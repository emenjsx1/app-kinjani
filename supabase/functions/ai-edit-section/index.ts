import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EditSectionRequest {
  sectionType: string;
  currentContent: Record<string, string>;
  instruction: string;
  websiteName: string;
  niche: string;
}

const SYSTEM_PROMPT = `Tu és um especialista em copywriting para websites em Português de Portugal.
A tua tarefa é editar/melhorar o conteúdo de uma secção específica de um website baseado nas instruções do utilizador.

REGRAS:
1. Todo o conteúdo DEVE estar em Português de Portugal
2. Mantém a estrutura existente, apenas melhora os textos
3. Segue as instruções do utilizador precisamente
4. Sê criativo mas profissional
5. Responde APENAS com JSON válido

FORMATO: Responde apenas com o JSON da secção atualizada, mantendo as mesmas chaves.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sectionType, currentContent, instruction, websiteName, niche } = 
      await req.json() as EditSectionRequest;

    const OPENROUTER_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const userPrompt = `
Edita o conteúdo desta secção "${sectionType}" para o website "${websiteName}" (nicho: ${niche}).

CONTEÚDO ATUAL:
${JSON.stringify(currentContent, null, 2)}

INSTRUÇÃO DO UTILIZADOR:
${instruction}

Responde apenas com o JSON atualizado da secção, mantendo todas as chaves existentes.
`;

    console.log(`Editing section ${sectionType} for ${websiteName}`);
    console.log("Instruction:", instruction);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen-2.5-coder-32b-instruct",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
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

    console.log(`Successfully edited section ${sectionType}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: parsedContent,
        creditsUsed: 1
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Section edit error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
