// Edits an existing HTML page based on a user instruction. Returns full new HTML.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `És um web developer de elite. Recebes um documento HTML completo e uma instrução do utilizador.
Aplicas a alteração pedida e devolves O DOCUMENTO HTML COMPLETO atualizado.

REGRAS:
1. Devolves APENAS HTML puro começando com <!DOCTYPE html>. Sem markdown, sem \`\`\`, sem explicações.
2. Preserva tudo o que não foi pedido para alterar. NÃO reescrevas do zero. Faz alteração cirúrgica.
3. Mantém o Tailwind CDN, fonts e estrutura existente.
4. Se o utilizador pedir para adicionar uma secção/botão/link → adiciona no sítio lógico.
5. Se pedir para mudar cores/tipografia → muda apenas as classes/styles relevantes.
6. Se pedir para adicionar logo e disser para usar imagem X → usa o URL fornecido.
7. Para botões que redireccionam → usa <a href="..."> com target="_blank" se for externo.
8. Mantém qualidade premium e responsivo.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { html, instruction, history } = await req.json();
    if (!html || !instruction) {
      return new Response(JSON.stringify({ error: "html and instruction required" }), {
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

    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        if (h?.role && h?.content) messages.push({ role: h.role, content: String(h.content).slice(0, 2000) });
      }
    }

    messages.push({
      role: "user",
      content: `HTML ACTUAL:\n\`\`\`html\n${html}\n\`\`\`\n\nINSTRUÇÃO:\n${instruction}\n\nDevolve o documento HTML completo actualizado.`,
    });

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        temperature: 0.6,
        messages,
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
    let newHtml: string = data?.choices?.[0]?.message?.content || "";
    newHtml = newHtml.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    if (!newHtml.toLowerCase().includes("<html")) {
      return new Response(JSON.stringify({ error: "AI did not return valid HTML", raw: newHtml.slice(0, 500) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ html: newHtml, message: "Pronto! Apliquei a alteração." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
