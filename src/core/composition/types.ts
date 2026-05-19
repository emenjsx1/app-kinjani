/**
 * Phase 8 — Open Composition Engine types.
 *
 * Replaces the implicit "stacked sections" mental model with a true
 * component graph. Nodes can be ANY component (built-in, generated, or
 * promoted). Containers expose slots; slots constrain what may be dropped.
 *
 * Coexists with the legacy WebsiteSection[] model — adapters convert
 * between flat sections and ComponentGraph for backward compatibility.
 */

import type { ComponentCategory, RuntimeTarget } from "../registry/types";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composition graph                                                      */
/* ─────────────────────────────────────────────────────────────────────── */

export type NodeId = string;

export interface CompositionNode {
  id: NodeId;
  /** Registry id resolved through GeneratedRegistry. */
  componentId: string;
  /** ComponentDefinition.category snapshot (for cheap validation). */
  category: ComponentCategory;
  props: Record<string, unknown>;
  /**
   * Children grouped by slot id. Slot "default" is the implicit slot for
   * components that did not declare any.
   */
  slots: Record<string, NodeId[]>;
  /** Layout box constraints (Phase 8 layout engine). */
  layout?: LayoutSpec;
  /** Optional interaction timeline bindings (Phase 8 interactions). */
  interactions?: InteractionBinding[];
  /** Optional state-machine / hook bindings (Phase 8 logic). */
  logic?: LogicBinding[];
  /** Per-breakpoint overrides resolved at render time. */
  responsive?: Record<string, Partial<{ hidden: boolean; props: Record<string, unknown>; layout: LayoutSpec }>>;
  /** Runtime hints. */
  runtimeTargets?: RuntimeTarget[];
}

export interface ComponentGraph {
  /** Root node id — the page or layout shell. */
  rootId: NodeId;
  nodes: Record<NodeId, CompositionNode>;
  /** Optional ordered list of design tokens this graph requires. */
  requiredTokens?: string[];
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Slot validation                                                        */
/* ─────────────────────────────────────────────────────────────────────── */

export interface SlotValidationResult {
  ok: boolean;
  reason?: string;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Layout engine                                                          */
/* ─────────────────────────────────────────────────────────────────────── */

export type LayoutMode = "free" | "stack" | "grid" | "auto";

export interface LayoutSpec {
  mode: LayoutMode;
  /** Auto-layout direction (stack/auto). */
  direction?: "row" | "column";
  /** Gap in design-token spacing units. */
  gap?: number | string;
  padding?: BoxSides;
  /** Grid template (CSS-grid friendly). */
  grid?: GridSpec;
  /** Free-layout placement (mode === "free"). */
  free?: FreePosition;
  /** Alignment constraints. */
  align?: Alignment;
  /** Responsive size constraints. */
  size?: SizeConstraints;
}

export interface BoxSides {
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
}

export interface GridSpec {
  columns: number | string;
  rows?: number | string;
  areas?: string[];
  columnGap?: number | string;
  rowGap?: number | string;
}

export interface FreePosition {
  x: number | string;
  y: number | string;
  width?: number | string;
  height?: number | string;
  /** Constraint pinning (Figma/Framer style). */
  constraints?: {
    left?: "fixed" | "scale";
    right?: "fixed" | "scale";
    top?: "fixed" | "scale";
    bottom?: "fixed" | "scale";
  };
}

export interface Alignment {
  main?: "start" | "center" | "end" | "between" | "around" | "evenly";
  cross?: "start" | "center" | "end" | "stretch" | "baseline";
}

export interface SizeConstraints {
  minWidth?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Multi-page app graph                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

export interface AppRoute {
  /** Next-style route path: "/", "/dashboard", "/posts/[id]". */
  path: string;
  /** Optional layout route id (nested). */
  layoutId?: string;
  /** Page composition graph. */
  graph: ComponentGraph;
  /** Route-scoped metadata. */
  meta?: {
    title?: string;
    description?: string;
    auth?: "public" | "required" | "optional";
  };
}

export interface AppGraph {
  pages: Record<string, AppRoute>;
  layouts: Record<string, ComponentGraph>;
  /** Shared global state slices (route-aware generation). */
  state: SharedStateSlice[];
}

export interface SharedStateSlice {
  id: string;
  shape: "object" | "array";
  /** Default value (JSON-serializable). */
  initial: unknown;
  /** Scope: "app" lives across pages; "route" is per-page. */
  scope: "app" | "route";
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Logic / interactions                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

export interface LogicBinding {
  kind: "hook" | "state-machine" | "handler" | "form" | "async";
  /** Symbol exported by a generated artifact (resolved via GeneratedRegistry). */
  ref: string;
  /** Props/inputs threaded into the binding. */
  input?: Record<string, unknown>;
  /** Output prop names projected back into the node's props. */
  output?: string[];
}

export type InteractionEvent =
  | "click"
  | "hover"
  | "focus"
  | "blur"
  | "scroll-into-view"
  | "mount"
  | "unmount";

export interface InteractionBinding {
  event: InteractionEvent;
  /** Timeline of effects. */
  timeline: InteractionStep[];
}

export interface InteractionStep {
  /** Effect kind: animate prop, set state, run handler. */
  kind: "animate" | "set" | "invoke";
  /** Target node id (defaults to self). */
  target?: NodeId;
  /** Animation/handler/state payload. */
  payload: Record<string, unknown>;
  /** Sequencing in ms. */
  at?: number;
  duration?: number;
  easing?: string;
}
