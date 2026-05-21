// Shared AI helper. Prefers OpenAI (OPENAI_API_KEY) and falls back to Gemini
// (GEMINI_API_KEY) when OpenAI is missing or fails with quota/rate limit errors.
// All endpoints used here are OpenAI-compatible Chat Completions.

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export interface CallAIOptions {
  messages: ChatMessage[];
  temperature?: number;
  // Override defaults if needed.
  openaiModel?: string;
  geminiModel?: string;
  // If true, request response_format json_object (OpenAI only).
  jsonMode?: boolean;
}

export interface CallAIResult {
  content: string;
  provider: "openai" | "gemini";
  model: string;
}

const OPENAI_DEFAULT = "gpt-4o-mini";
const GEMINI_DEFAULT = "gemini-2.5-flash";

async function callOpenAI(opts: CallAIOptions, apiKey: string): Promise<CallAIResult> {
  const model = opts.openaiModel || OPENAI_DEFAULT;
  const body: Record<string, unknown> = {
    model,
    temperature: opts.temperature ?? 0.7,
    messages: opts.messages,
  };
  if (opts.jsonMode) body.response_format = { type: "json_object" };

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    const err = new Error(`openai ${resp.status}: ${txt}`);
    (err as any).status = resp.status;
    throw err;
  }
  const data = await resp.json();
  return {
    content: data?.choices?.[0]?.message?.content ?? "",
    provider: "openai",
    model,
  };
}

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

/** Call the preferred AI provider (OpenAI first, then Gemini fallback). */
export async function callAI(opts: CallAIOptions): Promise<CallAIResult> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");

  if (openaiKey) {
    try {
      return await callOpenAI(opts, openaiKey);
    } catch (e) {
      const status = (e as any)?.status;
      // Fallback to Gemini on rate limit / quota / 5xx if available.
      if (geminiKey && (status === 429 || status === 402 || (status && status >= 500))) {
        return await callGemini(opts, geminiKey);
      }
      throw e;
    }
  }

  if (geminiKey) return await callGemini(opts, geminiKey);

  throw new Error("Nenhuma API key de IA configurada (OPENAI_API_KEY ou GEMINI_API_KEY).");
}
