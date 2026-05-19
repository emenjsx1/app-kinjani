import type { AIStreamEvent } from "./StreamEvents";

export type AIStreamListener = (event: AIStreamEvent) => void;

export class AIStreamEmitter {
  private listeners = new Set<AIStreamListener>();
  on(fn: AIStreamListener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  emit(event: AIStreamEvent) {
    for (const l of this.listeners) {
      try {
        l(event);
      } catch {
        /* swallow listener errors */
      }
    }
  }
}
