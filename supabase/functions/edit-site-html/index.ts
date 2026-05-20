// Conversational website editor.
// Classifies intent (chat / plan / edit), and in edit mode returns full new HTML.
// Supports image attachments (vision) and embeds uploaded images directly into the page when relevant.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `És o Assistente Kinjani, um web developer + designer de elite que conversa naturalmente em Português europeu (PT-PT) com o utilizador sobre o site dele.

Tens MEMÓRIA da conversa (vês o histórico). Tens o HTML actual do site. Podes:
- responder a perguntas ("o que podes fazer", "que cores tem o site", "explica-me isto") → action: "chat"
- planear alterações em texto sem mexer no código → action: "plan"
- editar o HTML cirurgicamente quando o utilizador pede uma alteração concreta → action: "edit"

REGRA DE OURO — RESPONDE SEMPRE EM JSON VÁLIDO, sem markdown nem \`\`\`:
{
  "action": "chat" | "plan" | "edit",
  "message": "texto conversacional curto a explicar o que fizeste ou a responder",
  "html": "<!DOCTYPE html>...documento completo..."   // OBRIGATÓRIO se action="edit", omitido caso contrário
}

REGRAS DE EDIÇÃO (action="edit"):
1. Devolve o DOCUMENTO HTML COMPLETO começando com <!DOCTYPE html>.
2. Preserva tudo o que não foi pedido para alterar. Edição cirúrgica, não reescrever.
3. Mantém Tailwind CDN, fonts Google e estrutura existente.
4. Se o utilizador anexar imagens, USA-AS REALMENTE no site (logo, hero, galeria, equipa, etc.) inserindo o data URL fornecido no atributo src de <img>.
5. Para links externos usa <a href="..." target="_blank" rel="noopener">.
6. Para e-mails usa mailto:, para telefones tel:, para WhatsApp https://wa.me/NUMERO.
7. Quando adicionas uma secção (equipa, testemunhos, FAQ, contacto, preços, galeria...), mantém o mesmo sistema visual (cores, espaçamento, tipografia) do resto do site.
8. SUPORTAS MULTI-PÁGINA: se o utilizador pedir para transformar em site institucional com várias páginas / rotas (/sobre, /servicos, /contacto...), envolve cada página em <section data-route="/rota"> dentro do <body>, mantém header/footer fora, e nos links de nav usa href="/sobre" data-nav. A primeira rota deve ser data-route="/" (home). NÃO precisas de gerir display: um runtime injectado mostra a rota correcta automaticamente.
9. Se o site já estiver em multi-página e o utilizador pedir uma página nova, adiciona apenas mais um <section data-route="/nova"> e o link no nav — não mexas nas outras.
10. message deve ser curto e descrever em PT-PT o que mudaste (ex: "Adicionei a página Sobre com a equipa e biografia.").

REGRAS DE CHAT (action="chat"):
- Responde como assistente útil. Lista capacidades (incluindo transformar one-page em multi-página com rotas), explica decisões, sugere próximos passos. NÃO devolvas html.

REGRAS DE PLANO (action="plan"):
- Devolve um plano numerado curto em message. NÃO devolvas html.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { html, instruction, history, mode, attachments } = await req.json();
    if (!html || !instruction) {
      return new Response(JSON.stringify({ error: "html and instruction required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messages: any[] = [{ role: "system", content: SYSTEM_PROMPT }];

    if (Array.isArray(history)) {
      for (const h of history.slice(-8)) {
        if (h?.role && h?.content) {
          messages.push({ role: h.role, content: String(h.content).slice(0, 1500) });
        }
      }
    }

    // Build multimodal user message (text + any image attachments)
    const imageAtts = Array.isArray(attachments)
      ? attachments.filter((a: any) => typeof a?.dataUrl === "string" && (a?.type || "").startsWith("image/"))
      : [];

    const modeHint = mode === "plan"
      ? "MODO PEDIDO: PLANEAR (não alteres o HTML, apenas devolve action=plan com plano em message)"
      : "MODO PEDIDO: CONSTRUIR (se for pedido de alteração concreto, action=edit; se for pergunta/conversa, action=chat)";

    const textPart =
      `${modeHint}\n\nHTML ACTUAL DO SITE:\n\`\`\`html\n${html}\n\`\`\`\n\n` +
      (imageAtts.length
        ? `IMAGENS ANEXADAS PELO UTILIZADOR (${imageAtts.length}). Usa-as se fizer sentido para a instrução. Os data URLs estão em baixo na ordem:\n` +
          imageAtts.map((a: any, i: number) => `Imagem ${i + 1} (${a.name}): ${a.dataUrl}`).join("\n") +
          `\n\n`
        : "") +
      `INSTRUÇÃO DO UTILIZADOR:\n${instruction}\n\nResponde APENAS com o objecto JSON descrito no system prompt.`;

    const userContent: any[] = [{ type: "text", text: textPart }];
    for (const a of imageAtts.slice(0, 4)) {
      userContent.push({ type: "image_url", image_url: { url: a.dataUrl } });
    }

    messages.push({ role: "user", content: imageAtts.length ? userContent : textPart });

    const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        temperature: 0.5,
        messages,
        response_format: { type: "json_object" },
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
    const raw: string = data?.choices?.[0]?.message?.content || "";
    if (!raw.trim()) {
      return new Response(JSON.stringify({ error: "Resposta vazia do modelo ao editar o site." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Try to extract first JSON object
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) {
        try { parsed = JSON.parse(m[0]); } catch { /* noop */ }
      }
    }

    if (!parsed || typeof parsed !== "object") {
      return new Response(JSON.stringify({
        action: "chat",
        message: raw?.slice(0, 800) || "Não consegui processar a resposta. Reformula o pedido?",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const action = parsed.action === "edit" || parsed.action === "plan" ? parsed.action : "chat";
    let newHtml: string | undefined;

    if (action === "edit") {
      newHtml = String(parsed.html || "")
        .replace(/^```html\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      if (!newHtml.toLowerCase().includes("<html")) {
        return new Response(JSON.stringify({
          action: "chat",
          message: "Não consegui gerar HTML válido para esta alteração. Podes detalhar mais?",
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({
      action,
      message: typeof parsed.message === "string" && parsed.message.trim()
        ? parsed.message.trim()
        : action === "edit"
          ? "Fiz a alteração pedida no site."
          : action === "plan"
            ? "Aqui está o plano proposto."
            : "Posso ajudar-te com alterações, estrutura, conteúdo, imagens e navegação do site.",
      html: newHtml,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
