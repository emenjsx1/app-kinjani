import { memo, useMemo } from "react";
import { createPortal } from "react-dom";
import { OutlineBox } from "./OutlineBox";
import { DropIndicator } from "./DropIndicator";
import { SpacingIndicators } from "./SpacingIndicators";
import { InlineToolbar } from "./InlineToolbar";
import type { SectionBBoxMap } from "./useSectionBBoxes";
import type { BoundingBox } from "@/core/editor/selection";
import { useInteractionStore } from "../store/interactionStore";
import { useEditorStore } from "../store/editorStore";
import { useCanvasStore } from "../store/canvasStore";

interface Props {
  hostRef: React.RefObject<HTMLElement>;
  bboxes: SectionBBoxMap;
  orderedIds: string[];
  sectionLabels: Record<string, string>;
  sectionEnabled: Record<string, boolean>;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onAIEdit: (id: string) => void;
  onSectionDragStart: (id: string) => (e: React.DragEvent) => void;
  onSectionDragEnd: () => void;
}

/**
 * OverlayLayer — portal-rendered absolute container that hosts every
 * canvas overlay (hover outline, selection outline, drop indicator,
 * spacing visualization, floating inline toolbar). It is mounted as a
 * sibling to the content tree so overlay paints never invalidate content.
 *
 * Performance contract:
 *  - Subscribes only to hoveredId, selection.sectionId, dropIndicator,
 *    showSpacing, showOutlines. Pointer-move handling is delegated to the
 *    parent CanvasFrame (single listener for the whole canvas).
 */
export const OverlayLayer = memo(function OverlayLayer({
  hostRef,
  bboxes,
  orderedIds,
  sectionLabels,
  sectionEnabled,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onToggleVisible,
  onAIEdit,
  onSectionDragStart,
  onSectionDragEnd,
}: Props) {
  const hoveredId = useInteractionStore((s) => s.hoveredId);
  const dropIndicator = useInteractionStore((s) => s.dropIndicator);
  const selectedId = useEditorStore((s) => s.selection.sectionId);
  const showSpacing = useCanvasStore((s) => s.showSpacing);
  const showOutlines = useCanvasStore((s) => s.showOutlines);
  const mode = useCanvasStore((s) => s.mode);

  const hoverBox = hoveredId ? bboxes[hoveredId] : null;
  const selectBox = selectedId ? bboxes[selectedId] : null;

  const idx = useMemo(
    () => (selectedId ? orderedIds.indexOf(selectedId) : -1),
    [orderedIds, selectedId],
  );

  if (!hostRef.current) return null;
  if (mode === "preview") return null;

  return createPortal(
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {showOutlines && hoverBox && hoveredId !== selectedId && (
        <OutlineBox bbox={hoverBox} variant="hover" label={sectionLabels[hoveredId!]} />
      )}
      {selectBox && (
        <>
          {showSpacing && <SpacingIndicators bbox={selectBox} />}
          <OutlineBox bbox={selectBox} variant="selection" label={sectionLabels[selectedId!]} />
          <InlineToolbar
            bbox={selectBox}
            label={sectionLabels[selectedId!] ?? "Secção"}
            visible={sectionEnabled[selectedId!] ?? true}
            canMoveUp={idx > 0}
            canMoveDown={idx >= 0 && idx < orderedIds.length - 1}
            onMoveUp={() => onMoveUp(selectedId!)}
            onMoveDown={() => onMoveDown(selectedId!)}
            onDuplicate={() => onDuplicate(selectedId!)}
            onDelete={() => onDelete(selectedId!)}
            onToggleVisible={() => onToggleVisible(selectedId!)}
            onAIEdit={() => onAIEdit(selectedId!)}
            draggable
            onDragStart={onSectionDragStart(selectedId!)}
            onDragEnd={onSectionDragEnd}
          />
        </>
      )}
      {dropIndicator && <DropIndicator state={dropIndicator} />}
    </div>,
    hostRef.current,
  );
});

export type { BoundingBox };
