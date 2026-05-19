/**
 * Runtime-side diagnostics bus. Conceptually parallel to
 * `src/core/preview/diagnostics.ts` (which is preview-scoped) but tracks
 * events specific to executing code: compile errors, dependency errors,
 * runtime exceptions, hydration mismatches.
 *
 * Engines publish events here; the editor and AI pipeline subscribe.
 */
export type RuntimeEventKind =
  | "log"
  | "warn"
  | "error"
  | "compile-error"
  | "dependency-error"
  | "import-error"
  | "runtime-exception"
  | "hydration-error"
  | "network";

export interface RuntimeEvent {
  id: string;
  kind: RuntimeEventKind;
  message: string;
  stack?: string;
  file?: string;
  line?: number;
  column?: number;
  source?: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface RuntimeDiagnostics {
  events: RuntimeEvent[];
  errors: RuntimeEvent[];
}

type Listener = (event: RuntimeEvent) => void;

let counter = 0;
const nextId = () => `evt_${Date.now().toString(36)}_${(counter++).toString(36)}`;

export class RuntimeDiagnosticsBus {
  private events: RuntimeEvent[] = [];
  private listeners = new Set<Listener>();
  private capacity: number;

  constructor(capacity = 500) {
    this.capacity = capacity;
  }

  emit(event: Omit<RuntimeEvent, "id" | "timestamp">): RuntimeEvent {
    const full: RuntimeEvent = {
      ...event,
      id: nextId(),
      timestamp: Date.now(),
    };
    this.events.push(full);
    if (this.events.length > this.capacity) this.events.shift();
    for (const l of this.listeners) {
      try {
        l(full);
      } catch {
        /* listener errors are swallowed */
      }
    }
    return full;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  snapshot(): RuntimeDiagnostics {
    return {
      events: [...this.events],
      errors: this.events.filter((e) =>
        ["error", "compile-error", "dependency-error", "import-error", "runtime-exception", "hydration-error"].includes(
          e.kind,
        ),
      ),
    };
  }

  clear(): void {
    this.events = [];
  }
}
