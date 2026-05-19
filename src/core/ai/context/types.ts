import type { Project } from "@/core/projects/types";
import type { ComponentDefinition } from "@/core/registry/types";
import type { AIOperationEnvelope } from "../types";

export type ResponsiveMode = "desktop" | "tablet" | "mobile";

export interface AIContextSelection {
  pageId?: string;
  sectionIds: string[];
  nodeIds: string[];
}

export interface AIContextProjectSnapshot {
  id: string;
  name: string;
  kind: Project["kind"];
  pageCount: number;
  activePageId?: string;
  activeSections: Array<{
    id: string;
    type: string;
    title: string;
    enabled: boolean;
    order: number;
  }>;
  theme: Project["theme"];
  settings: Project["settings"];
  seo?: Project["seo"];
}

export interface AIContext {
  project: AIContextProjectSnapshot;
  selection: AIContextSelection;
  responsiveMode: ResponsiveMode;
  registry: {
    components: Array<Pick<ComponentDefinition, "id" | "type" | "category" | "displayName">>;
  };
  history: {
    recent: Array<Pick<AIOperationEnvelope["meta"], "operationId" | "sourceAgent" | "label">>;
    totalOperations: number;
  };
  /** Free-form hints injected by agents (planner -> ui-agent etc). */
  hints?: Record<string, unknown>;
}
