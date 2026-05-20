// Shared credit charging helper for edge functions.
// Resolves the calling user from the Authorization JWT and deducts credits
// atomically via the `deduct_credits` Postgres RPC.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export type CreditAction =
  | "chat_text_short"
  | "chat_text_long"
  | "chat_image"
  | "chat_audio"
  | "chat_pdf"
  | "site_create"
  | "site_edit_micro"
  | "site_edit_small"
  | "site_edit_medium"
  | "site_edit_large"
  | "site_edit_massive"
  | "agent_create_ai"
  | "lead_scraper"
  | "email_blast"
  | "whatsapp_blast"
  | "whatsapp_instance_monthly";

export const CREDIT_COSTS: Record<CreditAction, number> = {
  chat_text_short: 1,
  chat_text_long: 2,
  chat_image: 3,
  chat_audio: 3,
  chat_pdf: 5,
  site_create: 50,
  site_edit_micro: 2,
  site_edit_small: 5,
  site_edit_medium: 15,
  site_edit_large: 30,
  site_edit_massive: 50,
  agent_create_ai: 5,
  lead_scraper: 15,
  email_blast: 1,
  whatsapp_blast: 1,
  whatsapp_instance_monthly: 500,
};

export function classifyEditByTokens(outputTokens: number): CreditAction {
  if (outputTokens < 500) return "site_edit_micro";
  if (outputTokens < 1500) return "site_edit_small";
  if (outputTokens < 4000) return "site_edit_medium";
  if (outputTokens < 8000) return "site_edit_large";
  return "site_edit_massive";
}

export function classifyChatMessage(attachments?: Array<{ type?: string }>, responseLength?: number): CreditAction {
  if (Array.isArray(attachments) && attachments.length) {
    const types = attachments.map(a => (a?.type || "").toLowerCase());
    if (types.some(t => t.startsWith("audio/"))) return "chat_audio";
    if (types.some(t => t === "application/pdf")) return "chat_pdf";
    if (types.some(t => t.startsWith("image/"))) return "chat_image";
  }
  return (responseLength ?? 0) > 200 ? "chat_text_long" : "chat_text_short";
}

function serviceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

export async function resolveUserId(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  try {
    const supabase = serviceClient();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

export type ChargeResult =
  | { ok: true; balance: number; charged: number; action: CreditAction; amount: number }
  | { ok: false; reason: "insufficient" | "profile_not_found" | "unauthenticated" | "error"; balance?: number; required?: number; action?: CreditAction };

/**
 * Charge credits for an action. Returns ok:false with reason on failure.
 * `multiplier` lets blast functions charge N units (1 per recipient).
 */
export async function chargeCredits(
  req: Request,
  action: CreditAction,
  description?: string,
  multiplier = 1,
): Promise<ChargeResult> {
  const userId = await resolveUserId(req);
  if (!userId) return { ok: false, reason: "unauthenticated" };

  const amount = CREDIT_COSTS[action] * Math.max(1, Math.floor(multiplier));

  try {
    const supabase = serviceClient();
    const { data, error } = await supabase.rpc("deduct_credits", {
      _user_id: userId,
      _action: action,
      _amount: amount,
      _description: description ?? null,
    });

    if (error) {
      console.error("deduct_credits rpc error", error);
      return { ok: false, reason: "error" };
    }

    const result = data as {
      success: boolean;
      balance?: number;
      reason?: string;
      required?: number;
      charged?: number;
    };

    if (result?.success) {
      return {
        ok: true,
        balance: result.balance ?? 0,
        charged: result.charged ?? amount,
        action,
        amount,
      };
    }

    return {
      ok: false,
      reason: (result?.reason as ChargeResult["reason"]) ?? "error",
      balance: result?.balance,
      required: result?.required,
      action,
    };
  } catch (e) {
    console.error("chargeCredits fatal", e);
    return { ok: false, reason: "error" };
  }
}

export function insufficientCreditsResponse(
  corsHeaders: Record<string, string>,
  result: Extract<ChargeResult, { ok: false }>,
): Response {
  const status = result.reason === "unauthenticated" ? 401 : 402;
  const body = {
    error: result.reason === "insufficient" ? "Créditos insuficientes para esta acção." : "Não foi possível cobrar créditos.",
    reason: result.reason,
    balance: result.balance ?? null,
    required: result.required ?? null,
    action: result.action ?? null,
  };
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
