// Image resolver: replaces every <img> in generated HTML with REAL, working images.
// Strategy:
//   1) If PEXELS_API_KEY is set, search Pexels per <img> (keywords from alt/context).
//   2) Otherwise, fall back to a curated catalogue of verified Unsplash photo IDs
//      indexed by keyword/niche. NEVER lets AI-hallucinated photo IDs reach the page.

// ---- Curated catalogue (verified, working Unsplash photo IDs) ---------------
// Each entry is an Unsplash photo ID (the part after "photo-" in the URL).
const CATALOG: Record<string, string[]> = {
  barbershop: [
    "1503951914875-452162b0f3f1", "1599351431202-1e0f0137899a",
    "1521590832167-7bcbfaa6381f", "1622286342621-4bd786c2447c",
    "1585747860715-2ba37e788b70", "1517832606299-7ae9b720a186",
    "1593702275687-f8b402bf1fb5", "1605497788044-5a32c7078486",
  ],
  haircut: [
    "1503951914875-452162b0f3f1", "1599351431202-1e0f0137899a",
    "1622286342621-4bd786c2447c", "1605497788044-5a32c7078486",
  ],
  beard: [
    "1517832606299-7ae9b720a186", "1593702275687-f8b402bf1fb5",
    "1599351431202-1e0f0137899a",
  ],
  dental: [
    "1606811841689-23dfddce3e95", "1588776814546-1ffcf47267a5",
    "1609840114035-3c981b782dfe", "1629909613654-28e377c37b09",
    "1581585504278-3e8a4ffeeb2e",
  ],
  restaurant: [
    "1517248135467-4c7edcad34c4", "1414235077428-338989a2e8c0",
    "1555396273-367ea4eb4db5", "1559339352-11d035aa65de",
    "1546069901-ba9599a7e63c", "1565299624946-b28f40a0ae38",
  ],
  food: [
    "1546069901-ba9599a7e63c", "1565299624946-b28f40a0ae38",
    "1567620905732-2d1ec7ab7445", "1540189549336-e6e99c3679fe",
  ],
  cafe: [
    "1554118811-1e0d58224f24", "1501339847302-ac426a4a7cbb",
    "1521017432531-fbd92d768814",
  ],
  saas: [
    "1551434678-e076c223a692", "1460925895917-afdab827c52f",
    "1498050108023-c5249f4df085", "1551288049-bebda4e38f71",
    "1556761175-5973dc0f32e7",
  ],
  technology: [
    "1518770660439-4636190af475", "1531297484001-80022131f5a1",
    "1550745165-9bc0b252726f", "1518709268805-4e9042af2176",
  ],
  portfolio: [
    "1494790108377-be9c29b29330", "1507003211169-0a1dd7228f2d",
    "1438761681033-6461ffad8d80", "1472099645785-5658abf4ff4e",
  ],
  team: [
    "1522071820081-009f0129c71c", "1521737604893-d14cc237f11d",
    "1542744173-8e7e53415bb0", "1551836022-d5d88e9218df",
  ],
  office: [
    "1497366216548-37526070297c", "1556761175-5973dc0f32e7",
    "1497366811353-6870744d04b2",
  ],
  health: [
    "1576091160399-112ba8d25d1d", "1559757148-5c350d0d3c56",
    "1505751172876-fa1923c5c528", "1631815589968-fdb09a223b1e",
  ],
  fitness: [
    "1571019613454-1cb2f99b2d8b", "1534438327276-14e5300c3a48",
    "1517836357463-d25dfeac3438", "1518611012118-696072aa579a",
  ],
  beauty: [
    "1487412947147-5cebf100ffc2", "1522337360788-8b13dee7a37e",
    "1560066984-138dadb4c035",
  ],
  fashion: [
    "1490481651871-ab68de25d43d", "1483985988355-763728e1935b",
    "1539109136881-3be0616acf4b",
  ],
  realestate: [
    "1560518883-ce09059eeffa", "1564013799919-ab600027ffc6",
    "1568605114967-8130f3a36994", "1512917774080-9991f1c4c750",
  ],
  travel: [
    "1488646953014-85cb44e25828", "1469854523086-cc02fe5d8800",
    "1502920917128-1aa500764cbd",
  ],
  nature: [
    "1441974231531-c6227db76b6e", "1470071459604-3b5ec3a7fe05",
    "1501785888041-af3ef285b470",
  ],
  workspace: [
    "1497366216548-37526070297c", "1499951360447-b19be8fe80f5",
    "1486312338219-ce68d2c6f44d",
  ],
  default: [
    "1497366216548-37526070297c", "1498050108023-c5249f4df085",
    "1486312338219-ce68d2c6f44d", "1518770660439-4636190af475",
    "1517048676732-d65bc937f952",
  ],
};

const KEYWORD_MAP: Array<[RegExp, string]> = [
  [/barbe|cabelo|corte|fade|tesoura|navalha/i, "barbershop"],
  [/barba|beard/i, "beard"],
  [/dent|ortodon|implante|sorriso|cl[ií]nica dental/i, "dental"],
  [/restaurante|menu|prato|chef|cozinha|food|comida|gastronom/i, "restaurant"],
  [/caf[eé]|coffee|brunch|pastel/i, "cafe"],
  [/saas|software|app|dashboard|platform/i, "saas"],
  [/tech|tecnologi|startup|c[oó]digo|developer/i, "technology"],
  [/portf[oó]lio|designer|fot[oó]graf|criativo|artista/i, "portfolio"],
  [/equipa|team|fundador|founder|sobre n[oó]s/i, "team"],
  [/escrit[oó]rio|office|workspace|coworking/i, "office"],
  [/sa[uú]de|cl[ií]nica|m[eé]dic|hospital|terapeut/i, "health"],
  [/fitness|gin[aá]sio|gym|treino|workout/i, "fitness"],
  [/beleza|beauty|sal[aã]o|spa|esteti/i, "beauty"],
  [/moda|fashion|roupa|boutique/i, "fashion"],
  [/im[oó]ve|real estate|casa|apartamento|propriedade/i, "realestate"],
  [/viagem|travel|turismo|hotel/i, "travel"],
  [/natureza|nature|paisagem|outdoor/i, "nature"],
];

function pickFromCatalog(keyword: string, idx: number): string {
  const key = (KEYWORD_MAP.find(([re]) => re.test(keyword))?.[1]) || "default";
  const pool = CATALOG[key] || CATALOG.default;
  const id = pool[idx % pool.length];
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;
}

function extractContext(imgTag: string, fullHtml: string, tagIndex: number): string {
  const alt = imgTag.match(/\salt=["']([^"']+)["']/i)?.[1] || "";
  const dataKw = imgTag.match(/\sdata-keywords?=["']([^"']+)["']/i)?.[1] || "";
  const start = Math.max(0, tagIndex - 200);
  const end = Math.min(fullHtml.length, tagIndex + imgTag.length + 100);
  const surrounding = fullHtml.slice(start, end).replace(/<[^>]+>/g, " ");
  return `${alt} ${dataKw} ${surrounding}`.trim();
}

async function pexelsSearch(query: string, apiKey: string): Promise<string | null> {
  try {
    const r = await fetch(
      `https://api.pexels.com/v1/search?per_page=5&query=${encodeURIComponent(query.slice(0, 80))}`,
      { headers: { Authorization: apiKey } }
    );
    if (!r.ok) return null;
    const data = await r.json();
    const photos = data?.photos as Array<{ src?: { large2x?: string; large?: string } }>;
    if (!photos?.length) return null;
    const pick = photos[Math.floor(Math.random() * photos.length)];
    return pick?.src?.large2x || pick?.src?.large || null;
  } catch {
    return null;
  }
}

export async function resolveImages(html: string, globalContext = ""): Promise<string> {
  if (!html) return html;
  const pexelsKey = Deno.env.get("PEXELS_API_KEY") || "";

  const imgRegex = /<img\b[^>]*>/gi;
  const matches: Array<{ tag: string; index: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = imgRegex.exec(html)) !== null) {
    matches.push({ tag: m[0], index: m.index });
  }

  const replacements: Array<[string, string]> = [];
  let idx = 0;
  for (const { tag, index } of matches) {
    const ctx = extractContext(tag, html, index);
    const query = `${ctx} ${globalContext}`.trim() || "modern lifestyle";
    let newSrc: string | null = null;
    if (pexelsKey) newSrc = await pexelsSearch(query, pexelsKey);
    if (!newSrc) newSrc = pickFromCatalog(query, idx);
    idx++;

    let updated = tag.replace(/\ssrc=["'][^"']*["']/i, ` src="${newSrc}"`);
    if (!/\ssrc=/i.test(updated)) {
      updated = updated.replace(/<img\b/i, `<img src="${newSrc}"`);
    }
    if (!/\sloading=/i.test(updated)) updated = updated.replace(/<img\b/i, `<img loading="lazy"`);
    if (!/\sdecoding=/i.test(updated)) updated = updated.replace(/<img\b/i, `<img decoding="async"`);
    if (!/\sreferrerpolicy=/i.test(updated))
      updated = updated.replace(/<img\b/i, `<img referrerpolicy="no-referrer"`);
    replacements.push([tag, updated]);
  }

  let out = html;
  for (const [oldTag, newTag] of replacements) {
    out = out.replace(oldTag, newTag);
  }

  out = out.replace(
    /https?:\/\/source\.unsplash\.com\/[^"')\s]+/gi,
    () => pickFromCatalog(globalContext, idx++)
  );
  const validIds = new Set<string>(Object.values(CATALOG).flat());
  out = out.replace(
    /https?:\/\/images\.unsplash\.com\/photo-([a-z0-9-]+)[^"')\s]*/gi,
    (full, id) => (validIds.has(id) ? full : pickFromCatalog(globalContext, idx++))
  );

  return out;
}
