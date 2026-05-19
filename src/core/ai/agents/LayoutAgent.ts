import type { Agent } from "./types";

/**
 * LayoutAgent — specializes in structure: ordering, adding, removing
 * sections. Phase 3 keeps it as a contract; concrete implementation will
 * proxy to the planner with a constrained schema in a later phase.
 */
export const layoutAgent: Agent = {
  id: "layout-agent",
  description: "Handles structural changes (add/remove/reorder sections).",
  canHandle({ prompt }) {
    return /(reorder|trocar ordem|mover|adicionar secção|remover secção|nova secção)/i.test(
      prompt,
    );
  },
  async run() {
    return { envelopes: [], message: "LayoutAgent stub — routed via planner." };
  },
};
