/**
 * Runtime abstraction. Phase 1 ships only the interface — future phases
 * implement Sandpack, WebContainer, or remote sandbox runtimes.
 */
import type { FileSystem } from "@/core/filesystem/types";

export interface RuntimeStatus {
  state: "idle" | "starting" | "ready" | "error";
  message?: string;
}

export interface Runtime {
  id: "noop" | "sandpack" | "webcontainer" | "remote";
  start(fs: FileSystem): Promise<void>;
  stop(): Promise<void>;
  status(): RuntimeStatus;
}

export class NoopRuntime implements Runtime {
  id = "noop" as const;
  private _status: RuntimeStatus = { state: "idle" };
  async start() {
    this._status = { state: "ready" };
  }
  async stop() {
    this._status = { state: "idle" };
  }
  status() {
    return this._status;
  }
}
