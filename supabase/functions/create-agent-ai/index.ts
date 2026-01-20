import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateAgentRequest {
  description: string;
  businessName: string;
  niche: string;
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
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
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    // Parse JSON from response
    let parsedContent;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("Failed to parse AI response as JSON");
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
