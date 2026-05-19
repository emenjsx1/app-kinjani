/**
 * Structured-output schemas for AI operation plans.
 *
 * These are the ONLY contract agents (Edge Function + future browser agents)
 * use to communicate mutations. No regex/JSON.parse(match) fallbacks should
 * exist anywhere in the codebase — every payload is validated by Zod and
 * shaped by the matching JSON schema sent to the model.
 */
import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*  Zod                                                                       */
/* -------------------------------------------------------------------------- */

export const aiOperationZ = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("setSectionProp"),
    sectionId: z.string(),
    patch: z.record(z.string()),
  }),
  z.object({
    op: z.literal("addSection"),
    section: z.object({
      id: z.string(),
      type: z.string(),
      title: z.string(),
      content: z.record(z.string()),
      enabled: z.boolean(),
      order: z.number(),
      variant: z.number().optional(),
    }),
  }),
  z.object({ op: z.literal("removeSection"), sectionId: z.string() }),
  z.object({ op: z.literal("reorderSections"), orderedIds: z.array(z.string()) }),
  z.object({ op: z.literal("setTheme"), theme: z.record(z.unknown()) }),
  z.object({ op: z.literal("setSettings"), settings: z.record(z.unknown()) }),
  z.object({ op: z.literal("noop"), reason: z.string().optional() }),
]);

export const operationMetaZ = z.object({
  operationId: z.string(),
  parentOperationId: z.string().optional(),
  sourceAgent: z.enum([
    "planner",
    "layout-agent",
    "ui-agent",
    "copy-agent",
    "responsive-agent",
    "seo-agent",
    "fix-agent",
    "export-agent",
    "user",
    "system",
  ]),
  operationGroup: z.string().optional(),
  rollbackable: z.boolean(),
  affectedFiles: z.array(z.string()),
  affectedComponents: z.array(z.string()),
  dependsOn: z.array(z.string()).optional(),
  createdAt: z.string(),
  label: z.string().optional(),
});

export const aiOperationEnvelopeZ = z.object({
  meta: operationMetaZ,
  op: aiOperationZ,
});

export const operationPlanZ = z.object({
  id: z.string(),
  strategy: z.enum(["sequential", "parallel"]).default("sequential"),
  description: z.string().optional(),
  reasoning: z.string().optional(),
  envelopes: z.array(aiOperationEnvelopeZ),
  message: z.string().optional(),
});

export type AIOperationPlan = z.infer<typeof operationPlanZ>;

/* -------------------------------------------------------------------------- */
/*  JSON schema (for OpenAI / Gemini structured outputs)                      */
/* -------------------------------------------------------------------------- */

/**
 * Hand-tuned JSON Schema mirroring the Zod above. Kept minimal so providers
 * with strict structured-output validation (OpenAI `json_schema`,
 * Gemini `responseSchema`) accept it. Edit both together when changing ops.
 */
export const operationPlanJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "strategy", "envelopes"],
  properties: {
    id: { type: "string" },
    strategy: { type: "string", enum: ["sequential", "parallel"] },
    description: { type: "string" },
    reasoning: { type: "string" },
    message: { type: "string" },
    envelopes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["meta", "op"],
        properties: {
          meta: {
            type: "object",
            additionalProperties: false,
            required: [
              "operationId",
              "sourceAgent",
              "rollbackable",
              "affectedFiles",
              "affectedComponents",
              "createdAt",
            ],
            properties: {
              operationId: { type: "string" },
              parentOperationId: { type: "string" },
              sourceAgent: {
                type: "string",
                enum: [
                  "planner",
                  "layout-agent",
                  "ui-agent",
                  "copy-agent",
                  "responsive-agent",
                  "seo-agent",
                  "fix-agent",
                  "export-agent",
                  "user",
                  "system",
                ],
              },
              operationGroup: { type: "string" },
              rollbackable: { type: "boolean" },
              affectedFiles: { type: "array", items: { type: "string" } },
              affectedComponents: { type: "array", items: { type: "string" } },
              dependsOn: { type: "array", items: { type: "string" } },
              createdAt: { type: "string" },
              label: { type: "string" },
            },
          },
          op: {
            // Loose union; we re-validate strictly in Zod after parse.
            type: "object",
            properties: {
              op: { type: "string" },
              sectionId: { type: "string" },
              patch: { type: "object", additionalProperties: { type: "string" } },
              section: { type: "object" },
              orderedIds: { type: "array", items: { type: "string" } },
              theme: { type: "object" },
              settings: { type: "object" },
              reason: { type: "string" },
            },
            required: ["op"],
          },
        },
      },
    },
  },
} as const;
