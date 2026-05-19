import { create } from "zustand";
import { HistoryEngine } from "@/core/history/HistoryEngine";
import type { Project } from "@/core/projects/types";

interface HistoryStoreState {
  engine: HistoryEngine<Project> | null;
  version: number; // bumped on every mutation to force consumers to re-read
  init: (project: Project) => void;
  push: (project: Project, label?: string) => void;
  undo: () => Project | null;
  redo: () => Project | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  beginGroup: () => void;
  endGroup: (label?: string) => void;
  reset: (project?: Project) => void;
}

export const useHistoryStore = create<HistoryStoreState>((set, get) => ({
  engine: null,
  version: 0,
  init: (project) => {
    set({ engine: new HistoryEngine<Project>(project, { capacity: 50 }), version: 1 });
  },
  push: (project, label) => {
    const eng = get().engine;
    if (!eng) {
      set({ engine: new HistoryEngine<Project>(project, { capacity: 50 }), version: 1 });
      return;
    }
    eng.push(project, label);
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
  canUndo: () => get().engine?.canUndo() ?? false,
  canRedo: () => get().engine?.canRedo() ?? false,
  beginGroup: () => get().engine?.beginGroup(),
  endGroup: (label) => {
    get().engine?.endGroup(label);
    set((s) => ({ version: s.version + 1 }));
  },
  reset: (project) => {
    const eng = get().engine;
    if (eng) eng.clear(project);
    set((s) => ({ version: s.version + 1 }));
  },
}));
