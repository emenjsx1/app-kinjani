import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}

type ChatMsg = { role: "user" | "assistant"; content: string };

const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  "atendimento-faq": "És um assistente de atendimento ao cliente profissional e amigável. Responde dúvidas de forma clara, curta e empática.",
  "captura-leads": "És um assistente especializado em captura de leads. Inicia conversas naturais, identifica interesses e recolhe contactos de forma não intrusiva.",
  qualificacao: "És um assistente de qualificação BANT (Budget, Authority, Need, Timeline). Classifica leads em Hot/Warm/Cold.",
  "follow-up": "És um assistente de follow-up. Verifica interesse, oferece informação adicional e agenda próximos passos. Persistente mas respeitoso.",
  agendamento: "És um assistente de agendamento. Confirma data, hora, local/link e envia lembretes quando apropriado.",
};

const BASE_RULES = `\n\nRegras gerais:\n- Responde em Português europeu (PT-PT) por defeito, espelhando a língua do utilizador se for diferente.\n- Mantém respostas concisas, profissionais e úteis.\n- Usa o histórico recente da conversa para preservar contexto, nomes, pedidos e continuidade.\n- Se o utilizador pedir algo que exija um humano, encaminha de forma clara.`;

function extractIncomingWhatsAppText(message: Record<string, any> | undefined): string | null {
  if (!message) return null;

  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.documentMessage?.caption ||
    message.buttonsResponseMessage?.selectedButtonId ||
    message.listResponseMessage?.title ||
    null
  );
}

type IncomingMedia = {
  kind: 'audio' | 'image' | 'document' | 'video';
  mimeType: string;
  caption?: string;
  fileName?: string;
};

function detectIncomingMedia(message: Record<string, any> | undefined): IncomingMedia | null {
  if (!message) return null;
  if (message.audioMessage) {
    return { kind: 'audio', mimeType: message.audioMessage.mimetype || 'audio/ogg' };
  }
  if (message.imageMessage) {
    return { kind: 'image', mimeType: message.imageMessage.mimetype || 'image/jpeg', caption: message.imageMessage.caption };
  }
  if (message.documentMessage) {
    return {
      kind: 'document',
      mimeType: message.documentMessage.mimetype || 'application/pdf',
      caption: message.documentMessage.caption,
      fileName: message.documentMessage.fileName,
    };
  }
  if (message.videoMessage) {
    return { kind: 'video', mimeType: message.videoMessage.mimetype || 'video/mp4', caption: message.videoMessage.caption };
  }
  return null;
}

async function fetchMediaBase64(instanceKey: string, payloadData: Record<string, any>): Promise<string | null> {
  const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
  const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');
  if (!evolutionApiUrl || !evolutionApiKey) return null;
  try {
    const res = await fetch(`${evolutionApiUrl}/chat/getBase64FromMediaMessage/${instanceKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': evolutionApiKey },
      body: JSON.stringify({ message: { key: payloadData.key, message: payloadData.message }, convertToMp4: false }),
    });
    if (!res.ok) {
      console.error('Evolution getBase64 failed:', res.status, await res.text());
      return null;
    }
    const data = await res.json();
    return data.base64 || data.media || null;
  } catch (e) {
    console.error('fetchMediaBase64 error:', e);
    return null;
  }
}

// Send message via Evolution API using the correct instance name
async function sendWhatsAppMessage(instanceKey: string, phone: string, message: string): Promise<boolean> {
  const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
  const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');

  if (!evolutionApiUrl || !evolutionApiKey) {
    console.error('Evolution API credentials not configured');
    return false;
  }

  const normalizedPhone = phone.replace(/\D/g, '');
  
  try {
    const response = await fetch(`${evolutionApiUrl}/message/sendText/${instanceKey}`, {
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
      console.error('Evolution API send error:', errorText);
      return false;
    }

    console.log(`Message sent to ${normalizedPhone} via instance ${instanceKey}`);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}


type GeminiPart = { text?: string; inline_data?: { mime_type: string; data: string } };

async function generateAgentResponse(
  messages: ChatMsg[],
  agentPrompt: string,
  agentType?: string,
  lastUserExtraParts: GeminiPart[] = [],
): Promise<string> {
  const geminiKey = Deno.env.get('GEMINI_API_KEY');

  if (!geminiKey) {
    console.error('GEMINI_API_KEY not configured');
    return 'Desculpe, não consigo processar sua mensagem no momento.';
  }

  const baseSystem = AGENT_SYSTEM_PROMPTS[agentType || ''] || AGENT_SYSTEM_PROMPTS['atendimento-faq'];
  const systemText = (agentPrompt ? `${baseSystem}\n\nInstruções específicas:\n${agentPrompt}` : baseSystem) + BASE_RULES;

  const contents = messages.map((message, idx) => {
    const parts: GeminiPart[] = [{ text: message.content }];
    if (idx === messages.length - 1 && message.role === 'user' && lastUserExtraParts.length) {
      parts.push(...lastUserExtraParts);
    }
    return {
      role: message.role === 'assistant' ? 'model' : 'user',
      parts,
    };
  });

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemText }] },
        contents,
        generationConfig: { maxOutputTokens: 700, temperature: 0.7 },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return 'Desculpe, ocorreu um erro ao processar sua mensagem.';
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const text = parts.map((part: { text?: string }) => part.text || '').join('').trim();
    return text || 'Não foi possível gerar uma resposta.';
  } catch (error) {
    console.error('Error generating AI response:', error);
    return 'Desculpe, ocorreu um erro ao processar sua mensagem.';
  }
}

async function loadConversationHistory(instanceKey: string, jid: string): Promise<ChatMsg[]> {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('wa_conversations')
    .select('history')
    .eq('instance_key', instanceKey)
    .eq('jid', jid)
    .maybeSingle();

  return Array.isArray(data?.history) ? data.history as ChatMsg[] : [];
}

async function saveConversationHistory(input: {
  instanceKey: string;
  jid: string;
  phone: string;
  userId?: string | null;
  agentId?: string | null;
  history: ChatMsg[];
}) {
  const supabase = getServiceClient();
  if (!input.userId) return;

  await supabase.from('wa_conversations').upsert({
    user_id: input.userId,
    agent_id: input.agentId,
    instance_key: input.instanceKey,
    jid: input.jid,
    phone: input.phone,
    history: input.history,
    last_message_at: new Date().toISOString(),
  }, { onConflict: 'instance_key,jid' });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Webhook from Evolution API
    if (action === 'webhook') {
      const instanceKey = url.searchParams.get('instance');
      const payload = await req.json();
      console.log('Webhook received for instance:', instanceKey, 'event:', payload.event);

      // Only process incoming messages
      if (payload.event !== 'messages.upsert' && payload.event !== 'MESSAGES_UPSERT') {
        // Handle connection updates
        if (payload.event === 'connection.update' || payload.event === 'CONNECTION_UPDATE') {
          const state = payload.data?.state || payload.data?.status;
          console.log('Connection update:', state);
          
          if (instanceKey && state) {
            const supabase = getServiceClient();
            const status = state === 'open' ? 'connected' : 'disconnected';
            await supabase
              .from('whatsapp_instances')
              .update({ 
                status,
                ...(status === 'connected' ? { connected_at: new Date().toISOString() } : {})
              })
              .eq('instance_key', instanceKey);
          }
        }
        
        return new Response(JSON.stringify({ status: 'ignored' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Ignore messages sent by us
      if (payload.data?.key?.fromMe) {
        return new Response(JSON.stringify({ status: 'ignored_own' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Extract user message + media
      const rawMessage = payload.data?.message;
      const userMessage = extractIncomingWhatsAppText(rawMessage);
      const media = detectIncomingMedia(rawMessage);

      if (!userMessage && !media) {
        console.log('No supported content in payload');
        return new Response(JSON.stringify({ status: 'no_text' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const remoteJid = payload.data.key.remoteJid;
      const senderPhone = remoteJid.replace('@s.whatsapp.net', '');

      // Fetch media base64 (if any) and build extra parts + guidance
      const extraParts: GeminiPart[] = [];
      const mediaHints: string[] = [];
      if (media) {
        const b64 = await fetchMediaBase64(instanceKey!, payload.data);
        if (b64) {
          extraParts.push({ inline_data: { mime_type: media.mimeType, data: b64 } });
          if (media.kind === 'audio') mediaHints.push('[O utilizador enviou uma mensagem de voz. Transcreve mentalmente e responde ao que ele realmente disse.]');
          else if (media.kind === 'image') mediaHints.push(`[O utilizador enviou uma imagem${media.caption ? ` com a legenda: "${media.caption}"` : ''}. Analisa o conteúdo visual e responde.]`);
          else if (media.kind === 'document') mediaHints.push(`[O utilizador enviou um documento${media.fileName ? ` "${media.fileName}"` : ''}. Lê o conteúdo e responde.]`);
          else if (media.kind === 'video') mediaHints.push(`[O utilizador enviou um vídeo${media.caption ? ` com legenda: "${media.caption}"` : ''}. Considera o conteúdo.]`);
        } else {
          mediaHints.push(`[O utilizador enviou um ${media.kind} mas não foi possível descarregar o ficheiro. Pede para reenviar.]`);
        }
      }

      const normalizedUserMessage = [userMessage, ...mediaHints].filter(Boolean).join('\n') || '[anexo multimédia]';
      console.log(`Message from ${senderPhone}: "${normalizedUserMessage}" (media: ${media?.kind || 'none'})`);


      // Look up the instance and linked agent in the database
      const supabase = getServiceClient();
      
      const { data: instance } = await supabase
        .from('whatsapp_instances')
        .select('id, agent_id, user_id')
        .eq('instance_key', instanceKey)
        .single();

      let agentPrompt = 'Você é um assistente virtual profissional. Responda de forma amigável e útil em português.';
      let agentType = 'atendimento-faq';
      let resolvedAgentId = instance?.agent_id || null;

      // First try: agent_id from whatsapp_instances
      // Second try: find agent where instance_id matches this whatsapp instance
      if (!resolvedAgentId && instance?.id) {
        const { data: linkedAgent } = await supabase
          .from('agents')
          .select('id, prompt, name')
          .eq('instance_id', instance.id)
          .eq('status', 'active')
          .limit(1)
          .single();

        if (linkedAgent) {
          resolvedAgentId = linkedAgent.id;
          if (linkedAgent.prompt) {
            agentPrompt = linkedAgent.prompt;
          }
          console.log(`Using agent "${linkedAgent.name}" (found via agents.instance_id)`);
          
          // Sync agent_id back to whatsapp_instances for future lookups
          await supabase
            .from('whatsapp_instances')
            .update({ agent_id: linkedAgent.id })
            .eq('id', instance.id);
        }
      }

      if (resolvedAgentId && agentPrompt === 'Você é um assistente virtual profissional. Responda de forma amigável e útil em português.') {
        const { data: agent } = await supabase
          .from('agents')
          .select('prompt, name, type_id')
          .eq('id', resolvedAgentId)
          .single();

        if (agent?.prompt) {
          agentPrompt = agent.prompt;
          console.log(`Using agent "${agent.name}" prompt`);
        }
        if (agent?.type_id) {
          agentType = agent.type_id;
        }
      }
      
      if (!resolvedAgentId) {
        console.log('No agent linked to this instance, using default prompt');
      }

      const priorHistory = await loadConversationHistory(instanceKey!, remoteJid);
      const trimmedHistory = priorHistory.slice(-12);
      const convo: ChatMsg[] = [...trimmedHistory, { role: 'user', content: normalizedUserMessage }];

      // Generate AI response
      const agentResponse = await generateAgentResponse(convo, agentPrompt, agentType, extraParts);
      console.log(`AI response generated (${agentResponse.length} chars)`);

      await saveConversationHistory({
        instanceKey: instanceKey!,
        jid: remoteJid,
        phone: senderPhone,
        userId: instance?.user_id,
        agentId: resolvedAgentId,
        history: [...convo, { role: 'assistant', content: agentResponse }].slice(-20),
      });

      // Send response back via WhatsApp
      const sent = await sendWhatsAppMessage(instanceKey!, senderPhone, agentResponse);

      // Update agent message count
      if (sent && resolvedAgentId) {
        await supabase.rpc('increment_trial_usage', { user_uuid: instance.user_id, usage_type: 'messages' }).catch(() => {});
        await supabase
          .from('agents')
          .update({ messages_handled: 1 })
          .eq('id', resolvedAgentId);
      }

      return new Response(JSON.stringify({ status: 'success', sent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Manual send endpoint
    if (action === 'send') {
      const { phone, message, instanceKey } = await req.json();

      if (!phone || !message) {
        return new Response(JSON.stringify({ error: 'Phone and message are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const key = instanceKey || 'default';
      const success = await sendWhatsAppMessage(key, phone, message);

      return new Response(JSON.stringify({ success }), {
        status: success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Test connection endpoint
    if (action === 'test') {
      const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
      const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');

      if (!evolutionApiUrl || !evolutionApiKey) {
        return new Response(JSON.stringify({ connected: false, error: 'Not configured' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        const response = await fetch(`${evolutionApiUrl}/instance/fetchInstances`, {
          headers: { 'apikey': evolutionApiKey },
        });
        const instances = await response.json();
        
        return new Response(JSON.stringify({ connected: true, instances }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ connected: false, error: String(error) }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Reconfigure webhook for an instance
    if (action === 'setup-webhook') {
      const instanceKey = url.searchParams.get('instance');
      if (!instanceKey) {
        return new Response(JSON.stringify({ error: 'Instance key required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
      const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const webhookUrl = `${supabaseUrl}/functions/v1/whatsapp-agent?action=webhook&instance=${instanceKey}`;

      // First check current webhook config
      let currentWebhook = null;
      try {
        const findRes = await fetch(`${evolutionApiUrl}/webhook/find/${instanceKey}`, {
          headers: { 'apikey': evolutionApiKey! },
        });
        if (findRes.ok) {
          currentWebhook = await findRes.json();
        }
      } catch (e) {
        console.log('Could not fetch current webhook:', e);
      }

      // Set webhook
      const webhookResponse = await fetch(`${evolutionApiUrl}/webhook/set/${instanceKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evolutionApiKey!,
        },
        body: JSON.stringify({
          enabled: true,
          url: webhookUrl,
          webhookByEvents: false,
          events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE'],
        }),
      });

      const webhookResult = webhookResponse.ok ? await webhookResponse.json() : await webhookResponse.text();

      return new Response(JSON.stringify({ 
        success: webhookResponse.ok,
        webhookUrl,
        currentWebhook,
        result: webhookResult,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in whatsapp-agent:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
