import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScrapeLeadsRequest {
  query: string;
  location?: string;
  limit?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, location, limit = 10 } = await req.json() as ScrapeLeadsRequest;

    if (!query || query.trim().length < 3) {
      throw new Error("Pesquisa deve ter pelo menos 3 caracteres");
    }

    const GEMINI_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("OPENROUTER_API_KEY não configurada");
    }

    const searchQuery = location 
      ? `${query} em ${location} contacto telefone email site`
      : `${query} contacto telefone email site`;

    console.log(`Scraping leads for: "${searchQuery}", limit: ${limit}`);

    // Use Lovable AI to extract structured data from search results
    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-3-27b-it",
        messages: [
          {
            role: "system",
            content: `Tu és um assistente que gera leads realistas baseadas em pesquisas de negócios. 
Gera leads fictícias mas realistas para o tipo de negócio pesquisado.

REGRAS:
- Gera exatamente o número pedido de leads
- Cada lead deve ter: nome da empresa, contacto (nome), telefone, email, website, cidade, categoria
- Os dados devem parecer realistas para o mercado lusófono (Portugal, Moçambique, Brasil, Angola)
- Telefones no formato internacional
- Responde APENAS com JSON válido

FORMATO:
{
  "leads": [
    {
      "company": "Nome da Empresa",
      "contact": "Nome do Contacto",
      "phone": "+258 84 XXX XXXX",
      "email": "email@empresa.co.mz",
      "website": "www.empresa.co.mz",
      "city": "Maputo",
      "category": "Categoria do negócio",
      "source": "AI Generated"
    }
  ]
}`
          },
          {
            role: "user",
            content: `Gera ${limit} leads para: "${query}"${location ? ` na localização: ${location}` : ""}. Responde apenas com JSON válido.`
          }
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Limite de requisições excedido. Tente novamente mais tarde." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "Créditos insuficientes." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Sem resposta da IA");
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Resposta inválida da IA");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const leads = parsed.leads || [];

    console.log(`Generated ${leads.length} leads for "${query}"`);

    return new Response(
      JSON.stringify({
        success: true,
        leads,
        query,
        location,
        count: leads.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Scrape leads error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
