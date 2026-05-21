import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebsiteGenerationRequest {
  websiteType: "landing" | "institutional";
  niche: string;
  templateName: string;
  prompt: string;
  websiteName: string;
  sections: string[];
}

const SYSTEM_PROMPT = `Tu és um DIRETOR CRIATIVO e copywriter sénior para websites em Português de Portugal.

A tua missão NÃO é preencher um template — é DESENHAR uma experiência única que reflete o prompt do cliente.

ANTI-TEMPLATE — REGRAS CRÍTICAS:
1. NUNCA escrevas títulos genéricos ("Os Nossos Serviços", "Sobre Nós", "Bem-vindo"). Inventa títulos com personalidade que falam diretamente do negócio.
2. NUNCA repitas o ritmo de copy entre sites. Varia comprimento, tom, ponto de vista (1ª pessoa, manifesto, declaração, pergunta).
3. NUNCA uses jargão SaaS ("Soluções inovadoras", "Excelência", "Qualidade superior"). Sê concreto, sensorial, específico.
4. Headlines DEVEM ter atitude — uma promessa ousada, um insight, uma provocação ou um manifesto curto. Evita frases neutras.
5. Subheadlines explicam o ângulo único, não repetem a headline.
6. Cada secção deve ter VOZ PRÓPRIA. Não soes a manual corporativo.

REGRAS GERAIS:
- Português de Portugal sempre
- Adapta TOM ao prompt do cliente (premium dark = sóbrio e cortante; playful = leve e direto; editorial = narrativo)
- CTAs ativos e específicos ao negócio ("Reservar mesa para 2", "Candidatar à mentoria", "Ver coleção outono") — nunca "Saber mais" genérico
- Testemunhos com nomes, cargos e detalhes credíveis e específicos
- Quando o prompt menciona formulário, captação, ou perguntas — o copy do CTA e Contact deve assumir esse contexto (não generalizar)

FORMATO:
Responde APENAS com JSON válido, sem markdown ou texto adicional. Inclui apenas as secções pedidas.`;


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { websiteType, niche, templateName, prompt, websiteName, sections } = 
      await req.json() as WebsiteGenerationRequest;

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
    const aiModel = useOpenAI ? "gpt-4o-mini" : "gemini-2.5-flash";

    const uniqueSeed = Math.random().toString(36).substring(2, 8);
    const userPrompt = `
[ID ÚNICO: ${uniqueSeed}] - Gera conteúdo ORIGINAL e ÚNICO para este website:

TIPO: ${websiteType === "landing" ? "Landing Page" : "Site Institucional"}
NICHO: ${niche}
TEMPLATE: ${templateName}
NOME DO NEGÓCIO: ${websiteName}

DESCRIÇÃO DO CLIENTE:
${prompt}

SECÇÕES A GERAR:
${sections.join(", ")}

Para cada secção, gera conteúdo apropriado. Usa o seguinte formato JSON:

{
  "hero": {
    "headline": "Título principal impactante",
    "subheadline": "Subtítulo explicativo",
    "ctaText": "Texto do botão principal",
    "ctaSecondaryText": "Texto do botão secundário"
  },
  "about": {
    "title": "Título da secção",
    "description": "Descrição do negócio (2-3 frases)",
    "mission": "Missão da empresa (1 frase)"
  },
  "services": {
    "title": "Título da secção",
    "subtitle": "Subtítulo",
    "service1Title": "Nome do serviço 1",
    "service1Description": "Descrição breve",
    "service2Title": "Nome do serviço 2",
    "service2Description": "Descrição breve",
    "service3Title": "Nome do serviço 3",
    "service3Description": "Descrição breve"
  },
  "features": {
    "title": "Título da secção",
    "feature1Title": "Característica 1",
    "feature1Description": "Descrição breve",
    "feature2Title": "Característica 2",
    "feature2Description": "Descrição breve",
    "feature3Title": "Característica 3",
    "feature3Description": "Descrição breve"
  },
  "testimonials": {
    "title": "Título da secção",
    "testimonial1Text": "Testemunho do cliente 1",
    "testimonial1Author": "Nome do cliente",
    "testimonial1Role": "Cargo/Papel",
    "testimonial2Text": "Testemunho do cliente 2",
    "testimonial2Author": "Nome do cliente",
    "testimonial2Role": "Cargo/Papel"
  },
  "cta": {
    "title": "Título do CTA",
    "description": "Descrição persuasiva",
    "buttonText": "Texto do botão"
  },
  "contact": {
    "title": "Título da secção",
    "subtitle": "Subtítulo",
    "email": "email@exemplo.pt",
    "phone": "+351 XXX XXX XXX",
    "address": "Localização"
  },
  "team": {
    "title": "Título da secção",
    "subtitle": "Subtítulo",
    "member1Name": "Nome do membro 1",
    "member1Role": "Cargo",
    "member2Name": "Nome do membro 2",
    "member2Role": "Cargo"
  },
  "faq": {
    "title": "Título da secção",
    "faq1Question": "Pergunta 1",
    "faq1Answer": "Resposta 1",
    "faq2Question": "Pergunta 2",
    "faq2Answer": "Resposta 2"
  }
}

Gera APENAS as secções solicitadas: ${sections.join(", ")}
`;

    console.log("Generating website content for:", websiteName);
    console.log("Sections to generate:", sections);

    const reqBody: Record<string, unknown> = {
      model: aiModel,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: useOpenAI ? 1.0 : 1.05,
    };
    reqBody.max_tokens = 2400;
    const response = await fetch(aiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqBody),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente mais tarde." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos à sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    console.log("Raw AI response:", content);

    // Parse the JSON response
    let parsedContent;
    try {
      // Try to extract JSON from the response (in case there's extra text)
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

    console.log("Successfully generated content for:", websiteName);

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: parsedContent,
        websiteName 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Website content generation error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
