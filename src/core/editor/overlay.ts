/**
 * Visual Overlay Engine — types.
 *
 * The overlay layer is rendered independently from content. Every selectable
 * canvas node publishes a BBox; the overlay system reads those BBoxes and
 * renders hover outlines, selection outlines, resize handles, spacing
 * indicators, drop indicators and floating toolbars without re-rendering
 * the underlying preview tree.
 */
import type { BoundingBox } from "./selection";

export type OverlayKind =
  | "hover"
  | "selection"
  | "drop-indicator"
  | "spacing"
  | "resize-handles"
  | "inline-toolbar";

export interface OverlayDescriptor {
  id: string;
  kind: OverlayKind;
  targetId: string;
  bbox: BoundingBox;
  label?: string;
  color?: string;
  zIndex?: number;
  meta?: Record<string, unknown>;
}

export interface OverlayPosition {
  /** Absolute bounding box in viewport-local pixel space. */
  bbox: BoundingBox;
  /** Whether this node is currently scrolled out of the visible viewport. */
  visible: boolean;
}

export type DropEdge = "top" | "bottom" | "left" | "right";

export interface DropIndicatorState {
  containerId: string;
  index: number;
  edge: DropEdge;
  bbox: BoundingBox;
}
