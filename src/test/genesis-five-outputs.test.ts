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

const PROMPT = "A premium fashion atelier in Lisbon for discerning buyers";

describe("Genesis — 5 outputs structural divergence proof", () => {
  it("produces 5 structurally distinct experiences from the same prompt", async () => {
    const runs = await Promise.all(
      [1, 2, 3, 4, 5].map((n) =>
        generateExperience({ prompt: PROMPT, theme, seed: `run-${n}-${crypto.randomUUID()}` })
      )
    );

    const rows = runs.map((r, i) => ({
      run: i + 1,
      dna: r.dna.signature.slice(0, 8),
      beats: r.plan.beats.length,
      spatial: r.plan.beats.map((b) => b.spatial.slice(0, 3)).join("-"),
      kinds: r.plan.beats.map((b) => b.kind.slice(0, 4)).join("-"),
      rhythm: r.plan.beats.map((b) => b.emphasis.toFixed(2)).join(","),
      nodes: r.graph.nodes.length,
      energy: r.energy.profile,
      score: r.critique?.overall.toFixed(2),
    }));

    // Pretty-print to console so we have visible proof
    // eslint-disable-next-line no-console
    console.table(rows);

    // Assertions — all 5 must differ structurally
    const spatials = new Set(rows.map((r) => r.spatial));
    const kinds = new Set(rows.map((r) => r.kinds));
    const dnas = new Set(rows.map((r) => r.dna));

    expect(dnas.size).toBe(5);
    expect(spatials.size).toBeGreaterThanOrEqual(4);
    expect(kinds.size).toBeGreaterThanOrEqual(4);
  });
});
