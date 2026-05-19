import type { Agent } from "./types";

export const exportAgent: Agent = {
  id: "export-agent",
  description: "Reserved for code generation / export in later phases.",
  async run() {
    return { envelopes: [], message: "ExportAgent reserved." };
  },
};
