// Multimodal agent chat — text + image + audio + PDF via Gemini native API or OpenAI API
// Streams SSE back to the client. Cobra créditos antes de chamar o modelo.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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
    const body = (await req.json()) as (AgentChatRequest & { agentId?: string });
    const { messages, agentType, agentPrompt, agentId, attachments } = body;

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Resolve owner's user_id for notifications / credentials
    let userId = "";
    if (agentId) {
      const { data: agentData } = await supabaseClient
        .from("agents")
        .select("user_id")
        .eq("id", agentId)
        .maybeSingle();
      if (agentData?.user_id) {
        userId = agentData.user_id;
      }
    }

    if (!userId) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const token = authHeader.split(" ")[1];
        const { data: userData } = await supabaseClient.auth.getUser(token);
        if (userData?.user?.id) {
          userId = userData.user.id;
        }
      }
    }

    // Charge credits up-front based on attachment type (text vs image/audio/pdf).
    const chargeAction = classifyChatMessage(attachments, 0);
    const charge = await chargeCredits(req, chargeAction, `Mensagem agente (${agentType || "geral"})`, 1, userId || null);
    if (!charge.ok) return insufficientCreditsResponse(corsHeaders, charge);

    const insertNotification = async (title: string, message: string, type: string) => {
      if (!userId) return;
      await supabaseClient.from("notifications").insert({
        user_id: userId,
        title,
        message,
        type,
        is_read: false
      });
    };

    // Load user's custom API keys
    let openaiKey: string | null = null;
    let geminiKey: string | null = null;

    if (userId) {
      try {
        const { data: keysData, error: keysError } = await supabaseClient
          .from("user_api_keys")
          .select("provider, api_key_encrypted, is_valid")
          .eq("user_id", userId);
        
        if (!keysError && keysData) {
          const oaKey = keysData.find(k => k.provider === "openai" && k.is_valid);
          if (oaKey?.api_key_encrypted) {
            openaiKey = atob(oaKey.api_key_encrypted);
          }
          const gemKey = keysData.find(k => k.provider === "gemini" && k.is_valid);
          if (gemKey?.api_key_encrypted) {
            geminiKey = atob(gemKey.api_key_encrypted);
          }
        }
      } catch (e) {
        console.error("Error fetching user api keys:", e);
      }
    }

    // Determine active provider & key
    let activeProvider: "gemini" | "openai" = "gemini";
    let activeApiKey = "";

    if (openaiKey) {
      activeProvider = "openai";
      activeApiKey = openaiKey;
    } else if (geminiKey) {
      activeProvider = "gemini";
      activeApiKey = geminiKey;
    } else {
      const globalGemini = Deno.env.get("GEMINI_API_KEY");
      const globalOpenai = Deno.env.get("OPENAI_API_KEY");
      if (globalGemini) {
        activeProvider = "gemini";
        activeApiKey = globalGemini;
      } else if (globalOpenai) {
        activeProvider = "openai";
        activeApiKey = globalOpenai;
      } else {
        return new Response(JSON.stringify({ error: "Nenhuma API Key (Gemini ou OpenAI) configurada para este agente ou sistema." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const baseSystem = AGENT_SYSTEM_PROMPTS[agentType || ""] || AGENT_SYSTEM_PROMPTS["atendimento-faq"];
    const systemText = (agentPrompt ? `${baseSystem}\n\nInstruções específicas:\n${agentPrompt}` : baseSystem) + BASE_RULES;

    const lastUserIdx = (() => {
      for (let i = messages.length - 1; i >= 0; i--) if (messages[i].role === "user") return i;
      return -1;
    })();

    // ────────────────────────────────────────────────────────
    // PROVEDOR: OPENAI
    // ────────────────────────────────────────────────────────
    if (activeProvider === "openai") {
      const openaiMessages: any[] = [
        { role: "system", content: systemText }
      ];

      messages.forEach((m, i) => {
        const role = m.role === "assistant" ? "assistant" : "user";
        if (role === "user" && i === lastUserIdx && Array.isArray(attachments) && attachments.length) {
          const contentParts: any[] = [];
          const attachmentGuidance = buildAttachmentGuidance(attachments);
          if (attachmentGuidance) {
            contentParts.push({ type: "text", text: `${attachmentGuidance}\n\nMensagem do utilizador: ${m.content || "(ver anexos)"}` });
          } else if (m.content) {
            contentParts.push({ type: "text", text: m.content });
          }
          for (const att of attachments) {
            const inline = dataUrlToInlineData(att.dataUrl);
            if (!inline) continue;
            const normalizedMime = normalizeMime(inline.mime_type);
            if (normalizedMime.startsWith("image/")) {
              contentParts.push({
                type: "image_url",
                image_url: {
                  url: att.dataUrl
                }
              });
            }
          }
          openaiMessages.push({ role, content: contentParts });
        } else {
          openaiMessages.push({ role, content: m.content || "" });
        }
      });

      let isFunctionCall = false;
      let functionResult: any = null;
      let functionName = "";
      let functionArgs: any = null;
      let toolCallId = "";

      let openaiTools: any[] | undefined = undefined;
      if (agentType === "agendamento") {
        openaiTools = [
          {
            type: "function",
            function: {
              name: "check_availability",
              description: "Verifica os horários disponíveis para agendamento em determinada data.",
              parameters: {
                type: "object",
                properties: {
                  date: { type: "string", description: "A data a verificar (formato YYYY-MM-DD)" }
                },
                required: ["date"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "book_appointment",
              description: "Cria e confirma um agendamento para o cliente.",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Nome completo do cliente" },
                  date: { type: "string", description: "Data do agendamento (YYYY-MM-DD)" },
                  time: { type: "string", description: "Hora do agendamento (HH:MM)" },
                  service: { type: "string", description: "Serviço ou tipo de consulta pretendida" }
                },
                required: ["name", "date", "time"]
              }
            }
          }
        ];
      } else if (agentType === "controlo-gastos") {
        openaiTools = [
          {
            type: "function",
            function: {
              name: "record_expense",
              description: "Regista uma nova despesa no controlo de gastos.",
              parameters: {
                type: "object",
                properties: {
                  description: { type: "string", description: "Descrição ou item da despesa" },
                  amount: { type: "number", description: "Valor monetário da despesa" },
                  category: { type: "string", description: "Categoria (ex: Alimentação, Transporte, Lazer, Contas)" }
                },
                required: ["description", "amount", "category"]
              }
            }
          }
        ];
      }

      if (openaiTools) {
        try {
          const checkResp = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${activeApiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              temperature: 0.2,
              messages: openaiMessages,
              tools: openaiTools,
            }),
          });

          if (checkResp.ok) {
            const json = await checkResp.json();
            const choice = json?.choices?.[0];
            const toolCall = choice?.message?.tool_calls?.[0];
            if (toolCall) {
              isFunctionCall = true;
              functionName = toolCall.function.name;
              functionArgs = JSON.parse(toolCall.function.arguments);
              toolCallId = toolCall.id;

              if (functionName === "check_availability") {
                functionResult = {
                  available_slots: ["09:00", "10:30", "14:00", "16:30"],
                  message: "Disponíveis para " + functionArgs.date + ": 09:00, 10:30, 14:00 e 16:30"
                };
              } else if (functionName === "book_appointment") {
                const { name, date, time, service } = functionArgs;
                await insertNotification(
                  "Novo Agendamento Marcado",
                  `${name} agendou ${service || "Marcação"} para ${date} às ${time}.`,
                  "appointment"
                );
                functionResult = {
                  status: "success",
                  message: `Agendamento agendado e confirmado para ${name} no dia ${date} às ${time}.`
                };
              } else if (functionName === "record_expense") {
                const { description, amount, category } = functionArgs;
                await insertNotification(
                  "Nova Despesa Registada",
                  `Despesa de ${amount} MZN registada para "${description}" (${category}).`,
                  "expense"
                );
                functionResult = {
                  status: "success",
                  message: `Despesa de ${amount} MZN registada com sucesso!`
                };
              }

              openaiMessages.push({
                role: "assistant",
                content: null,
                tool_calls: [toolCall]
              });

              openaiMessages.push({
                role: "tool",
                tool_call_id: toolCallId,
                name: functionName,
                content: JSON.stringify(functionResult)
              });
            }
          }
        } catch (err) {
          console.error("OpenAI tool call check failed", err);
        }
      }

      const requestBody: any = {
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 1024,
        messages: openaiMessages,
        stream: true,
      };

      const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeApiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!upstream.ok) {
        const txt = await upstream.text();
        console.error("OpenAI error", upstream.status, txt);
        return new Response(JSON.stringify({ error: `Erro do modelo OpenAI: ${upstream.status}`, detail: txt }), {
          status: upstream.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(upstream.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          "X-Accel-Buffering": "no",
        },
      });
    }

    // ────────────────────────────────────────────────────────
    // PROVEDOR: GEMINI
    // ────────────────────────────────────────────────────────
    let tools: any[] | undefined = undefined;
    if (agentType === "agendamento") {
      tools = [{
        function_declarations: [
          {
            name: "check_availability",
            description: "Verifica os horários disponíveis para agendamento em determinada data.",
            parameters: {
              type: "OBJECT",
              properties: {
                date: {
                  type: "STRING",
                  description: "A data a verificar (formato YYYY-MM-DD)"
                }
              },
              required: ["date"]
            }
          },
          {
            name: "book_appointment",
            description: "Cria e confirma um agendamento para o cliente.",
            parameters: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING", description: "Nome completo do cliente" },
                date: { type: "STRING", description: "Data do agendamento (YYYY-MM-DD)" },
                time: { type: "STRING", description: "Hora do agendamento (HH:MM)" },
                service: { type: "STRING", description: "Serviço ou tipo de consulta pretendida" }
              },
              required: ["name", "date", "time"]
            }
          }
        ]
      }];
    } else if (agentType === "controlo-gastos") {
      tools = [{
        function_declarations: [
          {
            name: "record_expense",
            description: "Regista uma nova despesa no controlo de gastos.",
            parameters: {
              type: "OBJECT",
              properties: {
                description: { type: "STRING", description: "Descrição ou item da despesa" },
                amount: { type: "NUMBER", description: "Valor monetário da despesa" },
                category: { type: "STRING", description: "Categoria (ex: Alimentação, Transporte, Lazer, Contas)" }
              },
              required: ["description", "amount", "category"]
            }
          }
        ]
      }];
    }

    const contents = messages.map((m, i) => {
      const role = m.role === "assistant" ? "model" : "user";
      const parts: any[] = [];
      if (m.content && m.content.trim()) parts.push({ text: m.content });

      if (i === lastUserIdx && Array.isArray(attachments) && attachments.length) {
        const attachmentGuidance = buildAttachmentGuidance(attachments);
        if (attachmentGuidance) parts.unshift({ text: `${attachmentGuidance}\n\nMensagem do utilizador: ${m.content || "(ver anexos)"}` });
        for (const att of attachments.slice(0, 6)) {
          const inline = dataUrlToInlineData(att.dataUrl);
          if (!inline) continue;
          const normalizedMime = normalizeMime(inline.mime_type);
          if (!isSupportedMime(normalizedMime)) continue;
          inline.mime_type = normalizedMime;
          parts.push({ inline_data: inline });
        }
      }

      if (parts.length === 0) parts.push({ text: "" });
      return { role, parts };
    });

    let isFunctionCall = false;
    let functionResult: any = null;
    let functionName = "";
    let functionArgs: any = null;

    if (tools) {
      const checkUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeApiKey}`;
      const checkResp = await fetch(checkUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemText }] },
          contents,
          tools,
          generationConfig: { temperature: 0.2 },
        }),
      });

      if (checkResp.ok) {
        const json = await checkResp.json();
        const part = json?.candidates?.[0]?.content?.parts?.[0];
        if (part?.functionCall) {
          isFunctionCall = true;
          functionName = part.functionCall.name;
          functionArgs = part.functionCall.args;

          if (functionName === "check_availability") {
            functionResult = {
              available_slots: ["09:00", "10:30", "14:00", "16:30"],
              message: "Disponíveis para " + functionArgs.date + ": 09:00, 10:30, 14:00 e 16:30"
            };
          } else if (functionName === "book_appointment") {
            const { name, date, time, service } = functionArgs;
            await insertNotification(
              "Novo Agendamento Marcado",
              `${name} agendou ${service || "Marcação"} para ${date} às ${time}.`,
              "appointment"
            );
            functionResult = {
              status: "success",
              message: `Agendamento agendado e confirmado para ${name} no dia ${date} às ${time}.`
            };
          } else if (functionName === "record_expense") {
            const { description, amount, category } = functionArgs;
            await insertNotification(
              "Nova Despesa Registada",
              `Despesa de ${amount} MZN registada para "${description}" (${category}).`,
              "expense"
            );
            functionResult = {
              status: "success",
              message: `Despesa de ${amount} MZN registada com sucesso!`
            };
          }

          contents.push({
            role: "model",
            parts: [{ functionCall: { name: functionName, args: functionArgs } }]
          });

          contents.push({
            role: "function",
            parts: [{
              functionResponse: {
                name: functionName,
                response: functionResult
              }
            }]
          });
        }
      }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${activeApiKey}`;
    const requestBody: any = {
      system_instruction: { parts: [{ text: systemText }] },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    };

    if (tools && !isFunctionCall) {
      requestBody.tools = tools;
    }

    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
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
                // skip
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
