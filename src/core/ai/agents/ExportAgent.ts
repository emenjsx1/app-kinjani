import type { AIAgent } from "./types";

export const exportAgent: AIAgent = {
  id: "export-agent",
  description: "Reserved for code generation / export in later phases.",
  async run() {
    return { envelopes: [], message: "ExportAgent reserved." };
  },
};
