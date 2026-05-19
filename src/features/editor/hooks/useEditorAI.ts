import { useCallback, useState } from "react";
import { websiteAIService } from "@/core/ai/services/WebsiteAIService";
import type { Project } from "@/core/projects/types";
import { useHistoryStore } from "../store/historyStore";

/**
 * Hook for invoking the AI pipeline from the editor. Commits resulting
 * project snapshots into the history store automatically.
 */
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
        const res = await websiteAIService.edit({
          project,
          prompt,
          commit: (next) => {
            push(next, "AI edit");
          },
        });
        return res;
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
