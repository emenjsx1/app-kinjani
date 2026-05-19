/**
 * AI Orchestrator (Phase 4 — execution coordination layer)
 *
 * Composes:
 *   - TokenAwareContextBuilder   (context-budget aware)
 *   - DesignConstraintBundle     (constraint-aware planning)
 *   - AgentRegistry              (existing)
 *   - AgentConsensusEngine       (multi-agent voting)
 *   - OperationLineageStore      (provenance graph)
 *   - AIRetryCoordinator         (smart retries)
 *   - AIDiagnosticsStore         (metrics)
 *   - AISnapshotGraph            (branching history)
 *   - AIExecutionTraceRecorder   (observability)
 *   - AIStreamEmitter            (UX feedback)
 *
 * This module does NOT execute operations itself — it produces a vetted
 * `OperationPlan` and a recorded trace. The existing OperationPipeline
 * continues to handle validation / simulation / apply / commit.
 */

import type { Project } from "@/core/projects/types";
import type {
  AIOperationEnvelope,
  OperationPlan,
} from "../types";
import { agentRegistry } from "../agents";
import type { AgentProposal } from "../consensus";
import {
  AgentConsensusEngine,
  DEFAULT_CONSENSUS_POLICY,
} from "../consensus";
import { TokenAwareContextBuilder } from "../context";
import {
  buildDesignConstraints,
  constraintsToPrompt,
} from "../designSystem";
import { aiDiagnosticsStore } from "../diagnostics";
import { aiSnapshotGraph } from "../history";
import {
  AIExecutionTraceRecorder,
  aiExecutionTraceStore,
} from "../observability";
import { operationLineageStore } from "../lineage";
import {
  AIRetryCoordinator,
  type RetryDirective,
} from "../retry";
import { AIStreamEmitter } from "../streaming/StreamEmitter";

export interface OrchestrationInput {
  project: Project;
  prompt: string;
  sessionId: string;
  sourcePromptId: string;
  /** Optional explicit agent ids to ask for proposals; defaults to all registered. */
  agents?: string[];
  /** Optional editor selection (forwarded to context builder). */
  selection?: {
    pageId?: string;
    sectionIds?: string[];
    nodeIds?: string[];
  };
  /** Hard token budget for the prompt-ready context payload. */
  maxContextTokens?: number;
  /** Optional stream emitter for UX. */
  emitter?: AIStreamEmitter;
  /** Optional recent operation envelopes (for context summarisation). */
  recentHistory?: AIOperationEnvelope[];
  /** Optional edit frequency map by sectionId (for relevance scoring). */
  editFrequency?: Record<string, number>;
  /** Optional override for retry strategy. */
  retry?: AIRetryCoordinator;
  /** Optional override for consensus engine. */
  consensus?: AgentConsensusEngine;
}

export interface OrchestrationResult {
  plan: OperationPlan | null;
  winnerAgent: string | null;
  disagreement: number;
  proposals: AgentProposal[];
  traceId: string;
  snapshotIdHint?: string;
  pruned: {
    historyDropped: number;
    sectionsCollapsed: number;
    registryCollapsed: boolean;
  };
}

/**
 * Build a vetted operation plan from a user prompt.
 *
 * NOTE: Concrete agent invocations rely on the existing `AgentRegistry.run`
 * surface. If an agent fails or returns empty, the retry coordinator decides
 * whether to refine, swap agent, or give up.
 */
export class AIOrchestrator {
  private retry: AIRetryCoordinator;
  private consensus: AgentConsensusEngine;

  constructor(opts: {
    retry?: AIRetryCoordinator;
    consensus?: AgentConsensusEngine;
  } = {}) {
    this.retry = opts.retry ?? new AIRetryCoordinator();
    this.consensus =
      opts.consensus ?? new AgentConsensusEngine(DEFAULT_CONSENSUS_POLICY);
  }

  async orchestrate(input: OrchestrationInput): Promise<OrchestrationResult> {
    const trace = new AIExecutionTraceRecorder({
      sessionId: input.sessionId,
      sourcePromptId: input.sourcePromptId,
    });
    const emit = input.emitter;

    /* 1. Context */
    trace.beginStage("context");
    emit?.emit({ type: "stage", stage: "analyzing-context" });
    const budgeted = TokenAwareContextBuilder.buildWithinBudget({
      project: input.project,
      selection: input.selection,
      recentHistory: input.recentHistory,
      editFrequency: input.editFrequency,
      maxTokens: input.maxContextTokens ?? 4000,
    });
    aiDiagnosticsStore.recordTokens(budgeted.estimatedTokens);
    if (
      budgeted.pruned.historyDropped > 0 ||
      budgeted.pruned.sectionsCollapsed > 0
    ) {
      emit?.emit({
        type: "context-pruned",
        droppedHistory: budgeted.pruned.historyDropped,
        collapsedSections: budgeted.pruned.sectionsCollapsed,
      });
    }
    trace.endStage("context", "ok", {
      tokens: budgeted.estimatedTokens,
      pruned: budgeted.pruned,
    });

    /* 2. Constraints */
    const constraints = buildDesignConstraints(input.project);
    const constraintsPrompt = constraintsToPrompt(constraints);

    /* 3. Gather agent proposals (with retry) */
    const agentIds = input.agents ?? agentRegistry.list().map((a) => a.id);
    const proposals: AgentProposal[] = [];
    let lastError: unknown = null;

    for (const agentId of agentIds) {
      let attempt = 1;
      let directive: RetryDirective | null = null;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        trace.beginStage(`agent:${agentId}`, agentId);
        emit?.emit({
          type: "agent-selected",
          agent: agentId,
          reason: directive ? directive.reason : undefined,
        });
        try {
          const proposal = await this.invokeAgent(
            agentId,
            input,
            budgeted.prompt,
            constraintsPrompt,
            directive,
          );
          if (!proposal || proposal.operations.length === 0) {
            throw new Error(`agent ${agentId} returned empty plan`);
          }
          proposals.push(proposal);
          aiDiagnosticsStore.recordAgentMetric(
            agentId,
            proposal.confidence,
            true,
          );
          for (const env of proposal.operations) {
            const lineage = operationLineageStore.record({
              id: env.meta.operationId,
              createdAt: Date.now(),
              agent: agentId,
              sourcePromptId: input.sourcePromptId,
              parentOperationId: env.meta.parentOperationId,
              sessionId: input.sessionId,
              pipelineStage: "planning",
              confidence: proposal.confidence,
              reason: proposal.reasoning,
            });
            trace.pushOperation(env);
            void lineage;
          }
          trace.endStage(`agent:${agentId}`, "ok", {
            confidence: proposal.confidence,
            opCount: proposal.operations.length,
          });
          trace.routing({
            candidate: agentId,
            selected: true,
            confidence: proposal.confidence,
          });
          break;
        } catch (err) {
          lastError = err;
          aiDiagnosticsStore.recordFailure({
            stage: `agent:${agentId}`,
            message: err instanceof Error ? err.message : String(err),
            severity: "warn",
            at: Date.now(),
            agent: agentId,
            sessionId: input.sessionId,
          });
          directive = this.retry.next(err, attempt, { agent: agentId });
          aiDiagnosticsStore.recordRetry({
            stage: `agent:${agentId}`,
            attempt: directive.attempt,
            at: Date.now(),
            reason: directive.reason,
            agent: agentId,
            sessionId: input.sessionId,
          });
          trace.retry();
          trace.endStage(`agent:${agentId}`, "failed", undefined, directive.reason);
          if (!directive.shouldRetry) {
            emit?.emit({
              type: "agent-rejected",
              agent: agentId,
              reason: directive.reason,
              severity: "warn",
            });
            trace.routing({
              candidate: agentId,
              selected: false,
              confidence: 0,
              reason: directive.reason,
            });
            break;
          }
          emit?.emit({
            type: "retry-started",
            attempt: directive.attempt,
            adjustment: directive.adjustment,
          });
          if (directive.delayMs > 0) {
            await new Promise((r) => setTimeout(r, directive!.delayMs));
          }
          attempt = directive.attempt;
        }
      }
    }

    /* 4. Consensus */
    trace.beginStage("consensus");
    emit?.emit({
      type: "consensus-started",
      candidates: proposals.map((p) => p.agent),
    });
    const consensus = this.consensus.decide(proposals);
    emit?.emit({
      type: "consensus-complete",
      winner: consensus.winner?.agent ?? null,
      disagreement: consensus.disagreementScore,
    });
    trace.endStage("consensus", consensus.winner ? "ok" : "failed", {
      disagreement: consensus.disagreementScore,
      rejected: consensus.rejected.map((r) => r.agent),
    });

    if (!consensus.winner || consensus.merged.length === 0) {
      trace.finish("failed", lastError ? String(lastError) : "no winner");
      aiExecutionTraceStore.record(trace.export());
      emit?.emit({ type: "trace-exported", traceId: trace.trace.traceId });
      return {
        plan: null,
        winnerAgent: null,
        disagreement: consensus.disagreementScore,
        proposals,
        traceId: trace.trace.traceId,
        pruned: budgeted.pruned,
      };
    }

    const plan: OperationPlan = {
      id: cryptoId("plan"),
      envelopes: consensus.merged,
      strategy: "sequential",
      description: consensus.reasoning,
    };

    /* 5. Pre-register a snapshot intent (committed by the pipeline) */
    const snapshot = aiSnapshotGraph.commit({
      parentSnapshotId:
        aiSnapshotGraph.branchHead("main")?.snapshotId ?? null,
      createdByAgent: consensus.winner.agent,
      operations: consensus.merged,
      rollbackOperations: [],
      summary: `Plano de ${consensus.winner.agent}: ${consensus.merged.length} op(s)`,
    });
    emit?.emit({
      type: "snapshot-created",
      snapshotId: snapshot.snapshotId,
      branch: snapshot.branch,
    });

    trace.finish("ok");
    aiExecutionTraceStore.record(trace.export());
    emit?.emit({ type: "trace-exported", traceId: trace.trace.traceId });

    return {
      plan,
      winnerAgent: consensus.winner.agent,
      disagreement: consensus.disagreementScore,
      proposals,
      traceId: trace.trace.traceId,
      snapshotIdHint: snapshot.snapshotId,
      pruned: budgeted.pruned,
    };
  }

  /**
   * Bridge to existing AgentRegistry surface. We expect each registered agent
   * to expose a `run(ctxPrompt, constraints, hints)` style method returning
   * either `{ envelopes }` or `{ operations }`. We adapt to AgentProposal.
   */
  private async invokeAgent(
    agentId: string,
    input: OrchestrationInput,
    contextPrompt: string,
    constraintsPrompt: string,
    directive: RetryDirective | null,
  ): Promise<AgentProposal | null> {
    const agent = agentRegistry.get(agentId);
    if (!agent) return null;

    const runner = (agent as unknown as {
      run?: (args: unknown) => Promise<unknown>;
      plan?: (args: unknown) => Promise<unknown>;
      propose?: (args: unknown) => Promise<unknown>;
    });
    const fn = runner.run ?? runner.plan ?? runner.propose;
    if (typeof fn !== "function") return null;

    const raw = await fn.call(agent, {
      project: input.project,
      prompt: input.prompt,
      contextPrompt,
      constraintsPrompt,
      sessionId: input.sessionId,
      sourcePromptId: input.sourcePromptId,
      adjustment: directive?.adjustment,
    });

    return normaliseProposal(agentId, raw);
  }
}

function normaliseProposal(
  agentId: string,
  raw: unknown,
): AgentProposal | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as {
    envelopes?: AIOperationEnvelope[];
    operations?: AIOperationEnvelope[];
    confidence?: number;
    reasoning?: string;
    weight?: number;
  };
  const operations = r.envelopes ?? r.operations ?? [];
  if (!Array.isArray(operations) || operations.length === 0) return null;
  return {
    agent: agentId,
    confidence: clamp01(r.confidence ?? 0.6),
    operations,
    reasoning: r.reasoning ?? "",
    weight: r.weight,
  };
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function cryptoId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export const aiOrchestrator = new AIOrchestrator();
