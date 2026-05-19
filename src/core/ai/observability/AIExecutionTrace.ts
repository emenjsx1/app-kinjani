/**
 * Execution Observability (Phase 4.6)
 *
 * Captures structured traces of every AI pipeline run for debugging panels,
 * post-mortems, and (future) cloud telemetry. No I/O — pure in-memory.
 */

import type { AIOperationEnvelope } from "../types";

export interface PipelineStageTrace {
  stage: string;
  startedAt: number;
  endedAt?: number;
  durationMs?: number;
  status: "running" | "ok" | "failed" | "skipped";
  agent?: string;
  message?: string;
  data?: Record<string, unknown>;
}

export interface AgentRoutingDecision {
  at: number;
  candidate: string;
  selected: boolean;
  confidence: number;
  reason?: string;
}

export interface ValidationReport {
  at: number;
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export interface SimulatorDiff {
  at: number;
  ok: boolean;
  pageCount: number;
  sectionCount: number;
  errorMessage?: string;
}

export interface AIExecutionTrace {
  traceId: string;
  sessionId: string;
  sourcePromptId: string;
  startedAt: number;
  endedAt?: number;
  status: "running" | "ok" | "failed" | "cancelled";
  stages: PipelineStageTrace[];
  routing: AgentRoutingDecision[];
  retries: number;
  operations: AIOperationEnvelope[];
  validations: ValidationReport[];
  simulator?: SimulatorDiff;
  errorMessage?: string;
}

/**
 * AIExecutionTraceRecorder — one instance per pipeline run.
 * Cheap to construct; collected centrally by AIExecutionTraceStore.
 */
export class AIExecutionTraceRecorder {
  readonly trace: AIExecutionTrace;
  private activeStages = new Map<string, PipelineStageTrace>();

  constructor(input: {
    sessionId: string;
    sourcePromptId: string;
    traceId?: string;
  }) {
    this.trace = {
      traceId: input.traceId ?? cryptoId(),
      sessionId: input.sessionId,
      sourcePromptId: input.sourcePromptId,
      startedAt: Date.now(),
      status: "running",
      stages: [],
      routing: [],
      retries: 0,
      operations: [],
      validations: [],
    };
  }

  beginStage(stage: string, agent?: string, message?: string): void {
    const t: PipelineStageTrace = {
      stage,
      startedAt: Date.now(),
      status: "running",
      agent,
      message,
    };
    this.trace.stages.push(t);
    this.activeStages.set(stage, t);
  }

  endStage(
    stage: string,
    status: "ok" | "failed" | "skipped",
    data?: Record<string, unknown>,
    message?: string,
  ): void {
    const t = this.activeStages.get(stage);
    if (!t) return;
    t.endedAt = Date.now();
    t.durationMs = t.endedAt - t.startedAt;
    t.status = status;
    if (data) t.data = data;
    if (message) t.message = message;
    this.activeStages.delete(stage);
  }

  routing(decision: Omit<AgentRoutingDecision, "at">): void {
    this.trace.routing.push({ ...decision, at: Date.now() });
  }

  retry(): void {
    this.trace.retries += 1;
  }

  pushOperation(env: AIOperationEnvelope): void {
    this.trace.operations.push(env);
  }

  validation(report: Omit<ValidationReport, "at">): void {
    this.trace.validations.push({ ...report, at: Date.now() });
  }

  simulator(diff: Omit<SimulatorDiff, "at">): void {
    this.trace.simulator = { ...diff, at: Date.now() };
  }

  finish(status: "ok" | "failed" | "cancelled", errorMessage?: string): void {
    this.trace.endedAt = Date.now();
    this.trace.status = status;
    if (errorMessage) this.trace.errorMessage = errorMessage;
  }

  export(): AIExecutionTrace {
    return JSON.parse(JSON.stringify(this.trace)) as AIExecutionTrace;
  }
}

const MAX_TRACES = 50;

export class AIExecutionTraceStore {
  private traces: AIExecutionTrace[] = [];
  private listeners = new Set<(trace: AIExecutionTrace) => void>();

  record(trace: AIExecutionTrace): void {
    this.traces.push(trace);
    if (this.traces.length > MAX_TRACES) {
      this.traces.splice(0, this.traces.length - MAX_TRACES);
    }
    for (const l of this.listeners) {
      try {
        l(trace);
      } catch {
        /* ignore */
      }
    }
  }

  list(): AIExecutionTrace[] {
    return this.traces.slice();
  }

  get(traceId: string): AIExecutionTrace | undefined {
    return this.traces.find((t) => t.traceId === traceId);
  }

  subscribe(listener: (trace: AIExecutionTrace) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  clear(): void {
    this.traces = [];
  }
}

export const aiExecutionTraceStore = new AIExecutionTraceStore();

function cryptoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `trace_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}
