// Conversational website editor.
// Classifies intent (chat / plan / edit), and in edit mode returns full new HTML.
// Supports image attachments (vision) and embeds uploaded images directly into the page when relevant.
// Cobrança proporcional: pré-cobra 5 créd; após geração ajusta para o nível real (micro/small/medium/large/massive).
import { chargeCredits, classifyEditByTokens, CREDIT_COSTS, insufficientCreditsResponse, resolveUserId } from "../_shared/credits.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

const UNSPLASH_URL_PATTERN = /https?:\/\/(?:images|source)\.unsplash\.com\/[^"'\s)<>]+/gi;

function sanitizeSeed(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "image";
}

function fallbackHeight(width: number) {
  if (width <= 320) return width;
  if (width <= 640) return Math.round(width * 0.75);
  return Math.round(width * 0.5625);
}

function normalizeImageUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    let width = Number(url.searchParams.get("w")) || 1600;
    let height = Number(url.searchParams.get("h")) || fallbackHeight(width);
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
    const { html, instruction, history, mode, attachments } = await req.json();
    if (!html || !instruction) {
      return new Response(JSON.stringify({ error: "html and instruction required" }), {
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


    // Pré-cobra "small" (5 créd). Após geração, ajustamos para o nível real com base nos tokens de output.
    const userId = await resolveUserId(req);
    const preCharge = await chargeCredits(req, "site_edit_small", "Edição de site (pré-cobrança)");
    if (!preCharge.ok) return insufficientCreditsResponse(corsHeaders, preCharge);

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

    const wantStream = req.headers.get("accept")?.includes("text/event-stream") === true;

    const editBody: Record<string, unknown> = {
      model: aiModel,
      messages,
      response_format: { type: "json_object" },
      stream: wantStream,
      temperature: 0.5,
    };
    if (useOpenAI) editBody.max_tokens = 16000;

    const resp = await fetch(aiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(editBody),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return new Response(JSON.stringify({ error: `AI gateway error: ${resp.status} ${txt}` }), {
        status: resp.status === 429 || resp.status === 402 ? resp.status : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---------- Streaming branch: forward incremental text to the client ----------
    if (wantStream && resp.body) {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      const stream = new ReadableStream({
        async start(controller) {
          const reader = resp.body!.getReader();
          const settleCharge = async () => {
            // Adjust pricing based on real output size. tokens ≈ chars / 4.
            const approxTokens = Math.ceil(fullText.length / 4);
            const realAction = classifyEditByTokens(approxTokens);
            const realCost = CREDIT_COSTS[realAction];
            const alreadyCharged = CREDIT_COSTS["site_edit_small"]; // 5
            const diff = realCost - alreadyCharged;
            if (diff > 0 && userId) {
              try {
                const svc = createClient(
                  Deno.env.get("SUPABASE_URL")!,
                  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
                  { auth: { persistSession: false } },
                );
                await svc.rpc("deduct_credits", {
                  _user_id: userId,
                  _action: realAction,
                  _amount: diff,
                  _description: `Edição site (ajuste para ${realAction})`,
                });
              } catch (e) { console.error("edit top-up failed", e); }
            } else if (diff < 0 && userId) {
              try {
                const svc = createClient(
                  Deno.env.get("SUPABASE_URL")!,
                  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
                  { auth: { persistSession: false } },
                );
                await svc.rpc("add_credits", {
                  _user_id: userId,
                  _amount: -diff,
                  _action: "refund_edit",
                  _description: `Reembolso edição (real: ${realAction})`,
                });
              } catch (e) { console.error("edit refund failed", e); }
            }
          };
          const flushFinal = () => {
            controller.enqueue(encoder.encode(`\n__KINJANI_END__${JSON.stringify({ raw: fullText })}\n`));
          };
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";
              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith("data:")) continue;
                const payload = trimmed.slice(5).trim();
                if (payload === "[DONE]") continue;
                try {
                  const j = JSON.parse(payload);
                  const delta = j?.choices?.[0]?.delta?.content || "";
                  if (delta) {
                    fullText += delta;
                    controller.enqueue(encoder.encode(delta));
                  }
                } catch { /* skip */ }
              }
            }
            await settleCharge();
            flushFinal();
          } catch (e) {
            controller.enqueue(encoder.encode(`\n__KINJANI_ERROR__${(e as Error).message}\n`));
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "X-Accel-Buffering": "no",
        },
      });
    }

    // ---------- Non-streaming branch (legacy / fallback) ----------
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
      newHtml = normalizeGeneratedHtml(String(parsed.html || "")
        .replace(/^```html\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim());
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
