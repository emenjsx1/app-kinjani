// Generates a full standalone HTML page from a prompt using Gemini.
// Returns: { html: string }. Cobra créditos (site_create = 50) antes de chamar o modelo.
import { chargeCredits, insufficientCreditsResponse } from "../_shared/credits.ts";
import { callAI } from "../_shared/ai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `És um web designer e developer de elite ao nível da Lovable / v0 / Framer.
A tua missão: gerar UM documento HTML completo, standalone, premium, único e lindo, baseado no pedido do utilizador.

REFERÊNCIA DE QUALIDADE DE CÓDIGO:
- O utilizador quer HTML com cara de site feito à mão por um developer real, não layout tosco de IA.
- Pensa em secções construídas manualmente, com hierarchy forte, CSS customizado no <style>, variáveis de cor, navbar cuidada, hero cinematográfica, transições subtis, reveal on scroll, mobile menu e footer real.
- A composição deve parecer semelhante em nível de polimento a um template premium codado manualmente em Tailwind + CSS custom, NÃO a blocos genéricos empilhados.
- Usa comentários de secção claros no HTML (ex: <!-- Hero -->, <!-- Serviços -->).
- Cria contraste, ritmo vertical, alternância de fundos e detalhes de interação elegantes.
- NÃO cries secções meta sobre o próprio assistente, sobre capacidades do developer, ou instruções de edição dentro do site final, a menos que o utilizador peça explicitamente.

REGRAS ABSOLUTAS:
1. Devolves APENAS HTML puro começando com <!DOCTYPE html>. Sem markdown, sem \`\`\`, sem explicações.
2. Usa Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
3. Se o utilizador pedir fontes específicas, usa EXATAMENTE essas fontes. Caso contrário escolhe Google Fonts apropriadas.
4. Inclui meta viewport responsiva. Mobile-first.
5. Inclui um <title> apropriado e <meta name="description">.
6. Design DEVE ser único, art-directed, NÃO genérico. Cada pedido = layout diferente. Varia paletas, tipografia, estrutura e micro-interações sem cair em template barato.
7. Conteúdo em PORTUGUÊS (PT-PT) por defeito a menos que o pedido peça outra língua.
8. Respeita EXATAMENTE a marca, o setor, a paleta, o tom e a lista de secções pedidas. NÃO substituas secções pedidas por secções inventadas.
9. Conteúdo real, persuasivo, profissional — NÃO uses "Lorem ipsum".
10. Se o utilizador pedir uma landing page, gera UMA landing page one-page. NÃO inventes rotas, páginas internas, /sobre, /servicos, /contacto ou data-route a menos que isso seja explicitamente pedido.
11. Se o utilizador der um nome de marca/negócio, usa esse nome exatamente como marca principal. NÃO inventes outro nome.
12. Imagens têm de ser coerentes com o negócio. NUNCA uses animais, paisagens aleatórias ou imagens irrelevantes. Se não tiveres certeza, prefere fundos elegantes/gradientes/fotografia clínica neutra em vez de imagem errada.
13. Se usares imagens remotas, usa keywords estritas e relevantes ao setor (ex: dental, dentist, orthodontics, smile, clinic interior, doctor portrait) — nunca keywords genéricas.
14. Footer completo. Formulários de contacto devem ser reais e visualmente premium.
15. O resultado deve parecer código de produção: secções bem compostas, classes coerentes, espaçamento profissional, sem blocos repetidos com a mesma estrutura pobre.
16. Se o pedido mencionar luxo/saúde/dental, evita visual corporativo barato. Usa camadas, superfícies translúcidas discretas, sombras suaves, copy premium e direção artística credível.

MODO DE NAVEGAÇÃO — ESCOLHE 1 dos 2 conforme o pedido:

(A) ONE-PAGE (OBRIGATÓRIO por defeito para landing pages e sites simples):
    - Uma única página com várias secções com id (#home, #sobre, #servicos, #portfolio, #contacto).
    - Nav com links âncora (href="#sobre", etc.) e scroll-behavior: smooth.
    - Mínimo 5 secções ricas.
    - Nunca uses href="/sobre" nem <section data-route="..."> neste modo.

(B) MULTI-PAGE (SÓ quando o utilizador pedir explicitamente "várias páginas", "com rotas", "/sobre", "página separada", etc.):
    - Gera várias rotas no MESMO documento usando <section data-route="/rota">.
    - Rotas típicas: data-route="/" (home), "/sobre", "/servicos", "/portfolio", "/contacto", "/blog".
    - A primeira rota é sempre "/" (home).
    - Cada <section data-route="..."> deve conter a página completa (hero/conteúdo/etc) e ser RICA (não vazia).
    - Header/footer ficam FORA dos data-route (partilhados entre páginas).
    - Links de navegação no header usam href="/sobre", href="/servicos", etc., E adicionam atributo data-nav (ex: <a href="/sobre" data-nav>Sobre</a>) — um runtime injectado faz a navegação automaticamente sem reload.
    - Podes misturar: dentro de cada rota podes ainda usar âncoras #seccao para sub-navegação.
    - NÃO uses display:none inline nas rotas — o runtime trata disso.

QUALIDADE = AWWWARDS. Pensa como director criativo, não como template.`;

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

    const userMsg = `NOME DO PROJECTO / MARCA: ${websiteName || "Sem nome"}

PEDIDO DO UTILIZADOR:
${prompt}

INSTRUÇÕES DE EXECUÇÃO:
- Se o pedido disser "landing page", gera apenas one-page.
- Se o pedido listar secções, inclui todas essas secções.
- Se o pedido exigir um estilo específico (ex: luxo, branco/bege, Montserrat + Inter, premium healthcare), cumpre-o literalmente.
- Se o setor for dental/saúde, toda a imagem, copy e UI devem parecer clínica dentária premium moderna.
- O HTML final deve parecer escrito por um developer sénior de frontend: navbar fixa bem resolvida, secções com composições diferentes, imagens integradas com intenção, micro-animações suaves e estrutura sem cara de template barato.
- Usa a referência do utilizador apenas como padrão de qualidade e composição, não como conteúdo de engenharia.
- Não inventes rotas nem páginas separadas sem pedido explícito.
- Não uses imagens irrelevantes. Zero animais, zero placeholders aleatórios.

Gera agora a página HTML completa, premium e única.`;

    const ai = await callAI({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMsg },
      ],
      temperature: 0.9,
      geminiModel: "gemini-2.5-flash",
    });

    let html: string = ai.content || "";
    if (!html.trim()) {
      return new Response(JSON.stringify({ error: "Resposta vazia do modelo ao criar o site." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // strip code fences if any
    html = html.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    if (!html.toLowerCase().startsWith("<!doctype") && !html.toLowerCase().startsWith("<html")) {
      // wrap minimal
      html = `<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"><script src="https://cdn.tailwindcss.com"></script></head><body>${html}</body></html>`;
    }

    return new Response(JSON.stringify({ html }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
