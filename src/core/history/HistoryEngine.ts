/**
 * History engine supporting two modes:
 *
 *  - snapshot mode (default, used by Phase 1)
 *      Each push stores the full project state. Undo restores prior snapshot.
 *  - operation mode (used by AI pipeline)
 *      Each push stores an AIOperationEnvelope. Undo replays a rollback op.
 *
 * Hybrid mode keeps both stacks in sync so consumers can choose per call.
 *
 * Grouping: beginGroup/endGroup collapses many pushes into a single undo step.
 * Serialization: serialize()/hydrate() power future project_versions table and
 * future collaborative editing (CRDT/OT integration point).
 */

import type { AIOperationEnvelope } from "@/core/ai/types";

export interface HistoryEngineOptions {
  capacity?: number;
  mode?: HistoryMode;
}

export type HistoryMode = "snapshot" | "operation" | "hybrid";

export interface HistorySnapshot<T> {
  id: string;
  state: T;
  label?: string;
  groupId?: string;
  envelope?: AIOperationEnvelope;
  timestamp: number;
}

export interface SerializedHistory<T> {
  mode: HistoryMode;
  past: HistorySnapshot<T>[];
  current: HistorySnapshot<T> | null;
  future: HistorySnapshot<T>[];
}

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `h_${Date.now().toString(36)}_${idCounter}`;
}

export class HistoryEngine<T> {
  private past: HistorySnapshot<T>[] = [];
  private future: HistorySnapshot<T>[] = [];
  private current: HistorySnapshot<T> | null = null;
  private capacity: number;
  private mode: HistoryMode;
  private groupDepth = 0;
  private currentGroupId: string | null = null;
  private pendingGroupBase: HistorySnapshot<T> | null = null;

  constructor(initial: T, opts: HistoryEngineOptions = {}) {
    this.capacity = opts.capacity ?? 50;
    this.mode = opts.mode ?? "hybrid";
    this.current = { id: nextId(), state: initial, timestamp: Date.now() };
  }

  get state(): T {
    return this.current!.state;
  }

  getCurrentId(): string | null {
    return this.current?.id ?? null;
  }

  push(state: T, label?: string): void {
    this.pushSnapshot(state, label);
  }

  pushSnapshot(state: T, label?: string): HistorySnapshot<T> {
    const snap: HistorySnapshot<T> = {
      id: nextId(),
      state,
      label,
      groupId: this.currentGroupId ?? undefined,
      timestamp: Date.now(),
    };
    return this.pushInternal(snap);
  }

  pushOperation(state: T, envelope: AIOperationEnvelope): HistorySnapshot<T> {
    const snap: HistorySnapshot<T> = {
      id: nextId(),
      state,
      label: envelope.meta.label,
      groupId: this.currentGroupId ?? envelope.meta.operationGroup,
      envelope,
      timestamp: Date.now(),
    };
    return this.pushInternal(snap);
  }

  private pushInternal(snap: HistorySnapshot<T>): HistorySnapshot<T> {
    if (this.groupDepth > 0) {
      if (!this.pendingGroupBase) this.pendingGroupBase = this.current!;
      this.current = snap;
      return snap;
    }
    if (this.current) this.past.push(this.current);
    if (this.past.length > this.capacity) this.past.shift();
    this.current = snap;
    this.future = [];
    return snap;
  }

  beginGroup(label?: string): string {
    if (this.groupDepth === 0) {
      this.currentGroupId = `g_${nextId()}`;
    }
    this.groupDepth += 1;
    if (label && this.current) this.current = { ...this.current, label };
    return this.currentGroupId!;
  }

  endGroup(label?: string): void {
    if (this.groupDepth === 0) return;
    this.groupDepth -= 1;
    if (this.groupDepth === 0 && this.pendingGroupBase && this.current) {
      this.past.push(this.pendingGroupBase);
      if (this.past.length > this.capacity) this.past.shift();
      if (label) this.current = { ...this.current, label };
      this.pendingGroupBase = null;
      this.currentGroupId = null;
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

  /**
   * Selective undo: rewind past entries until the snapshot with the given id
   * becomes current. Skipped snapshots are pushed onto future.
   */
  undoTo(snapshotId: string): T | null {
    while (this.past.length > 0 && this.current?.id !== snapshotId) {
      if (this.current?.id === snapshotId) break;
      const prev = this.past.pop();
      if (!prev) break;
      if (this.current) this.future.push(this.current);
      this.current = prev;
      if (this.current.id === snapshotId) break;
    }
    return this.current?.state ?? null;
  }

  redoTo(snapshotId: string): T | null {
    while (this.future.length > 0 && this.current?.id !== snapshotId) {
      const next = this.future.pop();
      if (!next) break;
      if (this.current) this.past.push(this.current);
      this.current = next;
      if (this.current.id === snapshotId) break;
    }
    return this.current?.state ?? null;
  }

  clear(initial?: T): void {
    this.past = [];
    this.future = [];
    this.pendingGroupBase = null;
    this.groupDepth = 0;
    this.currentGroupId = null;
    this.current = {
      id: nextId(),
      state: initial ?? this.current!.state,
      timestamp: Date.now(),
    };
  }

  serialize(): SerializedHistory<T> {
    return {
      mode: this.mode,
      past: [...this.past],
      current: this.current,
      future: [...this.future],
    };
  }

  hydrate(s: SerializedHistory<T>): void {
    this.mode = s.mode;
    this.past = [...s.past];
    this.future = [...s.future];
    this.current = s.current;
  }
}
