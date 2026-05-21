// Shared AI helper. Usa apenas Gemini (Google) — OpenAI removido.
// All endpoints used here are OpenAI-compatible Chat Completions.

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

const GEMINI_DEFAULT = "gemini-2.5-flash";

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

/** Call Gemini AI provider only. */
export async function callAI(opts: CallAIOptions): Promise<CallAIResult> {
  const geminiKey = Deno.env.get("GEMINI_API_KEY");

  if (!geminiKey) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }

  return await callGemini(opts, geminiKey);
}
