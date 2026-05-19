/**
 * Snapshot Graph (Phase 4.5)
 *
 * Replaces the previous *linear* history with a branching DAG so we can:
 *   - fork alternate AI revisions ("try a darker theme") without losing the main timeline
 *   - restore any branch by id
 *   - compare branches for diff UX
 *   - merge branches later (Phase 5)
 *
 * The graph is decoupled from the editor's HistoryEngine: HistoryEngine remains
 * the source of truth for synchronous local user edits; the snapshot graph
 * stores AI-authored checkpoints with provenance and rollback ops.
 */

import type { AIOperationEnvelope } from "../types";

export interface AISnapshotNode {
  snapshotId: string;
  parentSnapshotId: string | null;
  createdAt: number;
  createdByAgent: string;
  operations: AIOperationEnvelope[];
  rollbackOperations: AIOperationEnvelope[];
  summary: string;
  /** Branch name — defaults to "main". */
  branch: string;
  /** Optional opaque payload (project diff hash, screenshot id...). */
  attachments?: Record<string, unknown>;
}

export interface BranchInfo {
  name: string;
  headSnapshotId: string;
  createdAt: number;
}

export interface SnapshotDiff {
  added: AIOperationEnvelope[];
  removed: AIOperationEnvelope[];
  commonAncestor: string | null;
}

export class AISnapshotGraph {
  private nodes = new Map<string, AISnapshotNode>();
  private branches = new Map<string, BranchInfo>();
  private listeners = new Set<(node: AISnapshotNode) => void>();

  constructor() {
    // Auto-create main branch lazily on first commit.
  }

  /** Commit a new snapshot. */
  commit(input: Omit<AISnapshotNode, "snapshotId" | "createdAt" | "branch"> & {
    snapshotId?: string;
    branch?: string;
  }): AISnapshotNode {
    const node: AISnapshotNode = {
      snapshotId: input.snapshotId ?? cryptoId(),
      parentSnapshotId: input.parentSnapshotId,
      createdAt: Date.now(),
      createdByAgent: input.createdByAgent,
      operations: input.operations,
      rollbackOperations: input.rollbackOperations,
      summary: input.summary,
      branch: input.branch ?? "main",
      attachments: input.attachments,
    };
    this.nodes.set(node.snapshotId, node);
    this.branches.set(node.branch, {
      name: node.branch,
      headSnapshotId: node.snapshotId,
      createdAt: this.branches.get(node.branch)?.createdAt ?? node.createdAt,
    });
    this.emit(node);
    return node;
  }

  /** Fork a new branch from an existing snapshot. */
  fork(fromSnapshotId: string, newBranch: string): BranchInfo {
    const base = this.nodes.get(fromSnapshotId);
    if (!base) throw new Error(`Snapshot ${fromSnapshotId} not found`);
    if (this.branches.has(newBranch))
      throw new Error(`Branch ${newBranch} already exists`);
    const info: BranchInfo = {
      name: newBranch,
      headSnapshotId: fromSnapshotId,
      createdAt: Date.now(),
    };
    this.branches.set(newBranch, info);
    return info;
  }

  get(snapshotId: string): AISnapshotNode | undefined {
    return this.nodes.get(snapshotId);
  }

  branchHead(branch: string): AISnapshotNode | undefined {
    const info = this.branches.get(branch);
    return info ? this.nodes.get(info.headSnapshotId) : undefined;
  }

  listBranches(): BranchInfo[] {
    return Array.from(this.branches.values());
  }

  /** Walk from a snapshot back to the root. */
  ancestry(snapshotId: string): AISnapshotNode[] {
    const out: AISnapshotNode[] = [];
    let current: AISnapshotNode | undefined = this.nodes.get(snapshotId);
    while (current) {
      out.push(current);
      current = current.parentSnapshotId
        ? this.nodes.get(current.parentSnapshotId)
        : undefined;
    }
    return out.reverse();
  }

  /** Compare two snapshots — returns op-level diff plus common ancestor. */
  diff(aId: string, bId: string): SnapshotDiff {
    const a = this.ancestry(aId);
    const b = this.ancestry(bId);
    const aIds = new Set(a.map((n) => n.snapshotId));
    let commonAncestor: string | null = null;
    for (let i = b.length - 1; i >= 0; i--) {
      if (aIds.has(b[i].snapshotId)) {
        commonAncestor = b[i].snapshotId;
        break;
      }
    }
    const aOpsAfter = collectOpsAfter(a, commonAncestor);
    const bOpsAfter = collectOpsAfter(b, commonAncestor);
    return {
      added: bOpsAfter,
      removed: aOpsAfter,
      commonAncestor,
    };
  }

  /** Replay rollback operations from `snapshotId` back to `targetSnapshotId`. */
  rollbackOpsBetween(
    snapshotId: string,
    targetSnapshotId: string | null,
  ): AIOperationEnvelope[] {
    const ops: AIOperationEnvelope[] = [];
    let cur: AISnapshotNode | undefined = this.nodes.get(snapshotId);
    while (cur && cur.snapshotId !== targetSnapshotId) {
      ops.push(...cur.rollbackOperations);
      cur = cur.parentSnapshotId
        ? this.nodes.get(cur.parentSnapshotId)
        : undefined;
    }
    return ops;
  }

  subscribe(listener: (node: AISnapshotNode) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  exportGraph(): { nodes: AISnapshotNode[]; branches: BranchInfo[] } {
    return {
      nodes: Array.from(this.nodes.values()),
      branches: Array.from(this.branches.values()),
    };
  }

  clear(): void {
    this.nodes.clear();
    this.branches.clear();
  }

  private emit(node: AISnapshotNode): void {
    for (const l of this.listeners) {
      try {
        l(node);
      } catch {
        /* ignore */
      }
    }
  }
}

function collectOpsAfter(
  chain: AISnapshotNode[],
  commonAncestor: string | null,
): AIOperationEnvelope[] {
  const out: AIOperationEnvelope[] = [];
  let started = commonAncestor === null;
  for (const n of chain) {
    if (started) out.push(...n.operations);
    if (n.snapshotId === commonAncestor) started = true;
  }
  return out;
}

function cryptoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `snap_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export const aiSnapshotGraph = new AISnapshotGraph();
