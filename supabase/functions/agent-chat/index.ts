// Multimodal agent chat — text + image + audio + PDF via Gemini native API
// Streams SSE back to the client. Cobra créditos antes de chamar o modelo.
import { chargeCredits, classifyChatMessage, insufficientCreditsResponse } from "../_shared/credits.ts";

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

function normalizeMime(mime: string): string {
  const clean = mime.toLowerCase().trim();
  if (clean.startsWith("audio/webm")) return "audio/wav";
  if (clean === "audio/mpga") return "audio/mpeg";
  return clean;
}

function buildAttachmentGuidance(attachments: Attachment[] | undefined): string | null {
  if (!attachments?.length) return null;

  const notes = attachments
    .slice(0, 6)
    .map((att, index) => {
      const mime = normalizeMime(att.type || "application/octet-stream");
      if (mime.startsWith("audio/")) {
        return `Anexo ${index + 1}: áudio (${att.name || mime}). Primeiro compreende/transcreve o conteúdo falado; depois responde com base nele.`;
      }
      if (mime === "application/pdf") {
        return `Anexo ${index + 1}: PDF (${att.name || "documento"}). Lê o conteúdo antes de responder.`;
      }
      if (mime.startsWith("image/")) {
        return `Anexo ${index + 1}: imagem (${att.name || mime}). Observa os detalhes visuais relevantes antes de responder.`;
      }
      return null;
    })
    .filter(Boolean);

  return notes.length ? notes.join("\n") : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as AgentChatRequest;
    const { messages, agentType, agentPrompt, attachments } = body;

    const OPENROUTER_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_KEY) {
      return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Charge credits up-front based on attachment type (text vs image/audio/pdf).
    const chargeAction = classifyChatMessage(attachments, 0);
    const charge = await chargeCredits(req, chargeAction, `Mensagem agente (${agentType || "geral"})`);
    if (!charge.ok) return insufficientCreditsResponse(corsHeaders, charge);

    const baseSystem = AGENT_SYSTEM_PROMPTS[agentType || ""] || AGENT_SYSTEM_PROMPTS["atendimento-faq"];
    const systemText = (agentPrompt ? `${baseSystem}\n\nInstruções específicas:\n${agentPrompt}` : baseSystem) + BASE_RULES;

    // Detect attachments to pick a vision-capable model when needed.
    const hasImage = Array.isArray(attachments) && attachments.some((a) => {
      const inline = dataUrlToInlineData(a?.dataUrl);
      return inline && normalizeMime(inline.mime_type).startsWith("image/");
    });

    // Build OpenAI-compatible messages. Inject attachment guidance into the last user turn.
    const lastUserIdx = (() => {
      for (let i = messages.length - 1; i >= 0; i--) if (messages[i].role === "user") return i;
      return -1;
    })();

    const orMessages: any[] = [{ role: "system", content: systemText }];
    messages.forEach((m, i) => {
      const role = m.role === "assistant" ? "assistant" : "user";
      if (i === lastUserIdx && Array.isArray(attachments) && attachments.length) {
        const guidance = buildAttachmentGuidance(attachments) || "";
        const text = `${guidance}\n\nMensagem do utilizador: ${m.content || "(ver anexos)"}`.trim();
        if (hasImage) {
          const parts: any[] = [{ type: "text", text }];
          for (const att of attachments.slice(0, 6)) {
            const inline = dataUrlToInlineData(att.dataUrl);
            if (!inline) continue;
            const mime = normalizeMime(inline.mime_type);
            if (!mime.startsWith("image/") || !isSupportedMime(mime)) continue;
            parts.push({ type: "image_url", image_url: { url: `data:${mime};base64,${inline.data}` } });
          }
          orMessages.push({ role, content: parts });
        } else {
          orMessages.push({ role, content: text });
        }
      } else {
        orMessages.push({ role, content: m.content || "" });
      }
    });

    // AGENTS / REASONING → deepseek by default; switch to a vision model when images are present.
    const model = hasImage ? "qwen/qwen-2.5-vl-72b-instruct" : "deepseek/deepseek-chat";

    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        "HTTP-Referer": "https://kinjani.ai",
        "X-Title": "Kinjani AI",
      },
      body: JSON.stringify({
        model,
        stream: true,
        temperature: 0.7,
        max_tokens: 1024,
        messages: orMessages,
      }),
    });

    if (!upstream.ok) {
      const txt = await upstream.text();
      console.error("OpenRouter error", upstream.status, txt);
      const status = upstream.status === 429 || upstream.status === 402 ? upstream.status : 500;
      const msg =
        upstream.status === 429
          ? "Limite de pedidos excedido. Tenta novamente em alguns segundos."
          : upstream.status === 402
          ? "Créditos OpenRouter esgotados. Adiciona créditos em openrouter.ai."
          : `Erro do modelo: ${upstream.status}`;
      return new Response(JSON.stringify({ error: msg, detail: txt.slice(0, 400) }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // OpenRouter already streams OpenAI-style SSE deltas — pass through as-is.
    return new Response(upstream.body, {
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
