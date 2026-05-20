/**
 * VisualDNAEngine — generates a unique visual DNA per project.
 *
 * The engine never reuses a fixed preset. Every axis is sampled from
 * a continuous range using a seeded RNG, then constrained by light
 * compatibility rules so the combination still feels intentional.
 *
 * This is what stops the AI from producing "the same site again".
 */

import type {
  VisualDNA,
  DensityRegister,
  EnergyRegister,
  RhythmSignature,
  HierarchyVoice,
  MotionPersonality,
  CompositionEnergy,
  InteractionLanguage,
  LayoutDialect,
} from "./types";

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T>(rng: () => number, arr: readonly T[]) => arr[Math.floor(rng() * arr.length)];
const between = (rng: () => number, lo: number, hi: number) => lo + (hi - lo) * rng();
const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const RHYTHMS: RhythmSignature[] = ["even", "swelling", "syncopated", "broken"];
const VOICES: HierarchyVoice[] = ["whisper", "conversational", "declarative", "monumental"];
const ENERGIES: EnergyRegister[] = ["calm", "measured", "vibrant", "kinetic"];
const DENSITIES: DensityRegister[] = ["airy", "balanced", "dense", "compressed"];
const MOTIONS: MotionPersonality[] = ["still", "drift", "spring", "snap", "orbital"];
const COMPOSITIONS: CompositionEnergy[] = ["grid-locked", "asymmetric", "diagonal", "overlapped", "scattered"];
const INTERACTIONS: InteractionLanguage[] = ["minimal", "tactile", "playful", "cinematic"];
const DIALECTS: LayoutDialect[] = ["editorial", "modular", "magazine", "bento", "freeform", "monolithic"];

const HERO_WEIGHTS = [300, 400, 500, 600, 700, 800, 900] as const;
const BODY_WEIGHTS = [300, 400, 500] as const;

function buildManifesto(d: Omit<VisualDNA, "manifesto">): string {
  return [
    `${d.energy} ${d.composition.dialect}`,
    `${d.density} density`,
    `${d.hierarchy.voice} hierarchy`,
    `${d.motion.personality} motion`,
    `${d.composition.energy} layout`,
    `${d.interaction} interaction`,
  ].join(" · ");
}

export function generateVisualDNA(input: {
  prompt: string;
  websiteName: string;
  /** When omitted, falls back to Date.now() so each generation is unique. */
  uniqueSalt?: string | number;
}): VisualDNA {
  const salt = input.uniqueSalt ?? Date.now();
  const signatureSeed = hashSeed(`${input.prompt}|${input.websiteName}|${salt}`);
  const rng = mulberry32(signatureSeed);

  const energy = pick(rng, ENERGIES);
  const density = pick(rng, DENSITIES);
  const voice = pick(rng, VOICES);
  const motionPersonality = pick(rng, MOTIONS);
  const compEnergy = pick(rng, COMPOSITIONS);
  const interaction = pick(rng, INTERACTIONS);
  const dialect = pick(rng, DIALECTS);
  const rhythmSig = pick(rng, RHYTHMS);

  // Density informs base spacing & pause ratio
  const base = density === "airy" ? between(rng, 8, 12)
    : density === "balanced" ? between(rng, 6, 9)
    : density === "dense" ? between(rng, 4, 6)
    : between(rng, 3, 5); // compressed
  const scale = between(rng, 1.22, 1.95);
  const pauseRatio = density === "airy" ? between(rng, 0.55, 0.85)
    : density === "balanced" ? between(rng, 0.35, 0.6)
    : density === "dense" ? between(rng, 0.18, 0.4)
    : between(rng, 0.08, 0.22);

  // Typography contrast keyed on voice
  const headingScale =
    voice === "monumental" ? between(rng, 2.6, 3.4)
    : voice === "declarative" ? between(rng, 2.1, 2.8)
    : voice === "conversational" ? between(rng, 1.7, 2.2)
    : between(rng, 1.5, 1.85); // whisper

  const bodyLH = between(rng, 1.4, 1.8);
  const tracking = voice === "monumental" ? between(rng, -0.04, -0.01)
    : voice === "whisper" ? between(rng, 0.02, 0.1)
    : between(rng, -0.02, 0.03);

  const weightHero = voice === "monumental" ? pick(rng, [700, 800, 900] as const)
    : voice === "declarative" ? pick(rng, [600, 700, 800] as const)
    : voice === "conversational" ? pick(rng, [500, 600, 700] as const)
    : pick(rng, [300, 400, 500] as const);
  const weightBody = pick(rng, BODY_WEIGHTS);

  const contrast = round(between(rng, 1.8, 5.5), 2);
  const asymmetryBias =
    compEnergy === "grid-locked" ? between(rng, 0, 0.2)
    : compEnergy === "asymmetric" ? between(rng, 0.35, 0.7)
    : compEnergy === "diagonal" ? between(rng, 0.5, 0.85)
    : compEnergy === "overlapped" ? between(rng, 0.55, 0.9)
    : between(rng, 0.7, 1); // scattered

  const motionIntensity = motionPersonality === "still" ? 0
    : motionPersonality === "drift" ? between(rng, 0.15, 0.35)
    : motionPersonality === "spring" ? between(rng, 0.35, 0.65)
    : motionPersonality === "snap" ? between(rng, 0.4, 0.7)
    : between(rng, 0.55, 0.9); // orbital

  const motionDuration = motionPersonality === "still" ? 0
    : motionPersonality === "snap" ? between(rng, 160, 260)
    : motionPersonality === "spring" ? between(rng, 320, 560)
    : motionPersonality === "drift" ? between(rng, 540, 900)
    : between(rng, 400, 720);

  const sectionsPerViewport = density === "airy" ? between(rng, 0.55, 0.85)
    : density === "balanced" ? between(rng, 0.8, 1.1)
    : density === "dense" ? between(rng, 1.05, 1.4)
    : between(rng, 1.3, 1.6);

  const radiusBase = interaction === "minimal" ? between(rng, 4, 10)
    : interaction === "tactile" ? between(rng, 10, 18)
    : interaction === "playful" ? between(rng, 14, 28)
    : between(rng, 2, 8); // cinematic
  const radiusExpressive = round(radiusBase * between(rng, 1.6, 3.2), 0);

  const partial: Omit<VisualDNA, "manifesto"> = {
    signature: signatureSeed.toString(36),
    rhythm: { base: round(base, 1), scale: round(scale, 3), register: rhythmSig },
    typography: {
      headingScale: round(headingScale, 3),
      bodyLineHeight: round(bodyLH, 3),
      tracking: round(tracking, 3),
      weightHero,
      weightBody,
      voice,
    },
    density,
    composition: { energy: compEnergy, dialect, asymmetryBias: round(asymmetryBias, 3) },
    hierarchy: { voice, contrast },
    motion: { personality: motionPersonality, intensity: round(motionIntensity, 2), durationMs: Math.round(motionDuration) },
    interaction,
    energy,
    pacing: { sectionsPerViewport: round(sectionsPerViewport, 2), pauseRatio: round(pauseRatio, 2) },
    radius: { base: round(radiusBase, 0), expressive: radiusExpressive },
  };

  return { ...partial, manifesto: buildManifesto(partial) };
}

/** Short, AI-prompt-ready summary describing the DNA. */
export function describeDNAForAI(dna: VisualDNA): string {
  return [
    `VISUAL DNA SIGNATURE ${dna.signature}`,
    `Manifesto: ${dna.manifesto}`,
    `Rhythm: base ${dna.rhythm.base}px · scale ${dna.rhythm.scale} · ${dna.rhythm.register}`,
    `Typography: heading×${dna.typography.headingScale}, body LH ${dna.typography.bodyLineHeight}, tracking ${dna.typography.tracking}em, hero ${dna.typography.weightHero} / body ${dna.typography.weightBody}, voice ${dna.typography.voice}`,
    `Composition: ${dna.composition.dialect} / ${dna.composition.energy}, asymmetry ${dna.composition.asymmetryBias}`,
    `Hierarchy contrast: ${dna.hierarchy.contrast}x`,
    `Motion: ${dna.motion.personality}, intensity ${dna.motion.intensity}, ${dna.motion.durationMs}ms`,
    `Pacing: ${dna.pacing.sectionsPerViewport} sections/viewport, pause ${dna.pacing.pauseRatio}`,
    `Density ${dna.density} · Energy ${dna.energy} · Interaction ${dna.interaction}`,
    `Radius: ${dna.radius.base}px / ${dna.radius.expressive}px expressive`,
    "",
    "STRICT INSTRUCTIONS:",
    "- DO NOT reuse generic hero+features+CTA stacks.",
    "- Honor the asymmetry bias literally: lay elements off-grid when > 0.5.",
    "- Match the rhythm signature in vertical pacing.",
    "- Hierarchy contrast must visibly read at the stated ratio.",
    "- Motion timings & intensity are mandatory, not suggestions.",
  ].join("\n");
}
