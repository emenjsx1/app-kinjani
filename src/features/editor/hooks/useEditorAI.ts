import { useCallback, useState } from "react";
import { websiteAIService } from "@/core/ai/services/WebsiteAIService";
import { applyOperations } from "@/core/ai/applier";
import type { AIOperation } from "@/core/ai/types";
import type { Project } from "@/core/projects/types";
import { useHistoryStore } from "../store/historyStore";

export function useEditorAI(project: Project | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const push = useHistoryStore((s) => s.push);

  const sendPrompt = useCallback(
    async (prompt: string) => {
      if (!project) return null;
      setLoading(true);
      setError(null);
      try {
        const data = await websiteAIService.edit({ project, prompt });
        const ops = (data?.operations ?? []) as AIOperation[];
        if (ops.length > 0) {
          const next = applyOperations(project, ops);
          push(next, "AI edit");
        }
        return data;
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [project, push],
  );

  return { sendPrompt, loading, error };
}
