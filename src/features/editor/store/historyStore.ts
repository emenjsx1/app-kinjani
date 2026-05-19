import { create } from "zustand";
import { HistoryEngine } from "@/core/history/HistoryEngine";
import type { AIOperationEnvelope } from "@/core/ai/types";
import type { Project } from "@/core/projects/types";

interface HistoryStoreState {
  engine: HistoryEngine<Project> | null;
  version: number; // bumped on every mutation to force consumers to re-read
  init: (project: Project) => void;
  push: (project: Project, label?: string) => void;
  pushOperation: (project: Project, envelope: AIOperationEnvelope) => void;
  undo: () => Project | null;
  redo: () => Project | null;
  undoTo: (snapshotId: string) => Project | null;
  redoTo: (snapshotId: string) => Project | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  beginGroup: (label?: string) => string | undefined;
  endGroup: (label?: string) => void;
  reset: (project?: Project) => void;
  serialize: () => unknown;
}

export const useHistoryStore = create<HistoryStoreState>((set, get) => ({
  engine: null,
  version: 0,
  init: (project) => {
    set({
      engine: new HistoryEngine<Project>(project, { capacity: 50, mode: "hybrid" }),
      version: 1,
    });
  },
  push: (project, label) => {
    const eng = get().engine;
    if (!eng) {
      set({
        engine: new HistoryEngine<Project>(project, { capacity: 50, mode: "hybrid" }),
        version: 1,
      });
      return;
    }
    eng.pushSnapshot(project, label);
    set((s) => ({ version: s.version + 1 }));
  },
  pushOperation: (project, envelope) => {
    const eng = get().engine;
    if (!eng) {
      set({
        engine: new HistoryEngine<Project>(project, { capacity: 50, mode: "hybrid" }),
        version: 1,
      });
      return;
    }
    eng.pushOperation(project, envelope);
    set((s) => ({ version: s.version + 1 }));
  },
  undo: () => {
    const eng = get().engine;
    if (!eng) return null;
    const prev = eng.undo();
    if (prev) set((s) => ({ version: s.version + 1 }));
    return prev;
  },
  redo: () => {
    const eng = get().engine;
    if (!eng) return null;
    const next = eng.redo();
    if (next) set((s) => ({ version: s.version + 1 }));
    return next;
  },
  undoTo: (id) => {
    const eng = get().engine;
    if (!eng) return null;
    const r = eng.undoTo(id);
    if (r) set((s) => ({ version: s.version + 1 }));
    return r;
  },
  redoTo: (id) => {
    const eng = get().engine;
    if (!eng) return null;
    const r = eng.redoTo(id);
    if (r) set((s) => ({ version: s.version + 1 }));
    return r;
  },
  canUndo: () => get().engine?.canUndo() ?? false,
  canRedo: () => get().engine?.canRedo() ?? false,
  beginGroup: (label) => get().engine?.beginGroup(label),
  endGroup: (label) => {
    get().engine?.endGroup(label);
    set((s) => ({ version: s.version + 1 }));
  },
  reset: (project) => {
    const eng = get().engine;
    if (eng) eng.clear(project);
    set((s) => ({ version: s.version + 1 }));
  },
  serialize: () => get().engine?.serialize() ?? null,
}));
