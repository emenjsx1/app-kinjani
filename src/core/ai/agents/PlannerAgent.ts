import { supabase } from "@/integrations/supabase/client";
import { AIContextBuilder } from "../context/AIContextBuilder";
import { validator } from "../pipeline/validator";
import type { AIAgent, AgentRunResult } from "./types";

/**
 * PlannerAgent — server-side strategist. Calls the `ai-edit-website` edge
 * function (now structured-output enabled) and returns a validated plan.
 * Falls back to a routing decision (`nextAgent`) when the plan is empty.
 */
export const plannerAgent: AIAgent = {
  id: "planner",
  description: "Plans an OperationPlan from the user's intent and project context.",
  async run({ prompt, context, emitter }): Promise<AgentRunResult> {
    emitter?.emit({ type: "stage", stage: "planning" });

    const { data, error } = await supabase.functions.invoke("ai-edit-website", {
      body: {
        mode: "plan",
        prompt,
        context: AIContextBuilder.toPrompt(context),
      },
    });

    if (error || !data?.success) {
      const msg = data?.error ?? error?.message ?? "Planner failed";
      emitter?.emit({ type: "error", message: msg });
      return { envelopes: [], message: msg };
    }

    // Modern path: edge fn returns { plan }.
    if (data.plan) {
      const v = validator.validatePlan(data.plan);
      if (v.ok) {
        emitter?.emit({ type: "plan", envelopes: v.plan.envelopes });
        return {
          envelopes: v.plan.envelopes,
          message: v.plan.message ?? data.message,
          data: { reasoning: v.plan.reasoning },
        };
      }
      emitter?.emit({ type: "error", message: "Invalid plan shape." });
      return { envelopes: [], message: "Invalid plan shape." };
    }

    // Legacy fallback: edge fn returned a whole template.
    return {
      envelopes: [],
      message: data.message,
      data: { legacyTemplate: data.template },
    };
  },
};
