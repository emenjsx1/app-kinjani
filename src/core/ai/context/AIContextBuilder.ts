import type { Project } from "@/core/projects/types";
import { componentRegistry } from "@/core/registry";
import type { AIOperationEnvelope } from "../types";
import type { AIContext, AIContextSelection, ResponsiveMode } from "./types";

export interface AIContextBuilderInput {
  project: Project;
  selection?: AIContextSelection;
  responsiveMode?: ResponsiveMode;
  recentHistory?: AIOperationEnvelope[];
  hints?: Record<string, unknown>;
}

/**
 * AIContextBuilder converts live editor state into a compact, agent-ready
 * description. It MUST be cheap to produce on every prompt — no large blobs.
 */
export const AIContextBuilder = {
  build(input: AIContextBuilderInput): AIContext {
    const { project } = input;
    const activePage =
      (input.selection?.pageId && project.pages.find((p) => p.id === input.selection?.pageId)) ||
      project.pages.find((p) => p.isHomepage) ||
      project.pages[0];

    return {
      project: {
        id: project.id,
        name: project.name,
        kind: project.kind,
        pageCount: project.pages.length,
        activePageId: activePage?.id,
        activeSections: (activePage?.sections ?? []).map((s) => ({
          id: s.id,
          type: s.type,
          title: s.title,
          enabled: s.enabled,
          order: s.order,
        })),
        theme: project.theme,
        settings: project.settings,
        seo: project.seo,
      },
      selection: {
        pageId: input.selection?.pageId ?? activePage?.id,
        sectionIds: input.selection?.sectionIds ?? [],
        nodeIds: input.selection?.nodeIds ?? [],
      },
      responsiveMode: input.responsiveMode ?? "desktop",
      registry: {
        components: componentRegistry.all().map((c) => ({
          id: c.id,
          type: c.type,
          category: c.category,
          label: c.label,
        })),
      },
      history: {
        recent: (input.recentHistory ?? []).slice(-10).map((e) => ({
          operationId: e.meta.operationId,
          sourceAgent: e.meta.sourceAgent,
          label: e.meta.label,
        })),
        totalOperations: input.recentHistory?.length ?? 0,
      },
      hints: input.hints,
    };
  },

  /** Compact serialization fed to LLMs. Excludes registry verbosity. */
  toPrompt(ctx: AIContext): string {
    return JSON.stringify(
      {
        project: ctx.project,
        selection: ctx.selection,
        responsiveMode: ctx.responsiveMode,
        registry: ctx.registry.components.map((c) => c.type),
        recentOps: ctx.history.recent,
      },
      null,
      2,
    );
  },
};
