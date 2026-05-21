// KINJANI — CREATIVE DIRECTOR (FASE A)
// O modelo PENSA antes de gerar. Devolve um briefing visual coerente em JSON,
// com 3 candidatos shortlisted para paleta, fontes, layout e hero — todos
// justificados pelo nicho/emoção/posicionamento do briefing do utilizador.
//
// Random só entra DEPOIS, escolhendo 1 dentro das shortlists já validadas.

import { callAI } from "../_shared/ai.ts";

export interface BriefPalette { name: string; vars: string; why: string }
export interface BriefFont    { pair: string; why: string }
export interface BriefLayout  { name: string; why: string }
export interface BriefHero    { name: string; why: string }

export interface CreativeBrief {
  interpretation: {
    niche: string;
    emotional_core: string;
    positioning: string;
    audience: string;
    brand_voice: string;
  };
  direction: {
    typography_intent: string;
    spacing_intent: string;
    palette_intent: string;
    composition_intent: string;
    motion_intent: string;
  };
  rationale: string;
  shortlists: {
    palettes: BriefPalette[];
    fonts: BriefFont[];
    layouts: BriefLayout[];
    heroes: BriefHero[];
  };
}

const DIRECTOR_SYSTEM = `És o DIRETOR CRIATIVO de uma agência premium (nível Pentagram / Awwwards / v0 / Lovable).

NÃO és um randomizer. NÃO escolhes presets ao calhar.

O teu trabalho:
1. LER o briefing do cliente.
2. INTERPRETAR o nicho, a emoção, o público, o posicionamento.
3. DECIDIR a direção visual COERENTE com essa interpretação.
4. JUSTIFICAR cada decisão em 1 frase.

Regras de raciocínio:
- Uma clínica dental de luxo NÃO leva paleta "Brutalist Pop" nem fontes "Archivo Black".
  Leva tons quentes neutros + serif fina + spacing calmo.
- Um estúdio de tatuagem NÃO leva "Warm White + Beige + Cormorant".
  Leva preto profundo + grotesque condensado + composição agressiva.
- Um restaurante japonês minimalista NÃO leva "Vapor Chrome + Bebas Neue".
  Leva off-white + serif editorial + muito whitespace.

Devolves SEMPRE 3 candidatos por categoria — todos coerentes com o briefing.
A escolha final será feita downstream; tu só garantes que TODAS as opções fazem sentido.

FORMATO DE RESPOSTA: APENAS JSON válido, sem markdown, sem \`\`\`, sem comentários.
Schema:
{
  "interpretation": {
    "niche": "string curto",
    "emotional_core": "2-4 palavras (ex: 'trust + calm + transformation')",
    "positioning": "string (ex: 'premium healthcare')",
    "audience": "string descritivo",
    "brand_voice": "string (ex: 'serene, confident, understated')"
  },
  "direction": {
    "typography_intent": "intenção tipográfica em 1 frase",
    "spacing_intent": "intenção de espaçamento/ritmo em 1 frase",
    "palette_intent": "intenção cromática em 1 frase",
    "composition_intent": "intenção de composição/layout em 1 frase",
    "motion_intent": "intenção de motion em 1 frase"
  },
  "rationale": "2-4 frases explicando PORQUÊ esta direção serve este briefing. Tom de diretor criativo.",
  "shortlists": {
    "palettes": [
      { "name": "nome", "vars": "--bg:#hex;--fg:#hex;--accent:#hex;--muted:#hex", "why": "porque encaixa" },
      ... 3 total
    ],
    "fonts": [
      { "pair": "Heading Font + Body Font (ambas Google Fonts)", "why": "porque encaixa" },
      ... 3 total
    ],
    "layouts": [
      { "name": "Editorial Magazine / Swiss Grid / Broken Brutalist / Bento Modular / Vertical Storytelling / Asymmetric Editorial / Minimalist Awwwards / Card Stack Y2K / outro", "why": "porque encaixa" },
      ... 3 total
    ],
    "heroes": [
      { "name": "Cinematic Fullscreen / Editorial Split / Bento Hero / Minimal Statement / Magazine Cover / Dark Spotlight / Diagonal Split / Marquee Type / Asymmetric Stack / Glassmorphism Layered / outro", "why": "porque encaixa" },
      ... 3 total
    ]
  }
}`;

// Fallback presets — só se o JSON do director vier malformado
const FALLBACK_PALETTES: BriefPalette[] = [
  { name: "Paper & Ink", vars: "--bg:#f5f3ee;--fg:#0d0d0d;--accent:#c44d2d;--muted:#e8e4dd", why: "neutro editorial seguro" },
  { name: "Midnight Indigo", vars: "--bg:#0a0a1a;--fg:#fafbfc;--accent:#6366f1;--muted:#141432", why: "dark moderno seguro" },
  { name: "Cream & Terracotta", vars: "--bg:#faf6f1;--fg:#2d1810;--accent:#c4654a;--muted:#f0e8de", why: "warm neutral seguro" },
];
const FALLBACK_FONTS: BriefFont[] = [
  { pair: "Fraunces + Inter", why: "serif moderno + sans neutro" },
  { pair: "Instrument Serif + DM Sans", why: "editorial elegante" },
  { pair: "Space Grotesk + IBM Plex Sans", why: "tech moderno" },
];
const FALLBACK_LAYOUTS: BriefLayout[] = [
  { name: "Editorial Magazine", why: "fallback editorial" },
  { name: "Minimalist Awwwards", why: "fallback minimal premium" },
  { name: "Bento Modular", why: "fallback estruturado" },
];
const FALLBACK_HEROES: BriefHero[] = [
  { name: "Editorial Split 60/40", why: "fallback elegante" },
  { name: "Minimal Statement", why: "fallback minimal" },
  { name: "Cinematic Fullscreen", why: "fallback impacto" },
];

function fallbackBrief(prompt: string): CreativeBrief {
  return {
    interpretation: {
      niche: "general",
      emotional_core: "confident + modern + clear",
      positioning: "premium modern",
      audience: "general professional audience",
      brand_voice: "clear, confident, modern",
    },
    direction: {
      typography_intent: "Serif moderno para headlines, sans neutro para body",
      spacing_intent: "Generous breathing room, py-20 md:py-32",
      palette_intent: "Neutros equilibrados com 1 accent decisivo",
      composition_intent: "Editorial com hierarquia clara e variação por secção",
      motion_intent: "Reveals subtis e refinados",
    },
    rationale: `Sem briefing rico disponível ("${prompt.slice(0, 80)}..."), aplico uma direção premium neutra que serve a maioria dos casos sem comprometer a coerência.`,
    shortlists: {
      palettes: FALLBACK_PALETTES,
      fonts: FALLBACK_FONTS,
      layouts: FALLBACK_LAYOUTS,
      heroes: FALLBACK_HEROES,
    },
  };
}

function tryParseJSON(raw: string): unknown | null {
  if (!raw) return null;
  let s = raw.trim();
  s = s.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
  // Try direct
  try { return JSON.parse(s); } catch { /* continue */ }
  // Try to extract first { ... } block
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try { return JSON.parse(s.slice(start, end + 1)); } catch { /* ignore */ }
  }
  return null;
}

function validate(b: unknown): b is CreativeBrief {
  if (!b || typeof b !== "object") return false;
  const x = b as Record<string, unknown>;
  if (!x.interpretation || !x.direction || !x.shortlists) return false;
  const sl = x.shortlists as Record<string, unknown>;
  const arrs = [sl.palettes, sl.fonts, sl.layouts, sl.heroes];
  return arrs.every((a) => Array.isArray(a) && a.length >= 1);
}

/**
 * Executa o Creative Director. Devolve sempre um brief válido (fallback se falhar).
 */
export async function runCreativeDirector(
  prompt: string,
  websiteName: string,
  niche_hint: string,
): Promise<CreativeBrief> {
  const userMsg = `BRIEFING DO CLIENTE:
"""
${prompt}
"""
Nome do site: ${websiteName || "(não fornecido)"}
Pista de nicho (heurística — podes corrigir): ${niche_hint}

Devolve o Creative Brief em JSON conforme o schema.`;

  try {
    const ai = await callAI({
      messages: [
        { role: "system", content: DIRECTOR_SYSTEM },
        { role: "user", content: userMsg },
      ],
      temperature: 0.7,
      geminiModel: "gemini-2.5-flash",
    });

    const parsed = tryParseJSON(ai.content || "");
    if (validate(parsed)) {
      console.log("[Creative Director] Brief OK:", {
        niche: (parsed as CreativeBrief).interpretation.niche,
        emotion: (parsed as CreativeBrief).interpretation.emotional_core,
      });
      return parsed as CreativeBrief;
    }
    console.warn("[Creative Director] JSON inválido, a usar fallback. Raw:", (ai.content || "").slice(0, 200));
  } catch (e) {
    console.warn("[Creative Director] Erro:", String(e));
  }

  return fallbackBrief(prompt);
}
