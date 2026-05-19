/**
 * Phase 4 — Code Generation Engine public surface.
 *
 *   import { codegen } from "@/core/codegen";
 *   const result = await codegen.pipeline.run(codegen.targets.next, project);
 */
export * from "./types";
export * from "./ast";
export * from "./resolver";
export * from "./graph";
export * from "./formatter";
export * from "./validators";
export * from "./emitter";
export * from "./targets";
export * from "./pipeline";
export * from "./NextProjectGenerator";

import { CodegenPipeline } from "./pipeline/CodegenPipeline";
import { NextAppRouterTarget } from "./targets/NextAppRouterTarget";

export const codegen = {
  pipeline: new CodegenPipeline(),
  targets: {
    next: new NextAppRouterTarget(),
  },
};
