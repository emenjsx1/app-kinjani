import { aiOperationEnvelopeZ, operationPlanZ } from "../schemas/operationPlan";
import type { AIOperationEnvelope } from "../types";

export interface ValidationError {
  index: number;
  operationId?: string;
  message: string;
}

export const validator = {
  validatePlan(raw: unknown) {
    const parsed = operationPlanZ.safeParse(raw);
    return parsed.success
      ? { ok: true as const, plan: parsed.data }
      : { ok: false as const, errors: parsed.error.flatten() };
  },
  validateEnvelopes(envs: unknown[]): { ok: boolean; errors: ValidationError[]; valid: AIOperationEnvelope[] } {
    const errors: ValidationError[] = [];
    const valid: AIOperationEnvelope[] = [];
    envs.forEach((e, i) => {
      const r = aiOperationEnvelopeZ.safeParse(e);
      if (r.success) valid.push(r.data);
      else
        errors.push({
          index: i,
          message: r.error.issues.map((iss) => iss.message).join("; "),
        });
    });
    return { ok: errors.length === 0, errors, valid };
  },
};
