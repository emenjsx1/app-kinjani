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

// Generate AI response using the agent's prompt
async function generateAgentResponse(userMessage: string, agentPrompt: string): Promise<string> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiKey) {
    console.error('OPENAI_API_KEY not configured');
    return 'Desculpe, não consigo processar sua mensagem no momento.';
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: agentPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
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

      // Extract user message
      const userMessage = payload.data?.message?.conversation || 
                         payload.data?.message?.extendedTextMessage?.text;

      if (!userMessage) {
        console.log('No text message in payload');
        return new Response(JSON.stringify({ status: 'no_text' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const senderPhone = payload.data.key.remoteJid.replace('@s.whatsapp.net', '');
      console.log(`Message from ${senderPhone}: "${userMessage}"`);

      // Look up the instance and linked agent in the database
      const supabase = getServiceClient();
      
      const { data: instance } = await supabase
        .from('whatsapp_instances')
        .select('id, agent_id, user_id')
        .eq('instance_key', instanceKey)
        .single();

      let agentPrompt = 'Você é um assistente virtual profissional. Responda de forma amigável e útil em português.';
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
          .select('prompt, name')
          .eq('id', resolvedAgentId)
          .single();

        if (agent?.prompt) {
          agentPrompt = agent.prompt;
          console.log(`Using agent "${agent.name}" prompt`);
        }
      }
      
      if (!resolvedAgentId) {
        console.log('No agent linked to this instance, using default prompt');
      }

      // Generate AI response
      const agentResponse = await generateAgentResponse(userMessage, agentPrompt);
      console.log(`AI response generated (${agentResponse.length} chars)`);

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
