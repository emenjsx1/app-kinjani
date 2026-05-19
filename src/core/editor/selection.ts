export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type SelectionHandle =
  | "tl"
  | "tr"
  | "bl"
  | "br"
  | "t"
  | "r"
  | "b"
  | "l";

export interface SelectionOverlay {
  targetId: string;
  bbox: BoundingBox;
  label?: string;
  handles?: SelectionHandle[];
  color?: string;
}
