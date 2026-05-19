/**
 * Creative Composition Engine
 *
 * Replaces the deterministic "hero+features+cta+contact" stack with a
 * prompt-driven, variation-pressured composition. Two pages from the same
 * niche must not look like siblings.
 *
 * Inputs:  prompt + siteType + seed
 * Outputs: WebsiteTemplate with unique section selection, order, variants,
 *          palette, font, and density.
 */

import type { WebsiteTemplate, WebsiteSection } from "@/lib/website-templates";

type SectionType = WebsiteSection["type"];

const ALL_SECTIONS: SectionType[] = [
  "hero",
  "about",
  "services",
  "features",
  "gallery",
  "testimonials",
  "team",
  "pricing",
  "faq",
  "cta",
  "contact",
];

const VARIANT_COUNTS: Record<string, number> = {
  hero: 3,
  about: 3,
  services: 3,
  features: 3,
  testimonials: 3,
  cta: 3,
  contact: 3,
  team: 2,
  gallery: 2,
  pricing: 1,
  faq: 1,
};

/* ─────────── Palette + typography pools (anti-repetition) ─────────── */

export const CREATIVE_PALETTES = [
  // Noir & Gold
  { primary: "45 80% 55%", secondary: "0 0% 12%", accent: "45 95% 65%", background: "0 0% 6%", text: "45 30% 92%" },
  // Editorial paper
  { primary: "0 0% 8%", secondary: "20 20% 40%", accent: "10 75% 55%", background: "40 30% 96%", text: "0 0% 10%" },
  // Brutalist pop
  { primary: "0 0% 8%", secondary: "0 0% 20%", accent: "15 95% 55%", background: "60 90% 70%", text: "0 0% 5%" },
  // Vapor chrome
  { primary: "260 80% 65%", secondary: "200 90% 65%", accent: "320 90% 70%", background: "230 30% 8%", text: "240 30% 95%" },
  // Glass aurora
  { primary: "150 70% 55%", secondary: "260 70% 65%", accent: "190 90% 60%", background: "230 40% 6%", text: "210 30% 95%" },
  // Desert clay
  { primary: "20 55% 45%", secondary: "30 35% 60%", accent: "10 60% 50%", background: "35 35% 94%", text: "20 30% 18%" },
  // Forest deep
  { primary: "160 55% 32%", secondary: "180 30% 45%", accent: "85 60% 55%", background: "160 20% 96%", text: "160 40% 12%" },
  // Cherry blossom
  { primary: "340 70% 55%", secondary: "210 30% 50%", accent: "30 85% 65%", background: "350 30% 97%", text: "340 30% 18%" },
  // Midnight indigo
  { primary: "240 70% 65%", secondary: "260 60% 55%", accent: "190 80% 60%", background: "240 40% 8%", text: "240 20% 95%" },
  // Sunset blaze
  { primary: "20 85% 55%", secondary: "340 70% 55%", accent: "45 95% 60%", background: "20 20% 8%", text: "30 30% 95%" },
];

const CREATIVE_FONTS = [
  "Space Grotesk",
  "Instrument Serif",
  "DM Serif Display",
  "Syne",
  "Sora",
  "Archivo Black",
  "Bricolage Grotesque",
  "Fraunces",
  "Cormorant Garamond",
  "Bebas Neue",
];

/* ─────────── Deterministic-but-diverse RNG ─────────── */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffle<T>(rng: () => number, arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* ─────────── Prompt → intent extraction ─────────── */

interface PromptIntent {
  needsForm: boolean;
  needsMenu: boolean;
  needsGallery: boolean;
  needsPricing: boolean;
  needsTeam: boolean;
  needsTestimonials: boolean;
  needsFAQ: boolean;
  mood: "premium-dark" | "editorial" | "playful" | "minimal" | "vivid";
}

function analyzePrompt(prompt: string, siteType: string): PromptIntent {
  const p = prompt.toLowerCase();
  const has = (...keys: string[]) => keys.some((k) => p.includes(k));

  const moodCandidates: PromptIntent["mood"][] = [];
  if (has("premium", "luxo", "elegante", "sofisticad", "preto", "dark", "noir")) moodCandidates.push("premium-dark");
  if (has("editorial", "revista", "magazine", "artigo", "publicação")) moodCandidates.push("editorial");
  if (has("divertid", "fun", "vibrant", "alegre", "playful", "color")) moodCandidates.push("playful");
  if (has("minimal", "limpo", "clean", "simples", "minimalist")) moodCandidates.push("minimal");
  if (has("vivid", "vivo", "intenso", "bold", "ousado", "energia")) moodCandidates.push("vivid");

  return {
    needsForm:
      has("form", "captura", "lead", "questoes", "questões", "questionário", "questionario", "inscri") ||
      siteType === "leadform",
    needsMenu: has("menu", "cardápio", "cardapio", "ementa", "pratos") || siteType === "restaurant",
    needsGallery:
      has("galeria", "gallery", "fotos", "imagens", "portfólio", "portfolio", "trabalhos") ||
      siteType === "portfolio" ||
      siteType === "photography" ||
      siteType === "wedding",
    needsPricing: has("preço", "preco", "pricing", "planos", "tabela de preços", "mensalidade", "pacote"),
    needsTeam: has("equipa", "team", "fundador", "founders", "sócios", "socios"),
    needsTestimonials: has("testemunho", "testimonial", "depoimento", "review", "avaliação", "avaliacao"),
    needsFAQ: has("faq", "perguntas frequentes", "dúvidas", "duvidas"),
    mood: moodCandidates[0] ?? "premium-dark",
  };
}

/* ─────────── Composition strategies ─────────── */

const STRATEGIES = [
  // Conventional but reshuffled
  ["hero", "about", "services", "testimonials", "cta", "contact"],
  // Story-first (about before hero feel)
  ["hero", "features", "about", "gallery", "cta"],
  // Bold + sparse
  ["hero", "services", "contact"],
  // Editorial long-form
  ["hero", "about", "gallery", "testimonials", "team", "contact"],
  // Conversion-first lead funnel
  ["hero", "features", "testimonials", "cta", "contact"],
  // Visual-led
  ["hero", "gallery", "about", "cta", "contact"],
  // Service-led
  ["hero", "services", "features", "pricing", "faq", "contact"],
  // Manifest style
  ["hero", "about", "cta"],
] as const;

/* ─────────── Main composer ─────────── */

export interface CompositionInput {
  prompt: string;
  siteType: string;
  websiteName: string;
  seed?: number;
}

export function getCreativeComposition(input: CompositionInput): WebsiteTemplate {
  const seed = input.seed ?? hashString(`${input.prompt}|${input.websiteName}|${Date.now()}`);
  const rng = mulberry32(seed);
  const intent = analyzePrompt(input.prompt, input.siteType);

  // Start from a randomly picked strategy then mutate based on intent.
  let order: SectionType[] = [...pick(rng, STRATEGIES as readonly (readonly SectionType[])[]) as SectionType[]];

  // Intent-driven additions (always inserted at non-default positions)
  const ensure = (t: SectionType, position: number) => {
    if (!order.includes(t)) {
      const i = Math.min(Math.max(position, 0), order.length);
      order.splice(i, 0, t);
    }
  };
  if (intent.needsForm) ensure("contact", Math.max(1, order.length - 1));
  if (intent.needsGallery) ensure("gallery", Math.floor(order.length / 2));
  if (intent.needsPricing) ensure("pricing", order.length - 1);
  if (intent.needsTeam) ensure("team", Math.floor(order.length / 2));
  if (intent.needsTestimonials) ensure("testimonials", Math.floor(order.length / 2));
  if (intent.needsFAQ) ensure("faq", order.length - 1);

  // Anti-template pressure: occasionally drop a generic section.
  if (rng() < 0.35 && order.length > 4) {
    const dropCandidates: SectionType[] = ["features", "cta", "about"];
    const dropable = order.filter((s) => dropCandidates.includes(s));
    if (dropable.length > 1) {
      const drop = pick(rng, dropable);
      order = order.filter((s) => s !== drop);
    }
  }

  // Random tail shuffle on the non-hero portion to break predictable flow.
  if (order[0] === "hero" && order.length > 3) {
    const head = order.slice(0, 1);
    const tail = shuffle(rng, order.slice(1));
    // Always keep contact last when present.
    const contactIdx = tail.indexOf("contact");
    if (contactIdx >= 0) {
      tail.splice(contactIdx, 1);
      tail.push("contact");
    }
    order = [...head, ...tail];
  }

  // Build sections with diverse variants (avoid always picking variant 1)
  const sections: WebsiteSection[] = order.map((type, idx) => {
    const max = VARIANT_COUNTS[type] ?? 1;
    const variant = Math.floor(rng() * max) + 1;
    return {
      id: `${type}-${idx}`,
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      enabled: true,
      order: idx,
      content: {},
      variant,
    } as WebsiteSection;
  });

  // Mood → palette bias
  const moodPaletteIdx: Record<PromptIntent["mood"], number[]> = {
    "premium-dark": [0, 3, 4, 8, 9],
    editorial: [1, 5, 7],
    playful: [2, 7, 9],
    minimal: [1, 5, 6],
    vivid: [3, 4, 9, 2],
  };
  const paletteCandidates = moodPaletteIdx[intent.mood].map((i) => CREATIVE_PALETTES[i]);
  const colors = pick(rng, paletteCandidates);
  const font = pick(rng, CREATIVE_FONTS);

  return {
    id: "creative-composition",
    name: "Composição Criativa",
    description: `Composição única gerada (mood: ${intent.mood})`,
    category: "Criativo",
    categoryId: "creative",
    type: "landing",
    thumbnail: "/placeholder.svg",
    colors,
    font,
    sections,
  };
}

export function isCreativeIntent(prompt: string, siteType: string): PromptIntent {
  return analyzePrompt(prompt, siteType);
}
