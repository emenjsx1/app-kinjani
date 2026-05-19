import type { AIContext } from "../context/types";
import type { AIStreamEmitter } from "../streaming/StreamEmitter";
import type { AIOperationEnvelope } from "../types";

export type AgentId =
  | "planner"
  | "layout-agent"
  | "ui-agent"
  | "copy-agent"
  | "responsive-agent"
  | "seo-agent"
  | "fix-agent"
  | "export-agent";

export interface AgentRunInput {
  prompt: string;
  context: AIContext;
  /** Hints injected by an upstream agent (typically the Planner). */
  hints?: Record<string, unknown>;
  emitter?: AIStreamEmitter;
}

export interface AgentRunResult {
  envelopes: AIOperationEnvelope[];
  message?: string;
  /** Suggested next agent in a chain (planner output). */
  nextAgent?: AgentId;
  data?: unknown;
}

export interface Agent {
  id: AgentId;
  description: string;
  /** Lightweight predicate: can this agent handle the prompt? */
  canHandle?(input: AgentRunInput): boolean;
  run(input: AgentRunInput): Promise<AgentRunResult>;
}
