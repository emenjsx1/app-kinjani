import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI } from "../_shared/ai.ts";

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

REFERÊNCIA DE QUALIDADE:
- O utilizador quer resultado ao nível de um site real codado manualmente por um frontend developer, com linguagem mais humana, específica e premium.
- O conteúdo deve sustentar layouts ricos e secções distintas, não cards genéricos repetidos.

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
- Se o prompt especificar marca, estilo, tipografia, paleta, setor e lista de secções, segue isso literalmente.
- Se o negócio for saúde/dental, o tom deve soar premium, clínico, humano e credível — nunca genérico nem corporativo barato.
- NUNCA inventes secções fora das pedidas.
- NUNCA escrevas copy que pareça outro setor.
- NUNCA uses títulos tipo placeholder, copy de agência genérica ou linguagem de template de clínica barata.
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

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      throw new Error("GEMINI_API_KEY não configurada.");
    }

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

REGRAS IMPORTANTES:
- Se o prompt pedir landing page, pensa em narrativa one-page.
- Se o prompt pedir dental premium / luxo / branco e bege / Montserrat + Inter / modern medical UI, o copy deve refletir exatamente isso.
- Se pedirem Before/After ou transformações, devolve isso como secção image-text com linguagem de transformação estética e confiança clínica.
- Se pedirem Statistics ou números, devolve secção counter.
- O utilizador quer um nível de realismo alto: nomes, provas, benefícios, descrições e FAQs devem soar plausíveis e específicos.
- Não inventes termos de outros nichos nem promessas vagas.

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
  },
  "counter": {
    "title": "Título da secção",
    "counter1Value": "1500",
    "counter1Suffix": "+",
    "counter1Label": "Sorrisos reabilitados",
    "counter2Value": "98",
    "counter2Suffix": "%",
    "counter2Label": "Pacientes que recomendam",
    "counter3Value": "12",
    "counter3Suffix": " anos",
    "counter3Label": "De prática especializada"
  },
  "image-text": {
    "title": "Título da transformação",
    "description": "Descrição do antes/depois e do impacto estético-funcional.",
    "image": "https://images.unsplash.com/...",
    "imagePosition": "left",
    "ctaText": "Marcar avaliação"
  }
}

Gera APENAS as secções solicitadas: ${sections.join(", ")}
`;

    console.log("Generating website content for:", websiteName);
    console.log("Sections to generate:", sections);

    const ai = await callAI({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      geminiModel: "gemini-2.5-flash",
    });
    const content = ai.content;

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
