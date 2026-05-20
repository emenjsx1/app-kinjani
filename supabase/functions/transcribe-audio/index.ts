// Transcribes audio to text using Google Gemini API directly.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { audioBase64, mimeType } = await req.json();
    if (!audioBase64) {
      return new Response(JSON.stringify({ error: "audioBase64 required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    const promptText = "Transcreve este áudio para texto em português, exactamente o que foi dito, sem comentários. Devolve apenas a transcrição.";
    const audioMime = (mimeType || "audio/webm").split(";")[0];

    // 1) Try Gemini API directly first (user has GEMINI_API_KEY).
    // Cascata de modelos: cada um tem quota separada no free-tier.
    if (geminiKey) {
      const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
      let lastErr = "";
      for (const model of models) {
        const gRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: promptText },
                  { inline_data: { mime_type: audioMime, data: audioBase64 } },
                ],
              }],
            }),
          },
        );
        if (gRes.ok) {
          const data = await gRes.json();
          const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).filter(Boolean).join(" ").trim() ?? "";
          return new Response(JSON.stringify({ text, provider: "gemini", model }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        lastErr = await gRes.text();
        console.error(`Gemini ${model} error`, gRes.status, lastErr);
        // Se não for quota/rate-limit, não vale a pena tentar outros modelos
        if (gRes.status !== 429 && gRes.status !== 503) break;
      }
      // fall through to Lovable AI gateway
    }


    // 2) Fallback: Lovable AI Gateway
    if (lovableKey) {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{
            role: "user",
            content: [
              { type: "text", text: promptText },
              { type: "input_audio", input_audio: { data: audioBase64, format: audioMime.split("/")[1] || "webm" } },
            ],
          }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content ?? "";
        return new Response(JSON.stringify({ text, provider: "lovable" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const err = await res.text();
      console.error("Lovable AI gateway error", res.status, err);
      const reason = res.status === 402
        ? "Sem créditos de IA disponíveis. Configure a sua GEMINI_API_KEY em Integrações."
        : "Não foi possível transcrever o áudio agora.";
      return new Response(JSON.stringify({ error: reason, fallback: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Nenhuma chave de IA configurada (GEMINI_API_KEY ou LOVABLE_API_KEY).", fallback: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Erro ao processar áudio.", fallback: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
