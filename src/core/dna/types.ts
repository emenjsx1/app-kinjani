/**
 * Visual DNA — the per-project genetic signature that destroys template DNA.
 *
 * Every generated project gets a unique 8-axis DNA. No two projects share
 * the same signature, because each axis is sampled from a continuous range
 * keyed on the project's seed. This is what gives Kinjani sites their own
 * rhythm, hierarchy and personality instead of recycling the same template.
 */

export type DensityRegister = "airy" | "balanced" | "dense" | "compressed";
export type EnergyRegister = "calm" | "measured" | "vibrant" | "kinetic";
export type RhythmSignature = "even" | "swelling" | "syncopated" | "broken";
export type HierarchyVoice = "whisper" | "conversational" | "declarative" | "monumental";
export type MotionPersonality = "still" | "drift" | "spring" | "snap" | "orbital";
export type CompositionEnergy = "grid-locked" | "asymmetric" | "diagonal" | "overlapped" | "scattered";
export type InteractionLanguage = "minimal" | "tactile" | "playful" | "cinematic";
export type LayoutDialect = "editorial" | "modular" | "magazine" | "bento" | "freeform" | "monolithic";

export interface VisualDNA {
  /** Stable hash of the project — same prompt+name+timestamp → same DNA. */
  signature: string;

  /** Spacing rhythm — base unit + scale ratio that defines breathing room. */
  rhythm: {
    base: number;           // px, e.g. 4–12
    scale: number;          // ratio, e.g. 1.25–2.0
    register: RhythmSignature;
  };

  /** Typography logic — own scale, weight cadence, tracking attitude. */
  typography: {
    headingScale: number;   // multiplier vs body, 1.6–3.4
    bodyLineHeight: number; // 1.35–1.85
    tracking: number;       // em, -0.04 – 0.12
    weightHero: 300 | 400 | 500 | 600 | 700 | 800 | 900;
    weightBody: 300 | 400 | 500;
    voice: HierarchyVoice;
  };

  /** Density — how packed the page feels. */
  density: DensityRegister;

  /** Composition energy — structural language. */
  composition: {
    energy: CompositionEnergy;
    dialect: LayoutDialect;
    asymmetryBias: number;  // 0–1: how off-grid the layout dares to be
  };

  /** Hierarchy — how loud the loudest element is vs the quietest. */
  hierarchy: {
    voice: HierarchyVoice;
    contrast: number;       // 1.5–6  (max-to-min size ratio across the page)
  };

  /** Motion personality — how things move. */
  motion: {
    personality: MotionPersonality;
    intensity: number;      // 0–1
    durationMs: number;     // 200–900
  };

  /** Interaction language — hover, focus, feedback character. */
  interaction: InteractionLanguage;

  /** Energy register — global emotional pacing. */
  energy: EnergyRegister;

  /** Visual pacing — sections per viewport on average. */
  pacing: {
    sectionsPerViewport: number; // 0.5–1.6
    pauseRatio: number;          // 0–1 (whitespace gaps between blocks)
  };

  /** Border radius personality. */
  radius: {
    base: number;     // px
    expressive: number; // px, for hero/feature surfaces
  };

  /** A short human-readable description for logs / AI prompts. */
  manifesto: string;
}
