/**
 * Composition Generator — turns a creative brief into a CompositionGraph.
 *
 * IMPORTANT: this is NOT a section-stacker. Strategies produce asymmetric,
 * overlapping, magazine, bento, cinematic layouts. The output graph nests
 * primitives (Stack/Grid/Overlay/Floating) — never "section[]".
 */

import {
  CompositionGraph, CompositionNode, GraphTheme,
} from "./composition-graph";
import type { VisualDNA } from "@/core/dna";

export interface CreativeBrief {
  prompt: string;
  websiteName: string;
  mood: GraphTheme["mood"];
  palette: { primary: string; secondary: string; accent: string; background: string; text: string };
  font: string;
  /** Seed for determinism within the same prompt */
  seed: number;
  /** Per-project visual DNA — destroys template repetition. */
  dna?: VisualDNA;
  /** Optional copy hints */
  headline?: string;
  subheadline?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  features?: Array<{ title: string; description: string }>;
  whatsappNumber?: string;
}

/* ---------- seeded RNG ---------- */
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
const id = (prefix: string, n: number) => `${prefix}-${n.toString(36)}`;

/* Stock-ish placeholder images that look intentional, not random */
const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1600&q=80",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1600&q=80",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1600&q=80",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1600&q=80",
];

/* ---------- public API ---------- */

export function generateCompositionGraph(brief: CreativeBrief): CompositionGraph {
  const rng = mulberry32(brief.seed);
  const pickStrategy = pickByMood(brief.mood, rng);
  const root = pickStrategy(brief, rng);
  return {
    version: 1,
    theme: {
      ...brief.palette,
      font: brief.font,
      mood: brief.mood,
      dna: brief.dna,
    },
    root,
  };
}

type Strategy = (b: CreativeBrief, rng: () => number) => CompositionNode;

function pickByMood(mood: GraphTheme["mood"], rng: () => number): Strategy {
  const editorial: Strategy[] = [editorialAsymmetric, magazineSplit, editorialLayered];
  const cinematic: Strategy[] = [cinematicHero, fullBleedCinematic];
  const brutalist: Strategy[] = [brutalistGrid, brutalistOffset];
  const minimal:   Strategy[] = [appleMinimal, minimalEditorial];
  const magazine:  Strategy[] = [magazineSplit, editorialLayered];
  const bento:     Strategy[] = [bentoGrid];
  const futuristic:Strategy[] = [cinematicHero, brutalistOffset];
  const apple:     Strategy[] = [appleMinimal];
  const pool: Record<GraphTheme["mood"], Strategy[]> = {
    editorial, cinematic, brutalist, minimal, magazine, bento, futuristic, apple,
  };
  const list = pool[mood] ?? editorial;
  return list[Math.floor(rng() * list.length)];
}

/* ---------- helpers ---------- */
const txt = (i: number, b: CreativeBrief, fallback: string): string => fallback;
const img = (rng: () => number) => STOCK_IMAGES[Math.floor(rng() * STOCK_IMAGES.length)];
const F = (b: CreativeBrief) => b.features ?? defaultFeatures(b);

function defaultFeatures(b: CreativeBrief) {
  return [
    { title: "Visão clara",   description: "Direção criativa pensada para a sua marca." },
    { title: "Execução rápida", description: "Do briefing ao site em minutos, não semanas." },
    { title: "Estética única", description: "Cada composição é diferente — sem templates." },
  ];
}

/* ====================================================================== */
/* STRATEGIES                                                             */
/* ====================================================================== */

/** Editorial asymmetric: huge serif headline left, small image stack right,
 *  then offset feature blocks, then cinematic CTA strip. */
function editorialAsymmetric(b: CreativeBrief, rng: () => number): CompositionNode {
  let n = 0;
  const features = F(b);
  return {
    id: id("root", n++), type: "stack", direction: "v", gap: 0, contain: "none",
    children: [
      // Nav strip
      navBar(b, n++),
      // Hero: 7/5 grid with floating type and decorative shape
      {
        id: id("hero", n++), type: "overlay", py: 32, px: 8, minH: "80vh",
        children: [
          { id: id("blob", n++), type: "shape", shape: "blob", color: "primary",
            style: { position: "absolute", top: "-10%", right: "-10%", width: "60%", height: "70%" } },
          {
            id: id("grid", n++), type: "grid", cols: "7fr 5fr", gap: 12, contain: "wide",
            children: [
              {
                id: id("col1", n++), type: "stack", direction: "v", gap: 6, align: "start", justify: "center",
                children: [
                  { id: id("eyebrow", n++), type: "text", text: b.websiteName.toUpperCase(), size: "xs", className: "tracking-[0.3em] opacity-60" },
                  { id: id("h1", n++), type: "heading", level: 1, size: "hero", text: b.headline ?? deriveHeadline(b), serif: true, tracking: "tighter", weight: "black" },
                  { id: id("sub", n++), type: "text", text: b.subheadline ?? deriveSub(b), size: "lg", muted: true, maxW: "520px" },
                  {
                    id: id("ctas", n++), type: "flex", direction: "row", gap: 4,
                    children: [
                      { id: id("cta1", n++), type: "button", label: b.ctaPrimary ?? "Começar agora", action: "scroll", target: "contact", size: "lg" },
                      { id: id("cta2", n++), type: "button", label: b.ctaSecondary ?? "Saber mais", variant: "ghost", action: "scroll", target: "story", size: "lg" },
                    ],
                  },
                ],
              },
              {
                id: id("col2", n++), type: "stack", direction: "v", gap: 4, align: "end",
                children: [
                  { id: id("img1", n++), type: "image", src: img(rng), aspect: "portrait", rounded: "2xl", className: "w-4/5 ml-auto" },
                  { id: id("img2", n++), type: "image", src: img(rng), aspect: "square",   rounded: "2xl", className: "w-3/5 ml-auto -mt-12" },
                ],
              },
            ],
          },
        ],
      },
      // Offset feature strip
      {
        id: id("story", n++), type: "stack", direction: "v", gap: 16, py: 32, px: 8, contain: "wide",
        children: features.map((f, i) => ({
          id: id("frow", n++), type: "grid", cols: i % 2 === 0 ? "1fr 2fr" : "2fr 1fr", gap: 8,
          children: i % 2 === 0
            ? [
              { id: id("fimg", n++), type: "image", src: img(rng), aspect: "video", rounded: "xl" },
              { id: id("ftxt", n++), type: "stack", direction: "v", gap: 2, justify: "center",
                children: [
                  { id: id("fnum", n++), type: "text", text: `0${i+1}`, size: "sm", className: "opacity-50 tracking-widest" },
                  { id: id("fh",   n++), type: "heading", level: 2, size: "xl", text: f.title, serif: true, weight: "bold" },
                  { id: id("fd",   n++), type: "text", text: f.description, size: "lg", muted: true, maxW: "520px" },
                ],
              },
            ]
            : [
              { id: id("ftxt", n++), type: "stack", direction: "v", gap: 2, justify: "center",
                children: [
                  { id: id("fnum", n++), type: "text", text: `0${i+1}`, size: "sm", className: "opacity-50 tracking-widest" },
                  { id: id("fh",   n++), type: "heading", level: 2, size: "xl", text: f.title, serif: true, weight: "bold" },
                  { id: id("fd",   n++), type: "text", text: f.description, size: "lg", muted: true, maxW: "520px" },
                ],
              },
              { id: id("fimg", n++), type: "image", src: img(rng), aspect: "video", rounded: "xl" },
            ],
        })) as CompositionNode[],
      },
      ctaStrip(b, n++),
      footer(b, n++),
    ],
  };
}

/** Magazine: 50/50 split hero with full-bleed image, then a 3x asymmetric grid. */
function magazineSplit(b: CreativeBrief, rng: () => number): CompositionNode {
  let n = 0;
  return {
    id: id("root", n++), type: "stack", direction: "v", gap: 0,
    children: [
      navBar(b, n++),
      {
        id: id("hero", n++), type: "grid", cols: "1fr 1fr", gap: 0,
        children: [
          { id: id("img", n++), type: "image", src: img(rng), aspect: "portrait", className: "h-full", fit: "cover" },
          {
            id: id("col", n++), type: "stack", direction: "v", gap: 6, justify: "center", py: 24, px: 16, align: "start",
            children: [
              { id: id("eye", n++), type: "text", text: "ISSUE 01 — " + b.websiteName.toUpperCase(), size: "xs", className: "tracking-[0.3em] opacity-60" },
              { id: id("h",   n++), type: "heading", level: 1, size: "display", text: b.headline ?? deriveHeadline(b), serif: true, weight: "black", tracking: "tighter" },
              { id: id("s",   n++), type: "text", text: b.subheadline ?? deriveSub(b), size: "lg", muted: true },
              { id: id("cta", n++), type: "button", label: b.ctaPrimary ?? "Ler agora", action: "scroll", target: "grid", size: "lg" },
            ],
          },
        ],
      },
      {
        id: id("grid", n++), type: "grid", cols: 12, gap: 6, py: 24, px: 8, contain: "wide",
        spans: [{ col: 7 }, { col: 5 }, { col: 4 }, { col: 8 }, { col: 6 }, { col: 6 }],
        children: [
          imageCard(n++, img(rng), F(b)[0]?.title ?? "Capítulo I", F(b)[0]?.description ?? ""),
          quoteBlock(n++, "“" + deriveSub(b) + "”"),
          imageCard(n++, img(rng), F(b)[1]?.title ?? "Capítulo II", ""),
          imageCard(n++, img(rng), F(b)[2]?.title ?? "Capítulo III", F(b)[2]?.description ?? ""),
          quoteBlock(n++, b.websiteName + " — uma nova forma de ver."),
          imageCard(n++, img(rng), "Contacto", ""),
        ],
      },
      ctaStrip(b, n++),
      footer(b, n++),
    ],
  };
}

/** Editorial layered: floating elements, overlapping text+image, broken grid. */
function editorialLayered(b: CreativeBrief, rng: () => number): CompositionNode {
  let n = 0;
  return {
    id: id("root", n++), type: "stack", direction: "v", gap: 0,
    children: [
      navBar(b, n++),
      {
        id: id("hero", n++), type: "overlay", minH: "90vh", py: 0, px: 0,
        children: [
          { id: id("img", n++), type: "image", src: img(rng), className: "absolute inset-0 w-full h-full", fit: "cover" },
          { id: id("ov", n++), type: "shape", shape: "gradient", color: "primary", style: { mixBlendMode: "multiply", opacity: 0.7 } },
          {
            id: id("text", n++), type: "stack", direction: "v", gap: 4, justify: "end", py: 24, px: 16,
            className: "relative z-10 min-h-[90vh] text-white",
            children: [
              { id: id("h", n++), type: "heading", level: 1, size: "hero", text: b.headline ?? deriveHeadline(b), serif: true, weight: "black", tracking: "tighter", className: "text-white max-w-4xl" },
              { id: id("s", n++), type: "text", text: b.subheadline ?? deriveSub(b), size: "xl", maxW: "640px", className: "text-white/80" },
            ],
          },
          { id: id("fl", n++), type: "floating", top: "8%", right: "6%", rotate: 6, z: 5,
            children: [{ id: id("badge", n++), type: "text", text: "EST. " + new Date().getFullYear(), className: "text-white/70 tracking-[0.3em] text-xs border border-white/30 px-3 py-1 rounded-full backdrop-blur" }] },
        ],
      },
      featureColumns(b, rng, n++),
      ctaStrip(b, n++),
      footer(b, n++),
    ],
  };
}

/** Cinematic hero: huge full-bleed video-ish hero, narrow text reveals after. */
function cinematicHero(b: CreativeBrief, rng: () => number): CompositionNode {
  let n = 0;
  return {
    id: id("root", n++), type: "stack", direction: "v", gap: 0,
    children: [
      navBar(b, n++),
      {
        id: id("hero", n++), type: "overlay", minH: "100vh",
        children: [
          { id: id("img", n++), type: "image", src: img(rng), className: "absolute inset-0 w-full h-full", fit: "cover" },
          { id: id("dark", n++), type: "shape", shape: "gradient", color: "muted",
            style: { background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)" } },
          {
            id: id("center", n++), type: "stack", direction: "v", gap: 6, align: "center", justify: "center",
            className: "relative z-10 min-h-[100vh] text-center text-white", px: 8,
            children: [
              { id: id("h", n++), type: "heading", level: 1, size: "hero", text: b.headline ?? deriveHeadline(b), weight: "black", tracking: "tighter", className: "text-white max-w-5xl" },
              { id: id("s", n++), type: "text", text: b.subheadline ?? deriveSub(b), size: "xl", className: "text-white/80 max-w-2xl mx-auto" },
              { id: id("cta", n++), type: "button", label: b.ctaPrimary ?? "Descobrir", action: "scroll", target: "next", size: "lg" },
            ],
          },
        ],
      },
      featureColumns(b, rng, n++),
      ctaStrip(b, n++),
      footer(b, n++),
    ],
  };
}

function fullBleedCinematic(b: CreativeBrief, rng: () => number): CompositionNode {
  let n = 0;
  const cine = cinematicHero(b, rng) as CompositionNode & { children: CompositionNode[] };
  const heroOverlay = cine.children?.[1];
  return {
    id: id("root", n++), type: "stack", direction: "v", gap: 0,
    children: [
      navBar(b, n++),
      ...(heroOverlay ? [heroOverlay] : []),
      bentoGridInner(b, rng, n++),
      ctaStrip(b, n++),
      footer(b, n++),
    ],
  };
}

/** Brutalist: huge raw type, harsh grid, no rounding, mono-ish. */
function brutalistGrid(b: CreativeBrief, rng: () => number): CompositionNode {
  let n = 0;
  return {
    id: id("root", n++), type: "stack", direction: "v", gap: 0,
    children: [
      navBar(b, n++, true),
      {
        id: id("hero", n++), type: "stack", direction: "v", gap: 0, py: 12, px: 8, contain: "wide",
        children: [
          { id: id("h", n++), type: "heading", level: 1, size: "hero", text: (b.headline ?? deriveHeadline(b)).toUpperCase(), weight: "black", tracking: "tighter", className: "border-b-4 border-current pb-8" },
          { id: id("sub", n++), type: "text", text: b.subheadline ?? deriveSub(b), size: "xl", className: "py-6 max-w-2xl" },
        ],
      },
      {
        id: id("grid", n++), type: "grid", cols: 3, gap: 0, contain: "full",
        children: F(b).map((f, i) => ({
          id: id("cell", n++), type: "stack", direction: "v", gap: 2, py: 16, px: 8,
          className: i % 2 === 0 ? "bg-black text-white" : "border-2 border-current",
          children: [
            { id: id("num", n++), type: "heading", level: 3, size: "xl", text: `0${i+1}.`, weight: "black" },
            { id: id("t",   n++), type: "heading", level: 4, size: "lg", text: f.title.toUpperCase(), weight: "bold", tracking: "wide" },
            { id: id("d",   n++), type: "text", text: f.description, size: "base" },
          ],
        })) as CompositionNode[],
      },
      ctaStrip(b, n++, true),
      footer(b, n++),
    ],
  };
}

function brutalistOffset(b: CreativeBrief, rng: () => number): CompositionNode {
  let n = 0;
  return {
    id: id("root", n++), type: "stack", direction: "v", gap: 0,
    children: [
      navBar(b, n++, true),
      {
        id: id("hero", n++), type: "overlay", py: 24, px: 8, minH: "70vh",
        children: [
          { id: id("dot", n++), type: "shape", shape: "dot-grid", color: "muted" },
          {
            id: id("grid", n++), type: "grid", cols: 12, gap: 4, contain: "wide",
            spans: [{ col: 8, colStart: 1 }, { col: 6, colStart: 6 }],
            children: [
              { id: id("h", n++), type: "heading", level: 1, size: "hero", text: (b.headline ?? deriveHeadline(b)).toUpperCase(), weight: "black", tracking: "tighter" },
              { id: id("s", n++), type: "text", text: b.subheadline ?? deriveSub(b), size: "xl", className: "mt-12 border-l-4 border-current pl-6" },
            ],
          },
        ],
      },
      featureColumns(b, rng, n++),
      ctaStrip(b, n++, true),
      footer(b, n++),
    ],
  };
}

/** Apple-like minimal: massive centered headline, lots of breathing. */
function appleMinimal(b: CreativeBrief, rng: () => number): CompositionNode {
  let n = 0;
  return {
    id: id("root", n++), type: "stack", direction: "v", gap: 0,
    children: [
      navBar(b, n++),
      {
        id: id("hero", n++), type: "stack", direction: "v", gap: 4, align: "center", justify: "center", py: 40, px: 8,
        className: "text-center",
        children: [
          { id: id("h", n++), type: "heading", level: 1, size: "hero", text: b.headline ?? deriveHeadline(b), weight: "semibold", tracking: "tighter", className: "max-w-5xl mx-auto" },
          { id: id("s", n++), type: "text", text: b.subheadline ?? deriveSub(b), size: "xl", className: "max-w-2xl mx-auto opacity-70" },
          { id: id("cta", n++), type: "button", label: b.ctaPrimary ?? "Começar", action: "scroll", target: "feat", size: "lg" },
          { id: id("hero-img", n++), type: "image", src: img(rng), aspect: "ultra", rounded: "3xl", className: "mt-12 max-w-5xl mx-auto" },
        ],
      },
      {
        id: id("feat", n++), type: "stack", direction: "v", gap: 24, py: 32, px: 8, contain: "wide",
        children: F(b).map((f, i) => ({
          id: id("row", n++), type: "stack", direction: "v", gap: 4, align: "center",
          className: "text-center",
          children: [
            { id: id("t", n++), type: "heading", level: 2, size: "display", text: f.title, weight: "semibold", tracking: "tighter" },
            { id: id("d", n++), type: "text", text: f.description, size: "lg", className: "opacity-70 max-w-xl mx-auto" },
            { id: id("img", n++), type: "image", src: img(rng), aspect: "wide", rounded: "3xl", className: "mt-6" },
          ],
        })) as CompositionNode[],
      },
      ctaStrip(b, n++),
      footer(b, n++),
    ],
  };
}

function minimalEditorial(b: CreativeBrief, rng: () => number): CompositionNode {
  let n = 0;
  return {
    id: id("root", n++), type: "stack", direction: "v", gap: 0,
    children: [
      navBar(b, n++),
      {
        id: id("hero", n++), type: "stack", direction: "v", gap: 6, py: 40, px: 8, contain: "narrow",
        children: [
          { id: id("eye", n++), type: "text", text: b.websiteName.toUpperCase(), size: "xs", className: "tracking-[0.3em] opacity-60" },
          { id: id("h", n++), type: "heading", level: 1, size: "display", text: b.headline ?? deriveHeadline(b), serif: true, weight: "normal", tracking: "tight" },
          { id: id("s", n++), type: "text", text: b.subheadline ?? deriveSub(b), size: "lg", serif: true, muted: true },
          { id: id("line", n++), type: "shape", shape: "line", color: "muted" },
        ],
      },
      featureColumns(b, rng, n++),
      ctaStrip(b, n++),
      footer(b, n++),
    ],
  };
}

/** Bento grid as primary surface */
function bentoGrid(b: CreativeBrief, rng: () => number): CompositionNode {
  let n = 0;
  return {
    id: id("root", n++), type: "stack", direction: "v", gap: 0,
    children: [
      navBar(b, n++),
      {
        id: id("intro", n++), type: "stack", direction: "v", gap: 4, py: 20, px: 8, contain: "wide", align: "start",
        children: [
          { id: id("h", n++), type: "heading", level: 1, size: "display", text: b.headline ?? deriveHeadline(b), weight: "bold", tracking: "tighter" },
          { id: id("s", n++), type: "text", text: b.subheadline ?? deriveSub(b), size: "lg", muted: true, maxW: "640px" },
        ],
      },
      bentoGridInner(b, rng, n++),
      ctaStrip(b, n++),
      footer(b, n++),
    ],
  };
}

function bentoGridInner(b: CreativeBrief, rng: () => number, baseN: number): CompositionNode {
  let n = baseN;
  return {
    id: id("bento", n++), type: "grid", cols: 6, gap: 4, py: 16, px: 8, contain: "wide",
    spans: [
      { col: 4, row: 2 }, { col: 2 }, { col: 2 },
      { col: 2 }, { col: 4 },
    ],
    children: [
      // Big featured card
      {
        id: id("c1", n++), type: "overlay", className: "rounded-3xl overflow-hidden min-h-[320px]",
        children: [
          { id: id("c1img", n++), type: "image", src: img(rng), className: "absolute inset-0 w-full h-full" },
          { id: id("c1grad", n++), type: "shape", shape: "gradient", color: "primary", style: { background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)" } },
          {
            id: id("c1t", n++), type: "stack", direction: "v", gap: 2, justify: "end", py: 8, px: 8,
            className: "relative z-10 h-full text-white min-h-[320px]",
            children: [
              { id: id("c1h", n++), type: "heading", level: 2, size: "xl", text: F(b)[0]?.title ?? b.websiteName, weight: "bold", className: "text-white" },
              { id: id("c1d", n++), type: "text", text: F(b)[0]?.description ?? "", className: "text-white/80" },
            ],
          },
        ],
      },
      bentoCard(n++, F(b)[1]?.title ?? "Rápido", F(b)[1]?.description ?? "", "primary"),
      bentoCard(n++, F(b)[2]?.title ?? "Único", F(b)[2]?.description ?? "", "accent"),
      bentoCard(n++, "Premium", "Composições únicas, sem templates.", "secondary"),
      {
        id: id("c5", n++), type: "overlay", className: "rounded-3xl overflow-hidden min-h-[200px]",
        children: [
          { id: id("c5img", n++), type: "image", src: img(rng), className: "absolute inset-0 w-full h-full" },
        ],
      },
    ],
  };
}

/* ---------- shared sub-builders ---------- */

function navBar(b: CreativeBrief, n: number, harsh = false): CompositionNode {
  return {
    id: id("nav", n), type: "flex", direction: "row", justify: "between", align: "center",
    className: harsh
      ? "px-8 py-4 border-b-2 border-current sticky top-0 z-20 backdrop-blur"
      : "px-8 py-5 sticky top-0 z-20 backdrop-blur bg-[hsl(var(--g-bg)/0.7)] border-b border-[hsl(var(--g-text)/0.08)]",
    children: [
      { id: id("logo", n + 100), type: "heading", level: 4, size: "md", text: b.websiteName, weight: "bold", tracking: "tighter" },
      {
        id: id("nlinks", n + 101), type: "flex", direction: "row", gap: 6, align: "center",
        children: [
          { id: id("nl1", n + 102), type: "text", text: "História", size: "sm", className: "hidden md:block opacity-70 cursor-pointer hover:opacity-100" },
          { id: id("nl2", n + 103), type: "text", text: "Trabalho", size: "sm", className: "hidden md:block opacity-70 cursor-pointer hover:opacity-100" },
          { id: id("ncta", n + 104), type: "button", label: "Contactar", action: "scroll", target: "contact", size: "sm" },
        ],
      },
    ],
  };
}

function ctaStrip(b: CreativeBrief, n: number, harsh = false): CompositionNode {
  return {
    id: id("cta", n), type: "overlay", py: 24, px: 8, minH: "40vh",
    className: harsh ? "bg-black text-white" : "",
    children: [
      ...(harsh ? [] : [{ id: id("ctab", n + 1), type: "shape" as const, shape: "blob" as const, color: "primary" as const, style: { position: "absolute" as const, top: "10%", left: "30%", width: "40%", height: "80%" } }]),
      {
        id: id("ctac", n + 2), type: "stack", direction: "v", gap: 4, align: "center", justify: "center",
        className: "relative z-10 text-center min-h-[40vh]",
        children: [
          { id: id("ctah", n + 3), type: "heading", level: 2, size: "display", text: "Pronto para começar?", weight: "black", tracking: "tighter", className: harsh ? "text-white" : "" },
          { id: id("ctad", n + 4), type: "text", text: "Vamos criar algo único juntos.", size: "lg", className: harsh ? "text-white/70" : "opacity-70" },
          { id: id("ctab2", n + 5), type: "button", label: b.ctaPrimary ?? "Falar connosco", action: b.whatsappNumber ? "whatsapp" : "scroll", target: b.whatsappNumber ?? "contact", size: "lg", variant: harsh ? "outline" : "primary" },
        ],
      },
    ],
  };
}

function footer(b: CreativeBrief, n: number): CompositionNode {
  return {
    id: id("foot", n), type: "stack", direction: "v", gap: 2, py: 12, px: 8, align: "center",
    className: "border-t border-[hsl(var(--g-text)/0.1)] text-center",
    children: [
      { id: id("fname", n + 1), type: "text", text: b.websiteName, size: "sm", className: "font-semibold" },
      { id: id("fcopy", n + 2), type: "text", text: `© ${new Date().getFullYear()} — Composição única gerada com Kinjani.`, size: "xs", muted: true },
    ],
  };
}

function featureColumns(b: CreativeBrief, rng: () => number, n: number): CompositionNode {
  return {
    id: id("feats", n), type: "grid", cols: 3, gap: 8, py: 24, px: 8, contain: "wide",
    children: F(b).map((f, i) => ({
      id: id("fc", n + i * 10), type: "stack", direction: "v", gap: 3,
      children: [
        { id: id("fcn", n + i * 10 + 1), type: "text", text: `0${i+1}`, className: "text-5xl font-black opacity-20" },
        { id: id("fct", n + i * 10 + 2), type: "heading", level: 3, size: "lg", text: f.title, weight: "bold" },
        { id: id("fcd", n + i * 10 + 3), type: "text", text: f.description, muted: true },
      ],
    })) as CompositionNode[],
  };
}

function imageCard(n: number, src: string, title: string, desc: string): CompositionNode {
  return {
    id: id("ic", n), type: "stack", direction: "v", gap: 3,
    children: [
      { id: id("ici", n + 1), type: "image", src, aspect: "video", rounded: "xl" },
      { id: id("ich", n + 2), type: "heading", level: 3, size: "lg", text: title, weight: "bold", serif: true },
      ...(desc ? [{ id: id("icd", n + 3), type: "text" as const, text: desc, muted: true, size: "sm" as const }] : []),
    ],
  };
}

function quoteBlock(n: number, text: string): CompositionNode {
  return {
    id: id("q", n), type: "stack", direction: "v", gap: 4, justify: "center",
    className: "border-l-4 border-current pl-6 italic",
    children: [
      { id: id("qt", n + 1), type: "heading", level: 3, size: "xl", text, serif: true, italic: true, weight: "normal" },
    ],
  };
}

function bentoCard(n: number, title: string, desc: string, color: "primary" | "secondary" | "accent"): CompositionNode {
  const bg = color === "primary" ? "bg-[hsl(var(--g-primary)/0.08)]" : color === "accent" ? "bg-[hsl(var(--g-accent)/0.1)]" : "bg-[hsl(var(--g-secondary)/0.08)]";
  return {
    id: id("bc", n), type: "stack", direction: "v", gap: 2, py: 8, px: 8,
    className: `${bg} rounded-3xl justify-end min-h-[200px]`,
    children: [
      { id: id("bct", n + 1), type: "heading", level: 3, size: "lg", text: title, weight: "bold" },
      { id: id("bcd", n + 2), type: "text", text: desc, size: "sm", muted: true },
    ],
  };
}

/* ---------- copy derivation ---------- */

function deriveHeadline(b: CreativeBrief): string {
  const p = b.prompt.toLowerCase();
  const name = b.websiteName;
  if (p.includes("luxury") || p.includes("luxo")) return `${name}. Onde o detalhe importa.`;
  if (p.includes("brutalist")) return `${name.toUpperCase()} — SEM RUÍDO.`;
  if (p.includes("apple") || p.includes("minimal")) return `${name}. Menos. Melhor.`;
  if (p.includes("agency") || p.includes("agência")) return `Construímos marcas que ficam.`;
  if (p.includes("restaurant") || p.includes("restaurante")) return `${name} — sabor que conta uma história.`;
  if (p.includes("real estate") || p.includes("imobil")) return `Encontre o lugar certo.`;
  if (p.includes("fintech") || p.includes("saas")) return `${name}. Infraestrutura que não falha.`;
  return `${name}. Algo novo está a acontecer.`;
}

function deriveSub(b: CreativeBrief): string {
  return b.prompt.length > 120 ? b.prompt.slice(0, 120) + "..." : b.prompt;
}
