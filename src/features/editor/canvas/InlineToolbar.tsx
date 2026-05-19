import { memo } from "react";
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Sparkles,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";
import type { BoundingBox } from "@/core/editor/selection";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface InlineToolbarProps {
  bbox: BoundingBox;
  label: string;
  visible: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleVisible: () => void;
  onAIEdit: () => void;
  onDragHandleMouseDown?: (e: React.MouseEvent) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

/**
 * Floating contextual toolbar anchored to a selected section. Renders via
 * the overlay portal layer, so it does not affect content layout. Positioning
 * is clamped so the bar remains visible even when the section's top edge is
 * above the viewport.
 */
export const InlineToolbar = memo(function InlineToolbar({
  bbox,
  label,
  visible,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onToggleVisible,
  onAIEdit,
  draggable,
  onDragStart,
  onDragEnd,
}: InlineToolbarProps) {
  const top = bbox.y < 36 ? bbox.y + bbox.height + 8 : bbox.y - 36;
  const left = Math.max(8, bbox.x);

  return (
    <div
      className={cn(
        "absolute flex items-center gap-0.5 rounded-md border bg-popover shadow-lg p-0.5 pointer-events-auto",
        "animate-in fade-in zoom-in-95 duration-100",
      )}
      style={{
        transform: `translate3d(${left}px, ${top}px, 0)`,
        zIndex: 50,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className="px-1.5 py-1 text-[10px] font-semibold uppercase text-muted-foreground border-r mr-0.5 cursor-grab active:cursor-grabbing flex items-center gap-1"
        title="Arrastar para reordenar"
      >
        <GripVertical className="h-3 w-3 opacity-60" />
        {label}
      </div>
      <ToolBtn label="Mover acima" disabled={!canMoveUp} onClick={onMoveUp}>
        <ArrowUp className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn label="Mover abaixo" disabled={!canMoveDown} onClick={onMoveDown}>
        <ArrowDown className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn label="Duplicar" onClick={onDuplicate}>
        <Copy className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn label={visible ? "Ocultar" : "Mostrar"} onClick={onToggleVisible}>
        {visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
      </ToolBtn>
      <ToolBtn label="Editar com IA" onClick={onAIEdit} variant="primary">
        <Sparkles className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn label="Eliminar" onClick={onDelete} variant="danger">
        <Trash2 className="h-3.5 w-3.5" />
      </ToolBtn>
    </div>
  );
});

function ToolBtn({
  children,
  label,
  onClick,
  disabled,
  variant,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "danger";
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-7 w-7",
        variant === "primary" && "text-primary hover:text-primary",
        variant === "danger" && "text-destructive hover:text-destructive",
      )}
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
