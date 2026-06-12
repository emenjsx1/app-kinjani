import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export interface CallAIOptions {
  messages: ChatMessage[];
  temperature?: number;
  // Override default Gemini model if needed.
  geminiModel?: string;
}

export interface CallAIResult {
  content: string;
  provider: "gemini";
  model: string;
}

const GEMINI_DEFAULT = "gemini-1.5-pro";

async function callGemini(opts: CallAIOptions, apiKey: string): Promise<CallAIResult> {
  const model = opts.geminiModel || GEMINI_DEFAULT;
  const resp = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: opts.temperature ?? 0.7,
        messages: opts.messages,
      }),
    },
  );
  if (!resp.ok) {
    const txt = await resp.text();
    const err = new Error(`gemini ${resp.status}: ${txt}`);
    (err as any).status = resp.status;
    throw err;
  }
  const data = await resp.json();
  return {
    content: data?.choices?.[0]?.message?.content ?? "",
    provider: "gemini",
    model,
  };
}

export async function getUserApiKey(req: Request, provider: "openai" | "gemini"): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return null;

    const { data, error } = await supabase
      .from("user_api_keys")
      .select("api_key_encrypted")
      .eq("user_id", user.id)
      .eq("provider", provider)
      .single();

    if (error || !data?.api_key_encrypted) return null;

    return atob(data.api_key_encrypted);
  } catch (e) {
    console.error("Failed to retrieve user API key:", e);
    return null;
  }
}

/** Call Gemini AI provider only. */
export async function callAI(opts: CallAIOptions, userKey?: string | null): Promise<CallAIResult> {
  const geminiKey = userKey || Deno.env.get("GEMINI_API_KEY");

  if (!geminiKey) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }

  return await callGemini(opts, geminiKey);
}

