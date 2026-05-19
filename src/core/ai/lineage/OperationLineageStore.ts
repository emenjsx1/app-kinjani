/**
 * OperationLineageStore (Phase 4.1)
 *
 * Tracks every AI operation produced in the system as a node in a DAG.
 * Used by:
 *   - SnapshotGraph (to associate ops with snapshots)
 *   - DiagnosticsStore (to aggregate per-agent metrics)
 *   - RetryCoordinator (to fork retries from a parent op)
 *   - ObservabilityTrace (to export full execution traces)
 *
 * Deterministic, in-memory, replayable. No I/O.
 */

import type {
  AIOperationMetadata,
  OperationLineageNode,
  OperationLineageQuery,
} from "./types";

export class OperationLineageStore {
  private nodes = new Map<string, OperationLineageNode>();
  private listeners = new Set<(node: OperationLineageNode) => void>();

  /** Record a new operation. Returns the materialized node. */
  record(metadata: AIOperationMetadata): OperationLineageNode {
    const ancestors = metadata.parentOperationId
      ? this.computeAncestors(metadata.parentOperationId)
      : [];
    const node: OperationLineageNode = {
      metadata,
      children: [],
      ancestors,
    };
    this.nodes.set(metadata.id, node);

    if (metadata.parentOperationId) {
      const parent = this.nodes.get(metadata.parentOperationId);
      if (parent && !parent.children.includes(metadata.id)) {
        parent.children.push(metadata.id);
      }
    }
    this.emit(node);
    return node;
  }

  /** Attach commit info after a snapshot is produced. */
  attachSnapshot(
    operationId: string,
    snapshotId: string,
    rollbackOpIds?: string[],
  ): void {
    const node = this.nodes.get(operationId);
    if (!node) return;
    node.snapshotId = snapshotId;
    if (rollbackOpIds) node.rollbackOpIds = rollbackOpIds;
  }

  get(operationId: string): OperationLineageNode | undefined {
    return this.nodes.get(operationId);
  }

  /** Full chain from root → operation. */
  trace(operationId: string): OperationLineageNode[] {
    const node = this.nodes.get(operationId);
    if (!node) return [];
    const chain: OperationLineageNode[] = [];
    for (const aid of node.ancestors) {
      const a = this.nodes.get(aid);
      if (a) chain.push(a);
    }
    chain.push(node);
    return chain;
  }

  /** All descendants of an operation (BFS). */
  descendants(operationId: string): OperationLineageNode[] {
    const seen = new Set<string>();
    const out: OperationLineageNode[] = [];
    const queue = [operationId];
    while (queue.length) {
      const id = queue.shift()!;
      if (seen.has(id)) continue;
      seen.add(id);
      const node = this.nodes.get(id);
      if (!node) continue;
      if (id !== operationId) out.push(node);
      queue.push(...node.children);
    }
    return out;
  }

  query(filter: OperationLineageQuery = {}): OperationLineageNode[] {
    const out: OperationLineageNode[] = [];
    for (const n of this.nodes.values()) {
      const m = n.metadata;
      if (filter.agent && m.agent !== filter.agent) continue;
      if (filter.sessionId && m.sessionId !== filter.sessionId) continue;
      if (filter.sourcePromptId && m.sourcePromptId !== filter.sourcePromptId)
        continue;
      if (filter.sinceMs && m.createdAt < filter.sinceMs) continue;
      if (
        filter.minConfidence !== undefined &&
        m.confidence < filter.minConfidence
      )
        continue;
      out.push(n);
    }
    return out;
  }

  subscribe(listener: (node: OperationLineageNode) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Export full graph (for trace export / debugging). */
  exportGraph(): OperationLineageNode[] {
    return Array.from(this.nodes.values());
  }

  clear(): void {
    this.nodes.clear();
  }

  private computeAncestors(parentId: string): string[] {
    const parent = this.nodes.get(parentId);
    if (!parent) return [parentId];
    return [...parent.ancestors, parentId];
  }

  private emit(node: OperationLineageNode): void {
    for (const l of this.listeners) {
      try {
        l(node);
      } catch {
        /* swallow listener errors */
      }
    }
  }
}

/** Process-wide default instance. */
export const operationLineageStore = new OperationLineageStore();
