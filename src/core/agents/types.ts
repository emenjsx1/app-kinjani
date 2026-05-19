import type { Project } from "@/core/projects/types";
import type { AIOperation } from "@/core/ai/types";

/**
 * Multi-agent contracts. Phase 1 only declares interfaces — orchestration
 * lands in Phase 2 alongside the real planner.
 */

export interface AgentContext {
  project: Project;
  prompt: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  signal?: AbortSignal;
}

export interface AgentResult {
  operations: AIOperation[];
  message?: string;
  warnings?: string[];
}

export interface Agent {
  id: string;
  role: "planner" | "ui" | "copy" | "seo" | "fix";
  run(ctx: AgentContext): Promise<AgentResult>;
}

export type AgentPipeline = Agent[];
