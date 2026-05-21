// KINJANI CREATIVE INTELLIGENCE ENGINE
// Generates premium websites using creative reasoning + Gemini 2.5 Flash
// Returns: { html: string }. Cobra créditos (site_create = 50) antes de chamar o modelo.
import { chargeCredits, insufficientCreditsResponse } from "../_shared/credits.ts";
import { callAI } from "../_shared/ai.ts";
import { EXPERT_SYSTEM_PROMPT, SECTOR_SPECIFIC_INSTRUCTIONS } from "./expert-prompts.ts";
import { MODERN_DESIGN_PATTERNS } from "./modern-components.ts";
import { validateHTMLQuality, formatQualityReport } from "./quality-validator.ts";
import {
  analyzeCreativeDirection,
  composeVisualStructure,
  generateCreativePrompt
} from "./creative-intelligence.ts";
import { runCreativeDirector } from "./creative-director.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Detecta o setor baseado no prompt
function detectSector(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.match(/dent[aá]ri[ao]|cl[ií]nica dental|ortodon|implante|branqueamento|sorriso/)) return 'dental';
  if (lower.match(/restaurante|comida|menu|chef|prato|gastronomia|cozinha/)) return 'restaurant';
  if (lower.match(/saas|software|app|dashboard|plataforma|tech|startup/)) return 'saas';
  if (lower.match(/portf[oó]lio|designer|fot[oó]grafo|criativo|artista/)) return 'portfolio';
  if (lower.match(/cl[ií]nica|sa[uú]de|m[eé]dic|hospital|terapeuta|fisio/)) return 'health';
  if (lower.match(/luxo|premium|exclusiv|high-end|elite/)) return 'luxury';
  return 'general';
}

const SYSTEM_PROMPT = `${EXPERT_SYSTEM_PROMPT}

═══════════════════════════════════════════════════════════════════════════════
📚 EXEMPLOS DE COMPONENTES MODERNOS (Para inspiração)
═══════════════════════════════════════════════════════════════════════════════

${MODERN_DESIGN_PATTERNS.heroes}

${MODERN_DESIGN_PATTERNS.bentoGrids}

${MODERN_DESIGN_PATTERNS.cards}

${MODERN_DESIGN_PATTERNS.navbars}

${MODERN_DESIGN_PATTERNS.animations}

${MODERN_DESIGN_PATTERNS.footers}

${MODERN_DESIGN_PATTERNS.colorPalettes}

═══════════════════════════════════════════════════════════════════════════════

IMPORTANTE: Estes exemplos são para INSPIRAÇÃO. NÃO copies literalmente.
Usa-os para entender o NÍVEL DE QUALIDADE esperado e cria algo ÚNICO para cada pedido.

A tua missão: gerar UM documento HTML completo, standalone, premium, único e lindo, baseado no pedido do utilizador.

REGRAS TÉCNICAS ABSOLUTAS:
1. Devolves APENAS HTML puro começando com <!DOCTYPE html>. Sem markdown, sem \`\`\`, sem explicações.
2. Usa Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
3. Carrega 2 Google Fonts contrastantes (display + sans)
4. Define CSS variables para cores no <style>
5. Inclui meta viewport, title, description
6. Mobile-first, responsivo em todos os breakpoints
7. Conteúdo em PORTUGUÊS (PT-PT) por defeito
8. Scroll-behavior: smooth no html
9. IntersectionObserver para scroll reveals
10. Mobile menu funcional com JavaScript

MODO DE NAVEGAÇÃO:
- ONE-PAGE por defeito: secções com id, links âncora (#sobre)
- MULTI-PAGE só se pedido: <section data-route="/rota"> com data-nav nos links`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, websiteName } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: "prompt required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY não configurada." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Charge 50 credits before generating.
    const charge = await chargeCredits(req, "site_create", `Geração de site${websiteName ? `: ${websiteName}` : ""}`);
    if (!charge.ok) return insufficientCreditsResponse(corsHeaders, charge);

    // ═══════════════════════════════════════════════════════════════════════════════
    // FASE 1: ANÁLISE CRIATIVA PROFUNDA
    // O sistema PENSA antes de gerar, como um diretor criativo real
    // ═══════════════════════════════════════════════════════════════════════════════

    console.log('[Creative Intelligence] Analisando direção criativa...');
    const creativeAnalysis = analyzeCreativeDirection(prompt);

    console.log('[Creative Intelligence] Análise:', {
      niche: creativeAnalysis.niche,
      emotion: creativeAnalysis.emotionalDirection,
      positioning: creativeAnalysis.brandPositioning
    });

    // ═══════════════════════════════════════════════════════════════════════════════
    // FASE 2: COMPOSIÇÃO VISUAL
    // Define estrutura visual ANTES de gerar HTML
    // ═══════════════════════════════════════════════════════════════════════════════

    console.log('[Creative Intelligence] Compondo estrutura visual...');
    const visualComposition = composeVisualStructure(creativeAnalysis);

    console.log('[Creative Intelligence] Composição:', {
      heroStyle: visualComposition.heroStyle,
      pacing: visualComposition.visualPacing,
      asymmetry: visualComposition.asymmetryLevel
    });

    // ═══════════════════════════════════════════════════════════════════════════════
    // FASE 3: GERAÇÃO DO PROMPT CRIATIVO
    // Transforma análise em instruções específicas
    // ═══════════════════════════════════════════════════════════════════════════════

    const creativePrompt = generateCreativePrompt(
      creativeAnalysis,
      visualComposition,
      prompt,
      websiteName || "Website Premium"
    );

    // ═══════════════════════════════════════════════════════════════════════════════
    // SEED CRIATIVO ALEATÓRIO — força DIVERGÊNCIA total entre gerações
    // Mesmo nicho repetido NÃO pode produzir o mesmo site
    // ═══════════════════════════════════════════════════════════════════════════════
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const pickN = <T,>(arr: T[], n: number): T[] => [...arr].sort(() => Math.random() - 0.5).slice(0, n);

    const HERO_ARCHETYPES = [
      "Cinematic Fullscreen (imagem/gradiente full-bleed + título oversized sobreposto + scroll indicator subtil)",
      "Editorial Split 60/40 (texto à esquerda em serif gigante, visual à direita com offset/sangria)",
      "Bento Hero (grid bento assimétrico 4-6 cards de tamanhos diferentes, headline embebida num card)",
      "Minimal Statement (apenas tipografia oversized centrada, whitespace extremo, 1 CTA discreto)",
      "Glassmorphism Layered (camadas translúcidas com blur sobre gradiente vibrante)",
      "Magazine Cover (estilo capa de revista: flag + título serif gigante + lead + foto editorial)",
      "Diagonal Split (divisão diagonal cor-sólida/imagem, conteúdo desencontrado)",
      "Marquee Type (texto gigante em scroll horizontal infinito como hero principal)",
      "Asymmetric Stack (blocos sobrepostos com z-index, broken grid, elementos a sangrar)",
      "Dark Spotlight (fundo escuro, spotlight radial em volta do título, accent vivo)",
    ];

    const PALETTES = [
      { name: "Noir & Gold", vars: "--bg:#0a0a0a;--fg:#f5f0e0;--accent:#c9a84c;--muted:#1a1a1a" },
      { name: "Midnight Indigo", vars: "--bg:#0a0a1a;--fg:#fafbfc;--accent:#6366f1;--muted:#141432" },
      { name: "Paper & Ink", vars: "--bg:#f5f3ee;--fg:#0d0d0d;--accent:#c44d2d;--muted:#e8e4dd" },
      { name: "Forest Moss", vars: "--bg:#0f1f15;--fg:#e8f0e8;--accent:#7da87d;--muted:#1a3c2a" },
      { name: "Cream & Terracotta", vars: "--bg:#faf6f1;--fg:#2d1810;--accent:#c4654a;--muted:#f0e8de" },
      { name: "Electric Coral", vars: "--bg:#fff8f6;--fg:#1a0d0d;--accent:#ff5a5f;--muted:#ffe8e5" },
      { name: "Arctic Steel", vars: "--bg:#f0f4f8;--fg:#0c2340;--accent:#2d8a9e;--muted:#dde6ee" },
      { name: "Burgundy Cream", vars: "--bg:#faf5f0;--fg:#3d1a1a;--accent:#8b1e3f;--muted:#f0e5d8" },
      { name: "Brutalist Pop", vars: "--bg:#ffffff;--fg:#0a0a0a;--accent:#ff5722;--muted:#fff48a" },
      { name: "Vapor Chrome", vars: "--bg:#1a1530;--fg:#e8e0ff;--accent:#a78bfa;--muted:#2a2050" },
      { name: "Sand & Olive", vars: "--bg:#f5f0e6;--fg:#2d2818;--accent:#6b7a3a;--muted:#e8dfc8" },
      { name: "Mono Slate", vars: "--bg:#1a1d24;--fg:#e8ecf1;--accent:#94a3b8;--muted:#252932" },
    ];

    const FONT_PAIRS = [
      "Fraunces + Inter", "Instrument Serif + DM Sans", "Cormorant Garamond + Montserrat",
      "Syne + Plus Jakarta Sans", "Space Grotesk + IBM Plex Sans", "Bricolage Grotesque + Inter",
      "Playfair Display + Work Sans", "DM Serif Display + Manrope", "Archivo Black + Hind",
      "Bebas Neue + Barlow", "Outfit + Figtree", "Sora + Manrope",
      "Italiana + Lato", "Tenor Sans + Source Sans 3", "Big Shoulders Display + Inter",
    ];

    const LAYOUT_DNA = [
      "Editorial Magazine (colunas tipo revista, callouts laterais, pull-quotes oversized)",
      "Swiss Grid (grid rigoroso 12-col, tipografia precisa, zero ornamento)",
      "Broken Grid Brutalist (elementos a sangrar, sobreposição agressiva, bordas duras)",
      "Bento Modular (cards de tamanhos variáveis, mix de conteúdo, hover lifts diferenciados)",
      "Vertical Storytelling (scroll narrativo, secções full-height alternadas, parallax leve)",
      "Asymmetric Editorial (alinhamentos desencontrados intencionais, whitespace dramático)",
      "Card Stack Y2K (cards arredondados grandes, cores vibrantes, sombras coloridas)",
      "Minimalist Awwwards (90% whitespace, micro-detalhes, animações sutis premium)",
    ];

    const MOTION_STYLES = [
      "Smooth & Refined (fades 600ms ease-out, micro-lifts em hover, scroll reveals subtis)",
      "Bold & Dynamic (slide-ins agressivos, scale transforms, hover com tilt 3D)",
      "Cinematic Slow (parallax pesado, ken-burns em imagens, reveals encadeados 1.2s)",
      "Snappy Modern (animações 200ms rápidas, micro-interactions vivas)",
      "Editorial Calm (fades quase invisíveis, foco no conteúdo, motion mínima propositada)",
    ];

    const SECTION_ORDERS = [
      ["hero", "manifesto", "serviços-bento", "processo-timeline", "casos-galeria", "equipa", "depoimentos", "faq", "cta-final", "footer"],
      ["hero", "estatísticas-impacto", "sobre-narrativa", "ofertas-cards", "galeria-masonry", "testemunhos-editorial", "contato-direto", "footer"],
      ["hero", "problema-solução", "como-funciona", "diferenciais", "social-proof", "pricing-ou-pacotes", "faq-acordeão", "cta-conversão", "footer"],
      ["hero", "showcase-fullbleed", "filosofia-quote", "serviços-split", "histórias-clientes", "perguntas-frequentes", "agendar", "footer"],
      ["hero", "destaque-único", "trilogia-pilares", "trabalho-recente-grid", "manifesto-pessoal", "contato-conversa", "footer"],
    ];

    const seed = {
      hero: pick(HERO_ARCHETYPES),
      palette: pick(PALETTES),
      fonts: pick(FONT_PAIRS),
      layoutDNA: pick(LAYOUT_DNA),
      motion: pick(MOTION_STYLES),
      sections: pick(SECTION_ORDERS),
      moodWords: pickN(["raw","refined","cinematic","playful","austere","warm","futuristic","nostalgic","luxurious","brutalist","soft","confident","experimental","editorial","intimate"], 3).join(" + "),
      uniqueId: Math.random().toString(36).slice(2, 8),
    };

    console.log('[Creative Seed]', { id: seed.uniqueId, palette: seed.palette.name, hero: seed.hero.slice(0,40), layout: seed.layoutDNA.slice(0,40) });

    let userMsg = `${creativePrompt}

═══════════════════════════════════════════════════════════════════════════════
🎲 SEED CRIATIVO ÚNICO (ID: ${seed.uniqueId}) — OBRIGATÓRIO SEGUIR À RISCA
═══════════════════════════════════════════════════════════════════════════════

Este seed garante que ESTE site é VISUALMENTE DIFERENTE de qualquer outro que já geraste.
NÃO ignores. NÃO uses defaults. Aplica EXATAMENTE estas escolhas:

🎨 PALETA OBRIGATÓRIA: ${seed.palette.name}
   CSS Variables (copia LITERALMENTE para :root):
   :root { ${seed.palette.vars} }
   Usa via var(--bg), var(--fg), var(--accent), var(--muted) em TODO o site.

🔤 PAR TIPOGRÁFICO OBRIGATÓRIO: ${seed.fonts}
   Carrega ambas via Google Fonts. Display → H1/H2/H3. Sans → body/UI.

🎬 ARQUÉTIPO DE HERO OBRIGATÓRIO: ${seed.hero}
   NÃO uses outro estilo de hero. Implementa exatamente este.

📐 LAYOUT DNA OBRIGATÓRIO: ${seed.layoutDNA}
   Toda a composição do site deve respeitar este DNA estrutural.

✨ MOTION: ${seed.motion}

🎭 MOOD: ${seed.moodWords}

📋 ORDEM DE SECÇÕES (segue esta sequência exata):
${seed.sections.map((s, i) => `   ${i + 1}. ${s}`).join("\n")}

═══════════════════════════════════════════════════════════════════════════════
🚨 REGRAS ANTI-REPETIÇÃO (CRÍTICO)
═══════════════════════════════════════════════════════════════════════════════

1. ESTE SITE NÃO PODE PARECER COM QUALQUER OUTRO QUE JÁ TENHAS GERADO.
2. Se sentires impulso de usar grid 3x3 de cards centrado → PARA. Usa o Layout DNA acima.
3. Se sentires impulso de hero centrado com título+sub+2 botões → PARA. Usa o Arquétipo acima.
4. A PALETA É OBRIGATÓRIA — proibido substituir por azul/cinza genérico ou "indigo/blue Tailwind".
5. As FONTES são obrigatórias — proibido usar só Inter ou system fonts.
6. Varia ALINHAMENTOS entre secções (esquerda, direita, centro, justificado).
7. Varia FUNDOS entre secções (var(--bg), var(--muted), var(--accent) invertido, gradiente).
8. Mínimo 7 secções ricas. Cada secção com composição DIFERENTE da anterior.
9. Copy 100% em PT, real e específico ao negócio. ZERO Lorem Ipsum.
10. Inclui obrigatoriamente: 1 pull-quote oversized, 1 secção de números/estatísticas, 1 galeria/grid visual, 1 timeline/steps.

REQUISITOS TÉCNICOS:
- Tailwind CDN + Google Fonts no <head>
- :root com as CSS variables EXATAS da paleta acima
- IntersectionObserver para scroll reveals (stagger 100ms)
- Navbar fixed com backdrop-blur, transição on-scroll
- Mobile menu funcional (JS)
- Smooth scroll, hover effects em TUDO interativo
- py-20 md:py-32 mínimo entre secções
- Footer completo

Gera AGORA o HTML completo, único, premium, baseado neste seed ${seed.uniqueId}.`;

    // Sistema de geração com validação de qualidade e retry
    let html: string = "";
    let qualityResult;
    let attempts = 0;
    const maxAttempts = 2; // Tenta até 2 vezes se qualidade for baixa

    while (attempts < maxAttempts) {
      attempts++;

      console.log(`[Attempt ${attempts}/${maxAttempts}] Gerando HTML...`);

      // Usa temperatura alta para criatividade máxima
      const ai = await callAI({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMsg },
        ],
        temperature: 1.0, // Máxima criatividade
        geminiModel: "gemini-2.5-flash", // Modelo mais recente e capaz
      });

      html = ai.content || "";

      if (!html.trim()) {
        if (attempts === maxAttempts) {
          return new Response(JSON.stringify({ error: "Resposta vazia do modelo ao criar o site." }), {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        continue; // Tenta novamente
      }

      // Strip code fences if any
      html = html.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

      if (!html.toLowerCase().startsWith("<!doctype") && !html.toLowerCase().startsWith("<html")) {
        // wrap minimal
        html = `<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"><script src="https://cdn.tailwindcss.com"></script></head><body>${html}</body></html>`;
      }

      // Valida qualidade do HTML gerado
      qualityResult = validateHTMLQuality(html);

      console.log(`[Quality Check] Score: ${qualityResult.score}/100, Passed: ${qualityResult.passed}`);
      console.log(formatQualityReport(qualityResult));

      // Se passou na validação ou é a última tentativa, aceita o resultado
      if (qualityResult.passed || attempts === maxAttempts) {
        break;
      }

      // Se não passou, adiciona feedback específico para retry
      console.log(`[Retry] Qualidade insuficiente (${qualityResult.score}/100). Tentando novamente com feedback...`);

      userMsg += `\n\n⚠️ FEEDBACK DA TENTATIVA ANTERIOR (Score: ${qualityResult.score}/100):

PROBLEMAS ENCONTRADOS:
${qualityResult.issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

AVISOS:
${qualityResult.warnings.map((warning, i) => `${i + 1}. ${warning}`).join('\n')}

Por favor, corrige estes problemas e gera um HTML de MAIOR QUALIDADE.
Foca especialmente em:
- Adicionar mais animações e micro-interações
- Usar layouts assimétricos e criativos
- Implementar scroll reveal com IntersectionObserver
- Adicionar hover effects em todos os elementos
- Usar gradientes e glassmorphism
- Garantir espaçamento generoso (py-20 md:py-32)
- Copy real e persuasivo (ZERO Lorem Ipsum)`;
    }

    // Retorna o HTML com informações de qualidade
    return new Response(JSON.stringify({
      html,
      quality: {
        score: qualityResult?.score || 0,
        passed: qualityResult?.passed || false,
        attempts
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
