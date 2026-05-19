import { memo } from "react";
import type { BoundingBox } from "@/core/editor/selection";

/**
 * Spacing indicators — visualizes padding/margin as semi-transparent
 * overlays. Phase 2.5 ships with a simplified rendering (top/bottom padding
 * inferred from common section paddings); future phases will read real
 * spacing models from the section schema.
 */
export const SpacingIndicators = memo(function SpacingIndicators({
  bbox,
  padding = { top: 64, right: 24, bottom: 64, left: 24 },
}: {
  bbox: BoundingBox;
  padding?: { top: number; right: number; bottom: number; left: number };
}) {
  const fill = "hsl(var(--primary) / 0.10)";
  const border = "hsl(var(--primary) / 0.35)";
  const styleBase: React.CSSProperties = {
    position: "absolute",
    background: fill,
    outline: `1px dashed ${border}`,
    pointerEvents: "none",
    zIndex: 25,
  };
  return (
    <>
      <div style={{ ...styleBase, transform: `translate3d(${bbox.x}px, ${bbox.y}px, 0)`, width: bbox.width, height: padding.top }} />
      <div style={{ ...styleBase, transform: `translate3d(${bbox.x}px, ${bbox.y + bbox.height - padding.bottom}px, 0)`, width: bbox.width, height: padding.bottom }} />
      <div style={{ ...styleBase, transform: `translate3d(${bbox.x}px, ${bbox.y + padding.top}px, 0)`, width: padding.left, height: bbox.height - padding.top - padding.bottom }} />
      <div style={{ ...styleBase, transform: `translate3d(${bbox.x + bbox.width - padding.right}px, ${bbox.y + padding.top}px, 0)`, width: padding.right, height: bbox.height - padding.top - padding.bottom }} />
    </>
  );
});
