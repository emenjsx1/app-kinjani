import type { ReactNode } from "react";
import type { Project } from "@/core/projects/types";

export type PreviewDevice = "desktop" | "tablet" | "mobile";

export interface PreviewOptions {
  device?: PreviewDevice;
  zoom?: number;
  interactive?: boolean;
  embedConfig?: unknown;
}

export interface PreviewEngine {
  id: "react-template" | "sandpack" | "runtime";
  render(project: Project, opts?: PreviewOptions): ReactNode;
}
