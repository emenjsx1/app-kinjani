import type { AIOperationEnvelope, OperationResult } from "../types";

export type AIStreamEvent =
  | { type: "stage"; stage: AIStreamStage; message?: string }
  | { type: "plan"; envelopes: AIOperationEnvelope[] }
  | { type: "operation:start"; operationId: string; label?: string }
  | { type: "operation:result"; result: OperationResult }
  | { type: "message"; role: "assistant" | "system"; content: string }
  | { type: "error"; message: string }
  | { type: "done" };

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
  | "diagnostics";

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
};
