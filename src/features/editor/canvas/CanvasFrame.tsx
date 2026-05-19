import { memo, useCallback, useRef } from "react";
import { OverlayLayer } from "./OverlayLayer";
import { useSectionBBoxes } from "./useSectionBBoxes";
import { useSectionDnD } from "./useSectionDnD";
import { useCanvasStore } from "../store/canvasStore";
import { useInteractionStore } from "../store/interactionStore";
import { useEditorStore } from "../store/editorStore";
import { cn } from "@/lib/utils";

const DEVICE_WIDTH: Record<"desktop" | "tablet" | "mobile", number | "100%"> = {
  desktop: "100%",
  tablet: 820,
  mobile: 390,
};

interface Props {
  /** Stable identifier of the underlying project version — invalidates bbox cache. */
  version: unknown;
  orderedIds: string[];
  sectionLabels: Record<string, string>;
  sectionEnabled: Record<string, boolean>;
  onReorder: (orderedIds: string[]) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onAIEdit: (id: string) => void;
  children: React.ReactNode;
}

/**
 * CanvasFrame — the visual viewport. Responsibilities:
 *  - Scaled, device-aware frame that hosts the content tree (children).
 *  - Single pointer listener that performs hit-testing via `[id^="section-"]`
 *    and publishes hover state to the interaction store.
 *  - Click-to-select with bubbling out of the overlay.
 *  - DnD source/target wiring for section reordering.
 *  - Mounts the OverlayLayer portal as a sibling of the content tree.
 */
export const CanvasFrame = memo(function CanvasFrame({
  version,
  orderedIds,
  sectionLabels,
  sectionEnabled,
  onReorder,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onToggleVisible,
  onAIEdit,
  children,
}: Props) {
  const device = useCanvasStore((s) => s.device);
  const zoom = useCanvasStore((s) => s.zoom);
  const showGrid = useCanvasStore((s) => s.showGrid);
  const mode = useCanvasStore((s) => s.mode);

  const scrollRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const bboxes = useSectionBBoxes(frameRef, contentRef, version);
  const dnd = useSectionDnD({ bboxes, orderedIds, onReorder });

  const setHovered = useInteractionStore((s) => s.setHovered);
  const select = useEditorStore((s) => s.select);
  const clearSelection = useEditorStore((s) => s.clearSelection);

  const findSectionId = useCallback((target: EventTarget | null): string | null => {
    let el = target as HTMLElement | null;
    while (el && el !== contentRef.current) {
      if (el.id && el.id.startsWith("section-")) return el.id.replace(/^section-/, "");
      el = el.parentElement;
    }
    return null;
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (mode === "preview") return;
      const id = findSectionId(e.target);
      setHovered(id);
    },
    [findSectionId, mode, setHovered],
  );

  const onPointerLeave = useCallback(() => setHovered(null), [setHovered]);

  const onClickCapture = useCallback(
    (e: React.MouseEvent) => {
      if (mode === "preview") return;
      const id = findSectionId(e.target);
      if (id) {
        e.preventDefault();
        e.stopPropagation();
        select({ sectionId: id, widgetId: null });
      } else {
        clearSelection();
      }
    },
    [clearSelection, findSectionId, mode, select],
  );

  const width = DEVICE_WIDTH[device];

  return (
    <div
      ref={scrollRef}
      className="relative h-full w-full overflow-auto bg-[hsl(var(--muted)/0.4)]"
      onDragOver={dnd.onDragOver(frameRef)}
      onDrop={dnd.onDrop(frameRef)}
    >
      {showGrid && (
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      )}
      <div className="flex items-start justify-center p-6 min-h-full">
        <div
          ref={frameRef}
          className={cn(
            "relative bg-background shadow-2xl rounded-lg overflow-hidden ring-1 ring-border transition-[width] duration-200",
          )}
          style={{
            width,
            maxWidth: "100%",
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
          }}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onClickCapture={onClickCapture}
        >
          <div ref={contentRef} className={cn(mode === "edit" && "select-none")}>
            {children}
          </div>
          <OverlayLayer
            hostRef={frameRef}
            bboxes={bboxes}
            orderedIds={orderedIds}
            sectionLabels={sectionLabels}
            sectionEnabled={sectionEnabled}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onToggleVisible={onToggleVisible}
            onAIEdit={onAIEdit}
            onSectionDragStart={dnd.onDragStart}
            onSectionDragEnd={dnd.onDragEnd}
          />
        </div>
      </div>
    </div>
  );
});
