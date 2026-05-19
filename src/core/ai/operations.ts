import { z } from "zod";

/**
 * Zod schemas for AIOperation. Used by the applier to validate any
 * agent-produced payload before mutating project state.
 */
export const aiOperationSchema = z.discriminatedUnion("op", [
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
