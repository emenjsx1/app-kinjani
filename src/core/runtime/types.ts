/**
 * Phase 5 — Sandbox Runtime abstraction.
 *
 * A `Runtime` executes a generated codebase. The legacy `Runtime` interface
 * (start/stop) is preserved for backwards compatibility; the new
 * `RuntimeEngine` interface is the canonical contract used by the preview
 * layer, export system and AI diagnostics bus.
 *
 * Engines (Sandpack, WebContainer, remote sandbox) are pluggable through
 * `runtimeRegistry`. They must remain decoupled from the codegen engine
 * and the preview engine — coupling happens only at the orchestration
 * façade (`builder.runtime`).
 */
import type { FileSystem, ProjectFile } from "@/core/filesystem/types";
import type {
  RuntimeDiagnostics,
  RuntimeDiagnosticsBus,
} from "./RuntimeDiagnostics";

export type RuntimeEngineId =
  | "noop"
  | "sandpack"
  | "webcontainer"
  | "remote";

export type RuntimeState =
  | "idle"
  | "starting"
  | "ready"
  | "updating"
  | "error"
  | "stopped";

export interface RuntimeStatus {
  state: RuntimeState;
  message?: string;
  startedAt?: number;
  lastUpdateAt?: number;
}

/** Backwards-compatible (Phase 1) interface. */
export interface Runtime {
  id: RuntimeEngineId;
  start(fs: FileSystem): Promise<void>;
  stop(): Promise<void>;
  status(): RuntimeStatus;
}

/* -------------------------------------------------------------------------- */
/*  RuntimeEngine — Phase 5 canonical contract                                */
/* -------------------------------------------------------------------------- */

export interface RuntimeFileMap {
  [path: string]: string;
}

export interface RuntimeBootOptions {
  /** Initial files (path -> content). */
  files: RuntimeFileMap;
  /** Active entry file relative to project root. */
  entry?: string;
  /** Dependencies for the runtime sandbox. */
  dependencies?: Record<string, string>;
  /** Dev-only dependencies. */
  devDependencies?: Record<string, string>;
  /** Environment variables exposed to the running app. */
  env?: Record<string, string>;
}

export interface RuntimePatch {
  /** Files added or fully replaced. */
  upserts?: RuntimeFileMap;
  /** Paths to remove from the runtime filesystem. */
  removes?: string[];
}

export interface RuntimeEngineCapabilities {
  hmr: boolean;
  isolated: boolean;
  console: boolean;
  network: boolean;
  /** Whether the engine supports `patch()` without a full restart. */
  partialUpdates: boolean;
  /** Whether the engine can render Next.js App Router projects. */
  nextAppRouter: boolean;
}

export interface RuntimeEngine {
  id: RuntimeEngineId;
  capabilities: RuntimeEngineCapabilities;
  /** Initialize the runtime with a full project file set. */
  boot(options: RuntimeBootOptions): Promise<void>;
  /** Apply an incremental patch. Falls back to reboot if unsupported. */
  patch(patch: RuntimePatch): Promise<void>;
  /** Stop the runtime and release resources. */
  dispose(): Promise<void>;
  /** Current status. */
  status(): RuntimeStatus;
  /** Diagnostics bus the engine publishes runtime events to. */
  diagnostics(): RuntimeDiagnosticsBus;
  /** Snapshot of current diagnostics. */
  snapshot(): RuntimeDiagnostics;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

export function filesToMap(files: ProjectFile[]): RuntimeFileMap {
  const out: RuntimeFileMap = {};
  for (const f of files) out[normalize(f.path)] = f.content;
  return out;
}

export function normalize(path: string): string {
  let p = path.replace(/\\/g, "/");
  if (!p.startsWith("/")) p = `/${p}`;
  // strip /projects/<id>/ prefix if present
  p = p.replace(/^\/projects\/[^/]+\//, "/");
  return p;
}

/* -------------------------------------------------------------------------- */
/*  NoopRuntime (legacy + dual interface)                                     */
/* -------------------------------------------------------------------------- */

import { RuntimeDiagnosticsBus as Bus } from "./RuntimeDiagnostics";

export class NoopRuntime implements Runtime, RuntimeEngine {
  id = "noop" as const;
  capabilities: RuntimeEngineCapabilities = {
    hmr: false,
    isolated: false,
    console: false,
    network: false,
    partialUpdates: true,
    nextAppRouter: false,
  };

  private _status: RuntimeStatus = { state: "idle" };
  private bus = new Bus();

  async start() {
    this._status = { state: "ready", startedAt: Date.now() };
  }
  async stop() {
    this._status = { state: "stopped" };
  }
  async boot() {
    this._status = { state: "ready", startedAt: Date.now() };
  }
  async patch() {
    this._status = { ...this._status, lastUpdateAt: Date.now() };
  }
  async dispose() {
    this._status = { state: "stopped" };
    this.bus.clear();
  }
  status() {
    return { ...this._status };
  }
  diagnostics() {
    return this.bus;
  }
  snapshot() {
    return this.bus.snapshot();
  }
}
