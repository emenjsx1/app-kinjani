import type { Intent } from "./types";

/**
 * Local heuristic intent interpreter. Does not call the network — gives the
 * planner a structured shape even before any AI call lands. Edge functions
 * can override this with a true semantic parse.
 */

const DOMAIN_HINTS: Record<string, string[]> = {
  tourism: ["tourism", "travel", "destination", "safari", "resort", "hotel", "lodge", "tour", "trip", "journey", "expedition", "getaway", "voyage", "hospitality"],
  finance: ["bank", "fintech", "invest", "trading", "wealth", "crypto", "loan"],
  fashion: ["fashion", "boutique", "atelier", "couture", "runway", "style"],
  food: ["restaurant", "menu", "cafe", "bistro", "kitchen", "chef", "bar"],
  saas: ["saas", "platform", "dashboard", "workspace", "api", "developer"],
  agency: ["agency", "studio", "creative", "branding", "advertising"],
  health: ["clinic", "wellness", "therapy", "medical", "doctor", "spa"],
  realestate: ["real estate", "property", "imobiliária", "luxury home"],
  events: ["event", "festival", "conference", "wedding", "summit"],
  portfolio: ["portfolio", "designer", "photographer", "artist", "writer"],
  ecommerce: ["shop", "store", "product", "ecommerce", "checkout"],
};

// Quick location detector — adds "place" awareness to copy without an LLM call.
const LOCATION_RE = /\b(?:in|to|across|from)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\b/;

const EMOTION_HINTS: Record<string, string[]> = {
  bold: ["bold", "loud", "powerful", "energetic", "kinetic"],
  serene: ["calm", "serene", "minimal", "quiet", "zen"],
  luxurious: ["luxury", "premium", "high-end", "exclusive", "elegant"],
  experimental: ["experimental", "weird", "broken", "avant"],
  playful: ["playful", "fun", "vibrant", "joyful", "young"],
  trustworthy: ["secure", "professional", "trust", "enterprise"],
};

function pickFirst(
  text: string,
  table: Record<string, string[]>,
  fallback: string,
): string {
  const t = text.toLowerCase();
  for (const [k, words] of Object.entries(table)) {
    if (words.some((w) => t.includes(w))) return k;
  }
  return fallback;
}

export function interpretIntent(prompt: string): Intent {
  const clean = prompt.trim();
  const domain = pickFirst(clean, DOMAIN_HINTS, "general");
  const emotion = pickFirst(clean, EMOTION_HINTS, "considered");

  // crude goal extraction
  const goal =
    /sell|convert|leads?|signup/i.test(clean) ? "convert visitors" :
    /portfolio|showcase|present/i.test(clean) ? "showcase work" :
    /inform|explain|teach/i.test(clean) ? "inform & educate" :
    "establish presence";

  const audience =
    /enterprise|b2b|business/i.test(clean) ? "decision-makers" :
    /young|gen ?z|teen/i.test(clean) ? "young creators" :
    /luxury|premium|exclusive/i.test(clean) ? "discerning buyers" :
    "curious visitors";

  const keywords = Array.from(
    new Set(
      clean
        .split(/[\s,.;:/!?()]+/)
        .filter((w) => w.length > 4)
        .map((w) => w.toLowerCase())
        .slice(0, 12),
    ),
  );

  return {
    prompt: clean,
    goal,
    audience,
    emotion,
    domain,
    references: [],
    keywords,
  };
}
