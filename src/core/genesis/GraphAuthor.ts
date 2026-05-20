/**
 * GraphAuthor — turns abstract beats into a CompositionGraph of arbitrary
 * nodes. Never picks "Hero / Features / CTA" components. Each beat is
 * authored as raw composition primitives (stack/grid/overlay/heading/text/
 * button/shape/image) whose shape is driven by the beat's spatial dialect,
 * emphasis and density.
 */
import type { CompositionGraph, CompositionNode, GraphTheme } from "@/core/render/composition-graph";
import type { VisualDNA } from "@/core/dna";
import type { Beat, CompositionPlan, EnergyProfile, Intent } from "./types";

let _id = 0;
const nid = (p: string) => `${p}-${(++_id).toString(36)}`;

interface AuthorContext {
  intent: Intent;
  energy: EnergyProfile;
  dna: VisualDNA;
  rand: () => number;
}

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

export function authorGraph(
  intent: Intent,
  energy: EnergyProfile,
  plan: CompositionPlan,
  dna: VisualDNA,
  theme: GraphTheme,
): CompositionGraph {
  _id = 0;
  const ctx: AuthorContext = { intent, energy, dna, rand: rng(dna.signature + intent.prompt) };
  const children: CompositionNode[] = plan.beats.map((b) => authorBeat(b, ctx));

  const root: CompositionNode = {
    id: nid("root"),
    type: "stack",
    direction: "v",
    gap: Math.max(8, Math.round(24 - energy.density * 16)),
    children,
  };

  return { version: 1, theme: { ...theme, dna }, root };
}

function authorBeat(beat: Beat, ctx: AuthorContext): CompositionNode {
  switch (beat.spatial) {
    case "overlap":     return overlapBeat(beat, ctx);
    case "monolithic":  return monolithicBeat(beat, ctx);
    case "editorial":   return editorialBeat(beat, ctx);
    case "magazine":    return magazineBeat(beat, ctx);
    case "bento":       return bentoBeat(beat, ctx);
    case "asymmetric":  return asymmetricBeat(beat, ctx);
    case "broken":      return brokenBeat(beat, ctx);
    case "freeform":    return freeformBeat(beat, ctx);
  }
}

/* ---------- beat dialects ---------- */

function copy(beat: Beat, ctx: AuthorContext) {
  const head = headlineFor(beat, ctx);
  const body = bodyFor(beat, ctx);
  return { head, body };
}

function headlineFor(beat: Beat, ctx: AuthorContext): string {
  const key = ctx.intent.keywords.slice(0, 2).join(" ") || ctx.intent.domain;
  const variations: Record<string, string[]> = {
    "opening-statement": [`${key}, recomposed.`, `A different shape of ${key}.`, `${ctx.intent.goal}, made tangible.`],
    "atmospheric-pause": [`Silence, then signal.`, `Slow attention.`, `Between two thoughts.`],
    "proof-moment": [`The numbers speak.`, `Evidence, not promise.`, `Measured in outcomes.`],
    "narrative-shift": [`And then — a turn.`, `Reframe.`, `What if the opposite is true.`],
    "quiet-pause": [`Breathe.`, `Pause.`, `Less, intentionally.`],
    "revelation": [`This is the difference.`, `The point of separation.`, `Where it changes.`],
    "tension-build": [`Layer by layer.`, `It compounds.`, `Each step raises the floor.`],
    "comparison": [`Before and after.`, `Two ways. One choice.`, `Old habits, new mechanics.`],
    "evidence": [`Capabilities, woven.`, `What you actually get.`, `Concrete, not abstract.`],
    "voice-of-customer": [`In their own words.`, `From the people who use it.`, `Letters from the field.`],
    "decision-call": [`Begin.`, `Move first.`, `Choose your version.`],
    "departure": [`Until next time.`, `A quiet exit.`, `End of transmission.`],
  };
  const arr = variations[beat.kind];
  return arr[Math.floor(ctx.rand() * arr.length)];
}

function bodyFor(beat: Beat, ctx: AuthorContext): string {
  return `${ctx.intent.goal} — for ${ctx.intent.audience}. ` +
         `${ctx.energy.label} interpretation, ${ctx.energy.voice} voice.`;
}

function py(beat: Beat, ctx: AuthorContext) {
  const base = 16 + Math.round(beat.emphasis * 24 - ctx.energy.density * 8);
  return Math.max(8, Math.min(40, base));
}

function overlapBeat(beat: Beat, ctx: AuthorContext): CompositionNode {
  const { head, body } = copy(beat, ctx);
  return {
    id: nid("ovl"),
    type: "overlay",
    py: py(beat, ctx),
    px: 6,
    minH: beat.emphasis > 0.7 ? "80vh" : "60vh",
    children: [
      { id: nid("sh"), type: "shape", shape: "gradient", color: "primary" } as CompositionNode,
      { id: nid("sh2"), type: "shape", shape: "blob", color: "accent",
        className: "absolute -right-20 top-10 w-[420px] h-[420px]" } as CompositionNode,
      {
        id: nid("inner"),
        type: "stack", direction: "v", gap: 6, contain: "wide", py: 8,
        className: "relative z-10",
        children: [
          { id: nid("h"), type: "heading", level: 1, text: head, size: "hero", weight: "black", tracking: "tighter" },
          { id: nid("t"), type: "text", text: body, size: "lg", muted: true, maxW: "640px" },
        ],
      } as CompositionNode,
    ],
  };
}

function monolithicBeat(beat: Beat, ctx: AuthorContext): CompositionNode {
  const { head } = copy(beat, ctx);
  return {
    id: nid("mono"),
    type: "stack", direction: "v", gap: 4, contain: "default", py: py(beat, ctx), align: "center",
    children: [
      { id: nid("h"), type: "heading", level: 2,
        text: head, size: beat.emphasis > 0.6 ? "display" : "xl",
        weight: ctx.energy.voice === "monumental" ? "black" : "semibold",
        tracking: "tight", className: "text-center" },
    ],
  };
}

function editorialBeat(beat: Beat, ctx: AuthorContext): CompositionNode {
  const { head, body } = copy(beat, ctx);
  return {
    id: nid("ed"),
    type: "grid", cols: "5fr 7fr", gap: 12, contain: "wide", py: py(beat, ctx),
    children: [
      { id: nid("h"), type: "heading", level: 2, text: head,
        size: beat.emphasis > 0.7 ? "display" : "xl",
        weight: "semibold", tracking: "tight", serif: ctx.dna.composition.dialect === "editorial" },
      { id: nid("t"), type: "text", text: body, size: "lg", muted: true, maxW: "560px" },
    ],
  };
}

function magazineBeat(beat: Beat, ctx: AuthorContext): CompositionNode {
  const { head, body } = copy(beat, ctx);
  return {
    id: nid("mag"),
    type: "stack", direction: "v", gap: 6, contain: "wide", py: py(beat, ctx),
    children: [
      { id: nid("kicker"), type: "text", text: beat.kind.replace(/-/g, " ").toUpperCase(),
        size: "xs", className: "tracking-[0.3em] opacity-60" },
      { id: nid("h"), type: "heading", level: 2, text: head, size: "display", weight: "bold", serif: true },
      { id: nid("col"), type: "grid", cols: 3, gap: 8, children: [
        { id: nid("c1"), type: "text", text: body, size: "base" },
        { id: nid("c2"), type: "text", text: body, size: "base" },
        { id: nid("c3"), type: "text", text: body, size: "base" },
      ] },
    ],
  };
}

function bentoBeat(beat: Beat, ctx: AuthorContext): CompositionNode {
  const tiles = 4 + Math.floor(ctx.rand() * 3);
  const children: CompositionNode[] = [];
  for (let i = 0; i < tiles; i++) {
    children.push({
      id: nid("tile"),
      type: "stack", direction: "v", gap: 2, py: 8, px: 8,
      className: "rounded-3xl bg-foreground/5 hover:bg-foreground/10 transition",
      children: [
        { id: nid("th"), type: "heading", level: 3,
          text: `${beat.kind.split("-")[0]} ${i + 1}`, size: "md", weight: "semibold" },
        { id: nid("tt"), type: "text", text: ctx.intent.goal, size: "sm", muted: true },
      ],
    });
  }
  const spans = children.map((_, i) => ({ col: i === 0 ? 2 : 1, row: i === 0 ? 2 : 1 }));
  return {
    id: nid("bento"),
    type: "grid", cols: 3, gap: 4, contain: "wide", py: py(beat, ctx),
    children, spans,
  };
}

function asymmetricBeat(beat: Beat, ctx: AuthorContext): CompositionNode {
  const { head, body } = copy(beat, ctx);
  const flip = ctx.rand() > 0.5;
  return {
    id: nid("asym"),
    type: "grid",
    cols: flip ? "2fr 5fr" : "5fr 2fr", gap: 16, contain: "wide", py: py(beat, ctx),
    children: flip
      ? [
          { id: nid("t"), type: "text", text: body, size: "lg", muted: true },
          { id: nid("h"), type: "heading", level: 2, text: head, size: "display", weight: "black", tracking: "tighter" },
        ]
      : [
          { id: nid("h"), type: "heading", level: 2, text: head, size: "display", weight: "black", tracking: "tighter" },
          { id: nid("t"), type: "text", text: body, size: "lg", muted: true },
        ],
  };
}

function brokenBeat(beat: Beat, ctx: AuthorContext): CompositionNode {
  const { head, body } = copy(beat, ctx);
  return {
    id: nid("brk"),
    type: "overlay", py: py(beat, ctx), px: 6, minH: "70vh",
    children: [
      { id: nid("h"), type: "heading", level: 2, text: head, size: "hero", weight: "black",
        className: "absolute left-[6%] top-[12%] z-10 max-w-[60%]" },
      { id: nid("t"), type: "text", text: body, size: "base", muted: true,
        className: "absolute right-[8%] bottom-[14%] max-w-[36%] text-right" },
      { id: nid("ln"), type: "shape", shape: "line", color: "primary",
        className: "absolute left-0 right-0 top-1/2 h-[2px]" },
    ],
  };
}

function freeformBeat(beat: Beat, ctx: AuthorContext): CompositionNode {
  const { head, body } = copy(beat, ctx);
  const rotation = Math.round((ctx.rand() - 0.5) * 6);
  return {
    id: nid("free"),
    type: "overlay", py: py(beat, ctx), px: 8, minH: "70vh",
    children: [
      { id: nid("dg"), type: "shape", shape: "dot-grid", color: "muted" },
      { id: nid("blob"), type: "shape", shape: "blob", color: "accent",
        className: "absolute left-[8%] top-[20%] w-[320px] h-[320px]" },
      { id: nid("h"), type: "heading", level: 2, text: head, size: "display", weight: "bold",
        className: `relative z-10 max-w-[640px] mx-auto text-center`,
        style: { transform: `rotate(${rotation}deg)` } },
      { id: nid("t"), type: "text", text: body, size: "base", muted: true,
        className: "relative z-10 max-w-[520px] mx-auto text-center mt-6" },
    ],
  };
}
