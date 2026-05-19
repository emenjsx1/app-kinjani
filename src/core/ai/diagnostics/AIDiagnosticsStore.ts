/**
 * AIDiagnosticsStore (Phase 4.2)
 *
 * Centralized, in-memory metrics collector for the AI pipeline.
 * Bounded buffers prevent unbounded memory growth.
 */

import type {
  AgentMetric,
  DiagnosticsSnapshot,
  FailureRecord,
  RetryRecord,
  RollbackRecord,
  StageTiming,
} from "./types";

const MAX_BUFFER = 500;

function bounded<T>(arr: T[], item: T): void {
  arr.push(item);
  if (arr.length > MAX_BUFFER) arr.splice(0, arr.length - MAX_BUFFER);
}

export class AIDiagnosticsStore {
  private timings: StageTiming[] = [];
  private failures: FailureRecord[] = [];
  private retries: RetryRecord[] = [];
  private rollbacks: RollbackRecord[] = [];
  private agents = new Map<string, AgentMetric>();
  private tokenEstimateTotal = 0;
  private conflictsDetected = 0;
  private listeners = new Set<(snap: DiagnosticsSnapshot) => void>();

  recordStage(timing: StageTiming): void {
    bounded(this.timings, timing);
    this.emit();
  }

  recordFailure(failure: FailureRecord): void {
    bounded(this.failures, failure);
    if (failure.agent) this.bumpAgent(failure.agent, "failure");
    this.emit();
  }

  recordRetry(retry: RetryRecord): void {
    bounded(this.retries, retry);
    if (retry.agent) this.bumpAgent(retry.agent, "retry");
    this.emit();
  }

  recordRollback(rollback: RollbackRecord): void {
    bounded(this.rollbacks, rollback);
    this.emit();
  }

  recordAgentMetric(agent: string, confidence: number, success: boolean): void {
    this.bumpAgent(agent, success ? "success" : "failure", confidence);
    this.emit();
  }

  recordTokens(estimate: number): void {
    this.tokenEstimateTotal += Math.max(0, estimate | 0);
  }

  recordConflict(count = 1): void {
    this.conflictsDetected += count;
  }

  snapshot(): DiagnosticsSnapshot {
    return {
      takenAt: Date.now(),
      timings: this.timings.slice(),
      failures: this.failures.slice(),
      retries: this.retries.slice(),
      rollbacks: this.rollbacks.slice(),
      agents: Array.from(this.agents.values()),
      tokenEstimateTotal: this.tokenEstimateTotal,
      conflictsDetected: this.conflictsDetected,
    };
  }

  subscribe(listener: (snap: DiagnosticsSnapshot) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  clear(): void {
    this.timings = [];
    this.failures = [];
    this.retries = [];
    this.rollbacks = [];
    this.agents.clear();
    this.tokenEstimateTotal = 0;
    this.conflictsDetected = 0;
  }

  private bumpAgent(
    agent: string,
    kind: "success" | "failure" | "retry",
    confidence?: number,
  ): void {
    const existing = this.agents.get(agent) ?? {
      agent,
      successes: 0,
      failures: 0,
      retries: 0,
      totalConfidence: 0,
      totalOps: 0,
      lastUsedAt: 0,
    };
    if (kind === "success") existing.successes += 1;
    if (kind === "failure") existing.failures += 1;
    if (kind === "retry") existing.retries += 1;
    if (typeof confidence === "number") {
      existing.totalConfidence += confidence;
      existing.totalOps += 1;
    }
    existing.lastUsedAt = Date.now();
    this.agents.set(agent, existing);
  }

  private emit(): void {
    if (this.listeners.size === 0) return;
    const snap = this.snapshot();
    for (const l of this.listeners) {
      try {
        l(snap);
      } catch {
        /* ignore */
      }
    }
  }
}

export const aiDiagnosticsStore = new AIDiagnosticsStore();

/** Convenience: time an async stage and record it. */
export async function timeStage<T>(
  store: AIDiagnosticsStore,
  stage: string,
  fn: () => Promise<T>,
  meta?: { agent?: string; sessionId?: string },
): Promise<T> {
  const startedAt = Date.now();
  try {
    return await fn();
  } finally {
    const endedAt = Date.now();
    store.recordStage({
      stage,
      startedAt,
      endedAt,
      durationMs: endedAt - startedAt,
      agent: meta?.agent,
      sessionId: meta?.sessionId,
    });
  }
}
