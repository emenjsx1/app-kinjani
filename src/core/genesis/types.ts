/**
 * Genesis — AI-first generative composition engine.
 *
 * Replaces section-first thinking with intention-first creative reasoning.
 * The pipeline thinks in beats, rhythm, hierarchy and visual tension —
 * never in "hero / features / cta".
 */
import type { VisualDNA } from "@/core/dna";
import type { CompositionGraph } from "@/core/render/composition-graph";

/* ---------- Intent ---------- */

export interface Intent {
  /** Raw user prompt — what they typed. */
  prompt: string;
  /** Inferred goal, audience, emotional register, references. */
  goal: string;
  audience: string;
  emotion: string;
  domain: string;
  references: string[];
  /** Words/phrases that bias generation toward originality. */
  keywords: string[];
  /** Optional location/place extracted from prompt (e.g. "Mozambique", "Lisbon"). */
  location?: string;
}

/* ---------- Energy ---------- */

export type EnergyLabel =
  | "cinematic"
  | "editorial"
  | "brutalist"
  | "minimal"
  | "luxurious"
  | "futuristic"
  | "experimental"
  | "high-fashion"
  | "fintech-premium"
  | "playful"
  | "tactical";

export interface EnergyProfile {
  label: EnergyLabel;
  density: number;        // 0..1 sparse → dense
  contrast: number;       // 0..1 mild → severe
  motion: number;         // 0..1 still → kinetic
  asymmetry: number;      // 0..1 grid-locked → off-grid
  voice: "whisper" | "conversational" | "declarative" | "monumental";
  manifesto: string;
}

/* ---------- Composition plan (narrative beats, NOT sections) ---------- */

export type BeatKind =
  | "opening-statement"
  | "atmospheric-pause"
  | "proof-moment"
  | "narrative-shift"
  | "quiet-pause"
  | "revelation"
  | "tension-build"
  | "comparison"
  | "evidence"
  | "voice-of-customer"
  | "decision-call"
  | "departure";

export interface Beat {
  id: string;
  kind: BeatKind;
  /** Emphasis weight 0..1 — drives focal density. */
  emphasis: number;
  /** Density 0..1 — sparse to packed. */
  density: number;
  /** Spatial dialect chosen for this beat. */
  spatial: "editorial" | "bento" | "asymmetric" | "broken" | "overlap" | "monolithic" | "magazine" | "freeform";
  /** Brief textual intent for the AI authoring this beat. */
  intent: string;
}

export interface CompositionPlan {
  beats: Beat[];
  /** Pacing curve sample values, length = beats.length, range 0..1. */
  rhythm: number[];
  /** Overall narrative arc summary. */
  arc: string;
}

/* ---------- Critique ---------- */

export type CritiqueAxis =
  | "originality"
  | "hierarchy"
  | "rhythm"
  | "tension"
  | "density"
  | "focalClarity"
  | "predictability"
  | "templateFeeling";

export interface CritiqueReport {
  scores: Record<CritiqueAxis, number>; // 0..1, higher is better (predictability/template inverted)
  overall: number;                       // 0..1
  weakBeats: string[];                   // beat ids needing regeneration
  notes: string[];
  passed: boolean;
}

/* ---------- Final output ---------- */

export interface GenerativeResult {
  intent: Intent;
  energy: EnergyProfile;
  plan: CompositionPlan;
  dna: VisualDNA;
  graph: CompositionGraph;
  critique?: CritiqueReport;
  iterations: number;
}
