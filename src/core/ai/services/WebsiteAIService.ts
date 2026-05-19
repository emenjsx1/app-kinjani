import type { Project } from "@/core/projects/types";
import { agentRegistry } from "../agents";
import { AIContextBuilder } from "../context/AIContextBuilder";
import { aiMemory, AIMemoryStore } from "../memory/AIMemoryStore";
import { OperationPipeline } from "../pipeline/OperationPipeline";
import { AIStreamEmitter } from "../streaming/StreamEmitter";
import type { AIOperationEnvelope } from "../types";

export interface WebsiteAIEditRequest {
  project: Project;
  prompt: string;
  selection?: { pageId?: string; sectionIds?: string[]; nodeIds?: string[] };
  responsiveMode?: "desktop" | "tablet" | "mobile";
  emitter?: AIStreamEmitter;
  memory?: AIMemoryStore;
  commit: (project: Project, envelopes: AIOperationEnvelope[]) => Promise<void> | void;
}

/**
 * High-level orchestrator. The chat panel and any other AI surface should
 * call this — never the edge function directly. It owns:
 *   - context building
 *   - agent routing (planner-first, with legacy fallback)
 *   - pipeline execution
 *   - memory bookkeeping
 *   - stream events
 */
export const websiteAIService = {
  async edit(req: WebsiteAIEditRequest) {
    const memory = req.memory ?? aiMemory;
    const emitter = req.emitter;

    emitter?.emit({ type: "stage", stage: "analyzing-context" });

    const context = AIContextBuilder.build({
      project: req.project,
      selection: {
        sectionIds: req.selection?.sectionIds ?? [],
        nodeIds: req.selection?.nodeIds ?? [],
        pageId: req.selection?.pageId,
      },
      responsiveMode: req.responsiveMode,
      recentHistory: memory.recentOperations(),
    });

    memory.appendMessage({
      id: `u_${Date.now()}`,
      role: "user",
      content: req.prompt,
      createdAt: new Date().toISOString(),
    });

    // Route to an agent. Planner is the default backbone.
    const agent = agentRegistry.route({ prompt: req.prompt, context, emitter });
    if (!agent) {
      emitter?.emit({ type: "error", message: "No agent available" });
      return { ok: false, message: "No agent available" };
    }
    emitter?.emit({ type: "stage", stage: "generating-operations" });
    const agentResult = await agent.run({ prompt: req.prompt, context, emitter });

    if (!agentResult.envelopes.length) {
      // Legacy template fallback: planner returned an old-shape template.
      const legacy = (agentResult.data as { legacyTemplate?: unknown } | undefined)?.legacyTemplate;
      if (legacy) {
        emitter?.emit({ type: "message", role: "assistant", content: agentResult.message ?? "" });
      }
      memory.appendMessage({
        id: `a_${Date.now()}`,
        role: "assistant",
        content: agentResult.message ?? "Sem operações.",
        createdAt: new Date().toISOString(),
      });
      return { ok: true, message: agentResult.message, legacyTemplate: legacy };
    }

    const result = await OperationPipeline.run({
      project: req.project,
      payload: { id: `plan_${Date.now()}`, strategy: "sequential", envelopes: agentResult.envelopes },
      memory,
      emitter,
      commit: req.commit,
    });

    memory.appendMessage({
      id: `a_${Date.now()}`,
      role: "assistant",
      content: agentResult.message ?? result.message ?? "Pronto.",
      createdAt: new Date().toISOString(),
      operationIds: result.applied.map((e) => e.meta.operationId),
    });

    return {
      ok: result.ok,
      project: result.project,
      applied: result.applied,
      denied: result.denied,
      errors: result.errors,
      message: agentResult.message ?? result.message,
    };
  },
};
