import type { z } from "zod";
import type { AIContext } from "../context/types";
import type { AIOperationEnvelope } from "../types";

export interface AIToolExecutionContext {
  context: AIContext;
  emit?: (event: { type: string; payload?: unknown }) => void;
}

export interface AIToolResult {
  ok: boolean;
  envelopes?: AIOperationEnvelope[];
  data?: unknown;
  error?: string;
}

export interface AITool<TInput = unknown> {
  id: string;
  description: string;
  /** Zod schema describing tool input. */
  inputSchema: z.ZodType<TInput>;
  /** Whether running the tool mutates project state. */
  mutating: boolean;
  execute(input: TInput, ctx: AIToolExecutionContext): Promise<AIToolResult> | AIToolResult;
}

export interface AIToolRegistry {
  register<T>(tool: AITool<T>): void;
  get(id: string): AITool | undefined;
  all(): AITool[];
}
