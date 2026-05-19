/**
 * Generic snapshot-based history engine.
 *
 * - Bounded ring buffer (capacity, default 50).
 * - Grouped actions via begin/endGroup so multi-step ops collapse to one undo.
 * - Pure data: serialize()/restore() power the future project_versions table.
 */

export interface HistoryEngineOptions {
  capacity?: number;
}

export interface HistorySnapshot<T> {
  state: T;
  label?: string;
  timestamp: number;
}

export class HistoryEngine<T> {
  private past: HistorySnapshot<T>[] = [];
  private future: HistorySnapshot<T>[] = [];
  private current: HistorySnapshot<T> | null = null;
  private capacity: number;
  private groupDepth = 0;
  private pendingGroupBase: HistorySnapshot<T> | null = null;

  constructor(initial: T, opts: HistoryEngineOptions = {}) {
    this.capacity = opts.capacity ?? 50;
    this.current = { state: initial, timestamp: Date.now() };
  }

  get state(): T {
    return this.current!.state;
  }

  push(state: T, label?: string): void {
    if (this.groupDepth > 0) {
      // Defer: only push the first state of the group when it ends.
      if (!this.pendingGroupBase) {
        this.pendingGroupBase = this.current!;
      }
      this.current = { state, label, timestamp: Date.now() };
      return;
    }
    if (this.current) this.past.push(this.current);
    if (this.past.length > this.capacity) this.past.shift();
    this.current = { state, label, timestamp: Date.now() };
    this.future = [];
  }

  beginGroup(): void {
    this.groupDepth += 1;
  }

  endGroup(label?: string): void {
    if (this.groupDepth === 0) return;
    this.groupDepth -= 1;
    if (this.groupDepth === 0 && this.pendingGroupBase && this.current) {
      this.past.push(this.pendingGroupBase);
      if (this.past.length > this.capacity) this.past.shift();
      if (label) this.current = { ...this.current, label };
      this.pendingGroupBase = null;
      this.future = [];
    }
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }
  canRedo(): boolean {
    return this.future.length > 0;
  }

  undo(): T | null {
    const prev = this.past.pop();
    if (!prev) return null;
    if (this.current) this.future.push(this.current);
    this.current = prev;
    return prev.state;
  }

  redo(): T | null {
    const next = this.future.pop();
    if (!next) return null;
    if (this.current) this.past.push(this.current);
    this.current = next;
    return next.state;
  }

  clear(initial?: T): void {
    this.past = [];
    this.future = [];
    this.pendingGroupBase = null;
    this.groupDepth = 0;
    this.current = {
      state: initial ?? this.current!.state,
      timestamp: Date.now(),
    };
  }

  serialize(): { past: HistorySnapshot<T>[]; current: HistorySnapshot<T>; future: HistorySnapshot<T>[] } {
    return { past: [...this.past], current: this.current!, future: [...this.future] };
  }
}
