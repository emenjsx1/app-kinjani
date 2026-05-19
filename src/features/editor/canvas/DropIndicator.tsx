import { memo } from "react";
import type { DropIndicatorState } from "@/core/editor/overlay";

/**
 * Visual drop indicator. Horizontal bar with end-caps; positioned via the
 * bbox computed by `useSectionDnD`. Pure rendering — does not subscribe.
 */
export const DropIndicator = memo(function DropIndicator({ state }: { state: DropIndicatorState }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        transform: `translate3d(${state.bbox.x}px, ${state.bbox.y - 1}px, 0)`,
        width: state.bbox.width,
        height: 3,
        background: "hsl(var(--primary))",
        borderRadius: 2,
        zIndex: 40,
        boxShadow: "0 0 0 1px hsl(var(--background)), 0 2px 8px hsl(var(--primary) / 0.4)",
      }}
    >
      <div
        className="absolute -left-1 -top-1 w-3 h-3 rounded-full"
        style={{ background: "hsl(var(--primary))", boxShadow: "0 0 0 2px hsl(var(--background))" }}
      />
      <div
        className="absolute -right-1 -top-1 w-3 h-3 rounded-full"
        style={{ background: "hsl(var(--primary))", boxShadow: "0 0 0 2px hsl(var(--background))" }}
      />
    </div>
  );
});
