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
    if (!parsed.success) return { ok: false as const, errors: parsed.error.flatten() };
    return {
      ok: true as const,
      plan: {
        ...parsed.data,
        envelopes: parsed.data.envelopes as unknown as AIOperationEnvelope[],
      },
    };
  },
  validateEnvelopes(envs: unknown[]): { ok: boolean; errors: ValidationError[]; valid: AIOperationEnvelope[] } {
    const errors: ValidationError[] = [];
    const valid: AIOperationEnvelope[] = [];
    envs.forEach((e, i) => {
      const r = aiOperationEnvelopeZ.safeParse(e);
      if (r.success) valid.push(r.data as unknown as AIOperationEnvelope);
      else
        errors.push({
          index: i,
          message: r.error.issues.map((iss) => iss.message).join("; "),
        });
    });
    return { ok: errors.length === 0, errors, valid };
  },
};
