import type { AIAgent } from "./types";

export const responsiveAgent: AIAgent = {
  id: "responsive-agent",
  description: "Applies breakpoint-specific overrides.",
  canHandle({ prompt }) {
    return /(mobile|tablet|telemóvel|responsiv)/i.test(prompt);
  },
  async run() {
    return { envelopes: [], message: "ResponsiveAgent stub — routed via planner." };
  },
};
