import { supabase } from "@/integrations/supabase/client";
import type { Project } from "@/core/projects/types";

/**
 * Thin service wrapper around the existing `ai-edit-website` Edge Function.
 * Phase 1: pass-through. Phase 2 will translate responses into AIOperation[]
 * and route them through the applier.
 */
export interface WebsiteAIEditRequest {
  project: Project;
  prompt: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export const websiteAIService = {
  async edit(req: WebsiteAIEditRequest) {
    const { data, error } = await supabase.functions.invoke("ai-edit-website", {
      body: {
        prompt: req.prompt,
        template: req.project, // legacy edge function still accepts a template-shaped payload
        history: req.history ?? [],
      },
    });
    if (error) throw error;
    return data;
  },
};
