import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { domainId } = await req.json();
    if (!domainId) {
      return new Response(JSON.stringify({ error: "domainId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: domain, error } = await supabase
      .from("custom_domains")
      .select("*")
      .eq("id", domainId)
      .maybeSingle();

    if (error || !domain) {
      return new Response(JSON.stringify({ error: "Domínio não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check TXT record _kinjani.<domain> for verification token
    const verificationHost = `_kinjani.${domain.domain}`;
    let verified = false;
    let foundTokens: string[] = [];

    try {
      // Use Google DNS-over-HTTPS
      const resp = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(verificationHost)}&type=TXT`,
      );
      const dns = await resp.json();
      const answers: Array<{ data: string }> = dns?.Answer ?? [];
      foundTokens = answers.map((a) => a.data.replace(/^"|"$/g, ""));
      verified = foundTokens.some((t) => t.includes(domain.verification_token));
    } catch (e) {
      console.error("DNS lookup failed:", e);
    }

    if (!verified) {
      return new Response(
        JSON.stringify({
          verified: false,
          expected: domain.verification_token,
          found: foundTokens,
          message: `Adiciona um registo TXT em ${verificationHost} com o valor ${domain.verification_token} e tenta novamente. A propagação DNS pode demorar alguns minutos.`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    await supabase
      .from("custom_domains")
      .update({ status: "active", verified_at: new Date().toISOString() })
      .eq("id", domainId);

    return new Response(
      JSON.stringify({ verified: true, message: "Domínio verificado com sucesso!" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
