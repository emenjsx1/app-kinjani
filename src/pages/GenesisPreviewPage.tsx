import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { generateExperience, type GenerativeResult } from "@/core/genesis";
import { CompositionRenderer } from "@/core/render/CompositionRenderer";
import type { GraphTheme } from "@/core/render/composition-graph";

const DEFAULT_PROMPT =
  "Create a premium tourism experience for luxury travel in Mozambique. Warm, cinematic, premium, immersive, emotionally rich. Use large destination imagery, editorial storytelling, layered layouts, magazine composition, beautiful whitespace, floating travel cards.";

const theme: GraphTheme = {
  primary: "25 70% 45%",
  secondary: "200 40% 30%",
  accent: "40 90% 55%",
  background: "30 25% 97%",
  text: "20 20% 12%",
  font: "Inter",
  mood: "editorial",
};

export default function GenesisPreviewPage() {
  const [sp] = useSearchParams();
  const prompt = sp.get("prompt") || DEFAULT_PROMPT;
  const count = Number(sp.get("n") || 5);
  const [runs, setRuns] = useState<GenerativeResult[]>([]);

  const seeds = useMemo(
    () => Array.from({ length: count }, (_, i) => `preview-run-${i + 1}-${Math.random().toString(36).slice(2, 8)}`),
    [count, prompt]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      const results = await Promise.all(
        seeds.map((seed) => generateExperience({ prompt, theme, seed }))
      );
      if (alive) setRuns(results);
    })();
    return () => {
      alive = false;
    };
  }, [seeds, prompt]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur border-b px-6 py-3">
        <h1 className="text-lg font-semibold">Genesis preview — {runs.length}/{count} gerações</h1>
        <p className="text-xs text-muted-foreground line-clamp-1">{prompt}</p>
      </header>

      <div className="space-y-16 py-8">
        {runs.map((r, idx) => (
          <section key={r.dna.signature + idx} className="space-y-4">
            <div className="px-6 flex flex-wrap gap-3 text-xs">
              <span className="px-2 py-1 rounded bg-primary/10 text-primary font-mono">RUN {idx + 1}</span>
              <span className="px-2 py-1 rounded bg-muted">beats: <b>{r.plan.beats.length}</b></span>
              <span className="px-2 py-1 rounded bg-muted">energy: <b>{r.energy.label}</b></span>
              <span className="px-2 py-1 rounded bg-muted">dna: <b>{r.dna.signature.slice(0, 8)}</b></span>
              <span className="px-2 py-1 rounded bg-muted">score: <b>{r.critique?.overall.toFixed(2)}</b></span>
              <span className="px-2 py-1 rounded bg-muted font-mono">
                {r.plan.beats.map((b) => `${b.kind.slice(0, 4)}/${b.spatial.slice(0, 3)}`).join(" · ")}
              </span>
            </div>
            <div className="mx-6 border-2 border-dashed border-border rounded-xl overflow-hidden bg-background" style={{ height: 900 }}>
              <div style={{ width: 1400, transform: "scale(0.55)", transformOrigin: "top left", height: 1636 }}>
                <CompositionRenderer graph={r.graph} />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
