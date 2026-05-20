/**
 * IntentCopy — turns Intent into real semantic copy and image queries.
 * Stops the placeholder "establish presence — for discerning buyers" output.
 */
import type { Intent, EnergyProfile, BeatKind } from "./types";

export interface CopyContext {
  intent: Intent;
  energy: EnergyProfile;
  rand: () => number;
}

/* ---------------- semantic vocabulary by domain ---------------- */

interface DomainVoice {
  nouns: string[];
  verbs: string[];
  promises: string[];
  proofWords: string[];
  ctaWords: string[];
  imageQueries: string[];
}

const DOMAIN_VOICE: Record<string, DomainVoice> = {
  tourism: {
    nouns: ["coastline", "horizon", "journey", "island", "dawn", "lodge", "wilderness", "ocean", "savannah"],
    verbs: ["wander", "drift", "arrive", "discover", "breathe", "unplug"],
    promises: [
      "Travel that leaves a mark, not a footprint.",
      "Designed slowly. Lived in once.",
      "Where the map ends, the story begins.",
    ],
    proofWords: ["12 private camps", "guided by locals", "carbon-positive stays", "since 2014"],
    ctaWords: ["Plan your journey", "Talk to a guide", "Reserve the experience"],
    imageQueries: ["luxury safari lodge", "tropical coastline aerial", "remote beach sunrise", "infinity pool ocean", "boat lagoon", "wild horizon landscape"],
  },
  finance: {
    nouns: ["capital", "wealth", "portfolio", "markets", "yield", "trust"],
    verbs: ["compound", "allocate", "protect", "grow", "deploy"],
    promises: ["Built for people who measure outcomes in decades.", "Quiet power for serious capital."],
    proofWords: ["$2.4B routed", "27 currencies", "ISO 27001", "0.03% spread"],
    ctaWords: ["Open an account", "Talk to a banker", "Start allocating"],
    imageQueries: ["modern finance interior", "skyline night", "marble desk", "private banking"],
  },
  fashion: {
    nouns: ["silhouette", "season", "atelier", "fabric", "form", "muse"],
    verbs: ["cut", "drape", "tailor", "compose", "reveal"],
    promises: ["Made slowly, worn forever.", "Cut in Lisbon. Finished by hand."],
    proofWords: ["F/W 26 lookbook", "5 ateliers", "made-to-measure", "limited series"],
    ctaWords: ["See the collection", "Book a fitting", "Request the lookbook"],
    imageQueries: ["editorial fashion", "atelier", "runway shadow", "linen detail"],
  },
  food: {
    nouns: ["plate", "fire", "season", "kitchen", "menu", "guest"],
    verbs: ["cook", "season", "serve", "ferment", "char"],
    promises: ["A small room. A long fire. One table at a time.", "Born from market mornings."],
    proofWords: ["8 seats", "tasting 11 courses", "Michelin-listed", "open kitchen"],
    ctaWords: ["Reserve a table", "See the menu", "Book the chef's counter"],
    imageQueries: ["restaurant interior moody", "chef plating", "smoke fire kitchen", "dining table"],
  },
  saas: {
    nouns: ["workflow", "team", "data", "ship velocity", "system"],
    verbs: ["ship", "deploy", "automate", "orchestrate", "scale"],
    promises: ["Built for teams that ship on Monday.", "One control plane. Every environment."],
    proofWords: ["12,400 teams", "99.99% uptime", "SOC2", "p99 < 80ms"],
    ctaWords: ["Start free", "Book a demo", "Open the docs"],
    imageQueries: ["dashboard ui dark", "team office laptops", "data abstract", "control room"],
  },
  agency: {
    nouns: ["brand", "system", "story", "interface", "campaign"],
    verbs: ["design", "shape", "launch", "rethink", "compose"],
    promises: ["A small studio. Big swings.", "We build the thing your competitors will copy in two years."],
    proofWords: ["62 launches", "5 D&AD pencils", "Awwwards SOTD x9"],
    ctaWords: ["Start a project", "See the work", "Write to us"],
    imageQueries: ["design studio workspace", "creative process desk", "type specimen", "moodboard"],
  },
  health: {
    nouns: ["body", "breath", "ritual", "care", "rhythm"],
    verbs: ["heal", "restore", "tune", "soften", "return"],
    promises: ["Modern medicine, slow as it should be.", "Quietly precise care."],
    proofWords: ["14 specialists", "in-house diagnostics", "open 6am–10pm"],
    ctaWords: ["Book a session", "Meet the team", "Plan your visit"],
    imageQueries: ["serene spa light", "hands wellness", "plants therapy room", "white architecture"],
  },
  dental: {
    nouns: ["smile", "confidence", "detail", "precision", "care", "result", "transformation"],
    verbs: ["transform", "restore", "design", "reveal", "refine", "rebuild"],
    promises: [
      "Smiles designed, not just treated.",
      "Precision dentistry, quietly perfected.",
      "The smile you'd choose, made permanent.",
    ],
    proofWords: ["1,200+ smiles restored", "in-house ceramist", "digital scan in 4 min", "10-year guarantee"],
    ctaWords: ["Book a consultation", "Plan your smile", "Talk to a specialist"],
    imageQueries: ["dental clinic interior", "modern dentist chair", "smile portrait close up", "dental ceramic detail", "minimal medical interior", "calm portrait warm light"],
  },
  beauty: {
    nouns: ["skin", "ritual", "glow", "form", "tone", "result"],
    verbs: ["refine", "renew", "sculpt", "soften", "reveal"],
    promises: ["Treatments that age with you, not against you.", "Quiet beauty, made on purpose."],
    proofWords: ["medical-grade only", "12 protocols", "consultations 60 min"],
    ctaWords: ["Book a consultation", "Plan your protocol", "Meet your specialist"],
    imageQueries: ["minimal spa interior", "skincare close up", "calm portrait soft light", "marble bath warm"],
  },
  realestate: {
    nouns: ["address", "view", "estate", "residence", "neighborhood"],
    verbs: ["live", "settle", "acquire", "discover", "tour"],
    promises: ["Six addresses. None of them obvious.", "Homes shaped by where they stand."],
    proofWords: ["EUR 12M sold YTD", "private viewings", "off-market access"],
    ctaWords: ["Request a viewing", "See the portfolio", "Talk to an advisor"],
    imageQueries: ["luxury architecture villa", "ocean view terrace", "interior minimal home", "marble bath"],
  },
  events: {
    nouns: ["night", "stage", "city", "lineup", "moment"],
    verbs: ["gather", "perform", "burn", "remember"],
    promises: ["Two nights. One city. No second chances.", "Built for those who travel for sound."],
    proofWords: ["18 acts", "3 stages", "limited 4,000 capacity"],
    ctaWords: ["Get tickets", "See the lineup", "Reserve your weekend"],
    imageQueries: ["concert crowd lights", "stage haze festival", "night city neon"],
  },
  portfolio: {
    nouns: ["work", "process", "obsession", "case", "year"],
    verbs: ["make", "draft", "ship", "iterate"],
    promises: ["Twelve years. Four hundred shipped things.", "Independent. Selective. Hands-on."],
    proofWords: ["Selected work 2018–2026", "12 industries", "founder-led"],
    ctaWords: ["See selected work", "Write to me", "Available Q3 2026"],
    imageQueries: ["designer portrait studio", "object photography", "workshop hands", "type close up"],
  },
  ecommerce: {
    nouns: ["object", "edition", "release", "drop", "shelf"],
    verbs: ["wear", "carry", "use", "own"],
    promises: ["Small drops. Big care.", "Made in batches of forty."],
    proofWords: ["Free returns 60d", "carbon neutral shipping", "lifetime repair"],
    ctaWords: ["Shop the drop", "Add to bag", "See the lookbook"],
    imageQueries: ["product photography matte", "still life ceramic", "atelier shelf"],
  },
  general: {
    nouns: ["idea", "form", "system", "experience"],
    verbs: ["build", "shape", "launch"],
    promises: ["Built carefully. Launched on purpose."],
    proofWords: ["since 2019", "global", "small team"],
    ctaWords: ["Get in touch", "Learn more", "Start now"],
    imageQueries: ["abstract architecture", "minimal still life", "warm light interior"],
  },
};

/* ---------------- emotion-tinted overlays ---------------- */

const EMOTION_TINT: Record<string, string> = {
  bold: "Loud where it matters. Silent where it doesn't.",
  serene: "An experience designed to slow you down.",
  luxurious: "Discretion is the new luxury.",
  experimental: "We don't ship safe.",
  playful: "Serious work, not serious tone.",
  trustworthy: "Built on twenty years of getting it right.",
  considered: "Every detail decided. Nothing left to default.",
};

/* ---------------- headline factories by beat ---------------- */

export function makeHeadline(kind: BeatKind, ctx: CopyContext): string {
  const v = DOMAIN_VOICE[ctx.intent.domain] ?? DOMAIN_VOICE.general;
  const noun = pick(v.nouns, ctx.rand);
  const verb = pick(v.verbs, ctx.rand);
  const promise = pick(v.promises, ctx.rand);
  const loc = ctx.intent.location;

  switch (kind) {
    case "opening-statement":
      return loc
        ? capitalize(`${verb} ${loc}, properly.`)
        : capitalize(`${verb} ${noun}, properly.`);
    case "atmospheric-pause":
      return EMOTION_TINT[ctx.intent.emotion] ?? promise;
    case "proof-moment":
      return `The proof isn't a promise — it's ${pick(v.proofWords, ctx.rand)}.`;
    case "narrative-shift":
      return loc
        ? `Then everything about ${loc} changed.`
        : `Then everything about ${noun} changed.`;
    case "quiet-pause":
      return `${capitalize(loc ?? noun)}.`;
    case "revelation":
      return `This is how we ${verb}.`;
    case "tension-build":
      return `${capitalize(noun)} compounds. Patience does too.`;
    case "comparison":
      return `Two ways to ${verb} ${noun}. One of them ages well.`;
    case "evidence":
      return `What you actually get.`;
    case "voice-of-customer":
      return `"We stopped looking after we found them."`;
    case "decision-call":
      return pick(v.ctaWords, ctx.rand);
    case "departure":
      return promise;
  }
}

export function makeBody(kind: BeatKind, ctx: CopyContext): string {
  const v = DOMAIN_VOICE[ctx.intent.domain] ?? DOMAIN_VOICE.general;
  const promise = pick(v.promises, ctx.rand);
  const loc = ctx.intent.location;
  const audience = ctx.intent.audience;
  switch (kind) {
    case "opening-statement":
      return loc
        ? `${promise} A ${ctx.intent.emotion} experience in ${loc}, made for ${audience}.`
        : `${promise} A studio-built experience for ${audience}.`;
    case "atmospheric-pause":
      return `${pick(v.nouns, ctx.rand)}, ${pick(v.verbs, ctx.rand)}ed on purpose.`;
    case "proof-moment":
      return v.proofWords.slice(0, 3).join(" · ");
    case "narrative-shift":
      return promise;
    case "evidence":
      return `${pick(v.verbs, ctx.rand)} ${pick(v.nouns, ctx.rand)}. ${pick(v.verbs, ctx.rand)} ${pick(v.nouns, ctx.rand)}. No filler.`;
    case "voice-of-customer":
      return `— A traveller we hosted, two seasons in.`;
    case "decision-call":
      return `${promise} Talk to us.`;
    default:
      return promise;
  }
}

export function makeCtaLabel(ctx: CopyContext): string {
  const v = DOMAIN_VOICE[ctx.intent.domain] ?? DOMAIN_VOICE.general;
  return pick(v.ctaWords, ctx.rand);
}

export function makeFeatureCards(ctx: CopyContext, n = 4): Array<{ title: string; body: string }> {
  const v = DOMAIN_VOICE[ctx.intent.domain] ?? DOMAIN_VOICE.general;
  const titles = shuffle([...v.nouns], ctx.rand).slice(0, n);
  return titles.map((t) => ({
    title: capitalize(t),
    body: `${capitalize(pick(v.verbs, ctx.rand))} ${pick(v.nouns, ctx.rand)} — without the noise.`,
  }));
}

export function makeProofStats(ctx: CopyContext, n = 3): Array<{ value: string; label: string }> {
  const v = DOMAIN_VOICE[ctx.intent.domain] ?? DOMAIN_VOICE.general;
  return shuffle([...v.proofWords], ctx.rand).slice(0, n).map((w) => {
    const m = w.match(/^([^\s]+)\s+(.+)$/);
    return m ? { value: m[1], label: m[2] } : { value: w, label: "" };
  });
}

/* ---------------- image system ---------------- */

/**
 * Curated Unsplash photo IDs keyed by semantic query fragments.
 * Each query maps to multiple real photo IDs so the same query can rotate.
 * Unsplash direct image URLs are stable and free for hotlinking.
 */
const PHOTO_LIBRARY: Array<{ match: RegExp; ids: string[] }> = [
  // dental / smile
  { match: /dental|dentist|smile|ceramic|teeth/i, ids: [
    "1606811971618-4486d14f3f99", "1588776814546-1ffcf47267a5", "1609840114035-3c981b782dfe",
    "1571772996211-2f02c9727629", "1606811841689-23dfddce3e95", "1612277795421-9bc7706a4a34",
  ]},
  // medical / clinic interior
  { match: /clinic|medical|hospital|surgery|chair/i, ids: [
    "1519494026892-80bbd2d6fd0d", "1580281657527-47f249e8f4df", "1538108149393-fbbd81895907",
    "1631815589968-fdb09a223b1e",
  ]},
  // portrait / face close up
  { match: /portrait|face|close up/i, ids: [
    "1494790108377-be9c29b29330", "1438761681033-6461ffad8d80", "1531746020798-e6953c6e8e04",
    "1573497019940-1c28c88b4f3e",
  ]},
  // spa / wellness
  { match: /spa|wellness|therapy|massage/i, ids: [
    "1540555700478-4be289fbecef", "1544161515-4ab6ce6db874", "1600334129128-685c5582fd35",
  ]},
  // travel / coastline / tropical
  { match: /coastline|ocean|beach|tropical|island|lagoon|sunrise|lodge|safari|horizon/i, ids: [
    "1507525428034-b723cf961d3e", "1505228395891-9a51e7e86bf6", "1519046904884-53103b34b206",
    "1571896349842-33c89424de2d", "1469474968028-56623f02e42e", "1507525428034-b723cf961d3e",
    "1518684079-3c830dcef090",
  ]},
  // finance / skyline / marble
  { match: /skyline|marble|banking|finance|capital/i, ids: [
    "1486406146926-c627a92ad1ab", "1444653614773-995cb1ef9efa", "1551836022-d5d88e9218df",
  ]},
  // fashion / atelier / editorial
  { match: /fashion|atelier|runway|linen|editorial/i, ids: [
    "1539109136881-3be0616acf4b", "1490481651871-ab68de25d43d", "1558769132-cb1aea458c5e",
  ]},
  // restaurant / food / kitchen
  { match: /restaurant|kitchen|chef|dining|fire|plating/i, ids: [
    "1517248135467-4c7edcad34c4", "1414235077428-338989a2e8c0", "1466978913421-dad2ebd01d17",
  ]},
  // dashboard / saas / office
  { match: /dashboard|ui|control|office|laptop|data/i, ids: [
    "1551434678-e076c223a692", "1460925895917-afdab827c52f", "1518770660439-4636190af475",
  ]},
  // studio / design / workspace
  { match: /studio|workspace|moodboard|design|type specimen/i, ids: [
    "1561070791-2526d30994b8", "1497366216548-37526070297c", "1542435503-956c469947f6",
  ]},
  // architecture / villa / interior
  { match: /architecture|villa|interior|home|residence|terrace/i, ids: [
    "1600585154340-be6161a56a0c", "1512917774080-9991f1c4c750", "1564013799919-ab600027ffc6",
  ]},
  // event / concert / stage
  { match: /concert|stage|festival|crowd|neon|night/i, ids: [
    "1470229722913-7c0e2dbbafd3", "1429962714451-bb934ecdc4ec", "1501281668745-f7f57925c3b4",
  ]},
  // product / still life
  { match: /product|still life|ceramic|object|shelf/i, ids: [
    "1556905055-8f358a7a47b2", "1542291026-7eec264c27ff", "1523275335684-37898b6baf30",
  ]},
  // abstract / minimal default
  { match: /abstract|minimal|architecture|warm light|interior/i, ids: [
    "1517842645767-c639042777db", "1557682250-33bd709cbe85", "1497436072909-60f360e1d4b1",
  ]},
];

/** Real themed photo URL — falls back to a calm minimal image. */
export function imageUrl(query: string, seed: string, w = 1200, h = 800): string {
  const bucket = PHOTO_LIBRARY.find((b) => b.match.test(query));
  const ids = bucket?.ids ?? PHOTO_LIBRARY[PHOTO_LIBRARY.length - 1].ids;
  // Deterministic pick based on seed so the same beat keeps the same photo.
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  const id = ids[Math.abs(hash) % ids.length];
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
}

export function pickImageQuery(ctx: CopyContext): string {
  const v = DOMAIN_VOICE[ctx.intent.domain] ?? DOMAIN_VOICE.general;
  return pick(v.imageQueries, ctx.rand);
}

/* ---------------- utils ---------------- */

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}
function shuffle<T>(arr: T[], rand: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
