import type { Agent } from "./types";

export const copyAgent: Agent = {
  id: "copy-agent",
  description: "Rewrites textual content with tone/length constraints.",
  canHandle({ prompt }) {
    return /(reescreve|texto|copy|título|headline|descrição|tom)/i.test(prompt);
  },
  async run() {
    return { envelopes: [], message: "CopyAgent stub — routed via planner." };
  },
};
