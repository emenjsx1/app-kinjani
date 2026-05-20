/**
 * Phase H — Runtime adapters.
 *
 * Honest, hybrid architecture:
 *   - BrowserRuntime: real, in-browser sandboxed execution of JS snippets
 *     via dynamic Function() — no fake stdout, returns actual evaluation.
 *   - RemoteNodeRuntime: stub that reports `unavailable` until a backing
 *     WebContainer / remote runner is wired. Never simulates success.
 *   - CloudContainerRuntime: same — reports `unavailable` until provisioned.
 *
 * The adapter contract is stable so future cloud runtimes can swap in without
 * touching consumers (DevOpsAgent, ExecutionTimeline, LiveTerminal).
 */

import { DEFAULT_QUOTA, type RuntimeAdapter, type RuntimeCapabilities, type RuntimeHandle } from "./types";
import { executionBus } from "./ExecutionBus";

let runtimeSeq = 0;
function newId(prefix: string) {
  return `${prefix}_${Date.now()}_${++runtimeSeq}`;
}

export class BrowserRuntime implements RuntimeAdapter {
  kind = "browser" as const;
  private handle?: RuntimeHandle;
  private execMsThisHour = 0;
  private hourStart = Date.now();

  describe(): RuntimeCapabilities {
    return {
      filesystem: false,
      packageInstall: false,
      network: true,
      serverProcess: false,
      persistence: false,
    };
  }

  async boot(): Promise<RuntimeHandle> {
    const id = newId("browser");
    this.handle = {
      id,
      kind: this.kind,
      status: "ready",
      capabilities: this.describe(),
      startedAt: Date.now(),
      detail: "In-browser sandbox (eval)",
    };
    executionBus.publish({ kind: "runtime.boot", level: "info", source: id, message: "Browser runtime ready" });
    return this.handle;
  }

  async exec(cmd: string): Promise<{ stdout: string; stderr: string; code: number }> {
    if (!this.handle) await this.boot();
    const id = this.handle!.id;

    // quota
    const now = Date.now();
    if (now - this.hourStart > 3600_000) {
      this.execMsThisHour = 0;
      this.hourStart = now;
    }
    if (this.execMsThisHour > DEFAULT_QUOTA.maxExecMsPerHour) {
      return { stdout: "", stderr: "Execution quota exceeded for this hour.", code: 429 };
    }

    const start = performance.now();
    try {
      // Real evaluation of JS expression in a Function scope (no access to closures).
      // eslint-disable-next-line no-new-func
      const fn = new Function(`"use strict"; return (async () => { return (${cmd}); })();`);
      const value = await fn();
      const dur = performance.now() - start;
      this.execMsThisHour += dur;
      const out = typeof value === "string" ? value : JSON.stringify(value, null, 2);
      executionBus.publish({
        kind: "runtime.exec",
        level: "info",
        source: id,
        message: `exec(${cmd.slice(0, 60)})`,
        durationMs: dur,
      });
      return { stdout: out ?? "", stderr: "", code: 0 };
    } catch (err) {
      const dur = performance.now() - start;
      this.execMsThisHour += dur;
      const msg = err instanceof Error ? err.message : String(err);
      executionBus.publish({
        kind: "runtime.exec",
        level: "error",
        source: id,
        message: `exec failed: ${msg}`,
        durationMs: dur,
      });
      return { stdout: "", stderr: msg, code: 1 };
    }
  }

  async install(pkg: string): Promise<{ ok: boolean; log: string }> {
    return { ok: false, log: `Browser runtime cannot install '${pkg}'. Use a remote runtime.` };
  }

  async shutdown(): Promise<void> {
    if (this.handle) {
      executionBus.publish({ kind: "runtime.shutdown", level: "info", source: this.handle.id, message: "shutdown" });
      this.handle.status = "idle";
    }
  }
}

class UnavailableRuntime implements RuntimeAdapter {
  constructor(public kind: RuntimeAdapter["kind"], private reason: string) {}
  describe(): RuntimeCapabilities {
    return { filesystem: false, packageInstall: false, network: false, serverProcess: false, persistence: false };
  }
  async boot(): Promise<RuntimeHandle> {
    return {
      id: newId(this.kind),
      kind: this.kind,
      status: "unavailable",
      capabilities: this.describe(),
      detail: this.reason,
    };
  }
  async exec() {
    return { stdout: "", stderr: this.reason, code: 503 };
  }
  async install(pkg: string) {
    return { ok: false, log: `${this.kind}: ${this.reason} (cannot install ${pkg})` };
  }
  async shutdown() {}
}

export const RemoteNodeRuntime = new UnavailableRuntime(
  "remote-node",
  "Remote Node runtime not provisioned. Connect a WebContainer or remote runner to enable.",
);

export const CloudContainerRuntime = new UnavailableRuntime(
  "cloud-container",
  "Cloud container runtime not provisioned. Configure cloud execution backend to enable.",
);

export const browserRuntime = new BrowserRuntime();

export function pickRuntime(needs: Partial<RuntimeCapabilities>): RuntimeAdapter {
  const candidates: RuntimeAdapter[] = [browserRuntime, RemoteNodeRuntime, CloudContainerRuntime];
  for (const c of candidates) {
    const caps = c.describe();
    const ok = Object.entries(needs).every(([k, v]) => !v || (caps as Record<string, boolean>)[k]);
    if (ok) return c;
  }
  return browserRuntime;
}
