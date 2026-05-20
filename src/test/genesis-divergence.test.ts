import { describe, it, expect } from "vitest";
import { generateExperience } from "@/core/genesis";
import type { GraphTheme } from "@/core/render/composition-graph";

const theme: GraphTheme = {
  primary: "220 70% 50%",
  secondary: "280 60% 50%",
  accent: "40 90% 55%",
  background: "0 0% 100%",
  text: "0 0% 10%",
  font: "Inter",
  mood: "editorial",
};

describe("Genesis divergence", () => {
  it("two prompts in the same niche produce structurally different experiences", async () => {
    const a = await generateExperience({
      prompt: "A premium fashion atelier in Lisbon for discerning buyers",
      theme,
      seed: "fashion-a",
    });
    const b = await generateExperience({
      prompt: "A premium fashion atelier in Lisbon for discerning buyers",
      theme,
      seed: "fashion-b",
    });

    expect(a.dna.signature).not.toEqual(b.dna.signature);
    // Different beat count OR different spatial dialect order
    const aSpatial = a.plan.beats.map((x) => x.spatial).join(",");
    const bSpatial = b.plan.beats.map((x) => x.spatial).join(",");
    expect(aSpatial).not.toEqual(bSpatial);
  });

  it("critique reports an overall score in [0,1]", async () => {
    const r = await generateExperience({
      prompt: "A fintech dashboard for early-stage startups",
      theme,
      seed: "fintech-x",
    });
    expect(r.critique).toBeDefined();
    expect(r.critique!.overall).toBeGreaterThanOrEqual(0);
    expect(r.critique!.overall).toBeLessThanOrEqual(1);
  });
});
