/**
 * Phase 7 — Freeform AI Generation Lane public surface.
 *
 *   import { freeform } from "@/core/freeform";
 *   const outcome = await freeform.pipeline.generate({ ... });
 */
export * from "./types";
export * from "./parser/tsxParser";
export * from "./sandbox/RenderSandbox";
export * from "./agent/FreeformAuthorAgent";
export * from "./pipeline/FreeformPipeline";
export * from "./registry/ProjectRegistry";
export * from "./registry/GeneratedRegistry";
export * from "./promotion/PromotionService";

import { FreeformAuthorAgent, type LLMClient } from "./agent/FreeformAuthorAgent";
import { FreeformPipeline } from "./pipeline/FreeformPipeline";
import { promotionService } from "./promotion/PromotionService";
import { projectRegistry } from "./registry/ProjectRegistry";
import { generatedRegistry } from "./registry/GeneratedRegistry";

/**
 * Default LLM client placeholder — the platform wires the real Edge
 * Function/Lovable AI Gateway transport at startup via `freeform.configure`.
 */
let activeLLM: LLMClient = async () => {
  throw new Error(
    "Freeform LLM not configured. Call freeform.configure(client) at startup.",
  );
};

const agent = new FreeformAuthorAgent((req) => activeLLM(req));
const pipeline = new FreeformPipeline(agent);

export const freeform = {
  configure(llm: LLMClient) {
    activeLLM = llm;
  },
  agent,
  pipeline,
  promotion: promotionService,
  projectRegistry,
  generatedRegistry,
};
