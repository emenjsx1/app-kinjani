import type { Project } from "@/core/projects/types";
import { applyOperationEnvelopes, defaultMeta } from "../applier";
import { AIMemoryStore } from "../memory/AIMemoryStore";
import { AIStreamEmitter } from "../streaming/StreamEmitter";
import type { AIOperationEnvelope, OperationResult } from "../types";
import { conflictResolver } from "./conflictResolver";
import { defaultPermissions, permissions, type PermissionContext } from "./permissions";
import { simulator } from "./simulator";
import { validator } from "./validator";

export interface PipelineRunInput {
  project: Project;
  /** Unvalidated agent payload (operation plan OR envelopes). */
  payload: unknown;
  memory?: AIMemoryStore;
  emitter?: AIStreamEmitter;
  perms?: PermissionContext;
  /** Caller-provided commit step: applies & persists to whatever store. */
  commit: (project: Project, envelopes: AIOperationEnvelope[]) => Promise<void> | void;
}

export interface PipelineRunResult {
  ok: boolean;
  project: Project;
  applied: AIOperationEnvelope[];
  results: OperationResult[];
  denied: { envelope: AIOperationEnvelope; reason: string }[];
  conflictsResolved: number;
  errors: string[];
  message?: string;
}

/**
 * OperationPipeline — the single safe entry point for applying AI mutations.
 *
 * Prompt → PlannerAgent (caller) → OperationPlan → Validation →
 *  Conflict detection → Permission checks → Simulation → Apply → Snapshot
 *  (via commit) → Diagnostics.
 */
export const OperationPipeline = {
  async run(input: PipelineRunInput): Promise<PipelineRunResult> {
    const errors: string[] = [];
    const { project, payload, memory, emitter, perms = defaultPermissions, commit } = input;

    emitter?.emit({ type: "stage", stage: "validating" });

    // 1. Validate — accept either OperationPlan or AIOperationEnvelope[].
    const planResult = validator.validatePlan(payload);
    let envelopes: AIOperationEnvelope[] = [];
    let message: string | undefined;
    if (planResult.ok) {
      envelopes = planResult.plan.envelopes;
      message = planResult.plan.message;
    } else if (Array.isArray(payload)) {
      const ev = validator.validateEnvelopes(payload as unknown[]);
      envelopes = ev.valid;
      if (!ev.ok) errors.push(...ev.errors.map((e) => `Envelope[${e.index}]: ${e.message}`));
    } else {
      errors.push("Payload does not match OperationPlan schema.");
      emitter?.emit({ type: "error", message: errors.join(" / ") });
      return {
        ok: false,
        project,
        applied: [],
        results: [],
        denied: [],
        conflictsResolved: 0,
        errors,
      };
    }

    emitter?.emit({ type: "plan", envelopes });

    // 2. Conflict detection + resolution.
    emitter?.emit({ type: "stage", stage: "checking-conflicts" });
    const conflicts = conflictResolver.detect(envelopes, project);
    const deconflicted = conflictResolver.resolve(envelopes, conflicts);

    // 3. Permission check.
    emitter?.emit({ type: "stage", stage: "checking-permissions" });
    const { allowed, denied } = permissions.check(deconflicted, perms);

    // 4. Simulation.
    emitter?.emit({ type: "stage", stage: "simulating" });
    const sim = simulator.run(project, allowed);
    if (!sim.ok) {
      const failed = sim.results.filter((r) => !r.ok);
      errors.push(...failed.map((r) => `${r.operationId}: ${r.error}`));
      emitter?.emit({ type: "error", message: errors.join(" / ") });
      return {
        ok: false,
        project,
        applied: [],
        results: sim.results,
        denied,
        conflictsResolved: conflicts.length,
        errors,
      };
    }

    // 5. Apply (real) — emit per-op events.
    emitter?.emit({ type: "stage", stage: "applying" });
    for (const env of allowed) {
      emitter?.emit({
        type: "operation:start",
        operationId: env.meta.operationId,
        label: env.meta.label,
      });
    }
    const { project: next, results } = applyOperationEnvelopes(project, allowed);
    for (const r of results) emitter?.emit({ type: "operation:result", result: r });

    // 6. Memory bookkeeping.
    memory?.recordOperations(allowed);
    for (const r of results) {
      if (r.rollbackOp) {
        memory?.recordRollbackRef(
          r.operationId,
          defaultMeta({ sourceAgent: "system", label: "rollback" }).operationId,
        );
      }
    }

    // 7. Snapshot (caller commits to store / history).
    emitter?.emit({ type: "stage", stage: "snapshotting" });
    await commit(next, allowed);

    emitter?.emit({ type: "stage", stage: "diagnostics" });
    emitter?.emit({ type: "done" });

    return {
      ok: true,
      project: next,
      applied: allowed,
      results,
      denied,
      conflictsResolved: conflicts.length,
      errors,
      message,
    };
  },
};
