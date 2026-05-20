/**
 * Brief Builder — turns prompt + name into a CreativeBrief usable by
 * the CompositionGenerator. Independent of the legacy section-stack.
 */

import { CREATIVE_PALETTES } from "@/lib/creative-composition";
import type { CreativeBrief } from "@/core/render/CompositionGenerator";
import type { GraphTheme } from "@/core/render/composition-graph";
import { generateVisualDNA } from "@/core/dna";

const MOOD_FONTS: Record<GraphTheme["mood"], string[]> = {
  editorial:  ["Instrument Serif", "Fraunces", "Cormorant Garamond", "DM Serif Display"],
  cinematic:  ["Syne", "Space Grotesk", "Sora"],
  brutalist:  ["Archivo Black", "Bebas Neue", "Space Mono"],
  minimal:    ["Inter", "Sora", "Space Grotesk"],
  magazine:   ["Fraunces", "Instrument Serif", "DM Serif Display"],
  bento:      ["Bricolage Grotesque", "Space Grotesk", "Sora"],
  futuristic: ["Space Grotesk", "Syne", "Sora"],
  apple:      ["Inter", "Sora"],
};

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function detectMood(prompt: string): GraphTheme["mood"] {
  const p = prompt.toLowerCase();
  if (/brutalist|raw|harsh|crud[oa]/.test(p))                          return "brutalist";
  if (/cinemat|film|movie|epic|grand|imersiv/.test(p))                 return "cinematic";
  if (/apple|minimal|clean|simples|pure|white space/.test(p))          return "apple";
  if (/editorial|magazin|publica[çc][ãa]o|serif|tipograf/.test(p))     return "editorial";
  if (/bento|grid|dashboard|cards/.test(p))                            return "bento";
  if (/futur|neon|cyber|vapor|y2k|metavers/.test(p))                   return "futuristic";
  if (/luxury|luxo|premium|estilo|elegant/.test(p))                    return "editorial";
  if (/agenc|marca|brand|criativ/.test(p))                             return "magazine";
  return "editorial";
}

function pickPalette(prompt: string, seed: number) {
  const p = prompt.toLowerCase();
  // Honor user hints first
  if (/dark|preto|black|noir/.test(p)) {
    return CREATIVE_PALETTES.find(x => x.background.startsWith("0 0% 6")) ?? CREATIVE_PALETTES[0];
  }
  if (/dourado|gold|noir/.test(p))   return CREATIVE_PALETTES[0];
  if (/paper|editorial|warm/.test(p)) return CREATIVE_PALETTES[1];
  if (/brutalist|pop|yellow/.test(p)) return CREATIVE_PALETTES[2];
  if (/vapor|neon|y2k/.test(p))      return CREATIVE_PALETTES[3];
  if (/glass|aurora|green/.test(p))  return CREATIVE_PALETTES[4];
  if (/clay|terra|desert|earth/.test(p)) return CREATIVE_PALETTES[5];
  if (/forest|nature|green/.test(p)) return CREATIVE_PALETTES[6];
  if (/blossom|pink|rosa/.test(p))   return CREATIVE_PALETTES[7];
  if (/indigo|midnight|blue/.test(p)) return CREATIVE_PALETTES[8];
  if (/sunset|orange|warm/.test(p))  return CREATIVE_PALETTES[9];
  return CREATIVE_PALETTES[seed % CREATIVE_PALETTES.length];
}

export function buildBrief(input: {
  prompt: string;
  websiteName: string;
  whatsappNumber?: string;
}): CreativeBrief {
  const seed = hashSeed(input.prompt + "|" + input.websiteName + "|" + Date.now());
  const mood = detectMood(input.prompt);
  const palette = pickPalette(input.prompt, seed);
  const fontPool = MOOD_FONTS[mood];
  const font = fontPool[seed % fontPool.length];

  const dna = generateVisualDNA({
    prompt: input.prompt,
    websiteName: input.websiteName,
    uniqueSalt: seed,
  });

  return {
    prompt: input.prompt,
    websiteName: input.websiteName,
    mood,
    palette,
    font,
    seed,
    dna,
    whatsappNumber: input.whatsappNumber,
  };
}
