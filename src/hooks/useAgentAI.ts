import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CreateAgentParams {
  description: string;
  businessName: string;
  niche: string;
}

interface GeneratedAgent {
  name: string;
  type: string;
  typeLabel: string;
  prompt: string;
  description: string;
}

interface CreateAgentResult {
  success: boolean;
  agent?: GeneratedAgent;
  creditsUsed?: number;
  error?: string;
}

export function useAgentAI() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAgentWithAI = async (params: CreateAgentParams): Promise<CreateAgentResult> => {
    setIsCreating(true);
    setError(null);

    try {
      console.log("Creating agent with AI:", params);

      const { data, error: functionError } = await supabase.functions.invoke(
        "create-agent-ai",
        {
          body: params,
        }
      );

      if (functionError) {
        console.error("Function error:", functionError);
        throw new Error(functionError.message || "Erro ao criar agente");
      }

      if (!data?.success) {
        throw new Error(data?.error || "Erro ao criar agente");
      }

      console.log("Created agent:", data.agent);
      return {
        success: true,
        agent: data.agent,
        creditsUsed: data.creditsUsed || 2,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      console.error("Agent creation error:", message);
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createAgentWithAI,
    isCreating,
    error,
  };
}
