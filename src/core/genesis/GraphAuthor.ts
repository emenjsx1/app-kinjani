/**
 * GraphAuthor — Visual Composition Author.
 *
 * Materializes beats into rich visual node trees: images, cards, overlays,
 * magazine rails, bento with media, monolithic full-bleed, broken layouts,
 * floating media. NEVER collapses to stack { heading + text }.
 */
import type { CompositionGraph, CompositionNode, GraphTheme } from "@/core/render/composition-graph";
import type { VisualDNA } from "@/core/dna";
import type { Beat, CompositionPlan, EnergyProfile, Intent } from "./types";
import {
  makeHeadline,
  makeBody,
  makeCtaLabel,
  makeFeatureCards,
  makeProofStats,
  imageUrl,
  pickImageQuery,
  type CopyContext,
} from "./IntentCopy";

let _id = 0;
const nid = (p: string) => `${p}-${(++_id).toString(36)}`;

interface AuthorContext extends CopyContext {
  intent: Intent;
  energy: EnergyProfile;
  dna: VisualDNA;
  rand: () => number;
  seed: string;
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
  const seed = dna.signature + intent.prompt;
  const ctx: AuthorContext = {
    intent, energy, dna, seed,
    rand: rng(seed),
  };

  const children: CompositionNode[] = plan.beats.map((b, i) => authorBeat(b, ctx, i));

  const root: CompositionNode = {
    id: nid("root"),
    type: "stack",
    direction: "v",
    gap: Math.max(0, Math.round(16 - energy.density * 16)),
    children,
  };

  return { version: 1, theme: { ...theme, dna }, root };
}

function authorBeat(beat: Beat, ctx: AuthorContext, index: number): CompositionNode {
  switch (beat.spatial) {
    case "overlap":     return overlapBeat(beat, ctx, index);
    case "monolithic":  return monolithicBeat(beat, ctx, index);
    case "editorial":   return editorialBeat(beat, ctx, index);
    case "magazine":    return magazineBeat(beat, ctx, index);
    case "bento":       return bentoBeat(beat, ctx, index);
    case "asymmetric":  return asymmetricBeat(beat, ctx, index);
    case "broken":      return brokenBeat(beat, ctx, index);
    case "freeform":    return freeformBeat(beat, ctx, index);
  }
}

/* ---------------- shared helpers ---------------- */

function py(beat: Beat, ctx: AuthorContext): number {
  const base = 24 + Math.round(beat.emphasis * 24 - ctx.energy.density * 8);
  return clampPy(base);
}
function clampPy(n: number) {
  const opts = [16, 20, 24, 32, 40];
  return opts.reduce((a, b) => (Math.abs(b - n) < Math.abs(a - n) ? b : a));
}
function img(ctx: AuthorContext, opts: {
  query?: string; aspect?: "square" | "video" | "portrait" | "wide" | "ultra";
  rounded?: "none" | "md" | "xl" | "2xl" | "3xl" | "full";
  className?: string; grayscale?: boolean; w?: number; h?: number;
} = {}): CompositionNode {
  const q = opts.query ?? pickImageQuery(ctx);
  return {
    id: nid("img"),
    type: "image",
    src: imageUrl(q, ctx.seed + nid("s"), opts.w ?? 1200, opts.h ?? 800),
    alt: q,
    aspect: opts.aspect ?? "video",
    rounded: opts.rounded ?? "2xl",
    fit: "cover",
    grayscale: opts.grayscale,
    className: opts.className,
  };
}

function card(ctx: AuthorContext, opts: { title: string; body: string; withImage?: boolean; className?: string }): CompositionNode {
  const children: CompositionNode[] = [];
  if (opts.withImage) {
    children.push(img(ctx, { aspect: "portrait", rounded: "xl" }));
  }
  children.push(
    { id: nid("ct"), type: "heading", level: 3, text: opts.title, size: "md", weight: "semibold" },
    { id: nid("cb"), type: "text", text: opts.body, size: "sm", muted: true },
  );
  return {
    id: nid("card"),
    type: "stack", direction: "v", gap: 4, py: 8, px: 8,
    className: `rounded-3xl border border-foreground/10 bg-foreground/[0.03] backdrop-blur-sm hover:bg-foreground/[0.06] transition ${opts.className ?? ""}`,
    children,
  };
}

function ctaButton(ctx: AuthorContext, variant: "primary" | "outline" = "primary"): CompositionNode {
  return {
    id: nid("cta"),
    type: "button",
    label: makeCtaLabel(ctx),
    variant,
    size: "lg",
    action: "scroll",
  };
}

function kicker(text: string): CompositionNode {
  return {
    id: nid("kk"), type: "text", text: text.toUpperCase(),
    size: "xs", className: "tracking-[0.32em] opacity-60",
  };
}

/* ---------------- dialect: OVERLAP — cinematic layered hero ---------------- */

function overlapBeat(beat: Beat, ctx: AuthorContext, index: number): CompositionNode {
  const heroImg = img(ctx, {
    aspect: "ultra", rounded: "none",
    className: "absolute inset-0 w-full h-full",
  });
  // Reset image to fill overlay
  (heroImg as any).className = "absolute inset-0 w-full h-full";

  const head = makeHeadline(beat.kind, ctx);
  const body = makeBody(beat.kind, ctx);

  return {
    id: nid("ovl"),
    type: "overlay",
    py: py(beat, ctx),
    px: 6,
    minH: beat.emphasis > 0.7 ? "92vh" : "70vh",
    className: "overflow-hidden",
    children: [
      // background image
      {
        id: nid("bg"), type: "image",
        src: imageUrl(pickImageQuery(ctx), ctx.seed + "hero" + index, 1800, 1200),
        alt: "", aspect: "ultra", fit: "cover", rounded: "none",
        className: "absolute inset-0 w-full h-full",
      },
      // dark scrim
      {
        id: nid("scrim"), type: "shape", shape: "gradient", color: "primary",
        className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent",
        style: { background: "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.25), transparent)" },
      },
      // floating card top-right
      {
        id: nid("float-card"),
        type: "stack", direction: "v", gap: 2, px: 6, py: 6,
        className: "absolute top-12 right-12 z-20 max-w-[280px] rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white",
        children: [
          kicker(ctx.intent.domain),
          { id: nid("fct"), type: "text", text: makeBody("evidence", ctx), size: "sm", className: "text-white/90" },
        ],
      },
      // headline bottom
      {
        id: nid("inner"),
        type: "stack", direction: "v", gap: 6, contain: "wide", py: 12,
        className: "absolute left-0 right-0 bottom-0 z-10 text-white",
        children: [
          kicker(`Chapter ${index + 1}`),
          { id: nid("h"), type: "heading", level: 1, text: head, size: "hero", weight: "black", tracking: "tighter", className: "text-white max-w-[900px]" },
          { id: nid("t"), type: "text", text: body, size: "lg", maxW: "560px", className: "text-white/80" },
          { id: nid("row"), type: "flex", direction: "row", gap: 4, children: [ctaButton(ctx, "primary"), ctaButton(ctx, "outline")] },
        ],
      } as CompositionNode,
    ],
  };
}

/* ---------------- dialect: MONOLITHIC — oversized typographic anchor ---------------- */

function monolithicBeat(beat: Beat, ctx: AuthorContext, index: number): CompositionNode {
  const head = makeHeadline(beat.kind, ctx);
  const withMedia = beat.emphasis > 0.6;

  const children: CompositionNode[] = [
    {
      id: nid("h"), type: "heading", level: 2, text: head,
      size: "hero", weight: ctx.energy.voice === "monumental" ? "black" : "bold",
      tracking: "tighter",
      className: "text-center max-w-[1200px] mx-auto",
    },
  ];
  if (withMedia) {
    children.push(img(ctx, { aspect: "ultra", rounded: "3xl", className: "mt-8" }));
  }
  return {
    id: nid("mono"),
    type: "stack", direction: "v", gap: 8, contain: "wide", py: py(beat, ctx), align: "center",
    children,
  };
}

/* ---------------- dialect: EDITORIAL — magazine column with image ---------------- */

function editorialBeat(beat: Beat, ctx: AuthorContext, index: number): CompositionNode {
  const head = makeHeadline(beat.kind, ctx);
  const body = makeBody(beat.kind, ctx);
  const imageLeft = ctx.rand() > 0.5;

  const textCol: CompositionNode = {
    id: nid("col-t"), type: "stack", direction: "v", gap: 5, py: 4,
    children: [
      kicker(beat.kind.replace(/-/g, " ")),
      { id: nid("h"), type: "heading", level: 2, text: head,
        size: beat.emphasis > 0.7 ? "display" : "xl",
        weight: "bold", tracking: "tight", serif: true },
      { id: nid("t"), type: "text", text: body, size: "lg", muted: true, maxW: "520px" },
      { id: nid("t2"), type: "text", text: makeBody("evidence", ctx), size: "base", maxW: "520px" },
    ],
  };
  const mediaCol = img(ctx, { aspect: "portrait", rounded: "2xl" });

  return {
    id: nid("ed"),
    type: "grid", cols: "1fr 1fr", gap: 16, contain: "wide", py: py(beat, ctx),
    children: imageLeft ? [mediaCol, textCol] : [textCol, mediaCol],
  };
}

/* ---------------- dialect: MAGAZINE — kicker, big head, 3-col body + rail ---------------- */

function magazineBeat(beat: Beat, ctx: AuthorContext, index: number): CompositionNode {
  const head = makeHeadline(beat.kind, ctx);
  const cards = makeFeatureCards(ctx, 3);

  return {
    id: nid("mag"),
    type: "stack", direction: "v", gap: 10, contain: "wide", py: py(beat, ctx),
    children: [
      kicker(`Issue ${index + 1}`),
      { id: nid("h"), type: "heading", level: 2, text: head, size: "display", weight: "bold", serif: true, className: "max-w-[1000px]" },
      // wide hero image
      img(ctx, { aspect: "wide", rounded: "2xl" }),
      // three columns of editorial copy
      {
        id: nid("rail"), type: "grid", cols: 3, gap: 8,
        children: cards.map((c) => ({
          id: nid("art"), type: "stack", direction: "v", gap: 3,
          children: [
            { id: nid("ah"), type: "heading", level: 3, text: c.title, size: "md", weight: "semibold", serif: true },
            { id: nid("ab"), type: "text", text: c.body, size: "sm" },
          ],
        }) as CompositionNode),
      },
    ],
  };
}

/* ---------------- dialect: BENTO — mixed media tile grid ---------------- */

function bentoBeat(beat: Beat, ctx: AuthorContext, index: number): CompositionNode {
  const head = makeHeadline(beat.kind, ctx);
  const cards = makeFeatureCards(ctx, 5);
  const stats = makeProofStats(ctx, 3);

  const tiles: CompositionNode[] = [
    // big feature tile (image + headline)
    {
      id: nid("big"),
      type: "overlay", className: "rounded-3xl overflow-hidden min-h-[320px]",
      children: [
        { id: nid("bgi"), type: "image",
          src: imageUrl(pickImageQuery(ctx), ctx.seed + "bento" + index, 1200, 800),
          alt: "", aspect: "video", fit: "cover", rounded: "none",
          className: "absolute inset-0 w-full h-full" },
        { id: nid("sc"), type: "shape", shape: "gradient", color: "primary",
          style: { background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" },
          className: "absolute inset-0" },
        { id: nid("bt"), type: "heading", level: 3, text: head, size: "lg", weight: "bold",
          className: "absolute bottom-6 left-6 right-6 text-white" },
      ],
    },
    // stat tile
    {
      id: nid("stat"),
      type: "stack", direction: "v", gap: 2, py: 8, px: 8, align: "start", justify: "center",
      className: "rounded-3xl bg-primary text-white min-h-[200px]",
      children: [
        { id: nid("sv"), type: "heading", level: 3, text: stats[0]?.value ?? "100x", size: "display", weight: "black", className: "text-white" },
        { id: nid("sl"), type: "text", text: stats[0]?.label ?? "growth", size: "sm", className: "text-white/80" },
      ],
    },
    card(ctx, cards[0]),
    card(ctx, cards[1], ),
    // image-only tile
    img(ctx, { aspect: "square", rounded: "3xl", className: "min-h-[200px]" }),
    card(ctx, cards[2]),
    card(ctx, cards[3]),
  ];

  const spans = [
    { col: 2, row: 2 }, // big
    { col: 1, row: 1 }, // stat
    { col: 1, row: 1 },
    { col: 1, row: 1 },
    { col: 1, row: 1 }, // img square
    { col: 2, row: 1 }, // card wide
    { col: 1, row: 1 },
  ];

  return {
    id: nid("bento"),
    type: "grid", cols: 3, gap: 4, contain: "wide", py: py(beat, ctx),
    children: tiles, spans,
  };
}

/* ---------------- dialect: ASYMMETRIC — split with floating media card ---------------- */

function asymmetricBeat(beat: Beat, ctx: AuthorContext, index: number): CompositionNode {
  const head = makeHeadline(beat.kind, ctx);
  const body = makeBody(beat.kind, ctx);
  const flip = ctx.rand() > 0.5;
  const cards = makeFeatureCards(ctx, 2);

  const textSide: CompositionNode = {
    id: nid("tx"), type: "stack", direction: "v", gap: 6,
    children: [
      { id: nid("h"), type: "heading", level: 2, text: head, size: "display", weight: "black", tracking: "tighter" },
      { id: nid("t"), type: "text", text: body, size: "lg", muted: true, maxW: "480px" },
      ctaButton(ctx),
    ],
  };
  const mediaSide: CompositionNode = {
    id: nid("md"), type: "overlay", className: "min-h-[500px]",
    children: [
      img(ctx, { aspect: "portrait", rounded: "3xl", className: "absolute inset-0 w-full h-full" }),
      // floating mini-cards
      {
        id: nid("fc1"), type: "stack", direction: "v", gap: 1, px: 4, py: 4,
        className: "absolute -left-6 top-8 w-[240px] rounded-2xl bg-background/95 backdrop-blur border border-foreground/10 shadow-2xl",
        children: [
          { id: nid("fct"), type: "heading", level: 4, text: cards[0].title, size: "md", weight: "semibold" },
          { id: nid("fcb"), type: "text", text: cards[0].body, size: "xs", muted: true },
        ],
      },
      {
        id: nid("fc2"), type: "stack", direction: "v", gap: 1, px: 4, py: 4,
        className: "absolute -right-6 bottom-12 w-[220px] rounded-2xl bg-foreground/90 text-background backdrop-blur shadow-2xl",
        children: [
          { id: nid("fct2"), type: "heading", level: 4, text: cards[1].title, size: "md", weight: "semibold", className: "text-background" },
          { id: nid("fcb2"), type: "text", text: cards[1].body, size: "xs", className: "text-background/70" },
        ],
      },
    ],
  };

  return {
    id: nid("asym"),
    type: "grid",
    cols: flip ? "1fr 1.4fr" : "1.4fr 1fr", gap: 16, contain: "wide", py: py(beat, ctx),
    children: flip ? [textSide, mediaSide] : [mediaSide, textSide],
  };
}

/* ---------------- dialect: BROKEN — fractured floating media chunks ---------------- */

function brokenBeat(beat: Beat, ctx: AuthorContext, index: number): CompositionNode {
  const head = makeHeadline(beat.kind, ctx);
  const body = makeBody(beat.kind, ctx);

  return {
    id: nid("brk"),
    type: "overlay", py: py(beat, ctx), px: 6, minH: "85vh",
    className: "overflow-hidden",
    children: [
      // scattered image tiles
      {
        id: nid("i1"), type: "image",
        src: imageUrl(pickImageQuery(ctx), ctx.seed + "brk-a" + index, 600, 800),
        alt: "", aspect: "portrait", fit: "cover", rounded: "xl",
        className: "absolute left-[3%] top-[8%] w-[28%] rotate-[-3deg] shadow-2xl",
      },
      {
        id: nid("i2"), type: "image",
        src: imageUrl(pickImageQuery(ctx), ctx.seed + "brk-b" + index, 800, 600),
        alt: "", aspect: "video", fit: "cover", rounded: "xl",
        className: "absolute right-[4%] top-[20%] w-[32%] rotate-[2deg] shadow-2xl",
      },
      {
        id: nid("i3"), type: "image",
        src: imageUrl(pickImageQuery(ctx), ctx.seed + "brk-c" + index, 600, 600),
        alt: "", aspect: "square", fit: "cover", rounded: "xl",
        className: "absolute left-[18%] bottom-[6%] w-[22%] rotate-[1deg] shadow-2xl",
      },
      // headline across centre
      { id: nid("h"), type: "heading", level: 2, text: head, size: "hero", weight: "black",
        className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 max-w-[60%] text-center tracking-tighter mix-blend-difference text-white" },
      { id: nid("t"), type: "text", text: body, size: "base", muted: true,
        className: "absolute right-[8%] bottom-[8%] max-w-[28%] text-right z-10" },
      // divider line
      { id: nid("ln"), type: "shape", shape: "line", color: "primary",
        className: "absolute left-0 right-0 top-1/2 h-px opacity-40" },
    ],
  };
}

/* ---------------- dialect: FREEFORM — experimental floating system ---------------- */

function freeformBeat(beat: Beat, ctx: AuthorContext, index: number): CompositionNode {
  const head = makeHeadline(beat.kind, ctx);
  const body = makeBody(beat.kind, ctx);
  const stats = makeProofStats(ctx, 3);
  const rotation = Math.round((ctx.rand() - 0.5) * 8);

  return {
    id: nid("free"),
    type: "overlay", py: py(beat, ctx), px: 8, minH: "80vh",
    className: "overflow-hidden",
    children: [
      { id: nid("dg"), type: "shape", shape: "dot-grid", color: "muted" },
      { id: nid("blob1"), type: "shape", shape: "blob", color: "accent",
        className: "absolute left-[8%] top-[20%] w-[420px] h-[420px]" },
      { id: nid("blob2"), type: "shape", shape: "blob", color: "primary",
        className: "absolute right-[6%] bottom-[10%] w-[320px] h-[320px]" },
      // floating image
      {
        id: nid("fi"), type: "image",
        src: imageUrl(pickImageQuery(ctx), ctx.seed + "free" + index, 600, 800),
        alt: "", aspect: "portrait", fit: "cover", rounded: "3xl",
        className: "absolute right-[12%] top-[8%] w-[26%] shadow-2xl rotate-[3deg]",
      },
      // headline
      { id: nid("h"), type: "heading", level: 2, text: head, size: "display", weight: "black",
        className: "relative z-10 max-w-[720px] mx-auto text-center mt-[18vh]",
        style: { transform: `rotate(${rotation}deg)` } },
      { id: nid("t"), type: "text", text: body, size: "lg", muted: true,
        className: "relative z-10 max-w-[520px] mx-auto text-center mt-6" },
      // floating stat chips
      ...stats.map((s, i) => ({
        id: nid("chip"), type: "stack" as const, direction: "v" as const, gap: 0, px: 6, py: 4,
        className: `absolute z-10 rounded-2xl bg-background/90 backdrop-blur border border-foreground/10 shadow-xl ${
          i === 0 ? "left-[6%] bottom-[24%]" :
          i === 1 ? "right-[10%] top-[50%]" :
                    "left-[28%] bottom-[8%]"
        }`,
        children: [
          { id: nid("sv"), type: "heading" as const, level: 4, text: s.value, size: "md", weight: "black" },
          { id: nid("sl"), type: "text" as const, text: s.label, size: "xs", muted: true },
        ],
      } as CompositionNode)),
    ],
  };
}

function clamp(n: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, n));
}
