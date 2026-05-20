import type { Intent, EnergyProfile, EnergyLabel } from "./types";
import type { VisualDNA } from "@/core/dna";

const ENERGY_BY_EMOTION: Record<string, EnergyLabel[]> = {
  bold: ["brutalist", "experimental", "tactical"],
  serene: ["minimal", "editorial", "cinematic"],
  luxurious: ["luxurious", "high-fashion", "cinematic"],
  experimental: ["experimental", "brutalist", "futuristic"],
  playful: ["playful", "experimental", "editorial"],
  trustworthy: ["fintech-premium", "minimal", "tactical"],
  considered: ["editorial", "minimal", "cinematic"],
};

const ENERGY_BY_DOMAIN: Record<string, EnergyLabel[]> = {
  finance: ["fintech-premium", "tactical", "minimal"],
  fashion: ["high-fashion", "editorial", "cinematic"],
  food: ["editorial", "cinematic", "playful"],
  saas: ["tactical", "futuristic", "minimal"],
  agency: ["editorial", "experimental", "cinematic"],
  health: ["minimal", "cinematic", "editorial"],
  realestate: ["luxurious", "cinematic", "editorial"],
  events: ["cinematic", "experimental", "playful"],
  portfolio: ["editorial", "experimental", "minimal"],
  ecommerce: ["editorial", "luxurious", "playful"],
  general: ["editorial", "minimal", "cinematic"],
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

export function deriveEnergy(intent: Intent, dna: VisualDNA): EnergyProfile {
  const fromEmotion = ENERGY_BY_EMOTION[intent.emotion] ?? ENERGY_BY_EMOTION.considered;
  const fromDomain = ENERGY_BY_DOMAIN[intent.domain] ?? ENERGY_BY_DOMAIN.general;
  // Intersect candidates; fall back to domain pool.
  const overlap = fromEmotion.filter((e) => fromDomain.includes(e));
  const pool = overlap.length ? overlap : fromDomain;

  // DNA-seeded deterministic pick across pool — same DNA → same energy.
  const seed = hash(dna.signature + intent.prompt);
  const label = pool[seed % pool.length];

  // Map DNA axes into energy intensities — kept independent of label so
  // two projects with the same label still differ.
  const density = clamp((dna.composition.asymmetryBias + (1 - dna.pacing.pauseRatio)) / 2);
  const contrast = clamp(dna.hierarchy.contrast / 6);
  const motion = dna.motion.intensity;
  const asymmetry = dna.composition.asymmetryBias;
  const voice = dna.typography.voice;

  const manifesto =
    `Energy: ${label} — voice ${voice}, density ${density.toFixed(2)}, ` +
    `contrast ${contrast.toFixed(2)}, motion ${motion.toFixed(2)}, asymmetry ${asymmetry.toFixed(2)}. ` +
    `Goal: ${intent.goal}; Audience: ${intent.audience}.`;

  return { label, density, contrast, motion, asymmetry, voice, manifesto };
}

function clamp(n: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, n));
}
