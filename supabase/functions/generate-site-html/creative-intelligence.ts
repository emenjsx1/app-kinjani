// KINJANI CREATIVE INTELLIGENCE ENGINE
// Sistema de raciocínio criativo que pensa ANTES de gerar
// Comporta-se como Creative Director + Art Director + UX Architect

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

/**
 * FASE 1: ANÁLISE CRIATIVA PROFUNDA
 * O AI deve PENSAR antes de gerar, como um diretor criativo real
 */
export function analyzeCreativeDirection(prompt: string): CreativeAnalysis {
  const lower = prompt.toLowerCase();

  // Detecta nicho com contexto emocional
  let niche = 'general';
  let emotionalDirection = 'professional';
  let brandPositioning = 'modern';
  let visualLanguage = 'clean';
  let audience = 'general public';

  // DENTAL / HEALTHCARE
  if (lower.match(/dent[aá]ri[ao]|cl[ií]nica dental|ortodon|implante|branqueamento|sorriso/)) {
    niche = 'dental';
    emotionalDirection = 'trust + serenity + transformation';
    brandPositioning = 'premium healthcare';
    visualLanguage = 'clean + calm + elegant + medical precision';
    audience = 'health-conscious individuals seeking confidence';
  }

  // LUXURY / PREMIUM
  else if (lower.match(/luxo|premium|exclusiv|high-end|elite|sofisticad/)) {
    niche = 'luxury';
    emotionalDirection = 'exclusivity + sophistication + desire';
    brandPositioning = 'ultra-premium';
    visualLanguage = 'minimal + elegant + timeless + editorial';
    audience = 'affluent individuals seeking exceptional quality';
  }

  // CONSTRUCTION / ARCHITECTURE
  else if (lower.match(/constru[çc][ãa]o|engenharia|arquitetur|obra|edif[ií]cio/)) {
    niche = 'construction';
    emotionalDirection = 'strength + trust + precision';
    brandPositioning = 'corporate-premium';
    visualLanguage = 'structured + architectural + bold + professional';
    audience = 'business decision-makers seeking reliability';
  }

  // TOURISM / TRAVEL
  else if (lower.match(/turismo|viag|hotel|resort|destino|f[ée]rias/)) {
    niche = 'tourism';
    emotionalDirection = 'wanderlust + experience + emotion';
    brandPositioning = 'experiential';
    visualLanguage = 'immersive + cinematic + editorial + emotional';
    audience = 'experience-seekers wanting memorable journeys';
  }

  // LAW FIRM
  else if (lower.match(/advocacia|advogad|jur[ií]dic|direito|tribunal/)) {
    niche = 'law';
    emotionalDirection = 'authority + confidence + trust';
    brandPositioning = 'professional excellence';
    visualLanguage = 'elegant + structured + authoritative + premium';
    audience = 'individuals and businesses needing legal expertise';
  }

  // FASHION / CREATIVE
  else if (lower.match(/moda|fashion|roupa|est[ií]lo|design|criativ/)) {
    niche = 'fashion';
    emotionalDirection = 'bold + artistic + experimental';
    brandPositioning = 'avant-garde';
    visualLanguage = 'editorial + asymmetric + bold + artistic';
    audience = 'style-conscious individuals seeking uniqueness';
  }

  // RESTAURANT / FOOD
  else if (lower.match(/restaurante|comida|gastronom|chef|culin[aá]ria/)) {
    niche = 'restaurant';
    emotionalDirection = 'sensory + appetite + experience';
    brandPositioning = 'culinary excellence';
    visualLanguage = 'editorial + warm + immersive + sensorial';
    audience = 'food lovers seeking memorable dining';
  }

  // SAAS / TECH
  else if (lower.match(/saas|software|app|tech|startup|plataforma/)) {
    niche = 'saas';
    emotionalDirection = 'innovation + efficiency + future';
    brandPositioning = 'cutting-edge technology';
    visualLanguage = 'modern + clean + futuristic + systematic';
    audience = 'tech-savvy professionals seeking productivity';
  }

  // Determina estratégias baseadas no nicho
  const hierarchyStyle = determineHierarchyStyle(niche);
  const layoutStrategy = determineLayoutStrategy(niche, emotionalDirection);
  const typographyDirection = determineTypographyDirection(niche, brandPositioning);
  const spacingRhythm = determineSpacingRhythm(niche);
  const visualStorytelling = determineVisualStorytelling(niche, emotionalDirection);
  const colorPsychology = determineColorPsychology(niche, emotionalDirection);
  const interactionStyle = determineInteractionStyle(niche);

  return {
    niche,
    emotionalDirection,
    brandPositioning,
    visualLanguage,
    hierarchyStyle,
    audience,
    layoutStrategy,
    typographyDirection,
    spacingRhythm,
    visualStorytelling,
    colorPsychology,
    interactionStyle
  };
}

function determineHierarchyStyle(niche: string): string {
  const styles: Record<string, string> = {
    luxury: 'oversized typography + extreme whitespace + minimal elements',
    dental: 'clear medical hierarchy + trust-building structure + calm progression',
    construction: 'bold architectural hierarchy + strong grid system + corporate clarity',
    tourism: 'cinematic storytelling hierarchy + immersive layers + emotional flow',
    law: 'authoritative typography + structured sections + professional clarity',
    fashion: 'editorial asymmetry + bold type contrasts + artistic freedom',
    restaurant: 'sensory-first hierarchy + appetite-driven visuals + warm flow',
    saas: 'systematic clarity + feature-focused + modern efficiency',
    general: 'balanced hierarchy + clear sections + professional flow'
  };
  return styles[niche] || styles.general;
}

function determineLayoutStrategy(niche: string, emotion: string): string {
  if (emotion.includes('cinematic') || emotion.includes('immersive')) {
    return 'full-bleed sections + layered overlays + cinematic pacing + asymmetric grids';
  }
  if (emotion.includes('minimal') || emotion.includes('elegant')) {
    return 'generous whitespace + centered composition + minimal elements + editorial spacing';
  }
  if (emotion.includes('bold') || emotion.includes('experimental')) {
    return 'broken grids + asymmetric layouts + overlapping elements + artistic freedom';
  }
  if (emotion.includes('trust') || emotion.includes('professional')) {
    return 'structured grids + clear sections + balanced composition + professional spacing';
  }
  return 'modern bento grids + asymmetric sections + layered composition + dynamic spacing';
}

function determineTypographyDirection(niche: string, positioning: string): string {
  const directions: Record<string, string> = {
    luxury: 'Cormorant Garamond (display) + Montserrat (body) | oversized + ultra-light + extreme tracking',
    dental: 'Playfair Display (display) + Inter (body) | elegant + trustworthy + medical clarity',
    construction: 'Bai Jamjuree (display) + Inter (body) | bold + architectural + strong presence',
    tourism: 'Playfair Display (display) + Lato (body) | editorial + emotional + storytelling',
    law: 'Cormorant Garamond (display) + Inter (body) | authoritative + elegant + professional',
    fashion: 'Sora (display) + DM Sans (body) | bold + artistic + experimental',
    restaurant: 'Playfair Display (display) + Lato (body) | warm + inviting + sensorial',
    saas: 'Space Grotesk (display) + Inter (body) | modern + systematic + tech-forward',
    general: 'Plus Jakarta Sans (display) + Inter (body) | modern + clean + versatile'
  };
  return directions[niche] || directions.general;
}

function determineSpacingRhythm(niche: string): string {
  const rhythms: Record<string, string> = {
    luxury: 'py-32 md:py-48 | extreme breathing room + minimal density',
    dental: 'py-24 md:py-32 | calm rhythm + trust-building space',
    construction: 'py-20 md:py-32 | structured rhythm + professional spacing',
    tourism: 'py-24 md:py-40 | cinematic rhythm + immersive spacing',
    law: 'py-24 md:py-32 | authoritative rhythm + professional spacing',
    fashion: 'py-20 md:py-40 | editorial rhythm + artistic spacing',
    restaurant: 'py-20 md:py-32 | warm rhythm + inviting spacing',
    saas: 'py-20 md:py-32 | systematic rhythm + efficient spacing',
    general: 'py-20 md:py-32 | balanced rhythm + modern spacing'
  };
  return rhythms[niche] || rhythms.general;
}

function determineVisualStorytelling(niche: string, emotion: string): string {
  if (emotion.includes('cinematic') || emotion.includes('immersive')) {
    return 'hero as opening scene + sections as story chapters + emotional progression + climactic CTA';
  }
  if (emotion.includes('trust') || emotion.includes('confidence')) {
    return 'problem-solution narrative + proof points + testimonials + trust-building journey';
  }
  if (emotion.includes('sensory') || emotion.includes('experience')) {
    return 'sensory-first storytelling + appetite building + experience showcase + desire creation';
  }
  if (emotion.includes('bold') || emotion.includes('artistic')) {
    return 'visual-first narrative + artistic expression + bold statements + creative journey';
  }
  return 'clear value proposition + feature showcase + social proof + conversion path';
}

function determineColorPsychology(niche: string, emotion: string): string {
  const psychology: Record<string, string> = {
    luxury: 'black + gold + white | exclusivity + sophistication + timelessness',
    dental: 'teal + cyan + white | trust + cleanliness + medical precision',
    construction: 'navy + orange + gray | strength + energy + professionalism',
    tourism: 'blue + teal + warm accents | wanderlust + ocean + adventure',
    law: 'navy + gold + gray | authority + prestige + professionalism',
    fashion: 'black + vibrant accent + white | boldness + creativity + style',
    restaurant: 'warm orange + red + brown | appetite + warmth + comfort',
    saas: 'indigo + purple + cyan | innovation + technology + future',
    general: 'blue + teal + gray | trust + modernity + professionalism'
  };
  return psychology[niche] || psychology.general;
}

function determineInteractionStyle(niche: string): string {
  const styles: Record<string, string> = {
    luxury: 'subtle hover lifts + elegant transitions + minimal motion + refined interactions',
    dental: 'calm hover effects + trust-building animations + smooth reveals + gentle interactions',
    construction: 'strong hover effects + architectural transitions + bold interactions + professional motion',
    tourism: 'immersive hover effects + cinematic transitions + emotional reveals + engaging interactions',
    law: 'professional hover effects + authoritative transitions + structured interactions + refined motion',
    fashion: 'bold hover effects + artistic transitions + experimental interactions + creative motion',
    restaurant: 'appetizing hover effects + warm transitions + sensory interactions + inviting motion',
    saas: 'efficient hover effects + systematic transitions + modern interactions + tech-forward motion',
    general: 'modern hover effects + smooth transitions + professional interactions + balanced motion'
  };
  return styles[niche] || styles.general;
}

/**
 * FASE 2: COMPOSIÇÃO VISUAL
 * Decide a estrutura visual ANTES de gerar HTML
 */
export function composeVisualStructure(analysis: CreativeAnalysis): VisualComposition {
  const { niche, emotionalDirection, visualLanguage } = analysis;

  // Escolhe estilo de hero baseado na análise
  let heroStyle = 'cinematic-fullscreen';
  if (visualLanguage.includes('minimal')) heroStyle = 'minimal-centered';
  if (visualLanguage.includes('editorial')) heroStyle = 'editorial-split';
  if (visualLanguage.includes('immersive')) heroStyle = 'immersive-layered';
  if (visualLanguage.includes('bold')) heroStyle = 'bold-asymmetric';

  // Define ritmo de secções (cada site deve ser único)
  const sectionRhythm = generateUniqueSectionRhythm(niche, emotionalDirection);

  // Define abordagem de layout
  const layoutApproach = analysis.layoutStrategy;

  // Define pacing visual
  let visualPacing = 'balanced';
  if (emotionalDirection.includes('cinematic')) visualPacing = 'slow-immersive';
  if (emotionalDirection.includes('bold')) visualPacing = 'fast-dynamic';
  if (emotionalDirection.includes('calm')) visualPacing = 'slow-calm';

  // Define nível de assimetria
  let asymmetryLevel = 'moderate';
  if (visualLanguage.includes('editorial') || visualLanguage.includes('artistic')) asymmetryLevel = 'high';
  if (visualLanguage.includes('structured') || visualLanguage.includes('corporate')) asymmetryLevel = 'low';

  // Define elementos cinematográficos
  const cinematicElements = determineCinematicElements(niche, emotionalDirection);

  return {
    heroStyle,
    sectionRhythm,
    layoutApproach,
    visualPacing,
    asymmetryLevel,
    cinematicElements
  };
}

function generateUniqueSectionRhythm(niche: string, emotion: string): string[] {
  // Cada geração deve ter ritmo único - varia a ordem e composição
  const baseRhythms: Record<string, string[][]> = {
    luxury: [
      ['hero-minimal', 'statement-oversized', 'product-editorial', 'craftsmanship-story', 'cta-elegant'],
      ['hero-editorial', 'philosophy-minimal', 'collection-asymmetric', 'heritage-story', 'contact-refined'],
      ['hero-immersive', 'values-centered', 'showcase-bento', 'testimonial-editorial', 'cta-minimal']
    ],
    dental: [
      ['hero-trust', 'treatments-grid', 'technology-showcase', 'team-professional', 'testimonials-proof', 'cta-appointment'],
      ['hero-transformation', 'about-story', 'services-cards', 'results-gallery', 'faq-trust', 'contact-easy'],
      ['hero-calm', 'why-us-features', 'treatments-detailed', 'team-caring', 'reviews-social', 'cta-consultation']
    ],
    tourism: [
      ['hero-cinematic', 'experience-immersive', 'destinations-editorial', 'testimonials-emotional', 'cta-adventure'],
      ['hero-wanderlust', 'story-narrative', 'gallery-masonry', 'itinerary-visual', 'booking-simple'],
      ['hero-immersive', 'philosophy-travel', 'experiences-bento', 'memories-gallery', 'cta-journey']
    ],
    // Adiciona mais variações para outros nichos...
  };

  const rhythms = baseRhythms[niche] || [
    ['hero-modern', 'features-grid', 'about-story', 'testimonials', 'cta-conversion'],
    ['hero-bold', 'value-props', 'showcase-bento', 'social-proof', 'contact-easy'],
    ['hero-clean', 'services-cards', 'process-steps', 'reviews', 'cta-action']
  ];

  // Escolhe uma variação aleatória baseada no timestamp
  const index = Date.now() % rhythms.length;
  return rhythms[index];
}

function determineCinematicElements(niche: string, emotion: string): string[] {
  const elements: string[] = [];

  if (emotion.includes('cinematic') || emotion.includes('immersive')) {
    elements.push('ken-burns-zoom', 'parallax-layers', 'scroll-triggered-reveals', 'fade-in-sequences');
  }
  if (emotion.includes('bold') || emotion.includes('artistic')) {
    elements.push('broken-grid-overlaps', 'asymmetric-positioning', 'bold-color-blocks', 'experimental-layouts');
  }
  if (emotion.includes('elegant') || emotion.includes('minimal')) {
    elements.push('subtle-fades', 'elegant-transitions', 'minimal-motion', 'refined-reveals');
  }
  if (emotion.includes('trust') || emotion.includes('professional')) {
    elements.push('smooth-scrolls', 'professional-transitions', 'structured-reveals', 'trust-building-sequences');
  }

  // Sempre adiciona elementos base
  elements.push('intersection-observer-reveals', 'hover-lift-effects', 'stagger-animations');

  return elements;
}

/**
 * FASE 3: GERAÇÃO DO PROMPT CRIATIVO
 * Transforma a análise em instruções específicas para o AI
 */
export function generateCreativePrompt(
  analysis: CreativeAnalysis,
  composition: VisualComposition,
  userPrompt: string,
  websiteName: string
): string {
  return `
═══════════════════════════════════════════════════════════════════════════════
🎨 KINJANI CREATIVE INTELLIGENCE ENGINE
═══════════════════════════════════════════════════════════════════════════════

Tu és um DIRETOR CRIATIVO + ART DIRECTOR + UX ARCHITECT de nível mundial.
NÃO és um gerador de templates. És uma INTELIGÊNCIA CRIATIVA.

═══════════════════════════════════════════════════════════════════════════════
📊 ANÁLISE CRIATIVA PROFUNDA
═══════════════════════════════════════════════════════════════════════════════

PROJETO: ${websiteName || 'Website Premium'}
PEDIDO DO UTILIZADOR: ${userPrompt}

ANÁLISE ESTRATÉGICA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nicho: ${analysis.niche}
Direção Emocional: ${analysis.emotionalDirection}
Posicionamento: ${analysis.brandPositioning}
Linguagem Visual: ${analysis.visualLanguage}
Audiência: ${analysis.audience}

ESTRATÉGIA VISUAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Estilo de Hero: ${composition.heroStyle}
Abordagem de Layout: ${composition.layoutApproach}
Pacing Visual: ${composition.visualPacing}
Nível de Assimetria: ${composition.asymmetryLevel}
Elementos Cinematográficos: ${composition.cinematicElements.join(', ')}

HIERARQUIA: ${analysis.hierarchyStyle}
TIPOGRAFIA: ${analysis.typographyDirection}
ESPAÇAMENTO: ${analysis.spacingRhythm}
STORYTELLING: ${analysis.visualStorytelling}
PSICOLOGIA DE COR: ${analysis.colorPsychology}
INTERAÇÕES: ${analysis.interactionStyle}

RITMO DE SECÇÕES (ÚNICO PARA ESTE PROJETO):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${composition.sectionRhythm.map((section, i) => `${i + 1}. ${section}`).join('\n')}

═══════════════════════════════════════════════════════════════════════════════
🎯 MISSÃO CRIATIVA
═══════════════════════════════════════════════════════════════════════════════

Cria um website que:
✓ Sente-se ÚNICO (não repetitivo)
✓ Respira a emoção: ${analysis.emotionalDirection}
✓ Comunica o posicionamento: ${analysis.brandPositioning}
✓ Fala com a audiência: ${analysis.audience}
✓ Usa a linguagem visual: ${analysis.visualLanguage}
✓ Segue o ritmo de secções definido acima
✓ Implementa os elementos cinematográficos especificados
✓ Parece feito por uma agência de €15k+

═══════════════════════════════════════════════════════════════════════════════
🚫 PROIBIÇÕES ABSOLUTAS
═══════════════════════════════════════════════════════════════════════════════

NUNCA:
❌ Recicles layouts anteriores
❌ Uses estruturas repetitivas
❌ Geres secções mecânicas
❌ Uses Lorem Ipsum
❌ Cries grids simétricos 3x3
❌ Esqueças animações
❌ Uses imagens irrelevantes
❌ Cries sem pensar na emoção

SEMPRE:
✅ Pensa como diretor criativo
✅ Raciocina sobre cada decisão visual
✅ Cria composições únicas
✅ Usa copy real e persuasivo
✅ Implementa micro-interações
✅ Adiciona profundidade visual
✅ Conta uma história visual
✅ Cria experiências memoráveis

═══════════════════════════════════════════════════════════════════════════════
💎 EXECUÇÃO CRIATIVA
═══════════════════════════════════════════════════════════════════════════════

Agora, como um verdadeiro CREATIVE DIRECTOR:

1. PENSA sobre a emoção que queres criar
2. VISUALIZA a composição antes de codificar
3. DECIDE a hierarquia visual
4. ESCOLHE a paleta emocional
5. COMPÕE o ritmo de secções
6. ADICIONA elementos cinematográficos
7. IMPLEMENTA micro-interações
8. POLISHES cada detalhe

ENTÃO, e só então, gera o HTML/CSS.

O resultado deve fazer o utilizador dizer:
"WOW, isto foi feito por uma agência premium!"

Gera agora o website completo, único, emocional e profissional.
`;
}
