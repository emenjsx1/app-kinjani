import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI } from "../_shared/ai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_SECTION_TYPES = [
  "hero","about","services","features","gallery","team",
  "testimonials","pricing","faq","contact","cta","booking","counter","image-text",
] as const;

const SYSTEM_PROMPT = `Tu és um director criativo sénior de uma agência premium tipo Lovable / Linear / Stripe. Recebes QUALQUER pedido de website e desenhas um site completo, único, bespoke — NUNCA template genérico.

═══════════════════════════════════════════════
EXIGÊNCIAS DE QUALIDADE (não negociáveis)
═══════════════════════════════════════════════

1. **MARCA**: Se o utilizador der nome de marca/negócio explícito, usa-o EXATAMENTE. Só inventas nome quando não houver nenhum.

2. **PALETA**: Escolhe paleta sofisticada e coerente com o setor. NUNCA azul genérico. Pensa em moodboard real:
   - Psicologia/wellness → tons terrosos, sage, off-white, terracota suave
   - Fintech/luxo → preto profundo + dourado, navy + champagne
   - Construção → laranja queimado + grafite + bege
   - Dental → branco quente + verde menta + dourado champagne
   - Restaurante → bordeaux + creme + verde-oliva
   HSL sem o prefixo hsl(). Ex: "30 25% 96%", "168 24% 22%".

3. **TIPOGRAFIA**: Escolhe Google Font expressiva. Combina com o mood. Ex: "Fraunces", "Cormorant Garamond", "Space Grotesk", "Plus Jakarta Sans", "Instrument Serif", "DM Serif Display".

4. **SECÇÕES** (6 a 10 secções, ordem narrativa, variedade obrigatória):
   - Inclui SEMPRE: hero, about (ou features), services, contact
   - Acrescenta consoante o setor: team (com 3-4 membros realistas), testimonials (2-3 com nomes/cargos reais e portugueses), faq (3-5 perguntas reais do setor), gallery (6 imagens), pricing, booking, cta.
   - Se o pedido mencionar marcação/consulta/agendamento → inclui secção "booking" com serviços extraídos.
    - Se o pedido mencionar estatísticas / números / prova → inclui "counter".
    - Se o pedido mencionar before/after / antes e depois / transformações → inclui "image-text" com copy orientada a transformação visual.
    - Se o pedido for landing page, NÃO cries páginas internas nem rotas.

5. **COPY**: Profissional, calorosa, específica do setor — NUNCA placeholders ("Serviço 1", "Lorem", "Funcionalidade 1"). Cada serviço, FAQ, testimonial tem texto real e completo (2-3 frases).

6. **IMAGENS**: Para cada secção que tem imagens (hero bannerUrl, team memberXImage, gallery imageX, image-text image), preenche com URL remota RELEVANTE AO SETOR.
   - Dental premium: usa apenas keywords como dental clinic, dentist portrait, smile makeover, orthodontics, veneers, luxury clinic interior, dental technology.
   - NUNCA uses imagens irrelevantes, animais, natureza aleatória, lifestyle sem contexto clínico, ou placeholders absurdos.

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
counter: { title, counter1Value, counter1Suffix, counter1Label, counter2Value, counter2Suffix, counter2Label, counter3Value, counter3Suffix, counter3Label, counter4Value, counter4Suffix, counter4Label }
image-text: { title, description, image, imagePosition, ctaText }

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
        maxItems: 12,
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

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) throw new Error("GEMINI_API_KEY não configurada.");

    const userMessage = `PEDIDO DO UTILIZADOR:
"""
${prompt}
"""

Nome da marca/negócio: ${websiteName ?? "(nenhum)"}

Devolve EXCLUSIVAMENTE um objecto JSON puro (NÃO wrappes em "plan" ou outra chave) com EXACTAMENTE estes campos top-level: brand, tagline, type, domainLabel, contact{email,phone,address}, palette{primary,secondary,accent,background,text}, font, sections. Usa a marca dada pelo utilizador se existir. Se o prompt pedir Montserrat + Inter, devolve font como "Montserrat, Inter". Se o prompt pedir landing page dental de luxo, garante estética white/beige premium, secções coerentes e sem rotas inventadas.`;

    const ai = await callAI({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.55,
      geminiModel: "gemini-2.5-flash",
    });

    const raw = ai.content;
    if (!raw) throw new Error("Resposta vazia do modelo ao planear o website");
    let plan = typeof raw === "string" ? JSON.parse(raw) : raw;
    // Some models wrap the plan in { plan: {...} } or { website_plan: {...} }; unwrap.
    if (plan && typeof plan === "object" && !plan.brand && !plan.sections) {
      plan = plan.plan ?? plan.website_plan ?? plan;
    }

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
