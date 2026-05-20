/**
 * Creative OS — Multi-Agent Creative Operating System
 * Type contracts for orchestrator, agents, task graph, memory & communication.
 */
import type { CompositionGraph } from "@/core/render/composition-graph";

export type CreativeAgentId =
  | "creative-director"
  | "layout"
  | "art-direction"
  | "typography"
  | "color"
  | "ux"
  | "motion"
  | "responsive"
  | "copy"
  | "brand"
  | "runtime-fix";

export type CreativeAgentRole =
  | "orchestrator"
  | "structure"
  | "aesthetic"
  | "language"
  | "interaction"
  | "system";

export interface VisualContextSnapshot {
  graph?: CompositionGraph | null;
  canvasImage?: string; // dataURL
  viewport?: { width: number; height: number };
  designTokens?: Record<string, string>;
  moodboard?: string[];
}

export interface AgentMemory {
  shortTerm: string[];       // last actions in this session
  project: string[];          // persistent project knowledge
  visual: string[];           // observed visual patterns
  style: string[];            // tone, palette, typography decisions
  operations: string[];       // graph operations applied
}

export interface AgentTask {
  id: string;
  assignedTo: CreativeAgentId;
  intent: string;
  dependsOn?: string[];
  payload?: Record<string, unknown>;
}

export interface AgentTaskGraph {
  intent: string;
  tasks: AgentTask[];
}

export type AgentMessageKind =
  | "status"
  | "critique"
  | "refinement"
  | "handoff"
  | "decision"
  | "error";

export interface AgentMessage {
  id: string;
  ts: number;
  from: CreativeAgentId;
  to?: CreativeAgentId | "all";
  kind: AgentMessageKind;
  text: string;
  meta?: Record<string, unknown>;
}

export interface AgentReview {
  agent: CreativeAgentId;
  score: number;        // 0..1
  issues: string[];
  suggestions: string[];
}

export interface AgentRunContext {
  task: AgentTask;
  visual: VisualContextSnapshot;
  memory: AgentMemory;
  emit: (msg: Omit<AgentMessage, "id" | "ts" | "from">) => void;
  signal?: AbortSignal;
}

export interface AgentRunResult {
  review?: AgentReview;
  patch?: unknown;           // future: graph patch
  messages?: string[];       // human-readable summary
  nextTasks?: AgentTask[];
}

export interface CreativeAgent {
  id: CreativeAgentId;
  role: CreativeAgentRole;
  label: string;
  description: string;
  run(ctx: AgentRunContext): Promise<AgentRunResult>;
}

export interface OrchestratorSession {
  id: string;
  startedAt: number;
  intent: string;
  taskGraph: AgentTaskGraph;
  messages: AgentMessage[];
  reviews: AgentReview[];
  status: "planning" | "running" | "reviewing" | "done" | "error";
}
