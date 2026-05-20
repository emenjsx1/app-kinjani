import { describe, it } from "vitest";
import { interpretIntent } from "@/core/genesis/IntentInterpreter";
describe("diag", () => {
  it("fintech", () => {
    const p = "Create a futuristic luxury fintech platform for high-income entrepreneurs in Africa. Dark-mode luxury, cinematic, premium, powerful, editorial composition, floating UI, deep spacing rhythm, asymmetrical layouts, glassmorphism, high contrast hierarchy, layered storytelling, bold typography. Like Apple + Stripe + a futuristic African private bank.";
    console.log(JSON.stringify(interpretIntent(p), null, 2));
  });
});
