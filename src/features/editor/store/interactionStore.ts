/**
 * Interaction state — pointer/drag/focus signals.
 *
 * Lives in a dedicated store so high-frequency hover updates do not trigger
 * any re-render outside the overlay layer. Components reading interaction
 * state must use granular selectors (e.g. `useInteractionStore(s => s.hoveredId)`).
 */
import { create } from "zustand";
import type { DropIndicatorState } from "@/core/editor/overlay";

export interface InteractionState {
  hoveredId: string | null;
  focusedId: string | null;
  draggingId: string | null;
  dragKind: "section" | "widget" | null;
  dropIndicator: DropIndicatorState | null;
  /** Bumped whenever bounding boxes should be re-measured. */
  layoutVersion: number;
  setHovered: (id: string | null) => void;
  setFocused: (id: string | null) => void;
  beginDrag: (id: string, kind: "section" | "widget") => void;
  setDropIndicator: (s: DropIndicatorState | null) => void;
  endDrag: () => void;
  invalidateLayout: () => void;
}

export const useInteractionStore = create<InteractionState>((set) => ({
  hoveredId: null,
  focusedId: null,
  draggingId: null,
  dragKind: null,
  dropIndicator: null,
  layoutVersion: 0,
  setHovered: (id) => set((s) => (s.hoveredId === id ? s : { hoveredId: id })),
  setFocused: (id) => set({ focusedId: id }),
  beginDrag: (id, kind) =>
    set({ draggingId: id, dragKind: kind, dropIndicator: null }),
  setDropIndicator: (d) => set({ dropIndicator: d }),
  endDrag: () => set({ draggingId: null, dragKind: null, dropIndicator: null }),
  invalidateLayout: () => set((s) => ({ layoutVersion: s.layoutVersion + 1 })),
}));
