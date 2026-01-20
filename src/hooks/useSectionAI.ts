import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EditSectionParams {
  sectionType: string;
  currentContent: Record<string, string>;
  instruction: string;
  websiteName: string;
  niche: string;
}

interface EditSectionResult {
  success: boolean;
  content?: Record<string, string>;
  creditsUsed?: number;
  error?: string;
}

export function useSectionAI() {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editSectionWithAI = async (params: EditSectionParams): Promise<EditSectionResult> => {
    setIsEditing(true);
    setError(null);

    try {
      console.log("Editing section with AI:", params.sectionType);

      const { data, error: functionError } = await supabase.functions.invoke(
        "ai-edit-section",
        {
          body: params,
        }
      );

      if (functionError) {
        console.error("Function error:", functionError);
        throw new Error(functionError.message || "Erro ao editar secção");
      }

      if (!data?.success) {
        throw new Error(data?.error || "Erro ao editar secção");
      }

      console.log("Edited section content:", data.content);
      return {
        success: true,
        content: data.content,
        creditsUsed: data.creditsUsed || 1,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      console.error("Section edit error:", message);
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsEditing(false);
    }
  };

  return {
    editSectionWithAI,
    isEditing,
    error,
  };
}
