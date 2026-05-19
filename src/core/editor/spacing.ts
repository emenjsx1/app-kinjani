import type { Breakpoint } from "./breakpoints";

export type SpacingSide = "top" | "right" | "bottom" | "left";

export interface SpacingBox {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface SpacingModel {
  margin?: Partial<Record<Breakpoint, SpacingBox>>;
  padding?: Partial<Record<Breakpoint, SpacingBox>>;
}

export const EMPTY_SPACING: SpacingModel = { margin: {}, padding: {} };
