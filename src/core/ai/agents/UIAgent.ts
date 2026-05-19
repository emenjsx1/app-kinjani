import type { AIAgent } from "./types";

export const uiAgent: AIAgent = {
  id: "ui-agent",
  description: "Adjusts visual properties of components (spacing, color, size).",
  canHandle({ prompt }) {
    return /(cor|color|fundo|espaç|padding|margin|tamanho|fonte|font|botão)/i.test(prompt);
  },
  async run() {
    return { envelopes: [], message: "UIAgent stub — routed via planner." };
  },
};
