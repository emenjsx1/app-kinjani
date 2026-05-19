import type { Project } from "@/core/projects/types";
import { applyOperationEnvelopes } from "../applier";
import type { AIOperationEnvelope, OperationResult } from "../types";

export interface SimulationReport {
  ok: boolean;
  results: OperationResult[];
  projectedProject: Project;
}

/**
 * Dry-run the envelopes against a *clone* of the project. Never mutates the
 * original. Used by the pipeline before commit.
 */
export const simulator = {
  run(project: Project, envs: AIOperationEnvelope[]): SimulationReport {
    const clone = structuredClone(project);
    const { project: projected, results } = applyOperationEnvelopes(clone, envs);
    return {
      ok: results.every((r) => r.ok),
      results,
      projectedProject: projected,
    };
  },
};
