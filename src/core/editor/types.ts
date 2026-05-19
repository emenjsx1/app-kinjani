export type EditorMode = "edit" | "preview" | "responsive";
export type EditorDevice = "desktop" | "tablet" | "mobile";

export interface EditorSelection {
  pageId: string | null;
  sectionId: string | null;
  widgetId: string | null;
}

export interface EditorViewState {
  mode: EditorMode;
  device: EditorDevice;
  zoom: number;
  aiPanelOpen: boolean;
  layersPanelOpen: boolean;
  propertiesPanelOpen: boolean;
}
