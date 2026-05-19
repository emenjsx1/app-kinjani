import type { Agent } from "./types";

export const responsiveAgent: Agent = {
  id: "responsive-agent",
  description: "Applies breakpoint-specific overrides.",
  canHandle({ prompt }) {
    return /(mobile|tablet|telemóvel|responsiv)/i.test(prompt);
  },
  async run() {
    return { envelopes: [], message: "ResponsiveAgent stub — routed via planner." };
  },
};
