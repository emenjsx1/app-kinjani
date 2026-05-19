import type { AIAgent } from "./types";

export const seoAgent: AIAgent = {
  id: "seo-agent",
  description: "Improves title/meta/OG/JSON-LD.",
  canHandle({ prompt }) {
    return /(seo|meta|título.*página|description|keywords|og)/i.test(prompt);
  },
  async run() {
    return { envelopes: [], message: "SEOAgent stub — routed via planner." };
  },
};
