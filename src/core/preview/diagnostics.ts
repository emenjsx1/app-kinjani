/**
 * Runtime diagnostics shared by every preview engine.
 *
 * Engines emit logs/errors here so the editor UI can display a consistent
 * inspector regardless of the underlying runtime (React, Sandpack,
 * WebContainer, Remote).
 */

export type RuntimeLogLevel = "log" | "info" | "warn" | "error" | "debug";

export interface RuntimeLog {
  level: RuntimeLogLevel;
  message: string;
  source?: string;
  timestamp: number;
}

export interface RuntimeError {
  message: string;
  stack?: string;
  source?: string;
  timestamp: number;
}

export type PreviewHealthStatus =
  | "idle"
  | "rendering"
  | "ready"
  | "error"
  | "disposed";

export interface PreviewHealth {
  status: PreviewHealthStatus;
  lastError?: string;
  lastRenderAt?: number;
}

export interface PreviewDiagnostics {
  logs: RuntimeLog[];
  errors: RuntimeError[];
}

export class DiagnosticsBus {
  private logs: RuntimeLog[] = [];
  private errors: RuntimeError[] = [];
  private capacity: number;

  constructor(capacity = 200) {
    this.capacity = capacity;
  }

  log(entry: Omit<RuntimeLog, "timestamp">): void {
    this.logs.push({ ...entry, timestamp: Date.now() });
    if (this.logs.length > this.capacity) this.logs.shift();
  }

  error(entry: Omit<RuntimeError, "timestamp">): void {
    this.errors.push({ ...entry, timestamp: Date.now() });
    if (this.errors.length > this.capacity) this.errors.shift();
  }

  snapshot(): PreviewDiagnostics {
    return { logs: [...this.logs], errors: [...this.errors] };
  }

  clear(): void {
    this.logs = [];
    this.errors = [];
  }
}
