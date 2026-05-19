export type DndKind = "section" | "widget" | "asset";

export interface DndItem {
  id: string;
  kind: DndKind;
  payload?: unknown;
}

export interface DndDropTarget {
  containerId: string;
  index: number;
}

export interface DndController {
  begin(item: DndItem): void;
  over(target: DndDropTarget): void;
  drop(target: DndDropTarget): void;
  cancel(): void;
  current(): DndItem | null;
}
