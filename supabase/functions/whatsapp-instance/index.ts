import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateInstanceRequest {
  instanceName: string;
  agentId?: string;
  isForClient?: boolean;
}

// Generate unique client token
function generateClientToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create Supabase client
function getSupabaseClient(authHeader: string | null) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  });
}

// Get service role client for public operations
function getServiceClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, serviceKey);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');

    if (!evolutionApiUrl || !evolutionApiKey) {
      return new Response(JSON.stringify({ 
        error: 'Evolution API not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: Create new instance
    if (action === 'create') {
      const authHeader = req.headers.get('Authorization');
      const supabase = getSupabaseClient(authHeader);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { instanceName, agentId, isForClient }: CreateInstanceRequest = await req.json();

      if (!instanceName) {
        return new Response(JSON.stringify({ error: 'Instance name is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Pre-charge: 50 credits per instance (first month). Cron renews monthly.
      const { data: balanceRow } = await supabase
        .from('profiles')
        .select('credits_balance')
        .eq('user_id', user.id)
        .single();
      if (!balanceRow || balanceRow.credits_balance < 50) {
        return new Response(JSON.stringify({
          error: 'Créditos insuficientes. Cada instância WhatsApp custa 50 créditos/mês.',
          reason: 'insufficient',
          required: 50,
          balance: balanceRow?.credits_balance ?? 0,
          action: 'whatsapp_instance_monthly',
        }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Generate unique instance key
      const instanceKey = `${instanceName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      const clientToken = isForClient ? generateClientToken() : null;

      console.log(`Creating instance: ${instanceKey}`);

      // 1. Create instance in Evolution API
      const createResponse = await fetch(`${evolutionApiUrl}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evolutionApiKey,
        },
        body: JSON.stringify({
          instanceName: instanceKey,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
        }),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('Evolution API create error:', errorText);
        return new Response(JSON.stringify({ 
          error: 'Failed to create instance in Evolution API',
          details: errorText
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const createData = await createResponse.json();
      console.log('Instance created:', createData);

      // 2. Configure webhook automatically
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const webhookUrl = `${supabaseUrl}/functions/v1/whatsapp-agent?action=webhook&instance=${instanceKey}`;

      const webhookResponse = await fetch(`${evolutionApiUrl}/webhook/set/${instanceKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evolutionApiKey,
        },
        body: JSON.stringify({
          enabled: true,
          url: webhookUrl,
          webhookByEvents: false,
          events: [
            'MESSAGES_UPSERT',
            'CONNECTION_UPDATE',
          ],
        }),
      });

      if (!webhookResponse.ok) {
        console.error('Failed to configure webhook:', await webhookResponse.text());
      } else {
        console.log('Webhook configured:', webhookUrl);
      }

      // 3. Get QR code from connect endpoint (separate call)
      let qrCodeBase64 = null;
      try {
        const qrResponse = await fetch(`${evolutionApiUrl}/instance/connect/${instanceKey}`, {
          headers: {
            'apikey': evolutionApiKey,
          },
        });
        if (qrResponse.ok) {
          const qrData = await qrResponse.json();
          qrCodeBase64 = qrData.base64 || qrData.qrcode?.base64 || null;
          console.log('QR code obtained:', qrCodeBase64 ? 'yes' : 'no');
        }
      } catch (e) {
        console.error('Error getting QR code:', e);
      }

      // 4. Deduct 50 credits (monthly fee, first month) via RPC
      try {
        const service = getServiceClient();
        await service.rpc('deduct_credits', {
          _user_id: user.id,
          _action: 'whatsapp_instance_monthly',
          _amount: 50,
          _description: `Instância WhatsApp: ${instanceName}`,
        });
      } catch (e) {
        console.error('deduct_credits failed', e);
      }

      // 5. Save instance to Supabase
      const { data: instance, error: dbError } = await supabase
        .from('whatsapp_instances')
        .insert({
          user_id: user.id,
          agent_id: agentId || null,
          instance_name: instanceName,
          instance_key: instanceKey,
          status: 'disconnected',
          webhook_url: webhookUrl,
          is_for_client: isForClient || false,
          client_token: clientToken,
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        return new Response(JSON.stringify({ 
          error: 'Failed to save instance',
          details: dbError.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        success: true,
        instance,
        qrcode: qrCodeBase64,
        creditsUsed: isForClient ? 5 : 0,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: List user instances
    if (action === 'list') {
      const authHeader = req.headers.get('Authorization');
      const supabase = getSupabaseClient(authHeader);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: instances, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ instances }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: Get QR code for an instance
    if (action === 'qrcode') {
      const instanceKey = url.searchParams.get('instance');
      
      if (!instanceKey) {
        return new Response(JSON.stringify({ error: 'Instance key required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Getting QR code for instance: ${instanceKey}`);

      const qrResponse = await fetch(`${evolutionApiUrl}/instance/connect/${instanceKey}`, {
        headers: {
          'apikey': evolutionApiKey,
        },
      });

      if (!qrResponse.ok) {
        const errorText = await qrResponse.text();
        console.error('QR code error:', errorText);
        return new Response(JSON.stringify({ 
          error: 'Failed to get QR code',
          details: errorText
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const qrData = await qrResponse.json();
      console.log('QR Data received, keys:', Object.keys(qrData));
      
      // Handle different QR code formats from Evolution API
      let qrcode = null;
      if (qrData.base64) {
        qrcode = qrData.base64;
      } else if (qrData.qrcode?.base64) {
        qrcode = qrData.qrcode.base64;
      } else if (qrData.code) {
        qrcode = qrData.code;
      } else if (typeof qrData === 'string') {
        qrcode = qrData;
      }
      
      console.log('QR code extracted:', qrcode ? `${qrcode.substring(0, 50)}...` : 'null');

      return new Response(JSON.stringify({ 
        qrcode,
        status: qrData.state || qrData.instance?.state || 'unknown',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: Get instance status
    if (action === 'status') {
      const instanceKey = url.searchParams.get('instance');
      
      if (!instanceKey) {
        return new Response(JSON.stringify({ error: 'Instance key required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const statusResponse = await fetch(`${evolutionApiUrl}/instance/connectionState/${instanceKey}`, {
        headers: {
          'apikey': evolutionApiKey,
        },
      });

      if (!statusResponse.ok) {
        return new Response(JSON.stringify({ 
          status: 'disconnected',
          error: 'Instance not found'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const statusData = await statusResponse.json();
      const isConnected = statusData.state === 'open' || statusData.instance?.state === 'open';

      // Update status in database if connected
      if (isConnected) {
        const authHeader = req.headers.get('Authorization');
        if (authHeader) {
          const supabase = getSupabaseClient(authHeader);
          await supabase
            .from('whatsapp_instances')
            .update({ 
              status: 'connected',
              connected_at: new Date().toISOString()
            })
            .eq('instance_key', instanceKey);
        }
      }

      return new Response(JSON.stringify({ 
        status: isConnected ? 'connected' : 'disconnected',
        details: statusData,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: Delete instance
    if (action === 'delete') {
      const authHeader = req.headers.get('Authorization');
      const supabase = getSupabaseClient(authHeader);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const instanceKey = url.searchParams.get('instance');
      
      if (!instanceKey) {
        return new Response(JSON.stringify({ error: 'Instance key required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Verify ownership
      const { data: instance } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('instance_key', instanceKey)
        .eq('user_id', user.id)
        .single();

      if (!instance) {
        return new Response(JSON.stringify({ error: 'Instance not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Delete from Evolution API
      try {
        await fetch(`${evolutionApiUrl}/instance/delete/${instanceKey}`, {
          method: 'DELETE',
          headers: {
            'apikey': evolutionApiKey,
          },
        });
      } catch (e) {
        console.error('Error deleting from Evolution:', e);
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('whatsapp_instances')
        .delete()
        .eq('id', instance.id);

      if (deleteError) {
        return new Response(JSON.stringify({ error: deleteError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: Get instance by client token (public)
    if (action === 'client-connect') {
      const token = url.searchParams.get('token');
      
      if (!token) {
        return new Response(JSON.stringify({ error: 'Token required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const serviceClient = getServiceClient();
      
      const { data: instance, error } = await serviceClient
        .from('whatsapp_instances')
        .select('id, instance_name, instance_key, status, is_for_client')
        .eq('client_token', token)
        .eq('is_for_client', true)
        .single();

      if (error || !instance) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get QR code
      const qrResponse = await fetch(`${evolutionApiUrl}/instance/connect/${instance.instance_key}`, {
        headers: {
          'apikey': evolutionApiKey,
        },
      });

      let qrcode = null;
      if (qrResponse.ok) {
        const qrData = await qrResponse.json();
        qrcode = qrData.base64 || qrData.qrcode?.base64 || null;
      }

      return new Response(JSON.stringify({ 
        instance: {
          name: instance.instance_name,
          status: instance.status,
        },
        qrcode,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: Update instance status from webhook
    if (action === 'webhook-status') {
      const { instanceKey, status, phoneNumber } = await req.json();
      
      const serviceClient = getServiceClient();
      
      const updateData: Record<string, unknown> = { status };
      if (phoneNumber) {
        updateData.phone_number = phoneNumber;
      }
      if (status === 'connected') {
        updateData.connected_at = new Date().toISOString();
      }

      await serviceClient
        .from('whatsapp_instances')
        .update(updateData)
        .eq('instance_key', instanceKey);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Invalid action. Use: create, list, qrcode, status, delete, client-connect, webhook-status'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in whatsapp-instance:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
