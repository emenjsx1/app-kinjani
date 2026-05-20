import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AgentChatRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  agentType: string;
  agentPrompt: string;
}

// System prompts por tipo de agente
const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  "atendimento-faq": `Você é um assistente de atendimento ao cliente profissional e amigável.
Suas responsabilidades:
- Responder dúvidas frequentes de forma clara e concisa
- Ser educado e empático com os clientes
- Oferecer soluções práticas para problemas comuns
- Encaminhar casos complexos quando necessário
Mantenha respostas curtas e objetivas.`,
  
  "captura-leads": `Você é um assistente especializado em captura de leads.
Suas responsabilidades:
- Iniciar conversas de forma amigável e natural
- Identificar necessidades e interesses do visitante
- Coletar informações de contacto (nome, email, telefone) de forma não intrusiva
- Qualificar o interesse do lead
Seja persuasivo mas não agressivo.`,
  
  "qualificacao": `Você é um assistente de qualificação de leads.
Suas responsabilidades:
- Fazer perguntas estratégicas para entender o perfil do lead
- Classificar leads como Hot (pronto para comprar), Warm (interessado) ou Cold (apenas curioso)
- Identificar orçamento, prazo e necessidades específicas
- Registrar informações relevantes para a equipa de vendas
Use técnicas BANT (Budget, Authority, Need, Timeline).`,
  
  "follow-up": `Você é um assistente de follow-up automático.
Suas responsabilidades:
- Fazer seguimento de contactos anteriores
- Verificar se o cliente ainda tem interesse
- Oferecer informações adicionais relevantes
- Agendar próximos passos quando apropriado
Seja persistente mas respeitoso.`,
  
  "agendamento": `Você é um assistente de agendamento.
Suas responsabilidades:
- Ajudar a marcar reuniões e compromissos
- Verificar disponibilidade e preferências
- Confirmar detalhes (data, hora, local/link)
- Enviar lembretes quando necessário
Seja eficiente e organizado.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, agentType, agentPrompt }: AgentChatRequest = await req.json();
    
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Construir system prompt baseado no tipo + prompt personalizado
    const baseSystemPrompt = AGENT_SYSTEM_PROMPTS[agentType] || AGENT_SYSTEM_PROMPTS["atendimento-faq"];
    const systemPrompt = agentPrompt 
      ? `${baseSystemPrompt}\n\nInstruções adicionais do utilizador:\n${agentPrompt}`
      : baseSystemPrompt;

    console.log("Agent chat request:", { agentType, messagesCount: messages.length });

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Por favor, tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Por favor, adicione créditos à sua conta." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao processar mensagem" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Agent chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
