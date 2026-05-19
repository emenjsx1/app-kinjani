/**
 * Token-aware context builder (Phase 4.4)
 *
 * Wraps the existing AIContextBuilder with:
 *  - lightweight token estimator (chars/4 heuristic, no tokenizer dependency)
 *  - prioritised inclusion of selected / responsive / recent-edit signals
 *  - automatic summarisation of older history
 *  - hard token budget enforcement via progressive pruning
 *
 * Does NOT rebuild AIContextBuilder — it composes on top.
 */

import type { AIOperationEnvelope } from "../types";
import type { Project } from "@/core/projects/types";
import {
  AIContextBuilder,
  type AIContextBuilderInput,
} from "./AIContextBuilder";
import type { AIContext } from "./types";

const APPROX_CHARS_PER_TOKEN = 4;

export function estimateTokens(value: string | object): number {
  const str = typeof value === "string" ? value : JSON.stringify(value);
  return Math.ceil(str.length / APPROX_CHARS_PER_TOKEN);
}

export interface BudgetedBuildInput extends AIContextBuilderInput {
  /** Hard max tokens for the final prompt-ready payload. */
  maxTokens: number;
  /** Frequency map: sectionId -> edits in recent window (for prioritisation). */
  editFrequency?: Record<string, number>;
}

export interface BudgetedContext {
  context: AIContext;
  prompt: string;
  estimatedTokens: number;
  pruned: {
    historyDropped: number;
    sectionsCollapsed: number;
    registryCollapsed: boolean;
    summary?: string;
  };
}

/** Score a section by relevance. Higher = keep. */
function scoreSection(
  s: { id: string; order: number },
  selectedIds: string[],
  editFrequency?: Record<string, number>,
): number {
  let score = 0;
  if (selectedIds.includes(s.id)) score += 100;
  score += (editFrequency?.[s.id] ?? 0) * 5;
  // Top-of-page bias (hero etc.)
  score += Math.max(0, 10 - s.order);
  return score;
}

function summariseHistory(history: AIOperationEnvelope[]): string {
  if (history.length === 0) return "";
  const byAgent = new Map<string, number>();
  const byKind = new Map<string, number>();
  for (const e of history) {
    byAgent.set(e.meta.sourceAgent, (byAgent.get(e.meta.sourceAgent) ?? 0) + 1);
    byKind.set(e.op.op, (byKind.get(e.op.op) ?? 0) + 1);
  }
  const agents = Array.from(byAgent.entries())
    .map(([a, n]) => `${a}:${n}`)
    .join(", ");
  const kinds = Array.from(byKind.entries())
    .map(([k, n]) => `${k}:${n}`)
    .join(", ");
  return `Resumo de ${history.length} operações anteriores → agentes [${agents}] · tipos [${kinds}]`;
}

/**
 * Build a context that fits within `maxTokens`.
 *
 * Pruning order (least to most destructive):
 *  1. Trim recentHistory tail to N most recent + summary line.
 *  2. Drop low-relevance sections from project snapshot.
 *  3. Collapse component registry to type-only list.
 */
export function buildWithinBudget(input: BudgetedBuildInput): BudgetedContext {
  const pruned: BudgetedContext["pruned"] = {
    historyDropped: 0,
    sectionsCollapsed: 0,
    registryCollapsed: false,
  };

  // Phase 1: full build
  let context = AIContextBuilder.build(input);
  let prompt = AIContextBuilder.toPrompt(context);
  let tokens = estimateTokens(prompt);
  if (tokens <= input.maxTokens) {
    return { context, prompt, estimatedTokens: tokens, pruned };
  }

  // Phase 2: trim history
  const history = input.recentHistory ?? [];
  if (history.length > 4) {
    const kept = history.slice(-4);
    pruned.historyDropped = history.length - kept.length;
    pruned.summary = summariseHistory(history.slice(0, -4));
    context = AIContextBuilder.build({ ...input, recentHistory: kept });
    prompt = AIContextBuilder.toPrompt(context);
    tokens = estimateTokens(prompt);
    if (tokens <= input.maxTokens) {
      return { context, prompt, estimatedTokens: tokens, pruned };
    }
  }

  // Phase 3: drop low-relevance sections
  const selectedIds = context.selection.sectionIds ?? [];
  const sections = context.project.activeSections;
  const ranked = [...sections]
    .map((s) => ({ s, score: scoreSection(s, selectedIds, input.editFrequency) }))
    .sort((a, b) => b.score - a.score);

  // Keep at most top-K until budget fits
  for (let keep = Math.min(8, ranked.length); keep >= 2; keep -= 2) {
    const subset = ranked.slice(0, keep).map((r) => r.s);
    pruned.sectionsCollapsed = sections.length - subset.length;
    const trimmedCtx: AIContext = {
      ...context,
      project: { ...context.project, activeSections: subset },
    };
    prompt = AIContextBuilder.toPrompt(trimmedCtx);
    tokens = estimateTokens(prompt);
    if (tokens <= input.maxTokens) {
      return {
        context: trimmedCtx,
        prompt,
        estimatedTokens: tokens,
        pruned,
      };
    }
    context = trimmedCtx;
  }

  // Phase 4: collapse registry
  pruned.registryCollapsed = true;
  const collapsedCtx: AIContext = {
    ...context,
    registry: { components: [] },
  };
  prompt = JSON.stringify(
    {
      project: collapsedCtx.project,
      selection: collapsedCtx.selection,
      responsiveMode: collapsedCtx.responsiveMode,
      recentOps: collapsedCtx.history.recent,
      summary: pruned.summary,
    },
    null,
    0,
  );
  tokens = estimateTokens(prompt);
  return { context: collapsedCtx, prompt, estimatedTokens: tokens, pruned };
}

/** Public-API style wrapper exposed for agents. */
export const TokenAwareContextBuilder = {
  buildWithinBudget,
  estimateTokens,
};

// Ensure import is used in declaration order without TS unused warnings.
void (null as unknown as Project);
