// Generates a full standalone HTML page from a prompt using Lovable AI Gateway (Gemini 2.5 Pro).
// Returns: { html: string }. Cobra créditos (site_create = 50) antes de chamar o modelo.
import { chargeCredits, insufficientCreditsResponse } from "../_shared/credits.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `És um web designer e developer de elite ao nível da Lovable / v0 / Framer.
A tua missão: gerar UM documento HTML completo, standalone, premium, único e lindo, baseado no pedido do utilizador.

REGRAS ABSOLUTAS:
1. Devolves APENAS HTML puro começando com <!DOCTYPE html>. Sem markdown, sem \`\`\`, sem explicações.
2. Usa Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
3. Usa Google Fonts apropriadas (Inter, Space Grotesk, Fraunces, Instrument Serif, etc) — escolhe consoante o nicho.
4. Inclui meta viewport responsiva. Mobile-first.
5. Inclui um <title> apropriado e <meta name="description">.
6. Design DEVE ser único, art-directed, NÃO genérico. Cada pedido = layout diferente. Varia paletas, tipografia, estrutura (split, fullscreen, magazine, bento, asymmetric) e micro-interações (transitions, hover, scroll reveal com IntersectionObserver inline).
7. Conteúdo em PORTUGUÊS (PT-PT) por defeito a menos que o pedido peça outra língua.
8. Usa imagens estáveis e públicas de https://picsum.photos/seed/<tema>/1600/900 ou semelhantes; NÃO uses images.unsplash.com nem source.unsplash.com.
9. Conteúdo real, persuasivo, profissional — NÃO uses "Lorem ipsum".
10. Footer completo. Formulários de contacto abrem wa.me/<numero> ou mailto: se houver dados.

MODO DE NAVEGAÇÃO — ESCOLHE 1 dos 2 conforme o pedido:

(A) ONE-PAGE (default para landing pages, sites simples):
    - Uma única página com várias secções com id (#home, #sobre, #servicos, #portfolio, #contacto).
    - Nav com links âncora (href="#sobre", etc.) e scroll-behavior: smooth.
    - Mínimo 5 secções ricas.

(B) MULTI-PAGE (quando o utilizador pedir "site institucional", "várias páginas", "com rotas", "página sobre", "página separada", etc.):
    - Gera várias rotas no MESMO documento usando <section data-route="/rota">.
    - Rotas típicas: data-route="/" (home), "/sobre", "/servicos", "/portfolio", "/contacto", "/blog".
    - A primeira rota é sempre "/" (home).
    - Cada <section data-route="..."> deve conter a página completa (hero/conteúdo/etc) e ser RICA (não vazia).
    - Header/footer ficam FORA dos data-route (partilhados entre páginas).
    - Links de navegação no header usam href="/sobre", href="/servicos", etc., E adicionam atributo data-nav (ex: <a href="/sobre" data-nav>Sobre</a>) — um runtime injectado faz a navegação automaticamente sem reload.
    - Podes misturar: dentro de cada rota podes ainda usar âncoras #seccao para sub-navegação.
    - NÃO uses display:none inline nas rotas — o runtime trata disso.

QUALIDADE = AWWWARDS. Pensa como director criativo, não como template.`;

const UNSPLASH_URL_PATTERN = /https?:\/\/(?:images|source)\.unsplash\.com\/[^"'\s)<>]+/gi;

function sanitizeSeed(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "image";
}

function defaultHeight(width: number) {
  if (width <= 320) return width;
  if (width <= 640) return Math.round(width * 0.75);
  return Math.round(width * 0.5625);
}

function normalizeImageUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    let width = Number(url.searchParams.get("w")) || 1600;
    let height = Number(url.searchParams.get("h")) || defaultHeight(width);
    let seed = "image";

    if (url.hostname === "source.unsplash.com") {
      const sizeMatch = url.pathname.match(/\/(\d+)x(\d+)\/?$/);
      if (sizeMatch) {
        width = Number(sizeMatch[1]) || width;
        height = Number(sizeMatch[2]) || height;
      }
      seed = sanitizeSeed(url.search.slice(1) || url.pathname || "image");
    } else {
      const photoMatch = url.pathname.match(/photo-([a-z0-9-]+)/i);
      seed = sanitizeSeed(photoMatch?.[1] || `${width}x${height}`);
    }

    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
  } catch {
    return "https://picsum.photos/seed/image/1600/900";
  }
}

function normalizeGeneratedHtml(html: string) {
  return html.replace(UNSPLASH_URL_PATTERN, normalizeImageUrl);
}

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

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const apiKey = openaiKey || geminiKey;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Nenhuma API key de IA configurada (OPENAI_API_KEY ou GEMINI_API_KEY)" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const useOpenAI = !!openaiKey;
    const aiUrl = useOpenAI
      ? "https://api.openai.com/v1/chat/completions"
      : "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
    const aiModel = useOpenAI ? "gpt-4o" : "gemini-2.5-flash";

    // Charge 50 credits before generating.
    const charge = await chargeCredits(req, "site_create", `Geração de site${websiteName ? `: ${websiteName}` : ""}`);
    if (!charge.ok) return insufficientCreditsResponse(corsHeaders, charge);

    const userMsg = `Nome do projecto: ${websiteName || "Sem nome"}\n\nPedido do utilizador:\n${prompt}\n\nGera agora a página HTML completa, premium e única.`;

    const body: Record<string, unknown> = {
      model: aiModel,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMsg },
      ],
      temperature: 0.9,
    };
    if (useOpenAI) body.max_tokens = 16000;

    const resp = await fetch(aiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return new Response(JSON.stringify({ error: `AI gateway error: ${resp.status} ${txt}` }), {
        status: resp.status === 429 || resp.status === 402 ? resp.status : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    let html: string = data?.choices?.[0]?.message?.content || "";
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
    html = normalizeGeneratedHtml(html);

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
