import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppMessage {
  phone: string;
  message: string;
  agentPrompt?: string;
}

interface EvolutionWebhookPayload {
  event: string;
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
    };
    message?: {
      conversation?: string;
      extendedTextMessage?: {
        text: string;
      };
    };
  };
}

// Função para enviar mensagem via Evolution API
async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
  const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');

  if (!evolutionApiUrl || !evolutionApiKey) {
    console.error('Evolution API credentials not configured');
    throw new Error('Evolution API credentials not configured');
  }

  // Normalizar número de telefone
  const normalizedPhone = phone.replace(/\D/g, '');
  
  try {
    const response = await fetch(`${evolutionApiUrl}/message/sendText/default`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey,
      },
      body: JSON.stringify({
        number: normalizedPhone,
        text: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Evolution API error:', errorText);
      return false;
    }

    console.log(`Message sent successfully to ${normalizedPhone}`);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}

// Função para gerar resposta do agente IA
async function generateAgentResponse(userMessage: string, agentPrompt: string): Promise<string> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!lovableApiKey) {
    console.error('LOVABLE_API_KEY not configured');
    return 'Desculpe, não consigo processar sua mensagem no momento. Tente novamente mais tarde.';
  }

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: agentPrompt || 'Você é um assistente virtual amigável e profissional. Responda de forma clara e concisa.',
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      return 'Desculpe, ocorreu um erro ao processar sua mensagem.';
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Não foi possível gerar uma resposta.';
  } catch (error) {
    console.error('Error generating AI response:', error);
    return 'Desculpe, ocorreu um erro ao processar sua mensagem.';
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Webhook para receber mensagens do WhatsApp
    if (action === 'webhook') {
      const payload: EvolutionWebhookPayload = await req.json();
      console.log('Webhook received:', JSON.stringify(payload));

      // Ignorar mensagens enviadas por nós
      if (payload.data?.key?.fromMe) {
        return new Response(JSON.stringify({ status: 'ignored' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Extrair mensagem do usuário
      const userMessage = payload.data?.message?.conversation || 
                         payload.data?.message?.extendedTextMessage?.text;

      if (!userMessage) {
        return new Response(JSON.stringify({ status: 'no_message' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const senderPhone = payload.data.key.remoteJid.replace('@s.whatsapp.net', '');
      
      // Gerar resposta do agente
      const agentResponse = await generateAgentResponse(
        userMessage,
        'Você é um assistente virtual profissional. Responda de forma amigável e útil em português.'
      );

      // Enviar resposta
      await sendWhatsAppMessage(senderPhone, agentResponse);

      return new Response(JSON.stringify({ 
        status: 'success',
        message: 'Response sent' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Endpoint para enviar mensagem manual
    if (action === 'send') {
      const { phone, message }: WhatsAppMessage = await req.json();

      if (!phone || !message) {
        return new Response(JSON.stringify({ 
          error: 'Phone and message are required' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const success = await sendWhatsAppMessage(phone, message);

      return new Response(JSON.stringify({ 
        success,
        message: success ? 'Message sent' : 'Failed to send message'
      }), {
        status: success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Endpoint para testar conexão
    if (action === 'test') {
      const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
      const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');

      if (!evolutionApiUrl || !evolutionApiKey) {
        return new Response(JSON.stringify({ 
          connected: false,
          error: 'Evolution API credentials not configured'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        const response = await fetch(`${evolutionApiUrl}/instance/fetchInstances`, {
          headers: {
            'apikey': evolutionApiKey,
          },
        });

        const instances = await response.json();
        
        return new Response(JSON.stringify({ 
          connected: true,
          instances: instances
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ 
          connected: false,
          error: errorMessage
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ 
      error: 'Invalid action. Use: webhook, send, or test'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in whatsapp-agent:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
