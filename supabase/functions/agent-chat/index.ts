// Multimodal agent chat — text + image + audio + PDF via Gemini native API
// Streams SSE back to the client.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ChatMsg = { role: "user" | "assistant"; content: string };
type Attachment = { type: string; name?: string; dataUrl: string };

interface AgentChatRequest {
  messages: ChatMsg[];
  agentType?: string;
  agentPrompt?: string;
  attachments?: Attachment[];
}

const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  "atendimento-faq":
    "És um assistente de atendimento ao cliente profissional e amigável. Responde dúvidas de forma clara, curta e empática.",
  "captura-leads":
    "És um assistente especializado em captura de leads. Inicia conversas naturais, identifica interesses e recolhe contactos de forma não intrusiva.",
  "qualificacao":
    "És um assistente de qualificação BANT (Budget, Authority, Need, Timeline). Classifica leads em Hot/Warm/Cold.",
  "follow-up":
    "És um assistente de follow-up. Verifica interesse, oferece informação adicional e agenda próximos passos. Persistente mas respeitoso.",
  "agendamento":
    "És um assistente de agendamento. Confirma data, hora, local/link e envia lembretes quando apropriado.",
};

const BASE_RULES = `\n\nRegras gerais:\n- Responde em Português europeu (PT-PT) por defeito, espelhando a língua do utilizador se for diferente.\n- Se receberes uma imagem, descreve-a e age sobre o que vês (ex: recibo, captura de ecrã, documento, produto).\n- Se receberes um áudio, transcreve-o mentalmente e responde ao conteúdo falado.\n- Se receberes um PDF, lê o conteúdo e responde com base nele (resume, extrai, valida).\n- Mantém respostas concisas, profissionais e úteis.`;

function dataUrlToInlineData(dataUrl: string): { mime_type: string; data: string } | null {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return null;
  return { mime_type: m[1], data: m[2] };
}

function isSupportedMime(mime: string): boolean {
  return (
    mime.startsWith("image/") ||
    mime.startsWith("audio/") ||
    mime === "application/pdf"
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as AgentChatRequest;
    const { messages, agentType, agentPrompt, attachments } = body;

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const baseSystem = AGENT_SYSTEM_PROMPTS[agentType || ""] || AGENT_SYSTEM_PROMPTS["atendimento-faq"];
    const systemText = (agentPrompt ? `${baseSystem}\n\nInstruções específicas:\n${agentPrompt}` : baseSystem) + BASE_RULES;

    // Build contents in Gemini native format.
    // History messages become text-only `parts`. The LAST user turn carries attachments.
    const lastUserIdx = (() => {
      for (let i = messages.length - 1; i >= 0; i--) if (messages[i].role === "user") return i;
      return -1;
    })();

    const contents = messages.map((m, i) => {
      const role = m.role === "assistant" ? "model" : "user";
      const parts: any[] = [];
      if (m.content && m.content.trim()) parts.push({ text: m.content });

      if (i === lastUserIdx && Array.isArray(attachments) && attachments.length) {
        for (const att of attachments.slice(0, 6)) {
          const inline = dataUrlToInlineData(att.dataUrl);
          if (!inline || !isSupportedMime(inline.mime_type)) continue;
          parts.push({ inline_data: inline });
        }
      }

      if (parts.length === 0) parts.push({ text: "" });
      return { role, parts };
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemText }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!upstream.ok) {
      const txt = await upstream.text();
      console.error("Gemini error", upstream.status, txt);
      const status = upstream.status === 429 || upstream.status === 402 ? upstream.status : 500;
      const msg =
        upstream.status === 429
          ? "Limite de pedidos excedido. Tenta novamente em alguns segundos."
          : upstream.status === 402
          ? "Créditos esgotados. Adiciona créditos à conta."
          : `Erro do modelo: ${upstream.status}`;
      return new Response(JSON.stringify({ error: msg, detail: txt.slice(0, 400) }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Transform Gemini SSE -> OpenAI-style SSE deltas so the existing client parser keeps working.
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let buffer = "";

    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader();
        const emit = (text: string) => {
          const payload = { choices: [{ delta: { content: text } }] };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        };
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const raw of lines) {
              const line = raw.trim();
              if (!line.startsWith("data:")) continue;
              const payload = line.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;
              try {
                const j = JSON.parse(payload);
                const cand = j?.candidates?.[0];
                const parts = cand?.content?.parts || [];
                for (const p of parts) {
                  if (typeof p?.text === "string" && p.text.length) emit(p.text);
                }
              } catch {
                // skip malformed
              }
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (e) {
          console.error("stream error", e);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(e) })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e) {
    console.error("agent-chat fatal", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
