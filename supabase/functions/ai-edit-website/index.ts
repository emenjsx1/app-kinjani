import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { instruction, template, websiteName } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("API key not configured");

    const systemPrompt = `És um assistente que edita templates de websites. Recebes um template JSON e uma instrução do utilizador.

REGRAS:
- Devolve APENAS um objeto JSON válido com "message" (string curta) e "template" (o template modificado)
- Interpreta instruções em português (PT-PT)
- Para cores, usa formato HSL: "210 100% 50%"
- Para textos, mantém o português europeu
- Se não conseguires fazer a alteração, explica porquê na "message" e devolve o template original

Exemplo de resposta:
{"message": "Cor primária alterada para azul!", "template": {...}}`;

    const userPrompt = `Template atual do site "${websiteName}":
${JSON.stringify(template, null, 2)}

Instrução do utilizador: "${instruction}"

Devolve o JSON com a alteração aplicada.`;

    console.log("Calling AI gateway with instruction:", instruction);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${apiKey}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 8000,
        temperature: 0.7,
      }),
    });

    console.log("AI response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("AI response received");
    
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No valid JSON in response:", content);
      throw new Error("No valid JSON in response");
    }

    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ success: true, message: result.message, template: result.template }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
