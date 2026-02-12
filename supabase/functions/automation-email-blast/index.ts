import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailBlastRequest {
  recipients: { email: string; name?: string }[];
  subject: string;
  body: string;
  fromName?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipients, subject, body, fromName } = await req.json() as EmailBlastRequest;

    if (!recipients || recipients.length === 0) {
      throw new Error("Nenhum destinatário fornecido");
    }
    if (!subject || !body) {
      throw new Error("Assunto e corpo do email são obrigatórios");
    }
    if (recipients.length > 100) {
      throw new Error("Máximo de 100 destinatários por disparo");
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY não configurada");
    }

    console.log(`Sending email blast to ${recipients.length} recipients`);

    const results: { email: string; success: boolean; error?: string }[] = [];
    let sentCount = 0;
    let failedCount = 0;

    // Send emails in batches of 10 with delay to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (recipient) => {
        try {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: `${fromName || "Kinjani AI"} <onboarding@resend.dev>`,
              to: [recipient.email],
              subject: subject.replace("{{name}}", recipient.name || ""),
              html: body.replace(/\{\{name\}\}/g, recipient.name || ""),
            }),
          });

          if (!response.ok) {
            const errorData = await response.text();
            console.error(`Failed to send to ${recipient.email}:`, errorData);
            failedCount++;
            return { email: recipient.email, success: false, error: errorData };
          }

          sentCount++;
          return { email: recipient.email, success: true };
        } catch (err) {
          failedCount++;
          return { email: recipient.email, success: false, error: err.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`Email blast complete: ${sentCount} sent, ${failedCount} failed`);

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
    console.error("Email blast error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
