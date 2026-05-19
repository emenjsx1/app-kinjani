/**
 * Canvas (visual) state — strictly isolated from project data and interaction.
 *
 * Subscribers to this store re-render only when the visual viewport changes
 * (device, zoom, pan, ruler/grid toggles). It never holds selection or hover.
 */
import { create } from "zustand";
import type { EditorDevice, EditorMode } from "@/core/editor/types";

export interface CanvasState {
  mode: EditorMode;
  device: EditorDevice;
  zoom: number;
  showGrid: boolean;
  showRulers: boolean;
  showSpacing: boolean;
  showOutlines: boolean;
  setMode: (mode: EditorMode) => void;
  setDevice: (device: EditorDevice) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  toggleGrid: (v?: boolean) => void;
  toggleRulers: (v?: boolean) => void;
  toggleSpacing: (v?: boolean) => void;
  toggleOutlines: (v?: boolean) => void;
}

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;

const clampZoom = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));

export const useCanvasStore = create<CanvasState>((set) => ({
  mode: "edit",
  device: "desktop",
  zoom: 1,
  showGrid: false,
  showRulers: false,
  showSpacing: false,
  showOutlines: true,
  setMode: (mode) => set({ mode }),
  setDevice: (device) => set({ device }),
  setZoom: (zoom) => set({ zoom: clampZoom(zoom) }),
  zoomIn: () => set((s) => ({ zoom: clampZoom(s.zoom + ZOOM_STEP) })),
  zoomOut: () => set((s) => ({ zoom: clampZoom(s.zoom - ZOOM_STEP) })),
  resetZoom: () => set({ zoom: 1 }),
  toggleGrid: (v) => set((s) => ({ showGrid: v ?? !s.showGrid })),
  toggleRulers: (v) => set((s) => ({ showRulers: v ?? !s.showRulers })),
  toggleSpacing: (v) => set((s) => ({ showSpacing: v ?? !s.showSpacing })),
  toggleOutlines: (v) => set((s) => ({ showOutlines: v ?? !s.showOutlines })),
}));
