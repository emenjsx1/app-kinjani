import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Phase 3 edge function.
 *
 * Two modes:
 *   - mode: "plan"     -> returns { success, plan: AIOperationPlan }
 *                         using OpenAI-compatible json_schema structured output.
 *   - legacy default   -> returns { success, message, template } for back-compat
 *                         with older clients (we keep this until the editor
 *                         is fully migrated).
 *
 * NO regex parsing. All structured payloads validated client-side with Zod.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPERATION_PLAN_JSON_SCHEMA = {
  name: "operation_plan",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["id", "strategy", "envelopes"],
    properties: {
      id: { type: "string" },
      strategy: { type: "string", enum: ["sequential", "parallel"] },
      description: { type: "string" },
      reasoning: { type: "string" },
      message: { type: "string" },
      envelopes: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["meta", "op"],
          properties: {
            meta: {
              type: "object",
              additionalProperties: false,
              required: [
                "operationId",
                "sourceAgent",
                "rollbackable",
                "affectedFiles",
                "affectedComponents",
                "createdAt",
              ],
              properties: {
                operationId: { type: "string" },
                sourceAgent: {
                  type: "string",
                  enum: [
                    "planner",
                    "layout-agent",
                    "ui-agent",
                    "copy-agent",
                    "responsive-agent",
                    "seo-agent",
                    "fix-agent",
                    "export-agent",
                    "user",
                    "system",
                  ],
                },
                rollbackable: { type: "boolean" },
                affectedFiles: { type: "array", items: { type: "string" } },
                affectedComponents: { type: "array", items: { type: "string" } },
                createdAt: { type: "string" },
                label: { type: "string" },
              },
            },
            op: {
              type: "object",
              required: ["op"],
              properties: {
                op: {
                  type: "string",
                  enum: [
                    "setSectionProp",
                    "addSection",
                    "removeSection",
                    "reorderSections",
                    "setTheme",
                    "setSettings",
                    "noop",
                  ],
                },
                sectionId: { type: "string" },
                patch: { type: "object", additionalProperties: { type: "string" } },
                orderedIds: { type: "array", items: { type: "string" } },
                theme: { type: "object" },
                settings: { type: "object" },
                reason: { type: "string" },
                section: { type: "object" },
              },
            },
          },
        },
      },
    },
  },
} as const;

const PLAN_SYSTEM_PROMPT = `És o PlannerAgent do Kinjani Open Builder.

A tua função é converter o pedido do utilizador num OperationPlan estruturado.

REGRAS CRÍTICAS:
- Devolves SEMPRE um objeto JSON que respeita o schema "operation_plan".
- Cada operação tem um "meta" com operationId único (ex: "op_<timestamp>_<rand>"),
  sourceAgent ("planner" ou agente especializado), rollbackable, affectedFiles,
  affectedComponents (ids das secções afetadas) e createdAt (ISO).
- Operações suportadas: setSectionProp, addSection, removeSection,
  reorderSections, setTheme, setSettings, noop.
- Cores: HSL "H S% L%". Texto: português europeu.
- Se não tiveres certeza, devolve um plano vazio com message a explicar.
- NUNCA inventes ids de secções. Usa apenas os que aparecem no contexto.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    // ---------- Modern structured-output mode ----------
    if (body.mode === "plan") {
      const { prompt, context } = body as { prompt: string; context: string };
      const messages = [
        { role: "system", content: PLAN_SYSTEM_PROMPT },
        {
          role: "user",
          content: `CONTEXTO DO PROJETO:\n${context}\n\nPEDIDO:\n${prompt}\n\nDevolve um OperationPlan válido.`,
        },
      ];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages,
          response_format: { type: "json_schema", json_schema: OPERATION_PLAN_JSON_SCHEMA },
          temperature: 0.4,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ success: false, error: "Limite de pedidos atingido" }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ success: false, error: "Créditos esgotados" }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        throw new Error(`AI Gateway ${response.status}: ${text}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content ?? "{}";
      const plan = JSON.parse(content); // structured -> no regex needed

      return new Response(JSON.stringify({ success: true, plan }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---------- Legacy template mode (back-compat) ----------
    const { instruction, template, websiteName } = body;
    const systemPrompt = `És um assistente que edita templates de websites.
Devolves APENAS JSON: {"message": string, "template": <template alterado>}.
Cores em HSL "H S% L%". Português europeu.`;
    const userPrompt = `Template "${websiteName}":
${JSON.stringify(template)}

Instrução: "${instruction}"

Devolve o JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 8000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Gateway ${response.status}: ${errorText}`);
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";
    const result = JSON.parse(content);

    return new Response(
      JSON.stringify({ success: true, message: result.message, template: result.template }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("ai-edit-website error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
