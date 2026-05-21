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
import { resolveImages } from "../_shared/image-resolver.ts";

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
    // FASE A — CREATIVE DIRECTOR (AI raciocina e produz briefing visual coerente)
    // O random só entra DEPOIS, escolhendo dentro das shortlists já justificadas
    // ═══════════════════════════════════════════════════════════════════════════════
    const niche_hint = creativeAnalysis.niche;
    console.log('[Creative Director] A pensar...');
    const brief = await runCreativeDirector(prompt, websiteName || "", niche_hint);

    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const uniqueId = Math.random().toString(36).slice(2, 8);

    const chosenPalette = pick(brief.shortlists.palettes);
    const chosenFonts   = pick(brief.shortlists.fonts);
    const chosenLayout  = pick(brief.shortlists.layouts);
    const chosenHero    = pick(brief.shortlists.heroes);

    console.log('[Creative Director] Escolhas:', {
      id: uniqueId,
      niche: brief.interpretation.niche,
      emotion: brief.interpretation.emotional_core,
      palette: chosenPalette.name,
      fonts: chosenFonts.pair,
      layout: chosenLayout.name,
      hero: chosenHero.name,
      rationale: brief.rationale.slice(0, 120),
    });

    let userMsg = `${creativePrompt}

═══════════════════════════════════════════════════════════════════════════════
🎨 CREATIVE BRIEF (ID: ${uniqueId}) — DECIDIDO PELO DIRETOR CRIATIVO
═══════════════════════════════════════════════════════════════════════════════

INTERPRETAÇÃO DO BRIEFING:
- Nicho: ${brief.interpretation.niche}
- Núcleo emocional: ${brief.interpretation.emotional_core}
- Posicionamento: ${brief.interpretation.positioning}
- Público: ${brief.interpretation.audience}
- Voz de marca: ${brief.interpretation.brand_voice}

DIREÇÃO VISUAL (raciocínio do director):
- Tipografia → ${brief.direction.typography_intent}
- Espaçamento → ${brief.direction.spacing_intent}
- Paleta → ${brief.direction.palette_intent}
- Composição → ${brief.direction.composition_intent}
- Motion → ${brief.direction.motion_intent}

PORQUÊ ESTA DIREÇÃO (rationale do director — usa isto como bússola em TODAS as escolhas):
${brief.rationale}

═══════════════════════════════════════════════════════════════════════════════
🎯 ESCOLHAS FINAIS (justificadas, NÃO aleatórias)
═══════════════════════════════════════════════════════════════════════════════

PALETA: ${chosenPalette.name}
  Porquê: ${chosenPalette.why}
  CSS Variables (copia LITERALMENTE para :root):
  :root { ${chosenPalette.vars} }
  Usa via var(--bg), var(--fg), var(--accent), var(--muted) em TODO o site.

TIPOGRAFIA: ${chosenFonts.pair}
  Porquê: ${chosenFonts.why}
  Carrega ambas via Google Fonts. Display → H1/H2/H3. Sans/Body → corpo, UI, micro-copy.

LAYOUT DNA: ${chosenLayout.name}
  Porquê: ${chosenLayout.why}
  Toda a composição do site deve respeitar este DNA estrutural.

HERO: ${chosenHero.name}
  Porquê: ${chosenHero.why}
  Implementa exatamente este arquétipo de hero.

═══════════════════════════════════════════════════════════════════════════════
🚨 REGRAS DE COERÊNCIA (não são caprichos — servem a intenção)
═══════════════════════════════════════════════════════════════════════════════

1. Estas escolhas foram tomadas porque servem a intenção emocional do briefing.
   Aplica-as fielmente. Não substituas por defaults Tailwind genéricos.
2. Se sentires que algo não encaixa, REFINA dentro da intenção — não saias dela.
3. Toda a copy deve respeitar a "voz de marca" definida acima.
4. Mínimo 7 secções ricas. Cada secção com composição DIFERENTE da anterior.
5. Varia alinhamentos (esquerda/direita/centro) e fundos (var(--bg)/var(--muted)/var(--accent) invertido).
6. Copy 100% em PT-PT, real e específico ao negócio. ZERO Lorem Ipsum.
7. Inclui obrigatoriamente: 1 pull-quote oversized, 1 secção de números/estatísticas,
   1 galeria/grid visual, 1 timeline/steps.
8. Adiciona logo após o <!DOCTYPE html> um comentário: <!-- creative-brief: ${uniqueId} -->

REQUISITOS TÉCNICOS:
- Tailwind CDN + Google Fonts no <head>
- :root com as CSS variables EXATAS da paleta acima
- IntersectionObserver para scroll reveals (stagger 100ms)
- Navbar fixed com backdrop-blur, transição on-scroll
- Mobile menu funcional (JS)
- Smooth scroll, hover effects em TUDO interativo
- py-20 md:py-32 mínimo entre secções
- Footer completo

Gera AGORA o HTML completo, único, premium, fiel a este Creative Brief ${uniqueId}.`;

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

    // Substitui TODAS as imagens por reais (Pexels API se houver chave, caso contrário catálogo curado Unsplash)
    try {
      html = await resolveImages(html, String(prompt || ""));
    } catch (imgErr) {
      console.error("[image-resolver] falhou, mantendo HTML original", imgErr);
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
