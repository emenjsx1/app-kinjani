// Shared AI helper. Suporta OpenAI (primário se OPENAI_API_KEY existir) e Gemini como fallback.
// Endpoints são OpenAI-compatible Chat Completions.

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export interface CallAIOptions {
  messages: ChatMessage[];
  temperature?: number;
  geminiModel?: string;
  openaiModel?: string;
  // Força um provider específico ("openai" | "gemini"). Se omitido, usa OpenAI quando disponível.
  provider?: "openai" | "gemini";
}

export interface CallAIResult {
  content: string;
  provider: "openai" | "gemini";
  model: string;
}

const GEMINI_DEFAULT = "gemini-2.5-flash";
const OPENAI_DEFAULT = "gpt-4o-mini";

async function callOpenAI(opts: CallAIOptions, apiKey: string): Promise<CallAIResult> {
  const model = opts.openaiModel || OPENAI_DEFAULT;
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function tryOpenAI(opts: CallAIOptions, apiKey: string): Promise<CallAIResult> {
  const primary = opts.openaiModel || OPENAI_DEFAULT;
  const fallbacks = Array.from(new Set([primary, "gpt-4o-mini", "gpt-4o"]));
  let lastErr: any;
  for (const model of fallbacks) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await callOpenAI({ ...opts, openaiModel: model }, apiKey);
      } catch (e: any) {
        lastErr = e;
        const status = e?.status;
        const retryable = status === 503 || status === 429 || (status >= 500 && status < 600);
        if (!retryable) throw e;
        await sleep(500 * Math.pow(2, attempt) + Math.random() * 300);
      }
    }
  }
  throw lastErr;
}

async function tryGemini(opts: CallAIOptions, apiKey: string): Promise<CallAIResult> {
  const primary = opts.geminiModel || GEMINI_DEFAULT;
  const fallbacks = Array.from(
    new Set([primary, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite"]),
  );
  let lastErr: any;
  for (const model of fallbacks) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await callGemini({ ...opts, geminiModel: model }, apiKey);
      } catch (e: any) {
        lastErr = e;
        const status = e?.status;
        const retryable = status === 503 || status === 429 || (status >= 500 && status < 600);
        if (!retryable) throw e;
        await sleep(500 * Math.pow(2, attempt) + Math.random() * 300);
      }
    }
  }
  throw lastErr;
}

/** Call AI com OpenAI como primário (se houver key) e Gemini como fallback. */
export async function callAI(opts: CallAIOptions): Promise<CallAIResult> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");

  const wantOpenAI = opts.provider === "openai" || (!opts.provider && !!openaiKey);
  const wantGemini = opts.provider === "gemini" || (!opts.provider && !openaiKey);

  if (wantOpenAI && openaiKey) {
    try {
      return await tryOpenAI(opts, openaiKey);
    } catch (e) {
      if (geminiKey && opts.provider !== "openai") {
        console.warn("[ai] OpenAI falhou, fallback para Gemini:", (e as Error).message);
        return await tryGemini(opts, geminiKey);
      }
      throw e;
    }
  }

  if (wantGemini && geminiKey) {
    try {
      return await tryGemini(opts, geminiKey);
    } catch (e) {
      if (openaiKey && opts.provider !== "gemini") {
        console.warn("[ai] Gemini falhou, fallback para OpenAI:", (e as Error).message);
        return await tryOpenAI(opts, openaiKey);
      }
      throw e;
    }
  }

  throw new Error("Nenhuma API key de IA configurada (OPENAI_API_KEY ou GEMINI_API_KEY).");
}
