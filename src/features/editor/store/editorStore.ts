import { create } from "zustand";
import type {
  EditorDevice,
  EditorMode,
  EditorSelection,
  EditorViewState,
} from "@/core/editor/types";

export interface EditorStoreState extends EditorViewState {
  projectId: string | null;
  selection: EditorSelection;
  dirty: boolean;

  setProjectId: (id: string | null) => void;
  setMode: (mode: EditorMode) => void;
  setDevice: (device: EditorDevice) => void;
  setZoom: (zoom: number) => void;
  toggleAIPanel: (open?: boolean) => void;
  toggleLayersPanel: (open?: boolean) => void;
  togglePropertiesPanel: (open?: boolean) => void;
  select: (selection: Partial<EditorSelection>) => void;
  clearSelection: () => void;
  setDirty: (dirty: boolean) => void;
  reset: () => void;
}

const initialView: EditorViewState = {
  mode: "edit",
  device: "desktop",
  zoom: 1,
  aiPanelOpen: false,
  layersPanelOpen: true,
  propertiesPanelOpen: true,
};

const initialSelection: EditorSelection = {
  pageId: null,
  sectionId: null,
  widgetId: null,
};

export const useEditorStore = create<EditorStoreState>((set) => ({
  ...initialView,
  projectId: null,
  selection: initialSelection,
  dirty: false,

  setProjectId: (id) => set({ projectId: id }),
  setMode: (mode) => set({ mode }),
  setDevice: (device) => set({ device }),
  setZoom: (zoom) => set({ zoom }),
  toggleAIPanel: (open) =>
    set((s) => ({ aiPanelOpen: open ?? !s.aiPanelOpen })),
  toggleLayersPanel: (open) =>
    set((s) => ({ layersPanelOpen: open ?? !s.layersPanelOpen })),
  togglePropertiesPanel: (open) =>
    set((s) => ({ propertiesPanelOpen: open ?? !s.propertiesPanelOpen })),
  select: (sel) =>
    set((s) => ({ selection: { ...s.selection, ...sel } })),
  clearSelection: () => set({ selection: initialSelection }),
  setDirty: (dirty) => set({ dirty }),
  reset: () =>
    set({
      ...initialView,
      projectId: null,
      selection: initialSelection,
      dirty: false,
    }),
}));
