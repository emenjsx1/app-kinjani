import type { Project } from "@/core/projects/types";
import type { AIOperationEnvelope, OperationConflict } from "../types";

/**
 * Detects conflicts inside a plan. Examples: two ops mutate the same section
 * with overlapping patch keys; reorderSections + removeSection of same id;
 * setTheme overlapping keys, etc.
 */
export const conflictResolver = {
  detect(envs: AIOperationEnvelope[], _project: Project): OperationConflict[] {
    const conflicts: OperationConflict[] = [];
    const seenPatchKeys = new Map<string, Map<string, string>>(); // sectionId -> key -> firstOpId
    const removedSections = new Map<string, string>();
    const reorderOps: string[] = [];

    for (const env of envs) {
      const op = env.op;
      switch (op.op) {
        case "setSectionProp": {
          if (removedSections.has(op.sectionId)) {
            conflicts.push({
              operationId: env.meta.operationId,
              conflictsWith: [removedSections.get(op.sectionId)!],
              reason: `setSectionProp targets removed section ${op.sectionId}`,
            });
          }
          let map = seenPatchKeys.get(op.sectionId);
          if (!map) {
            map = new Map();
            seenPatchKeys.set(op.sectionId, map);
          }
          for (const key of Object.keys(op.patch)) {
            const prior = map.get(key);
            if (prior) {
              conflicts.push({
                operationId: env.meta.operationId,
                conflictsWith: [prior],
                reason: `Duplicate patch on ${op.sectionId}.${key}`,
              });
            } else {
              map.set(key, env.meta.operationId);
            }
          }
          break;
        }
        case "removeSection":
          removedSections.set(op.sectionId, env.meta.operationId);
          break;
        case "reorderSections":
          if (reorderOps.length) {
            conflicts.push({
              operationId: env.meta.operationId,
              conflictsWith: reorderOps.slice(),
              reason: "Multiple reorder operations in same plan",
            });
          }
          reorderOps.push(env.meta.operationId);
          break;
        default:
          break;
      }
    }
    return conflicts;
  },

  /** Strategy: drop later conflicting envelopes (last-writer-loses). */
  resolve(envs: AIOperationEnvelope[], conflicts: OperationConflict[]): AIOperationEnvelope[] {
    if (!conflicts.length) return envs;
    const drop = new Set(conflicts.map((c) => c.operationId));
    return envs.filter((e) => !drop.has(e.meta.operationId));
  },
};
