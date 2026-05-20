/**
 * CritiqueEngine — structural self-critique that detects template feeling,
 * repeated rhythm, weak hierarchy and generic SaaS sameness.
 *
 * This is the local (heuristic) pass. A multimodal vision critique can be
 * layered on top via an edge function — this layer always runs first to
 * guarantee a baseline quality bar without any AI call.
 */
import type { CompositionGraph, CompositionNode } from "@/core/render/composition-graph";
import type { CritiqueReport, CritiqueAxis, CompositionPlan } from "@/core/genesis/types";

function walk(node: CompositionNode, fn: (n: CompositionNode) => void) {
  fn(node);
  if ("children" in node && Array.isArray((node as any).children)) {
    (node as any).children.forEach((c: CompositionNode) => walk(c, fn));
  }
}

export function critiqueLocal(graph: CompositionGraph, plan: CompositionPlan): CritiqueReport {
  const nodes: CompositionNode[] = [];
  walk(graph.root, (n) => nodes.push(n));

  // --- spatial diversity ---
  const dialects = new Set(plan.beats.map((b) => b.spatial));
  const originality = Math.min(1, dialects.size / 4);

  // --- rhythm variance ---
  const rhythm = plan.rhythm;
  const mean = rhythm.reduce((a, b) => a + b, 0) / Math.max(1, rhythm.length);
  const variance = rhythm.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, rhythm.length);
  const rhythmScore = Math.min(1, variance * 6);

  // --- hierarchy spread ---
  const headings = nodes.filter((n) => n.type === "heading") as any[];
  const sizes = new Set(headings.map((h) => h.size ?? "xl"));
  const hierarchy = Math.min(1, sizes.size / 3);

  // --- density check ---
  const beats = plan.beats.length;
  const density = beats >= 4 && beats <= 9 ? 1 : 0.5;

  // --- focal clarity: at least one strong emphasis beat ---
  const focalClarity = plan.beats.some((b) => b.emphasis > 0.8) ? 1 : 0.4;

  // --- predictability: opener + closer types ---
  const opener = plan.beats[0]?.kind;
  const closer = plan.beats[plan.beats.length - 1]?.kind;
  const predictability =
    opener === "opening-statement" && closer === "decision-call"
      ? 0.6 // common arc → less original
      : 1;

  // --- template feeling: penalty if too many consecutive same-spatial beats ---
  let runs = 0;
  for (let i = 1; i < plan.beats.length; i++) {
    if (plan.beats[i].spatial === plan.beats[i - 1].spatial) runs++;
  }
  const templateFeeling = 1 - Math.min(1, runs / Math.max(1, plan.beats.length));

  // --- tension: spread of emphasis ---
  const empMax = Math.max(...plan.beats.map((b) => b.emphasis));
  const empMin = Math.min(...plan.beats.map((b) => b.emphasis));
  const tension = Math.min(1, empMax - empMin);

  const scores: Record<CritiqueAxis, number> = {
    originality,
    hierarchy,
    rhythm: rhythmScore,
    tension,
    density,
    focalClarity,
    predictability,
    templateFeeling,
  };

  const overall =
    (originality + hierarchy + rhythmScore + tension + density + focalClarity + predictability + templateFeeling) /
    8;

  const weakBeats: string[] = [];
  for (let i = 1; i < plan.beats.length; i++) {
    if (plan.beats[i].spatial === plan.beats[i - 1].spatial) {
      weakBeats.push(plan.beats[i].id);
    }
  }
  plan.beats.forEach((b) => {
    if (b.emphasis < 0.2) weakBeats.push(b.id);
  });

  const notes: string[] = [];
  if (originality < 0.5) notes.push("Spatial dialects too repetitive — diversify beat shapes.");
  if (rhythmScore < 0.3) notes.push("Density curve too flat — vary pacing across beats.");
  if (hierarchy < 0.5) notes.push("Heading sizes too uniform — widen the typographic range.");
  if (templateFeeling < 0.6) notes.push("Consecutive beats share the same spatial dialect.");
  if (tension < 0.3) notes.push("Emphasis spread is shallow — push some beats higher and others lower.");

  return {
    scores,
    overall,
    weakBeats: Array.from(new Set(weakBeats)),
    notes,
    passed: overall >= 0.62 && weakBeats.length <= Math.ceil(plan.beats.length * 0.25),
  };
}
