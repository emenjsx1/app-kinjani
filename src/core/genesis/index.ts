/**
 * Genesis — entry point for AI-first generation.
 *
 *   generateExperience({ prompt, theme }) → GenerativeResult
 *
 * Pipeline:
 *   prompt
 *     → interpretIntent
 *     → generateVisualDNA
 *     → deriveEnergy
 *     → planComposition (narrative beats, not sections)
 *     → authorGraph
 *     → critiqueLocal
 *     → regenerate weak beats (≤ N rounds)
 */
import type { GraphTheme } from "@/core/render/composition-graph";
import { generateVisualDNA } from "@/core/dna";
import { interpretIntent } from "./IntentInterpreter";
import { deriveEnergy } from "./EnergyEngine";
import { planComposition } from "./CompositionPlanner";
import { authorGraph } from "./GraphAuthor";
import { critiqueLocal } from "@/core/critique/CritiqueEngine";
import type { GenerativeResult, CompositionPlan, Beat } from "./types";

export * from "./types";
export { interpretIntent } from "./IntentInterpreter";
export { deriveEnergy } from "./EnergyEngine";
export { planComposition } from "./CompositionPlanner";
export { authorGraph } from "./GraphAuthor";

const SPATIAL_OPTIONS: Beat["spatial"][] = [
  "editorial", "bento", "asymmetric", "broken", "overlap", "monolithic", "magazine", "freeform",
];

export interface GenerateOptions {
  prompt: string;
  theme: GraphTheme;
  /** Stable per-project seed (e.g. websiteId + name). */
  seed?: string;
  /** Max regeneration rounds. Default 2. */
  maxRounds?: number;
}

export async function generateExperience(opts: GenerateOptions): Promise<GenerativeResult> {
  const { prompt, theme, seed = prompt, maxRounds = 2 } = opts;

  const intent = interpretIntent(prompt);
  const dna = generateVisualDNA(seed);
  const energy = deriveEnergy(intent, dna);

  let plan: CompositionPlan = planComposition(intent, energy, dna);
  let graph = authorGraph(intent, energy, plan, dna, theme);
  let critique = critiqueLocal(graph, plan);
  let iterations = 1;

  while (!critique.passed && iterations <= maxRounds) {
    plan = regenerateWeakBeats(plan, critique.weakBeats, dna.signature + ":" + iterations);
    graph = authorGraph(intent, energy, plan, dna, theme);
    critique = critiqueLocal(graph, plan);
    iterations++;
  }

  return { intent, energy, plan, dna, graph, critique, iterations };
}

function regenerateWeakBeats(plan: CompositionPlan, weakIds: string[], salt: string): CompositionPlan {
  if (!weakIds.length) return plan;
  let t = 0;
  for (let i = 0; i < salt.length; i++) t = (t * 31 + salt.charCodeAt(i)) >>> 0;
  const rand = () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };

  const beats = plan.beats.map((b, i) => {
    if (!weakIds.includes(b.id)) return b;
    // Force a different spatial than its neighbour to break runs
    const neighbour = plan.beats[i - 1]?.spatial;
    const pool = SPATIAL_OPTIONS.filter((s) => s !== neighbour && s !== b.spatial);
    const spatial = pool[Math.floor(rand() * pool.length)];
    const emphasis = Math.max(0.3, Math.min(0.95, b.emphasis + (rand() - 0.3) * 0.4));
    return { ...b, spatial, emphasis };
  });

  return { ...plan, beats, rhythm: beats.map((b) => b.density) };
}
