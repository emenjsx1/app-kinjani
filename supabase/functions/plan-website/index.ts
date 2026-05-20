import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_SECTION_TYPES = [
  "hero","about","services","features","gallery","team",
  "testimonials","pricing","faq","contact","cta","booking",
] as const;

const SYSTEM_PROMPT = `Tu és um arquiteto sénior de websites. Analisas QUALQUER pedido do utilizador (em qualquer idioma, qualquer setor) e devolves um plano JSON estruturado para construir o website pedido.

REGRAS ABSOLUTAS:
1. Cria APENAS o que foi pedido. Não inventes secções fora do pedido.
2. Se o utilizador pediu "marcação de consulta com seleção de serviço, horário e formulário" — inclui uma secção do tipo "booking" com os serviços extraídos.
3. Se o utilizador pediu páginas específicas (Home, Sobre, Contacto, Portfólio...) cria UMA secção por bloco lógico.
4. Extrai contactos (email, telefone, morada) reais do prompt quando presentes.
5. Texto em Português de Portugal por defeito (excepto se o prompt estiver claramente noutra língua).
6. Cada secção tem um "type" do enum permitido e um objeto "content" com as chaves típicas (headline/subheadline para hero; title/description para about; service1Title... para services; etc.).
7. NÃO devolvas comentários nem texto fora do JSON.

ENUM section.type permitido: ${ALLOWED_SECTION_TYPES.join(", ")}.`;

const PLAN_SCHEMA = {
  name: "website_plan",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["brand", "tagline", "type", "domainLabel", "contact", "palette", "font", "sections"],
    properties: {
      brand: { type: "string" },
      tagline: { type: "string" },
      type: { type: "string", enum: ["landing", "institutional"] },
      domainLabel: { type: "string", description: "Ex: Clínica Dentária, Construção Civil, Restaurante" },
      contact: {
        type: "object",
        additionalProperties: false,
        required: ["email", "phone", "address"],
        properties: {
          email: { type: "string" },
          phone: { type: "string" },
          address: { type: "string" },
        },
      },
      palette: {
        type: "object",
        additionalProperties: false,
        required: ["primary", "secondary", "accent", "background", "text"],
        properties: {
          primary: { type: "string", description: "HSL sem hsl(): ex '24 88% 54%'" },
          secondary: { type: "string" },
          accent: { type: "string" },
          background: { type: "string" },
          text: { type: "string" },
        },
      },
      font: { type: "string", description: "Família google font, ex 'Inter', 'Plus Jakarta Sans'" },
      sections: {
        type: "array",
        minItems: 3,
        maxItems: 10,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["type", "title", "content"],
          properties: {
            type: { type: "string", enum: [...ALLOWED_SECTION_TYPES] },
            title: { type: "string" },
            content: {
              type: "object",
              additionalProperties: true,
            },
          },
        },
      },
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, websiteName } = await req.json() as { prompt: string; websiteName?: string };
    if (!prompt || prompt.trim().length < 8) throw new Error("Prompt demasiado curto");

    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY missing");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Nome sugerido (opcional): ${websiteName ?? "(nenhum)"}\n\nPEDIDO DO UTILIZADOR:\n${prompt}` },
        ],
        response_format: { type: "json_schema", json_schema: PLAN_SCHEMA },
        temperature: 0.6,
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      if (resp.status === 429) return new Response(JSON.stringify({ error: "rate_limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "payment_required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway ${resp.status}`);
    }

    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) throw new Error("Resposta vazia");
    const plan = typeof raw === "string" ? JSON.parse(raw) : raw;

    return new Response(JSON.stringify({ success: true, plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("plan-website error:", message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
