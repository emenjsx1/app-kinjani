/**
 * ConstraintSolver — resolves responsive layout constraints across
 * breakpoints. Inputs are the base LayoutSpec + per-breakpoint overrides
 * + viewport width. Output is the effective LayoutSpec for that viewport.
 *
 * The solver also enforces alignment + spacing constraints by reducing
 * `auto` and `stack` modes through a deterministic merge.
 */

import type { LayoutSpec } from "./types";

export interface BreakpointConfig {
  id: string;
  /** Minimum viewport width that activates the breakpoint. */
  minWidth: number;
}

export const DEFAULT_BREAKPOINTS: BreakpointConfig[] = [
  { id: "base", minWidth: 0 },
  { id: "sm", minWidth: 640 },
  { id: "md", minWidth: 768 },
  { id: "lg", minWidth: 1024 },
  { id: "xl", minWidth: 1280 },
  { id: "2xl", minWidth: 1536 },
];

export class ConstraintSolver {
  constructor(private readonly breakpoints: BreakpointConfig[] = DEFAULT_BREAKPOINTS) {}

  /**
   * Resolve effective LayoutSpec for a given viewport width.
   */
  solve(
    base: LayoutSpec | undefined,
    overrides: Record<string, Partial<LayoutSpec>> | undefined,
    viewportWidth: number,
  ): LayoutSpec | undefined {
    if (!base && !overrides) return undefined;
    let effective: LayoutSpec = base ? { ...base } : { mode: "stack" };
    const active = this.activeBreakpoints(viewportWidth);
    for (const bp of active) {
      const o = overrides?.[bp.id];
      if (!o) continue;
      effective = mergeLayout(effective, o);
    }
    return effective;
  }

  private activeBreakpoints(width: number): BreakpointConfig[] {
    return this.breakpoints
      .filter((b) => width >= b.minWidth)
      .sort((a, b) => a.minWidth - b.minWidth);
  }
}

function mergeLayout(a: LayoutSpec, b: Partial<LayoutSpec>): LayoutSpec {
  return {
    ...a,
    ...b,
    padding: { ...(a.padding ?? {}), ...(b.padding ?? {}) },
    grid: a.grid || b.grid ? { ...(a.grid ?? { columns: 1 }), ...(b.grid ?? {}) } : undefined,
    free: a.free || b.free ? { ...(a.free ?? { x: 0, y: 0 }), ...(b.free ?? {}) } : undefined,
    align: { ...(a.align ?? {}), ...(b.align ?? {}) },
    size: { ...(a.size ?? {}), ...(b.size ?? {}) },
  };
}

export const constraintSolver = new ConstraintSolver();
