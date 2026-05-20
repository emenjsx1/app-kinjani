// Generates a full standalone HTML page from a prompt using Lovable AI Gateway (Gemini 2.5 Pro).
// Returns: { html: string }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `És um web designer e developer de elite ao nível da Lovable / v0 / Framer.
A tua missão: gerar UMA página HTML completa, standalone, premium, única e linda, baseada no pedido do utilizador.

REGRAS ABSOLUTAS:
1. Devolves APENAS HTML puro começando com <!DOCTYPE html>. Sem markdown, sem \`\`\`, sem explicações.
2. Usa Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
3. Usa Google Fonts apropriadas (Inter, Space Grotesk, Fraunces, Instrument Serif, etc) — escolhe consoante o nicho.
4. Inclui meta viewport responsiva. Mobile-first.
5. Inclui um <title> apropriado e <meta name="description">.
6. Design DEVE ser único, art-directed, NÃO genérico. Cada pedido = layout diferente. Varia:
   - paletas (escuro/claro/colorido conforme nicho)
   - tipografia (serif vs sans vs display)
   - estrutura (split, fullscreen, magazine, bento, asymmetric)
   - micro-interações (transitions, hover, scroll reveal usando IntersectionObserver inline)
7. Conteúdo em PORTUGUÊS (PT-PT) por defeito a menos que o pedido peça outra língua.
8. Usa imagens reais de https://images.unsplash.com/photo-... (URLs Unsplash diretos que sabes funcionarem) ou https://source.unsplash.com/1600x900/?<keywords>.
9. Inclui TODAS as secções pedidas (Hero, Sobre, Serviços, Portfolio, Testemunhos, Contacto, etc). Mínimo 5 secções ricas.
10. Inclui navegação no topo com âncoras (#home, #sobre, etc) e scroll-behavior: smooth.
11. Inclui footer completo.
12. Formulários de contacto devem abrir wa.me ou mailto: se o pedido tiver número/email.
13. NÃO uses placeholders tipo "Lorem ipsum" — escreve copy real, persuasivo, profissional.
14. Animações leves com CSS @keyframes ou data-aos-style com IntersectionObserver inline.

QUALIDADE = AWWWARDS. Pensa como um director criativo, não como um template.`;

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

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userMsg = `Nome do projecto: ${websiteName || "Sem nome"}\n\nPedido do utilizador:\n${prompt}\n\nGera agora a página HTML completa, premium e única.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        temperature: 0.9,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMsg },
        ],
      }),
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
