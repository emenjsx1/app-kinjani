// Monthly billing: charges 50 credits per active WhatsApp instance per user.
// If user has insufficient credits, deletes the oldest instances until they fit.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COST_PER_INSTANCE = 50;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const evolutionApiUrl = Deno.env.get("EVOLUTION_API_URL");
  const evolutionApiKey = Deno.env.get("EVOLUTION_API_KEY");

  // Group instances per user
  const { data: instances, error } = await supabase
    .from("whatsapp_instances")
    .select("id, user_id, instance_key, instance_name, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const byUser = new Map<string, typeof instances>();
  for (const i of instances ?? []) {
    if (!byUser.has(i.user_id)) byUser.set(i.user_id, []);
    byUser.get(i.user_id)!.push(i);
  }

  const summary: Array<{ user_id: string; charged: number; removed: string[] }> = [];

  for (const [userId, list] of byUser) {
    const { data: profile } = await supabase
      .from("profiles").select("credits_balance").eq("user_id", userId).single();
    let balance = profile?.credits_balance ?? 0;
    const charged: string[] = [];
    const removed: string[] = [];

    // Charge as many instances as the balance allows
    for (const inst of list) {
      if (balance >= COST_PER_INSTANCE) {
        const { data } = await supabase.rpc("deduct_credits", {
          _user_id: userId,
          _action: "whatsapp_instance_monthly",
          _amount: COST_PER_INSTANCE,
          _description: `Renovação mensal: ${inst.instance_name}`,
        });
        const res = data as { success?: boolean; balance?: number };
        if (res?.success) {
          balance = res.balance ?? balance - COST_PER_INSTANCE;
          charged.push(inst.instance_key ?? inst.id);
        }
      } else {
        // Insufficient — remove the instance
        if (evolutionApiUrl && evolutionApiKey && inst.instance_key) {
          try {
            await fetch(`${evolutionApiUrl}/instance/delete/${inst.instance_key}`, {
              method: "DELETE", headers: { apikey: evolutionApiKey },
            });
          } catch (e) { console.error("evolution delete failed", e); }
        }
        await supabase.from("whatsapp_instances").delete().eq("id", inst.id);
        removed.push(inst.instance_key ?? inst.id);

        await supabase.from("notifications").insert({
          user_id: userId,
          title: "Instância WhatsApp removida",
          message: `A instância "${inst.instance_name}" foi removida por créditos insuficientes (50/mês).`,
          type: "warning",
          link: "/credits",
        });
      }
    }

    summary.push({ user_id: userId, charged: charged.length, removed });
  }

  return new Response(JSON.stringify({ processed: summary.length, summary }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
