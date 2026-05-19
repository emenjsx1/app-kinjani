/**
 * Diagnostics Types (Phase 4.2)
 */

export type DiagnosticSeverity = "info" | "warn" | "error" | "fatal";

export interface StageTiming {
  stage: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  agent?: string;
  sessionId?: string;
}

export interface FailureRecord {
  stage: string;
  message: string;
  severity: DiagnosticSeverity;
  at: number;
  agent?: string;
  sessionId?: string;
  operationId?: string;
  code?: string;
}

export interface RetryRecord {
  stage: string;
  attempt: number;
  at: number;
  reason: string;
  agent?: string;
  sessionId?: string;
  parentOperationId?: string;
}

export interface RollbackRecord {
  snapshotId: string;
  at: number;
  reason?: string;
  sessionId?: string;
  opCount: number;
}

export interface AgentMetric {
  agent: string;
  successes: number;
  failures: number;
  retries: number;
  totalConfidence: number;
  totalOps: number;
  lastUsedAt: number;
}

export interface DiagnosticsSnapshot {
  takenAt: number;
  timings: StageTiming[];
  failures: FailureRecord[];
  retries: RetryRecord[];
  rollbacks: RollbackRecord[];
  agents: AgentMetric[];
  tokenEstimateTotal: number;
  conflictsDetected: number;
}
