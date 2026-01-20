import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    console.log(`[user-api-keys] Action: ${action}, User: ${user.id}`);

    switch (action) {
      case "list": {
        const { data, error } = await supabase
          .from("user_api_keys")
          .select("id, provider, is_valid, created_at, updated_at")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error listing API keys:", error);
          throw error;
        }

        // Return masked keys (just indicate they exist)
        const maskedData = data?.map(key => ({
          ...key,
          hasKey: true,
        }));

        return new Response(
          JSON.stringify({ success: true, keys: maskedData }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "save": {
        const body = await req.json();
        const { provider, apiKey } = body;

        if (!provider || !apiKey) {
          return new Response(
            JSON.stringify({ error: "Provider and API key are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Validate the API key by making a test request
        let isValid = false;
        
        if (provider === "openai") {
          try {
            const testResponse = await fetch("https://api.openai.com/v1/models", {
              headers: { "Authorization": `Bearer ${apiKey}` },
            });
            isValid = testResponse.ok;
            console.log(`OpenAI key validation: ${isValid}`);
          } catch (e) {
            console.error("OpenAI validation error:", e);
            isValid = false;
          }
        } else if (provider === "gemini") {
          try {
            const testResponse = await fetch(
              `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
            );
            isValid = testResponse.ok;
            console.log(`Gemini key validation: ${isValid}`);
          } catch (e) {
            console.error("Gemini validation error:", e);
            isValid = false;
          }
        }

        if (!isValid) {
          return new Response(
            JSON.stringify({ error: "Invalid API key. Please check and try again." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Simple encoding (in production, use proper encryption)
        const encodedKey = btoa(apiKey);

        // Upsert the key
        const { data, error } = await supabase
          .from("user_api_keys")
          .upsert({
            user_id: user.id,
            provider,
            api_key_encrypted: encodedKey,
            is_valid: true,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "user_id,provider",
          })
          .select()
          .single();

        if (error) {
          console.error("Error saving API key:", error);
          throw error;
        }

        console.log(`API key saved for provider: ${provider}`);

        return new Response(
          JSON.stringify({ success: true, message: "API key saved successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "delete": {
        const body = await req.json();
        const { provider } = body;

        if (!provider) {
          return new Response(
            JSON.stringify({ error: "Provider is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabase
          .from("user_api_keys")
          .delete()
          .eq("user_id", user.id)
          .eq("provider", provider);

        if (error) {
          console.error("Error deleting API key:", error);
          throw error;
        }

        console.log(`API key deleted for provider: ${provider}`);

        return new Response(
          JSON.stringify({ success: true, message: "API key deleted successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get": {
        // Internal use only - get decrypted key for use in other functions
        const body = await req.json();
        const { provider } = body;

        const { data, error } = await supabase
          .from("user_api_keys")
          .select("api_key_encrypted")
          .eq("user_id", user.id)
          .eq("provider", provider)
          .single();

        if (error || !data) {
          return new Response(
            JSON.stringify({ success: false, hasKey: false }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const decodedKey = atob(data.api_key_encrypted);

        return new Response(
          JSON.stringify({ success: true, hasKey: true, apiKey: decodedKey }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Error in user-api-keys function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
