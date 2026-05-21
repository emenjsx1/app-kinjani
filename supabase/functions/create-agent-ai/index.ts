import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { chargeCredits, insufficientCreditsResponse } from "../_shared/credits.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateAgentRequest {
  description: string;
  businessName: string;
  niche: string;
}

const CREATE_AGENT_JSON_SCHEMA = {
  name: "create_agent_response",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      name: { type: "string" },
      type: {
        type: "string",
        enum: ["faq", "leads", "qualificacao", "follow-up", "agendamento"],
      },
      typeLabel: { type: "string" },
      prompt: { type: "string" },
      description: { type: "string" },
    },
    required: ["name", "type", "typeLabel", "prompt", "description"],
  },
  strict: true,
};

function extractJsonObject(raw: string) {
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error("No JSON found in response");
    }

    return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
  }
}

function normalizeAgentPayload(payload: Record<string, unknown>, businessName: string, niche: string) {
  const allowedTypes = new Set(["faq", "leads", "qualificacao", "follow-up", "agendamento"]);
  const rawType = String(payload.type ?? "faq").trim().toLowerCase();
  const type = allowedTypes.has(rawType) ? rawType : "faq";

  const fallbackLabels: Record<string, string> = {
    faq: "FAQ",
    leads: "Captação de Leads",
    qualificacao: "Qualificação",
    "follow-up": "Follow-up",
    agendamento: "Agendamento",
  };

  return {
    name: String(payload.name ?? `${businessName} AI`).trim() || `${businessName} AI`,
    type,
    typeLabel: String(payload.typeLabel ?? fallbackLabels[type]).trim() || fallbackLabels[type],
    prompt: String(payload.prompt ?? "").trim(),
    description:
      String(payload.description ?? "").trim() ||
      `Agente de IA para ${businessName} no setor de ${niche}.`,
  };
}

const SYSTEM_PROMPT = `Tu és um especialista em criar prompts para agentes de IA conversacionais.
A tua tarefa é criar um prompt completo e profissional para um agente de chatbot baseado na descrição do utilizador.

REGRAS:
1. O prompt deve estar em Português de Portugal
2. Inclui instruções claras sobre tom, personalidade e comportamento
3. Define limites claros sobre o que o agente deve e não deve fazer
4. Inclui exemplos de como responder
5. O prompt deve ser profissional e eficaz

FORMATO DE RESPOSTA:
Responde com JSON válido no seguinte formato:
{
  "name": "Nome sugerido para o agente",
  "type": "faq | leads | qualificacao | follow-up | agendamento",
  "typeLabel": "Label legível do tipo",
  "prompt": "O prompt completo para o agente",
  "description": "Descrição curta do que o agente faz"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, businessName, niche } = await req.json() as CreateAgentRequest;

    if (!description?.trim() || !businessName?.trim() || !niche?.trim()) {
      return new Response(
        JSON.stringify({ error: "description, businessName e niche são obrigatórios", success: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const API_KEY = openaiKey || geminiKey;
    if (!API_KEY) {
      throw new Error("Nenhuma API key de IA configurada (OPENAI_API_KEY ou GEMINI_API_KEY)");
    }
    const useOpenAI = !!openaiKey;
    const aiUrl = useOpenAI
      ? "https://api.openai.com/v1/chat/completions"
      : "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
    const aiModel = useOpenAI ? "gpt-5-mini" : "gemini-2.5-flash";

    // Cobra 5 créditos antes de gerar o agente.
    const charge = await chargeCredits(req, "agent_create_ai", `Criação agente AI: ${businessName}`);
    if (!charge.ok) return insufficientCreditsResponse(corsHeaders, charge);

    const userPrompt = `
Cria um agente de IA para o seguinte negócio:

NOME DO NEGÓCIO: ${businessName}
NICHO: ${niche}

DESCRIÇÃO DO UTILIZADOR:
${description}

Cria um prompt profissional e completo que defina:
- A personalidade e tom do agente
- Os conhecimentos que deve ter
- Como deve interagir com os utilizadores
- Limites do que pode e não pode fazer
- Exemplos de respostas típicas

Responde apenas com JSON válido.
`;

    console.log(`Creating AI agent for ${businessName}`);

    const response = await fetch(aiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.6,
        response_format: useOpenAI ? { type: "json_object" } : { type: "json_schema", json_schema: CREATE_AGENT_JSON_SCHEMA },
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente mais tarde.", success: false }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos à sua conta.", success: false }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      throw new Error(`AI Gateway error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const finishReason = data.choices?.[0]?.finish_reason;

    if (finishReason === "length" || finishReason === "MAX_TOKENS") {
      throw new Error("A resposta da IA foi truncada antes de terminar.");
    }

    if (!content) {
      throw new Error("No content received from AI");
    }

    let rawContent = "";
    if (typeof content === "string") {
      rawContent = content;
    } else if (Array.isArray(content)) {
      rawContent = content
        .map((part) => typeof part?.text === "string" ? part.text : "")
        .join("\n")
        .trim();
    }

    if (!rawContent) {
      throw new Error("Empty AI response content");
    }

    let parsedContent;
    try {
      parsedContent = normalizeAgentPayload(extractJsonObject(rawContent), businessName, niche);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, rawContent);
      throw new Error("Failed to parse AI response as JSON");
    }

    if (!parsedContent.prompt) {
      throw new Error("AI response did not include a valid prompt");
    }

    console.log(`Successfully created agent configuration for ${businessName}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        agent: parsedContent,
        creditsUsed: 2
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Agent creation error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
