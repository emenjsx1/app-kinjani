/**
 * Section drag-and-drop hook.
 *
 * Phase 2.5 ships with vertical canvas-aware section reordering. The hook is
 * intentionally split from the overlay components so the same interaction
 * primitives can later drive nested widget DnD without changes to UI code.
 *
 * Architecture notes:
 *  - The drag source is the inline toolbar / layer tree row (HTML5 DnD).
 *  - The drop layer is the canvas content area; over events compute the
 *    drop edge (top/bottom of the hovered section) and publish a
 *    DropIndicatorState to the interaction store.
 *  - Commit fires a single reorder command — the project tree is mutated
 *    once per drop, never per pointer move.
 */
import { useCallback } from "react";
import type { DropIndicatorState } from "@/core/editor/overlay";
import type { SectionBBoxMap } from "./useSectionBBoxes";
import { useInteractionStore } from "../store/interactionStore";

export interface UseSectionDnDArgs {
  bboxes: SectionBBoxMap;
  /** Ordered section ids visible on the canvas. */
  orderedIds: string[];
  onReorder: (orderedIds: string[]) => void;
}

export function useSectionDnD({ bboxes, orderedIds, onReorder }: UseSectionDnDArgs) {
  const beginDrag = useInteractionStore((s) => s.beginDrag);
  const endDrag = useInteractionStore((s) => s.endDrag);
  const setIndicator = useInteractionStore((s) => s.setDropIndicator);

  const onDragStart = useCallback(
    (id: string) => (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id);
      beginDrag(id, "section");
    },
    [beginDrag],
  );

  const computeIndicator = useCallback(
    (clientY: number, containerTop: number, scrollTop: number): DropIndicatorState | null => {
      const localY = clientY - containerTop + scrollTop;
      let best: { id: string; edge: "top" | "bottom"; dist: number } | null = null;
      for (const id of orderedIds) {
        const b = bboxes[id];
        if (!b) continue;
        const topDist = Math.abs(localY - b.y);
        const botDist = Math.abs(localY - (b.y + b.height));
        if (!best || topDist < best.dist) best = { id, edge: "top", dist: topDist };
        if (botDist < best.dist) best = { id, edge: "bottom", dist: botDist };
      }
      if (!best) return null;
      const b = bboxes[best.id];
      const idx = orderedIds.indexOf(best.id);
      const insertIndex = best.edge === "top" ? idx : idx + 1;
      return {
        containerId: "page",
        index: insertIndex,
        edge: best.edge,
        bbox: {
          x: b.x,
          y: best.edge === "top" ? b.y : b.y + b.height,
          width: b.width,
          height: 2,
        },
      };
    },
    [bboxes, orderedIds],
  );

  const onDragOver = useCallback(
    (containerRef: React.RefObject<HTMLElement>) => (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const ind = computeIndicator(e.clientY, rect.top, el.scrollTop);
      setIndicator(ind);
    },
    [computeIndicator, setIndicator],
  );

  const onDrop = useCallback(
    (containerRef: React.RefObject<HTMLElement>) => (e: React.DragEvent) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData("text/plain");
      const el = containerRef.current;
      if (!draggedId || !el) {
        endDrag();
        return;
      }
      const rect = el.getBoundingClientRect();
      const ind = computeIndicator(e.clientY, rect.top, el.scrollTop);
      endDrag();
      if (!ind) return;
      const from = orderedIds.indexOf(draggedId);
      if (from < 0) return;
      let to = ind.index;
      const reordered = [...orderedIds];
      reordered.splice(from, 1);
      if (to > from) to -= 1;
      reordered.splice(to, 0, draggedId);
      onReorder(reordered);
    },
    [computeIndicator, endDrag, onReorder, orderedIds],
  );

  const onDragEnd = useCallback(() => {
    endDrag();
  }, [endDrag]);

  return { onDragStart, onDragOver, onDrop, onDragEnd };
}
