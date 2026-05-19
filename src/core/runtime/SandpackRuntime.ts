/**
 * Sandpack runtime engine. The actual `<SandpackProvider>` lives in the
 * preview engine (`SandpackPreviewEngine`) — this class is the headless
 * lifecycle/state holder that the preview component subscribes to.
 *
 * Design: Sandpack is a runtime layer, not an architecture layer. The engine
 * owns:
 *   - the current file map
 *   - dependency manifest
 *   - bootstrap state
 *   - debounced patch buffering
 *   - runtime diagnostics
 *
 * The React preview engine reads these via `subscribe()` and renders
 * `<SandpackProvider files={...} />`.
 */
import {
  RuntimeDiagnosticsBus,
  type RuntimeDiagnostics,
} from "./RuntimeDiagnostics";
import type {
  RuntimeBootOptions,
  RuntimeEngine,
  RuntimeEngineCapabilities,
  RuntimeFileMap,
  RuntimePatch,
  RuntimeStatus,
} from "./types";

export type SandpackTemplate = "react-ts" | "vite-react-ts" | "nextjs";

export interface SandpackSnapshot {
  files: RuntimeFileMap;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  entry: string;
  template: SandpackTemplate;
  version: number;
}

type Listener = (snap: SandpackSnapshot) => void;

export class SandpackRuntime implements RuntimeEngine {
  id = "sandpack" as const;
  capabilities: RuntimeEngineCapabilities = {
    hmr: true,
    isolated: true,
    console: true,
    network: true,
    partialUpdates: true,
    // Sandpack ships a NextJS template but with limitations — we report
    // capability conservatively.
    nextAppRouter: false,
  };

  private _files: RuntimeFileMap = {};
  private _deps: Record<string, string> = {};
  private _devDeps: Record<string, string> = {};
  private _entry = "/index.tsx";
  private _template: SandpackTemplate = "vite-react-ts";
  private _status: RuntimeStatus = { state: "idle" };
  private _version = 0;
  private bus = new RuntimeDiagnosticsBus();
  private listeners = new Set<Listener>();

  constructor(opts?: { template?: SandpackTemplate }) {
    if (opts?.template) this._template = opts.template;
  }

  async boot(options: RuntimeBootOptions): Promise<void> {
    this._status = { state: "starting", startedAt: Date.now() };
    this._files = { ...options.files };
    this._deps = { ...(options.dependencies ?? {}) };
    this._devDeps = { ...(options.devDependencies ?? {}) };
    if (options.entry) this._entry = options.entry;
    this._version += 1;
    this._status = { state: "ready", startedAt: Date.now() };
    this.publish();
  }

  async patch(patch: RuntimePatch): Promise<void> {
    if (this._status.state !== "ready" && this._status.state !== "updating") {
      // boot must complete before patching
      return;
    }
    this._status = { ...this._status, state: "updating" };
    let mutated = false;
    if (patch.upserts) {
      for (const [path, content] of Object.entries(patch.upserts)) {
        if (this._files[path] !== content) {
          this._files[path] = content;
          mutated = true;
        }
      }
    }
    if (patch.removes) {
      for (const p of patch.removes) {
        if (p in this._files) {
          delete this._files[p];
          mutated = true;
        }
      }
    }
    if (mutated) {
      this._version += 1;
      this.publish();
    }
    this._status = { state: "ready", lastUpdateAt: Date.now() };
  }

  async dispose(): Promise<void> {
    this._status = { state: "stopped" };
    this.listeners.clear();
    this.bus.clear();
  }

  status(): RuntimeStatus {
    return { ...this._status };
  }

  diagnostics() {
    return this.bus;
  }

  snapshot(): RuntimeDiagnostics {
    return this.bus.snapshot();
  }

  /** Current Sandpack snapshot consumed by the preview React component. */
  snapshotState(): SandpackSnapshot {
    return {
      files: { ...this._files },
      dependencies: { ...this._deps },
      devDependencies: { ...this._devDeps },
      entry: this._entry,
      template: this._template,
      version: this._version,
    };
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Engines call this to surface a runtime error to the diagnostics bus. */
  reportRuntimeError(message: string, stack?: string, file?: string): void {
    this.bus.emit({ kind: "runtime-exception", message, stack, file, source: this.id });
  }

  reportCompileError(message: string, file?: string): void {
    this.bus.emit({ kind: "compile-error", message, file, source: this.id });
  }

  private publish() {
    const snap = this.snapshotState();
    for (const l of this.listeners) {
      try {
        l(snap);
      } catch {
        /* swallow */
      }
    }
  }
}
