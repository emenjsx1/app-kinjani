import { memo } from "react";
import type { BoundingBox } from "@/core/editor/selection";

interface Props {
  bbox: BoundingBox;
  label?: string;
  variant?: "hover" | "selection";
}

/**
 * Pure overlay box. Pointer-events: none — input is captured by the parent
 * overlay layer, never by the outline itself.
 */
export const OutlineBox = memo(function OutlineBox({ bbox, label, variant = "hover" }: Props) {
  const isSel = variant === "selection";
  return (
    <div
      className="absolute pointer-events-none transition-[border-color] duration-75"
      style={{
        transform: `translate3d(${bbox.x}px, ${bbox.y}px, 0)`,
        width: bbox.width,
        height: bbox.height,
        borderWidth: isSel ? 2 : 1,
        borderStyle: "solid",
        borderColor: isSel ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.5)",
        boxShadow: isSel ? "0 0 0 1px hsl(var(--background))" : undefined,
        zIndex: isSel ? 30 : 20,
      }}
    >
      {label && (
        <div
          className="absolute -top-5 left-0 px-1.5 py-0.5 text-[10px] font-medium rounded-t-sm leading-none whitespace-nowrap"
          style={{
            background: isSel ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.75)",
            color: "hsl(var(--primary-foreground))",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
});
