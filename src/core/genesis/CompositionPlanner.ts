import type { Intent, EnergyProfile, CompositionPlan, Beat, BeatKind } from "./types";
import type { VisualDNA } from "@/core/dna";

/**
 * Planner that INVENTS narrative beats — never emits "hero / features / cta".
 *
 * The number of beats, their kinds, ordering and spatial dialect are all
 * derived from intent + energy + DNA. Two prompts in the same domain will
 * produce structurally different plans because the seed differs.
 */

const BEAT_POOL: BeatKind[] = [
  "opening-statement",
  "atmospheric-pause",
  "proof-moment",
  "narrative-shift",
  "quiet-pause",
  "revelation",
  "tension-build",
  "comparison",
  "evidence",
  "voice-of-customer",
  "decision-call",
  "departure",
];

const SPATIAL_FOR_ENERGY: Record<string, Beat["spatial"][]> = {
  cinematic: ["overlap", "monolithic", "editorial", "broken"],
  editorial: ["editorial", "magazine", "asymmetric"],
  brutalist: ["broken", "monolithic", "asymmetric"],
  minimal: ["monolithic", "editorial"],
  luxurious: ["editorial", "monolithic", "magazine"],
  futuristic: ["overlap", "asymmetric", "freeform"],
  experimental: ["freeform", "broken", "overlap"],
  "high-fashion": ["editorial", "asymmetric", "magazine"],
  "fintech-premium": ["bento", "asymmetric", "editorial"],
  playful: ["bento", "broken", "freeform"],
  tactical: ["bento", "asymmetric", "monolithic"],
};

function rng(seed: string) {
  let t = 0;
  for (let i = 0; i < seed.length; i++) t = (t * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function planComposition(
  intent: Intent,
  energy: EnergyProfile,
  dna: VisualDNA,
): CompositionPlan {
  const rand = rng(dna.signature + intent.prompt);

  // Number of beats: 4..9 — never the same fixed count
  const count = 4 + Math.floor(rand() * 6);

  // Required opener + closer to anchor the experience
  const opener: BeatKind = rand() > 0.5 ? "opening-statement" : "atmospheric-pause";
  const closer: BeatKind = intent.goal === "convert visitors" ? "decision-call" : "departure";

  // Middle beats: shuffled subset, never the same order
  const middlePool = BEAT_POOL.filter((b) => b !== opener && b !== closer);
  shuffle(middlePool, rand);
  const middle = middlePool.slice(0, Math.max(2, count - 2));

  const kinds: BeatKind[] = [opener, ...middle, closer];

  const spatialPool = SPATIAL_FOR_ENERGY[energy.label] ?? ["editorial", "asymmetric"];

  const beats: Beat[] = kinds.map((kind, i) => {
    const t = i / Math.max(1, kinds.length - 1);
    // Emphasis curve: high at opener, smaller crests in middle, peak near closer for CTA energy
    const baseEmphasis =
      kind === opener ? 0.95 :
      kind === closer ? 0.85 :
      0.3 + 0.5 * Math.sin(t * Math.PI);
    const emphasis = clamp(baseEmphasis + (rand() - 0.5) * 0.2);
    const density = clamp(energy.density + (rand() - 0.5) * 0.4);
    const spatial = spatialPool[Math.floor(rand() * spatialPool.length)];
    return {
      id: `beat-${i}-${kind}`,
      kind,
      emphasis,
      density,
      spatial,
      intent: describeBeatIntent(kind, intent, energy),
    };
  });

  const rhythm = beats.map((b) => b.density);

  const arc =
    `${energy.label} arc for ${intent.domain} — ${kinds.length} beats, ` +
    `voice ${energy.voice}, density ${energy.density.toFixed(2)}.`;

  return { beats, rhythm, arc };
}

function describeBeatIntent(kind: BeatKind, intent: Intent, energy: EnergyProfile): string {
  switch (kind) {
    case "opening-statement":
      return `Open with ${energy.voice} statement about ${intent.goal}. No tagline cliché.`;
    case "atmospheric-pause":
      return `Set atmosphere through imagery/typography, minimal copy.`;
    case "proof-moment":
      return `Show concrete proof: numbers, logos, or a defining artifact.`;
    case "narrative-shift":
      return `Break rhythm with a contrasting composition or scale change.`;
    case "quiet-pause":
      return `Deliberate breathing space — a single quote, image, or line.`;
    case "revelation":
      return `Reveal the differentiator. Big move, asymmetric framing.`;
    case "tension-build":
      return `Sequence escalating evidence or imagery to build momentum.`;
    case "comparison":
      return `Contrast two states / options. Use spatial duality.`;
    case "evidence":
      return `Detail-rich block: data, features, capabilities — woven, not listed.`;
    case "voice-of-customer":
      return `Human voice — testimonial, story fragment, or letter.`;
    case "decision-call":
      return `Resolve to a single decision. Confident, unhurried.`;
    case "departure":
      return `Closing impression — quiet authority or a poetic sign-off.`;
  }
}

function shuffle<T>(arr: T[], rand: () => number) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function clamp(n: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, n));
}
