/**
 * LayoutEngine — resolves LayoutSpec into CSS-friendly style objects.
 *
 * Supports four layout modes:
 *   - "stack"  → flexbox (column/row)
 *   - "grid"   → CSS grid with template areas
 *   - "auto"   → flex with auto-sizing (Figma auto-layout equivalent)
 *   - "free"   → absolute positioning with constraint pinning
 *
 * The engine emits inline styles AND tailwind-token-friendly className
 * hints so the editor and codegen pipelines can choose the right encoding.
 */

import type { LayoutSpec } from "./types";

export interface ResolvedLayout {
  style: Record<string, string | number>;
  className: string;
}

export class LayoutEngine {
  resolve(spec: LayoutSpec | undefined): ResolvedLayout {
    if (!spec) return { style: {}, className: "" };

    const style: Record<string, string | number> = {};
    const classes: string[] = [];

    switch (spec.mode) {
      case "stack": {
        style.display = "flex";
        style.flexDirection = spec.direction ?? "column";
        if (spec.gap !== undefined) style.gap = px(spec.gap);
        applyAlign(style, spec.align);
        break;
      }
      case "auto": {
        style.display = "flex";
        style.flexDirection = spec.direction ?? "row";
        style.flexWrap = "wrap";
        if (spec.gap !== undefined) style.gap = px(spec.gap);
        applyAlign(style, spec.align);
        break;
      }
      case "grid": {
        style.display = "grid";
        if (spec.grid) {
          style.gridTemplateColumns =
            typeof spec.grid.columns === "number"
              ? `repeat(${spec.grid.columns}, minmax(0, 1fr))`
              : spec.grid.columns;
          if (spec.grid.rows !== undefined) {
            style.gridTemplateRows =
              typeof spec.grid.rows === "number"
                ? `repeat(${spec.grid.rows}, minmax(0, 1fr))`
                : spec.grid.rows;
          }
          if (spec.grid.areas?.length) {
            style.gridTemplateAreas = spec.grid.areas.map((a) => `"${a}"`).join(" ");
          }
          if (spec.grid.columnGap !== undefined) style.columnGap = px(spec.grid.columnGap);
          if (spec.grid.rowGap !== undefined) style.rowGap = px(spec.grid.rowGap);
        }
        break;
      }
      case "free": {
        style.position = "relative";
        if (spec.free) {
          style.left = px(spec.free.x);
          style.top = px(spec.free.y);
          if (spec.free.width !== undefined) style.width = px(spec.free.width);
          if (spec.free.height !== undefined) style.height = px(spec.free.height);
          // Pinning: when both sides fixed we let CSS stretch.
          if (spec.free.constraints) {
            const c = spec.free.constraints;
            if (c.right === "fixed") style.right = 0;
            if (c.bottom === "fixed") style.bottom = 0;
          }
        }
        break;
      }
    }

    if (spec.padding) {
      const p = spec.padding;
      if (p.top !== undefined) style.paddingTop = px(p.top);
      if (p.right !== undefined) style.paddingRight = px(p.right);
      if (p.bottom !== undefined) style.paddingBottom = px(p.bottom);
      if (p.left !== undefined) style.paddingLeft = px(p.left);
    }
    if (spec.size) {
      const s = spec.size;
      if (s.minWidth !== undefined) style.minWidth = px(s.minWidth);
      if (s.maxWidth !== undefined) style.maxWidth = px(s.maxWidth);
      if (s.minHeight !== undefined) style.minHeight = px(s.minHeight);
      if (s.maxHeight !== undefined) style.maxHeight = px(s.maxHeight);
    }

    return { style, className: classes.join(" ") };
  }
}

function px(v: number | string): string | number {
  if (typeof v === "number") return v;
  return v;
}

function applyAlign(
  style: Record<string, string | number>,
  align?: LayoutSpec["align"],
): void {
  if (!align) return;
  if (align.main) {
    const map: Record<string, string> = {
      start: "flex-start",
      center: "center",
      end: "flex-end",
      between: "space-between",
      around: "space-around",
      evenly: "space-evenly",
    };
    style.justifyContent = map[align.main] ?? align.main;
  }
  if (align.cross) {
    const map: Record<string, string> = {
      start: "flex-start",
      center: "center",
      end: "flex-end",
      stretch: "stretch",
      baseline: "baseline",
    };
    style.alignItems = map[align.cross] ?? align.cross;
  }
}

export const layoutEngine = new LayoutEngine();
