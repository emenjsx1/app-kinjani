// KINJANI CREATIVE INTELLIGENCE ENGINE
// Generates premium websites using creative reasoning + Gemini 2.5 Flash
// Returns: { html: string }. Cobra créditos (site_create = 50) antes de chamar o modelo.
import { chargeCredits, insufficientCreditsResponse } from "../_shared/credits.ts";
import { callAI, getUserApiKey } from "../_shared/ai.ts";
import { EXPERT_SYSTEM_PROMPT, SECTOR_SPECIFIC_INSTRUCTIONS } from "./expert-prompts.ts";
import { MODERN_DESIGN_PATTERNS } from "./modern-components.ts";
import { validateHTMLQuality, formatQualityReport } from "./quality-validator.ts";
import {
  analyzeCreativeDirection,
  composeVisualStructure,
  generateCreativePrompt
} from "./creative-intelligence.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Detecta o setor baseado no prompt — 25+ setores + fallback semântico
function detectSector(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.match(/dent[aá]ri[ao]|cl[ií]nica dental|ortodon|implante|branqueamento|sorriso/)) return 'dental';
  if (lower.match(/restaurante|gastronomia|chef|culin[aá]ria|menu|cardápio|caf[eé]|bistr/)) return 'restaurant';
  if (lower.match(/padaria|confeitaria|bolo|doce|p[aã]o artesanal|pastel|torta|brigadeiro|pastelaria/)) return 'bakery';
  if (lower.match(/saas|software|dashboard|plataforma|api\b|automação|ia\b|inteligência artificial/)) return 'saas';
  if (lower.match(/portf[oó]lio|designer|fot[oó]grafo|videograf|galeria de trabalhos/)) return 'portfolio';
  if (lower.match(/cl[ií]nica|m[eé]dic|hospital|sa[uú]de|terapeuta|fisio|psicolog|nutri[çc]|dermatolog/)) return 'health';
  if (lower.match(/luxo|premium|exclusiv|high-end|elite|requintad/)) return 'luxury';
  if (lower.match(/advocacia|advogad|jur[ií]dic|direito|tribunal/)) return 'law';
  if (lower.match(/barbearia|barbeiro|barber|salão de bel|cabeleireiro/)) return 'barbershop';
  if (lower.match(/spa|bem-estar|wellness|massagem|relaxamento|est[eé]tica\b|manicure|pilates|yoga/)) return 'wellness';
  if (lower.match(/academia|gym\b|fitness|muscula[çc][ãa]o|personal trainer|crossfit/)) return 'fitness';
  if (lower.match(/escola\b|educa[çc][ãa]o|curso\b|universidade|faculdade|ensino|aulas?\b|mentor/)) return 'education';
  if (lower.match(/pet\b|animal\b|c[aã]o\b|cachorro|gato\b|veterin[aá]rio|\bvet\b|pet shop/)) return 'pet';
  if (lower.match(/m[uú]sic[ao]\b|banda\b|artista musical|\bdj\b|álbum|concerto/)) return 'music';
  if (lower.match(/agência|marketing\b|publicidade|branding\b|comunica[çc][ãa]o/)) return 'agency';
  if (lower.match(/constru[çc][ãa]o|engenharia\b|arquitetur|obra\b|edif[ií]cio/)) return 'construction';
  if (lower.match(/imobili[aá]|im[oó]vel|propriedade\b|casa [aà] vend|apartamento [aà]/)) return 'realestate';
  if (lower.match(/turismo|viag|hotel\b|resort\b|destino|f[ée]rias|pousada/)) return 'tourism';
  if (lower.match(/moda\b|fashion\b|roupa\b|vestu[aá]rio|boutique|streetwear/)) return 'fashion';
  if (lower.match(/contabilidade|contador|financ|consultoria|audit|investimento/)) return 'finance';
  if (lower.match(/evento\b|casamento\b|cerimônia|festa\b|cerimonial|wedding|noiva/)) return 'events';
  if (lower.match(/dança\b|ballet|teatro|arte[s]?\s+cênica|escola de arte|escola de música/)) return 'arts-school';
  if (lower.match(/carro\b|autom[oó]vel|stand\b|oficina mecânica|garagem|concession/)) return 'automotive';
  if (lower.match(/ong\b|organiza[çc][ãa]o sem fins|voluntari|causa social|comunidade\b/)) return 'nonprofit';
  if (lower.match(/loja online|e-commerce|ecommerce|catálogo de produtos/)) return 'ecommerce';
  if (lower.match(/farmácia|farmacia|botica|medicamento|remédio/)) return 'pharmacy';
  if (lower.match(/tech|startup\b|app\b|digital\b|inovação/)) return 'saas';
  // Para qualquer coisa não reconhecida — análise semântica dinâmica
  return 'dynamic';
}

// Para setores 'dynamic', gera instruções a partir da análise criativa
function buildDynamicSectorInstructions(analysis: { niche: string; emotionalDirection: string; brandPositioning: string; visualLanguage: string; audience: string; colorPsychology: string; typographyDirection: string }): string {
  return `
INSTRUÇÕES SETORIAIS DERIVADAS DINAMICAMENTE:
(Este é um negócio/projeto fora dos setores padrão — foi analisado semanticamente)

NICHO DETETADO: ${analysis.niche}
POSICIONAMENTO: ${analysis.brandPositioning}

PALETA E MOOD: ${analysis.colorPsychology}
MOOD VISUAL: ${analysis.visualLanguage}
AUDIÊNCIA: ${analysis.audience}

DIREÇÃO EMOCIONAL: ${analysis.emotionalDirection}
TIPOGRAFIA RECOMENDADA: ${analysis.typographyDirection}

INSTRUÇÕES CRÍTICAS PARA ESTE PROJETO:
1. Cria secções que fazem sentido ESPECÍFICO para este tipo de negócio
2. Usa copy real e relevante (nomes de serviços, preços aproximados, equipa)
3. Escolhe imagens de fundo do Unsplash que sejam RELEVANTES ao negócio
4. O design deve transmitir: ${analysis.emotionalDirection}
5. O utilizador deve imediatamente perceber o que o negócio faz
6. Não uses secções que não façam sentido para este nicho
`;
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

    const userKey = await getUserApiKey(req, "gemini");
    const geminiKey = userKey || Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY não configurada." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Detect sector — must come AFTER we have the analysis, so we resolve dynamic sectors
    const detectedSector = detectSector(prompt);
    // Note: for 'dynamic', we build instructions AFTER creative analysis below
    const staticSectorInstructions = detectedSector !== 'dynamic'
      ? (SECTOR_SPECIFIC_INSTRUCTIONS[detectedSector as keyof typeof SECTOR_SPECIFIC_INSTRUCTIONS] || '')
      : '';


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

    let userMsg = `${creativePrompt}`;

    // Resolve sector instructions — static for known sectors, dynamic for unknown
    const sectorInstructions = detectedSector === 'dynamic'
      ? buildDynamicSectorInstructions(creativeAnalysis)
      : staticSectorInstructions;

    if (sectorInstructions) {
      userMsg += `\n\n═══════════════════════════════════════════════════════════════════════════════\n🎯 INSTRUÇÕES SETORIAIS (SETOR: ${detectedSector.toUpperCase()})\n═══════════════════════════════════════════════════════════════════════════════\n${sectorInstructions}`;
    }

    userMsg += `\n\nINSTRUÇÕES TÉCNICAS CRÍTICAS:

🎯 OBJETIVO: Criar um website que pareça feito por uma agência premium de €10k+, NÃO por IA genérica.

✅ OBRIGATÓRIO:
1. Escolhe 1 estilo de hero moderno (Cinematic, Split Asymmetric, Glassmorphism, etc)
2. Usa layout assimétrico (NUNCA grid 3x3 simétrico)
3. Define paleta de cores coerente com CSS variables
4. Carrega 2 Google Fonts contrastantes
5. Implementa scroll reveal com IntersectionObserver
6. Adiciona hover effects em todos os elementos interativos
7. Navbar fixed com backdrop-blur e transição on-scroll
8. Mobile menu funcional
9. Espaçamento generoso (py-20 md:py-32)
10. Copy real e persuasivo em português (ZERO Lorem Ipsum)

🚫 PROIBIDO:
- Lorem Ipsum ou placeholder text
- Imagens irrelevantes (animais, paisagens aleatórias)
- Grid 3x3 simétrico
- Cards sem hover effects
- Cores primárias puras (red, blue) - usa tons sofisticados
- Apenas text-center - varia alinhamentos
- Espaçamento pequeno (menos de py-16)
- Fontes system - sempre Google Fonts
- Sites sem animações

📐 ESTRUTURA:
- Se "landing page": ONE-PAGE com secções #id
- Se pedir "várias páginas": MULTI-PAGE com data-route
- Mínimo 5 secções ricas e variadas
- Footer completo com links e social media

🎨 QUALIDADE:
- Cada secção deve ter composição DIFERENTE
- Alterna fundos (white, gray-50, gradientes)
- Usa transparências (bg-white/10, text-white/80)
- Adiciona micro-interações (hover, focus, active)
- Tipografia com hierarchy clara (8xl → base)

Gera agora a página HTML completa, premium, única e profissional.
Lembra-te: O utilizador deve dizer "WOW, isto parece caro!" quando vir o resultado.`;

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
        temperature: 0.75, // Criatividade controlada e layout estável
        geminiModel: "gemini-1.5-pro", // Modelo mais inteligente
      }, userKey);

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
