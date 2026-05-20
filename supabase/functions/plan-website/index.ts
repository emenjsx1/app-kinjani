import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_SECTION_TYPES = [
  "hero","about","services","features","gallery","team",
  "testimonials","pricing","faq","contact","cta","booking",
] as const;

const SYSTEM_PROMPT = `Tu és um director criativo sénior de uma agência premium tipo Lovable / Linear / Stripe. Recebes QUALQUER pedido de website e desenhas um site completo, único, bespoke — NUNCA template genérico.

═══════════════════════════════════════════════
EXIGÊNCIAS DE QUALIDADE (não negociáveis)
═══════════════════════════════════════════════

1. **MARCA**: Inventa um nome de marca real, memorável e curto (2-3 palavras MAX). NUNCA uses descrições genéricas como "Clínica de Psicologia", "Empresa de Construção", "Consultório Dentário". Exemplos bons: "Lume", "Sereno Mente", "Aurora Build", "Branco Smile", "Vértice Capital".

2. **PALETA**: Escolhe paleta sofisticada e coerente com o setor. NUNCA azul genérico. Pensa em moodboard real:
   - Psicologia/wellness → tons terrosos, sage, off-white, terracota suave
   - Fintech/luxo → preto profundo + dourado, navy + champagne
   - Construção → laranja queimado + grafite + bege
   - Dental → branco quente + verde menta + dourado champagne
   - Restaurante → bordeaux + creme + verde-oliva
   HSL sem o prefixo hsl(). Ex: "30 25% 96%", "168 24% 22%".

3. **TIPOGRAFIA**: Escolhe Google Font expressiva. Combina com o mood. Ex: "Fraunces", "Cormorant Garamond", "Space Grotesk", "Plus Jakarta Sans", "Instrument Serif", "DM Serif Display".

4. **SECÇÕES** (6 a 9 secções, ordem narrativa, variedade obrigatória):
   - Inclui SEMPRE: hero, about (ou features), services, contact
   - Acrescenta consoante o setor: team (com 3-4 membros realistas), testimonials (2-3 com nomes/cargos reais e portugueses), faq (3-5 perguntas reais do setor), gallery (6 imagens), pricing, booking, cta.
   - Se o pedido mencionar marcação/consulta/agendamento → inclui secção "booking" com serviços extraídos.

5. **COPY**: Profissional, calorosa, específica do setor — NUNCA placeholders ("Serviço 1", "Lorem", "Funcionalidade 1"). Cada serviço, FAQ, testimonial tem texto real e completo (2-3 frases).

6. **IMAGENS**: Para cada secção que tem imagens (hero bannerUrl, team memberXImage, gallery imageX), preenche com URL Unsplash relevante:
   \`https://images.unsplash.com/photo-XXX?w=1200&q=80\`
   Usa fotos REAIS do setor (psicologia → terapia, sofá, plantas; dental → sorrisos, clínica branca; construção → obras, capacete; etc). Se não conheceres ID válido, usa formato:
   \`https://source.unsplash.com/1200x800/?<keywords>\`
   Ex: \`https://source.unsplash.com/1200x800/?psychology,therapy,calm\`.

7. **CONTACTOS**: Extrai email/telefone/morada do prompt. Se ausentes, inventa coerentes com a marca/local (ex: \`hello@<brandslug>.pt\`, \`+351 912 ...\`, "Av. da Liberdade 245, Lisboa").

═══════════════════════════════════════════════
CHAVES DE CONTENT POR TIPO DE SECÇÃO
═══════════════════════════════════════════════

hero: { headline, subheadline, ctaText, ctaSecondaryText, bannerUrl }
about: { title, description, mission, imageUrl }
services: { title, subtitle, service1Title, service1Description, service2Title, service2Description, ... até 6 }
features: { title, feature1Title, feature1Description, feature2Title, ..., feature3Title, feature3Description }
team: { title, subtitle, member1Name, member1Role, member1Image, member1Bio, member2Name, ... (3-4 membros, imagens Unsplash de retrato real) }
testimonials: { title, testimonial1Text, testimonial1Author, testimonial1Role, testimonial2Text, testimonial2Author, testimonial2Role, ... }
gallery: { title, subtitle, image1, image2, image3, image4, image5, image6 (URLs Unsplash reais) }
pricing: { title, plan1Name, plan1Price, plan1Features, plan2Name, plan2Price, plan2Features, plan3Name, plan3Price, plan3Features }
faq: { title, faq1Question, faq1Answer, faq2Question, faq2Answer, faq3Question, faq3Answer, faq4Question, faq4Answer }
contact: { title, subtitle, email, phone, whatsappNumber, address }
cta: { title, description, buttonText }
booking: { title, subtitle, service1Title, service1Description, ... (até 6), slots ("09:00, 10:00, ..."), phone, whatsappNumber }

REGRA FINAL: Devolve APENAS JSON. NÃO adicionas markdown, prefixos, código de bloco. APENAS o objeto JSON do plano completo.`;

const PLAN_SCHEMA = {
  name: "website_plan",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["brand", "tagline", "type", "domainLabel", "contact", "palette", "font", "sections"],
    properties: {
      brand: { type: "string", description: "Nome de marca curto, memorável e inventado (NUNCA descrição genérica)" },
      tagline: { type: "string" },
      type: { type: "string", enum: ["landing", "institutional"] },
      domainLabel: { type: "string" },
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
          primary: { type: "string" },
          secondary: { type: "string" },
          accent: { type: "string" },
          background: { type: "string" },
          text: { type: "string" },
        },
      },
      font: { type: "string" },
      sections: {
        type: "array",
        minItems: 5,
        maxItems: 10,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["type", "title", "content"],
          properties: {
            type: { type: "string", enum: [...ALLOWED_SECTION_TYPES] },
            title: { type: "string" },
            content: { type: "object", additionalProperties: true },
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

    const userMessage = `PEDIDO DO UTILIZADOR:
"""
${prompt}
"""

Nome sugerido (se quiseres ignorar e inventar melhor, ignora): ${websiteName ?? "(nenhum)"}

Devolve o plano completo conforme schema. Lembra-te: nome de marca real e curto, paleta sofisticada do setor, 6-9 secções variadas, copy completa e profissional, imagens Unsplash relevantes em cada slot de imagem.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_schema", json_schema: PLAN_SCHEMA },
        temperature: 0.85,
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      if (resp.status === 429) return new Response(JSON.stringify({ success: false, error: "rate_limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ success: false, error: "payment_required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway ${resp.status}`);
    }

    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) throw new Error("Resposta vazia do modelo ao planear o website");
    const plan = typeof raw === "string" ? JSON.parse(raw) : raw;

    console.log("plan-website OK:", plan.brand, "→", plan.sections?.length, "secções");

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
