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

/* -------------------------------------------------------------------------- */
/*  Operation metadata + envelope                                             */
/* -------------------------------------------------------------------------- */

export type AgentSource =
  | "planner"
  | "layout-agent"
  | "ui-agent"
  | "copy-agent"
  | "responsive-agent"
  | "seo-agent"
  | "fix-agent"
  | "export-agent"
  | "user"
  | "system";

export interface OperationMeta {
  operationId: string;
  parentOperationId?: string;
  sourceAgent: AgentSource;
  operationGroup?: string;
  rollbackable: boolean;
  affectedFiles: string[];
  affectedComponents: string[];
  dependsOn?: string[];
  createdAt: string;
  label?: string;
}

export interface AIOperationEnvelope {
  meta: OperationMeta;
  op: AIOperation;
}

export type OperationStrategy = "sequential" | "parallel";

export interface OperationPlan {
  id: string;
  envelopes: AIOperationEnvelope[];
  strategy: OperationStrategy;
  description?: string;
}

export interface OperationResult {
  operationId: string;
  ok: boolean;
  error?: string;
  /** Optional reverse operation able to undo this mutation. */
  rollbackOp?: AIOperation;
}

export interface OperationConflict {
  operationId: string;
  conflictsWith: string[];
  reason: string;
}

export interface OperationConflictResolver {
  detect(plan: OperationPlan, project: Project): OperationConflict[];
  resolve(conflicts: OperationConflict[]): AIOperationEnvelope[];
}

/* -------------------------------------------------------------------------- */
/*  Legacy plan result (still used by current ai-edit-website Edge Function)  */
/* -------------------------------------------------------------------------- */

export interface AIPlanResult {
  operations: AIOperation[];
  message?: string;
}
