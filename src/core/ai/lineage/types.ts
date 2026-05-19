/**
 * Operation Lineage Types (Phase 4.1)
 *
 * Every AI operation carries provenance metadata so we can:
 * - trace which agent generated it
 * - link it to its parent operation (for refinements / retries)
 * - replay or revert any chain deterministically
 */

export interface AIOperationMetadata {
  /** Stable identifier for this operation. */
  id: string;
  /** Epoch ms when the operation was created. */
  createdAt: number;
  /** Identifier of the agent (or "user", "system") that produced it. */
  agent: string;
  /** Prompt id from AIMemoryStore that triggered this operation. */
  sourcePromptId: string;
  /** Parent operation id, when this op was derived from another (retry / refinement). */
  parentOperationId?: string;
  /** Session/conversation id (used by AIMemoryStore). */
  sessionId: string;
  /** Pipeline stage that produced or last touched this op. */
  pipelineStage: string;
  /** 0..1 — agent self-reported confidence for this op. */
  confidence: number;
  /** Optional human readable reason for this op. */
  reason?: string;
  /** Optional structured tags (model, route, branch...). */
  tags?: Record<string, string>;
}

/**
 * A node inside the operation lineage graph.
 * Stored in OperationLineageStore.
 */
export interface OperationLineageNode {
  metadata: AIOperationMetadata;
  /** Direct descendants (refinements / retries). */
  children: string[];
  /** Full ancestor chain, root → parent. */
  ancestors: string[];
  /** Optional snapshot id this op was committed into. */
  snapshotId?: string;
  /** Optional rollback envelope ids (in AIOperationEnvelope.inverse). */
  rollbackOpIds?: string[];
}

export interface OperationLineageQuery {
  agent?: string;
  sessionId?: string;
  sourcePromptId?: string;
  sinceMs?: number;
  minConfidence?: number;
}
