// KINJANI CREATIVE INTELLIGENCE ENGINE v3.0
// Filosofia Lovable: a IA raciocina sobre QUALQUER pedido antes de gerar.
// Não há templates. O motor cria um scaffold de raciocínio para a IA preencher.

export interface CreativeAnalysis {
  niche: string;
  emotionalDirection: string;
  brandPositioning: string;
  visualLanguage: string;
  hierarchyStyle: string;
  audience: string;
  layoutStrategy: string;
  typographyDirection: string;
  spacingRhythm: string;
  visualStorytelling: string;
  colorPsychology: string;
  interactionStyle: string;
}

export interface VisualComposition {
  heroStyle: string;
  sectionRhythm: string[];
  layoutApproach: string;
  visualPacing: string;
  asymmetryLevel: string;
  cinematicElements: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// FASE 1: ANÁLISE CONTEXTUAL MÍNIMA
// Fornece pistas à IA — ela decide o resto
// ═══════════════════════════════════════════════════════════════════════════════

export function analyzeCreativeDirection(prompt: string): CreativeAnalysis {
  const lower = prompt.toLowerCase();

  // Analisa pistas explícitas no prompt para dar contexto à IA
  // A IA vai completar e refinar tudo isto durante o raciocínio

  // Pistas de estilo visual
  const isDark    = lower.match(/dark|escuro|noturno|preto|black|neon|cyberpunk/);
  const isMinimal = lower.match(/minimal|simples|clean|espaço branco|whitespace|elegante/);
  const isBold    = lower.match(/ousado|bold|impacto|forte|vibrante|colorido|neon/);
  const isWarm    = lower.match(/quente|aconchegante|artesanal|familiar|vintage|orgânico/);
  const isLuxury  = lower.match(/luxo|premium|exclusiv|dourado|gold|sofisticado/);
  const isEnergy  = lower.match(/energia|dinâmico|rápido|intenso|fitness|sport|esporte/);
  const isCalm    = lower.match(/calmo|sereno|zen|paz|suave|delicado|spa|natureza/);
  const isFun     = lower.match(/divertido|alegre|colorido|jovem|kids|animado|criança/);

  let niche = 'custom';
  let emotionalDirection = 'professional + trustworthy + modern';
  let brandPositioning = 'approachable premium';
  let visualLanguage = 'clean + modern + structured';
  let audience = 'broad audience';
  let colorPsychology = 'derived from emotional direction';
  let typographyDirection = 'Plus Jakarta Sans (display) + Inter (body)';
  let spacingRhythm = 'py-20 md:py-32 | balanced rhythm';

  if (isLuxury) {
    niche = 'luxury';
    emotionalDirection = 'exclusivity + sophistication + timeless desire';
    brandPositioning = 'ultra-premium';
    visualLanguage = 'minimal + dark or white + editorial + oversized type';
    colorPsychology = 'black + gold + cream | exclusivity + prestige';
    typographyDirection = 'Cormorant Garamond (display) + Montserrat (body)';
    spacingRhythm = 'py-32 md:py-48 | extreme breathing room';
  } else if (isDark && isBold) {
    niche = 'bold-dark';
    emotionalDirection = 'power + boldness + impact + intensity';
    brandPositioning = 'disruptive premium';
    visualLanguage = 'dark + high-contrast + bold + experimental';
    colorPsychology = 'dark + electric accent + white | power + impact';
    typographyDirection = 'Bai Jamjuree (display) + Inter (body)';
    spacingRhythm = 'py-16 md:py-24 | energetic tight rhythm';
  } else if (isCalm || isMinimal) {
    niche = 'serene';
    emotionalDirection = 'serenity + clarity + elegance + trust';
    brandPositioning = 'refined minimalism';
    visualLanguage = 'minimal + spacious + clean + editorial';
    colorPsychology = 'soft palette + white + single accent | clarity + calm';
    typographyDirection = 'Playfair Display (display) + Inter (body)';
    spacingRhythm = 'py-24 md:py-40 | generous calm rhythm';
  } else if (isWarm) {
    niche = 'artisan';
    emotionalDirection = 'warmth + authenticity + craft + nostalgia';
    brandPositioning = 'artisan quality';
    visualLanguage = 'warm + earthy + editorial + handcrafted';
    colorPsychology = 'earth tones + cream + warm brown | authenticity + warmth';
    typographyDirection = 'Playfair Display (display) + Lato (body)';
    spacingRhythm = 'py-20 md:py-28 | warm inviting rhythm';
  } else if (isEnergy) {
    niche = 'energetic';
    emotionalDirection = 'energy + power + motivation + transformation';
    brandPositioning = 'high-performance';
    visualLanguage = 'dark + bold + kinetic + high-contrast';
    colorPsychology = 'black + electric yellow/orange + white | energy + power';
    typographyDirection = 'Bai Jamjuree (display) + Inter (body)';
    spacingRhythm = 'py-16 md:py-24 | fast dynamic rhythm';
  } else if (isFun) {
    niche = 'playful';
    emotionalDirection = 'joy + energy + friendliness + vibrancy';
    brandPositioning = 'approachable and memorable';
    visualLanguage = 'colorful + playful + dynamic + warm';
    colorPsychology = 'vibrant multi-color + white | joy + friendliness';
    typographyDirection = 'Nunito (display) + Inter (body)';
    spacingRhythm = 'py-20 md:py-28 | warm engaging rhythm';
  } else if (isBold) {
    niche = 'bold-creative';
    emotionalDirection = 'boldness + creativity + artistic + identity';
    brandPositioning = 'avant-garde';
    visualLanguage = 'editorial + asymmetric + bold + artistic';
    colorPsychology = 'bold single color + black + white | identity + expression';
    typographyDirection = 'Sora (display) + DM Sans (body)';
    spacingRhythm = 'py-20 md:py-32 | editorial rhythm';
  }

  return {
    niche,
    emotionalDirection,
    brandPositioning,
    visualLanguage,
    hierarchyStyle: deriveHierarchy(emotionalDirection),
    audience,
    layoutStrategy: deriveLayout(emotionalDirection),
    typographyDirection,
    spacingRhythm,
    visualStorytelling: deriveStorytelling(emotionalDirection),
    colorPsychology,
    interactionStyle: deriveInteractions(emotionalDirection),
  };
}

function deriveHierarchy(emotion: string): string {
  if (emotion.includes('exclusivity') || emotion.includes('luxury'))
    return 'oversized typography + extreme whitespace + minimal curated elements';
  if (emotion.includes('power') || emotion.includes('bold') || emotion.includes('energy'))
    return 'oversized impact headlines + tight rhythm + bold sections';
  if (emotion.includes('serenity') || emotion.includes('calm') || emotion.includes('care'))
    return 'spacious sections + human-centered + calming progression';
  if (emotion.includes('authority') || emotion.includes('trust') || emotion.includes('professional'))
    return 'structured sections + trust-building + clear professional hierarchy';
  return 'balanced modern hierarchy + clear sections + contemporary flow';
}

function deriveLayout(emotion: string): string {
  if (emotion.includes('cinematic') || emotion.includes('immersive'))
    return 'full-bleed sections + layered overlays + cinematic pacing';
  if (emotion.includes('exclusivity') || emotion.includes('minimal'))
    return 'generous whitespace + centered editorial + minimal elements';
  if (emotion.includes('bold') || emotion.includes('artistic'))
    return 'broken grids + asymmetric + overlapping elements + artistic freedom';
  if (emotion.includes('energy') || emotion.includes('power'))
    return 'dynamic diagonal layouts + bold sections + kinetic grids';
  return 'modern bento grids + asymmetric sections + dynamic spacing';
}

function deriveStorytelling(emotion: string): string {
  if (emotion.includes('exclusivity') || emotion.includes('luxury'))
    return 'desire cultivation + heritage + exclusivity signals + understated CTA';
  if (emotion.includes('trust') || emotion.includes('authority'))
    return 'problem → solution narrative + proof points + trust journey';
  if (emotion.includes('sensory') || emotion.includes('warmth'))
    return 'sensory-first + experience building + desire creation + inviting CTA';
  if (emotion.includes('energy') || emotion.includes('transformation'))
    return 'challenge → transformation + results + motivation + action CTA';
  return 'value proposition + features + social proof + conversion';
}

function deriveInteractions(emotion: string): string {
  if (emotion.includes('exclusivity') || emotion.includes('luxury'))
    return 'ultra-subtle hover lifts + elegant transitions (800ms) + minimal motion';
  if (emotion.includes('energy') || emotion.includes('power'))
    return 'strong hover effects + fast transitions (200ms) + kinetic motion';
  if (emotion.includes('serenity') || emotion.includes('calm'))
    return 'gentle hover effects + smooth transitions (600ms) + calming reveals';
  if (emotion.includes('joy') || emotion.includes('playful'))
    return 'bouncy hover effects + cheerful transitions + delightful micro-animations';
  return 'modern hover effects + smooth transitions (300ms) + professional motion';
}

// ═══════════════════════════════════════════════════════════════════════════════
// FASE 2: COMPOSIÇÃO (simplificada — a IA decide os detalhes)
// ═══════════════════════════════════════════════════════════════════════════════

export function composeVisualStructure(analysis: CreativeAnalysis): VisualComposition {
  const { emotionalDirection, visualLanguage } = analysis;

  let heroStyle = 'cinematic-fullscreen';
  if (visualLanguage.includes('minimal'))   heroStyle = 'minimal-centered';
  if (visualLanguage.includes('editorial')) heroStyle = 'editorial-split';
  if (visualLanguage.includes('dark'))      heroStyle = 'dark-immersive';
  if (visualLanguage.includes('warm'))      heroStyle = 'warm-editorial';
  if (visualLanguage.includes('colorful'))  heroStyle = 'colorful-dynamic';
  if (visualLanguage.includes('bold'))      heroStyle = 'bold-asymmetric';

  let visualPacing = 'balanced';
  if (emotionalDirection.includes('luxury') || emotionalDirection.includes('exclusivity')) visualPacing = 'ultra-slow-elegant';
  if (emotionalDirection.includes('energy') || emotionalDirection.includes('power'))       visualPacing = 'fast-dynamic';
  if (emotionalDirection.includes('calm') || emotionalDirection.includes('serenity'))      visualPacing = 'slow-calm';

  let asymmetryLevel = 'moderate';
  if (visualLanguage.includes('editorial') || visualLanguage.includes('bold'))       asymmetryLevel = 'high';
  if (visualLanguage.includes('minimal') || visualLanguage.includes('structured'))   asymmetryLevel = 'low';

  const cinematicElements = buildCinematicElements(emotionalDirection);
  const sectionRhythm = ['hero', 'features', 'about', 'social-proof', 'cta', 'footer'];

  return {
    heroStyle,
    sectionRhythm,
    layoutApproach: analysis.layoutStrategy,
    visualPacing,
    asymmetryLevel,
    cinematicElements,
  };
}

function buildCinematicElements(emotion: string): string[] {
  const base = ['intersection-observer-reveals', 'hover-lift-effects', 'stagger-animations'];
  if (emotion.includes('cinematic') || emotion.includes('immersive'))
    return [...base, 'ken-burns-zoom', 'parallax-layers', 'fade-sequences'];
  if (emotion.includes('bold') || emotion.includes('energy'))
    return [...base, 'bold-color-blocks', 'kinetic-elements', 'fast-reveals'];
  if (emotion.includes('luxury') || emotion.includes('minimal'))
    return [...base, 'subtle-fades', 'elegant-transitions', 'refined-reveals'];
  if (emotion.includes('joy') || emotion.includes('playful'))
    return [...base, 'bounce-effects', 'stagger-pop', 'colorful-transitions'];
  return base;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FASE 3: PROMPT DE RACIOCÍNIO — O CORAÇÃO DO SISTEMA
// Cria um scaffold que a IA deve preencher com o seu próprio raciocínio
// Isto é o que torna o sistema como o Lovable
// ═══════════════════════════════════════════════════════════════════════════════

export function generateCreativePrompt(
  analysis: CreativeAnalysis,
  composition: VisualComposition,
  userPrompt: string,
  websiteName: string
): string {
  return `
═══════════════════════════════════════════════════════════════════════════════
🧠 KINJANI OPEN BUILDER — RACIOCÍNIO CRIATIVO ANTES DE GERAR
═══════════════════════════════════════════════════════════════════════════════

PEDIDO DO UTILIZADOR:
"${userPrompt}"

NOME DO PROJETO: ${websiteName || 'Website Premium'}

───────────────────────────────────────────────────────────────────────────────
CONTEXTO ANALISADO (pistas — tu completas e refinas):
  Estilo visual detetado: ${analysis.visualLanguage}
  Direção emocional base: ${analysis.emotionalDirection}
  Posicionamento: ${analysis.brandPositioning}
  Paleta sugerida: ${analysis.colorPsychology}
  Tipografia base: ${analysis.typographyDirection}
───────────────────────────────────────────────────────────────────────────────

AGORA, COMO DIRETOR CRIATIVO, RACIOCINA:

## 🏢 1. QUE NEGÓCIO/PROJETO É ESTE?
[Analisa o pedido. Que tipo de negócio? Que serviços/produtos? Que mercado?
 O que é que este negócio faz de especial? Que nome e identidade lhe darias?]

## 👤 2. QUEM SÃO OS CLIENTES?
[Quem vai visitar este site? Que idade, estilo de vida, necessidades?
 O que os leva a escolher este negócio? O que temem? O que desejam?]

## 💭 3. QUE EMOÇÃO QUERO CRIAR?
[Que emoção deve o visitante sentir quando abre o site?
 Confiança? Desejo? Energia? Serenidade? Admiração? Apetite?
 Como traduzo essa emoção em decisões visuais concretas?]

## 🎨 4. DECISÕES DE DESIGN
### Paleta de Cores:
[Define as cores exatas com HEX ou HSL. Porquê estas cores? O que comunicam?]

### Tipografia:
[Que fontes escolhes? Display + body. Tamanhos? Pesos? Porquê?]

### Estilo Visual Geral:
[Dark mode ou light? Minimalista ou rico? Editorial ou clean?
 Que estilo de hero? Que tipo de layouts para as secções?]

## 📋 5. ARQUITECTURA DO SITE
[Lista as secções que este negócio específico precisa, por ordem narrativa.
 Cada secção deve ter um propósito claro. O que uma agência de €15k faria?]

## ✍️ 6. POSICIONAMENTO E COPY
[Que mensagem principal? Como se diferencia? Que tom de voz?
 Qual o headline do hero? Qual o CTA principal?]

═══════════════════════════════════════════════════════════════════════════════
💻 AGORA GERA O HTML COMPLETO
═══════════════════════════════════════════════════════════════════════════════

Com base no teu raciocínio acima, gera o HTML/CSS completo.

REQUISITOS TÉCNICOS OBRIGATÓRIOS:
1. Navbar fixed + backdrop-blur + mobile menu funcional
2. Hero min-height: 100vh com headline + CTA
3. Mínimo 6 secções relevantes a ESTE negócio
4. CSS variables para toda a paleta de cores
5. 2 Google Fonts (import no head)
6. IntersectionObserver para scroll reveals em TODAS as secções
7. Hover effects em todos os elementos interativos
8. Imagens via Unsplash (keywords em inglês, relevantes ao negócio)
9. Copy real em Português (PT-PT) — NUNCA Lorem Ipsum
10. Footer completo com links e copyright ${new Date().getFullYear()}
11. Totalmente responsive (mobile-first)
12. Animações: Ken Burns no hero, stagger em listas, fade-up em secções

PACING VISUAL: ${composition.visualPacing}
NÍVEL DE ASSIMETRIA: ${composition.asymmetryLevel}
ELEMENTOS CINEMATOGRÁFICOS: ${composition.cinematicElements.join(', ')}

Devolve APENAS o HTML. Sem markdown, sem explicações.
O documento começa em <!DOCTYPE html> e termina em </html>.
`;
}
