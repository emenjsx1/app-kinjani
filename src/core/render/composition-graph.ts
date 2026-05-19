/**
 * Composition Graph — replaces section[] stack with a true visual node tree.
 *
 * A site is a tree of nodes. Each node is either:
 *   - a layout primitive (Stack/Grid/Overlay/Flex/Floating)
 *   - a content leaf (Heading/Text/Image/Button/Shape/Spacer/Raw)
 *
 * Nodes can nest arbitrarily — that's the whole point. The renderer walks the
 * graph recursively. No "section" assumptions. No vertical-stack mental model.
 */

export type NodeId = string;

export interface BaseNode {
  id: NodeId;
  /** Optional tailwind className extension for this node */
  className?: string;
  /** Inline style overrides (use sparingly — prefer className) */
  style?: React.CSSProperties;
  /** Semantic role for AI addressing + the editor */
  role?: string;
}

/* ---------------- Layout primitives ---------------- */

export interface StackNode extends BaseNode {
  type: "stack";
  /** vertical | horizontal */
  direction?: "v" | "h";
  /** gap in tailwind scale: 0,1,2,4,6,8,12,16,24 */
  gap?: number;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  /** vertical padding-y in tailwind scale */
  py?: number;
  px?: number;
  /** Wrap content into a centered container with max-width */
  contain?: "none" | "narrow" | "default" | "wide" | "full";
  children: CompositionNode[];
}

export interface GridNode extends BaseNode {
  type: "grid";
  /** Tailwind cols template, e.g. "1fr 2fr" or columns count 1..12 */
  cols: number | string;
  rows?: number | string;
  gap?: number;
  py?: number;
  px?: number;
  contain?: "none" | "narrow" | "default" | "wide" | "full";
  children: CompositionNode[];
  /** Optional per-child placement (col-span, row-span) parallel to children */
  spans?: Array<{ col?: number; row?: number; colStart?: number; rowStart?: number }>;
}

export interface OverlayNode extends BaseNode {
  type: "overlay";
  /** Relative position container — children can be absolutely placed via FloatingNode */
  py?: number;
  px?: number;
  /** Minimum height (e.g. "100vh", "80vh", or tailwind class via className) */
  minH?: string;
  children: CompositionNode[];
}

export interface FlexNode extends BaseNode {
  type: "flex";
  direction?: "row" | "col";
  gap?: number;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  wrap?: boolean;
  children: CompositionNode[];
}

export interface FloatingNode extends BaseNode {
  type: "floating";
  /** Percent or px positioning */
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  z?: number;
  rotate?: number;
  children: CompositionNode[];
}

/* ---------------- Content leaves ---------------- */

export interface HeadingNode extends BaseNode {
  type: "heading";
  level?: 1 | 2 | 3 | 4;
  text: string;
  /** Display size: hero | display | xl | lg | md */
  size?: "hero" | "display" | "xl" | "lg" | "md";
  weight?: "normal" | "medium" | "semibold" | "bold" | "black";
  tracking?: "tighter" | "tight" | "normal" | "wide" | "widest";
  italic?: boolean;
  uppercase?: boolean;
  serif?: boolean;
}

export interface TextNode extends BaseNode {
  type: "text";
  text: string;
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  muted?: boolean;
  serif?: boolean;
  maxW?: string;
}

export interface ImageNode extends BaseNode {
  type: "image";
  src: string;
  alt?: string;
  aspect?: "square" | "video" | "portrait" | "wide" | "ultra";
  fit?: "cover" | "contain";
  rounded?: "none" | "md" | "xl" | "2xl" | "3xl" | "full";
  /** Optional grayscale / overlay color */
  grayscale?: boolean;
}

export interface ButtonNode extends BaseNode {
  type: "button";
  label: string;
  action?: "scroll" | "url" | "whatsapp";
  target?: string; // node id, url, or phone
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export interface ShapeNode extends BaseNode {
  type: "shape";
  /** A decorative shape — blob / gradient / line / dot-grid / noise */
  shape: "blob" | "gradient" | "line" | "dot-grid" | "noise" | "circle";
  color?: "primary" | "secondary" | "accent" | "muted";
}

export interface SpacerNode extends BaseNode {
  type: "spacer";
  size: number; // tailwind py scale
}

export interface RawSectionNode extends BaseNode {
  /** Escape hatch — render a legacy section by type+content */
  type: "legacy-section";
  sectionType: string;
  content: Record<string, unknown>;
  variant?: number;
}

export type CompositionNode =
  | StackNode | GridNode | OverlayNode | FlexNode | FloatingNode
  | HeadingNode | TextNode | ImageNode | ButtonNode | ShapeNode | SpacerNode
  | RawSectionNode;

/* ---------------- Theme ---------------- */

export interface GraphTheme {
  primary: string;   // hsl values, no hsl() wrapper
  secondary: string;
  accent: string;
  background: string;
  text: string;
  font: string;
  /** Composition mood — affects renderer defaults */
  mood: "editorial" | "cinematic" | "brutalist" | "minimal" | "magazine" | "bento" | "futuristic" | "apple";
}

export interface CompositionGraph {
  version: 1;
  theme: GraphTheme;
  root: CompositionNode;
}
