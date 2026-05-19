import { z } from "zod";
import { defaultMeta } from "../applier";
import type { AITool } from "./types";
import { aiToolRegistry } from "./registry";

/**
 * A small set of built-in tools agents can invoke through tool/function
 * calling. Each emits AIOperationEnvelope[]; pipeline applies safely.
 */

export const setSectionPropTool: AITool<{
  sectionId: string;
  patch: Record<string, string>;
  label?: string;
}> = {
  id: "set_section_prop",
  description: "Update content fields of a section.",
  mutating: true,
  inputSchema: z.object({
    sectionId: z.string(),
    patch: z.record(z.string()),
    label: z.string().optional(),
  }),
  execute(input) {
    return {
      ok: true,
      envelopes: [
        {
          meta: defaultMeta({
            sourceAgent: "ui-agent",
            affectedComponents: [input.sectionId],
            label: input.label ?? "Update section",
          }),
          op: { op: "setSectionProp", sectionId: input.sectionId, patch: input.patch },
        },
      ],
    };
  },
};

export const setThemeTool: AITool<{ theme: Record<string, unknown>; label?: string }> = {
  id: "set_theme",
  description: "Patch the project theme tokens (colors, fonts).",
  mutating: true,
  inputSchema: z.object({ theme: z.record(z.unknown()), label: z.string().optional() }),
  execute(input) {
    return {
      ok: true,
      envelopes: [
        {
          meta: defaultMeta({ sourceAgent: "ui-agent", label: input.label ?? "Update theme" }),
          op: { op: "setTheme", theme: input.theme },
        },
      ],
    };
  },
};

export const reorderSectionsTool: AITool<{ orderedIds: string[] }> = {
  id: "reorder_sections",
  description: "Reorder the sections of the active page.",
  mutating: true,
  inputSchema: z.object({ orderedIds: z.array(z.string()) }),
  execute(input) {
    return {
      ok: true,
      envelopes: [
        {
          meta: defaultMeta({ sourceAgent: "layout-agent", label: "Reorder sections" }),
          op: { op: "reorderSections", orderedIds: input.orderedIds },
        },
      ],
    };
  },
};

export function registerBuiltinTools() {
  aiToolRegistry.register(setSectionPropTool);
  aiToolRegistry.register(setThemeTool);
  aiToolRegistry.register(reorderSectionsTool);
}

registerBuiltinTools();
