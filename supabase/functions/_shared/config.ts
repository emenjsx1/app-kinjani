import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

/**
 * Fetches the system settings from the database and merges them with Deno.env.
 * Database settings take precedence over Deno.env secrets.
 */
export async function getSystemConfig() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  const config: Record<string, string> = {
    evolution_api_url: Deno.env.get("EVOLUTION_API_URL") || "",
    evolution_api_key: Deno.env.get("EVOLUTION_API_KEY") || "",
    openai_api_key: Deno.env.get("OPENAI_API_KEY") || "",
    gemini_api_key: Deno.env.get("GOOGLE_GENERATIVE_AI_API_KEY") || "",
  };

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Returning env config.");
    return config;
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabaseAdmin
      .from("system_settings")
      .select("key, value");

    if (error) {
      console.error("Error fetching system settings from DB:", error.message);
      return config;
    }

    if (data && data.length > 0) {
      for (const row of data) {
        if (row.value && row.value.trim() !== "") {
          // Normalize keys based on standard mapping
          if (row.key === "evolution_api_url") config.evolution_api_url = row.value;
          if (row.key === "evolution_api_key") config.evolution_api_key = row.value;
          if (row.key === "openai_api_key") config.openai_api_key = row.value;
          if (row.key === "gemini_api_key") config.gemini_api_key = row.value;
        }
      }
    }
  } catch (err) {
    console.error("Error connecting to system_settings:", err);
  }

  return config;
}
