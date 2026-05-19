import type { AIOperationEnvelope, OperationResult } from "../types";

export type StreamEventSeverity = "info" | "warn" | "error";

/** Common envelope fields attached to every emitted event. Auto-filled by emitter. */
export interface StreamEventCommon {
  timestamp?: number;
  duration?: number;
  agent?: string;
  severity?: StreamEventSeverity;
}

export type AIStreamEvent = StreamEventCommon &
  (
    | { type: "stage"; stage: AIStreamStage; message?: string }
    | { type: "plan"; envelopes: AIOperationEnvelope[] }
    | { type: "operation:start"; operationId: string; label?: string }
    | { type: "operation:result"; result: OperationResult }
    | { type: "message"; role: "assistant" | "system"; content: string }
    | { type: "error"; message: string }
    | { type: "done" }
    /* Phase 4 — orchestration events */
    | { type: "agent-selected"; agent: string; reason?: string }
    | { type: "agent-rejected"; agent: string; reason?: string }
    | { type: "consensus-started"; candidates: string[] }
    | {
        type: "consensus-complete";
        winner: string | null;
        disagreement: number;
      }
    | { type: "retry-started"; attempt: number; adjustment: string }
    | { type: "retry-failed"; attempt: number; reason: string }
    | { type: "snapshot-created"; snapshotId: string; branch: string }
    | {
        type: "context-pruned";
        droppedHistory: number;
        collapsedSections: number;
      }
    | { type: "diagnostics-recorded"; metric: string; value: number }
    | { type: "trace-exported"; traceId: string }
  );

export type AIStreamStage =
  | "analyzing-context"
  | "planning"
  | "generating-operations"
  | "validating"
  | "checking-conflicts"
  | "checking-permissions"
  | "simulating"
  | "applying"
  | "snapshotting"
  | "rendering"
  | "diagnostics"
  | "consensus"
  | "retrying";

export const STAGE_LABELS_PT: Record<AIStreamStage, string> = {
  "analyzing-context": "A analisar o contexto",
  planning: "A planear alterações",
  "generating-operations": "A gerar operações",
  validating: "A validar operações",
  "checking-conflicts": "A detectar conflitos",
  "checking-permissions": "A verificar permissões",
  simulating: "A simular alterações",
  applying: "A aplicar operações",
  snapshotting: "A gravar snapshot",
  rendering: "A renderizar",
  diagnostics: "A analisar resultado",
  consensus: "A combinar propostas de agentes",
  retrying: "A repetir tentativa",
};
