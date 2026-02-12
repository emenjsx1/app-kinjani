import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppBlastRequest {
  recipients: { phone: string; name?: string }[];
  message: string;
  instanceName: string;
  mediaUrl?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipients, message, instanceName, mediaUrl } = await req.json() as WhatsAppBlastRequest;

    if (!recipients || recipients.length === 0) {
      throw new Error("Nenhum destinatário fornecido");
    }
    if (!message) {
      throw new Error("Mensagem é obrigatória");
    }
    if (!instanceName) {
      throw new Error("Nome da instância é obrigatório");
    }
    if (recipients.length > 50) {
      throw new Error("Máximo de 50 destinatários por disparo para evitar bloqueio");
    }

    const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL") || "https://evolution.akiba.ao";
    const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
    if (!EVOLUTION_API_KEY) {
      throw new Error("EVOLUTION_API_KEY não configurada");
    }

    console.log(`Sending WhatsApp blast to ${recipients.length} recipients via ${instanceName}`);

    const results: { phone: string; success: boolean; error?: string }[] = [];
    let sentCount = 0;
    let failedCount = 0;

    // Send messages one by one with delay to avoid WhatsApp rate limits
    for (const recipient of recipients) {
      try {
        // Format phone number - remove spaces, dashes, ensure country code
        let phone = recipient.phone.replace(/[\s\-\(\)]/g, "");
        if (!phone.startsWith("+")) {
          phone = phone.startsWith("258") ? phone : `258${phone}`;
        } else {
          phone = phone.substring(1);
        }

        const personalizedMessage = message.replace(/\{\{name\}\}/g, recipient.name || "");

        const endpoint = mediaUrl 
          ? `${EVOLUTION_API_URL}/message/sendMedia/${instanceName}`
          : `${EVOLUTION_API_URL}/message/sendText/${instanceName}`;

        const body = mediaUrl 
          ? {
              number: phone,
              mediatype: "image",
              media: mediaUrl,
              caption: personalizedMessage,
            }
          : {
              number: phone,
              text: personalizedMessage,
            };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            apikey: EVOLUTION_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error(`Failed to send to ${phone}:`, errorData);
          failedCount++;
          results.push({ phone: recipient.phone, success: false, error: errorData });
        } else {
          sentCount++;
          results.push({ phone: recipient.phone, success: true });
        }

        // Delay between messages (3-5 seconds random) to avoid WhatsApp blocking
        const delay = 3000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } catch (err) {
        failedCount++;
        results.push({ phone: recipient.phone, success: false, error: err.message });
      }
    }

    console.log(`WhatsApp blast complete: ${sentCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sentCount,
        failedCount,
        total: recipients.length,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("WhatsApp blast error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
