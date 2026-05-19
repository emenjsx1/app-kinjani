import type { Project } from "@/core/projects/types";
import type { WebsiteSection } from "@/lib/website-templates";

/**
 * AI operation discriminated union. Every AI-driven mutation flows through
 * one of these so future agents, history, and audit logs share one vocabulary.
 */
export type AIOperation =
  | { op: "setSectionProp"; sectionId: string; patch: Record<string, string> }
  | { op: "addSection"; section: WebsiteSection }
  | { op: "removeSection"; sectionId: string }
  | { op: "reorderSections"; orderedIds: string[] }
  | { op: "setTheme"; theme: Partial<Project["theme"]> }
  | { op: "setSettings"; settings: Partial<Project["settings"]> }
  | { op: "noop"; reason?: string };

export interface AIPlanResult {
  operations: AIOperation[];
  message?: string;
}
