import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WebsiteSection } from "@/lib/website-templates";

interface GenerateContentParams {
  websiteType: "landing" | "institutional";
  niche: string;
  templateName: string;
  prompt: string;
  websiteName: string;
  sections: string[];
}

interface GeneratedContent {
  [key: string]: Record<string, string>;
}

export function useWebsiteAI() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async (params: GenerateContentParams): Promise<GeneratedContent | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log("Generating content with params:", params);

      const { data, error: functionError } = await supabase.functions.invoke(
        "generate-website-content",
        {
          body: params,
        }
      );

      if (functionError) {
        console.error("Function error:", functionError);
        throw new Error(functionError.message || "Erro ao gerar conteúdo");
      }

      if (!data?.success) {
        throw new Error(data?.error || "Erro ao gerar conteúdo");
      }

      console.log("Generated content:", data.content);
      return data.content;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      console.error("Content generation error:", message);
      setError(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const applySectionsContent = (
    sections: WebsiteSection[],
    generatedContent: GeneratedContent
  ): WebsiteSection[] => {
    return sections.map((section) => {
      const sectionContent = generatedContent[section.type];
      if (sectionContent) {
        return {
          ...section,
          content: {
            ...section.content,
            ...sectionContent,
          },
        };
      }
      return section;
    });
  };

  return {
    generateContent,
    applySectionsContent,
    isGenerating,
    error,
  };
}
