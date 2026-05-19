/**
 * Phase 8 — Open Composition Engine public surface.
 *
 *   import { composition } from "@/core/composition";
 *   const next = composition.graph.insertChild(graph, parentId, "default", node);
 *   const resolved = composition.layout.resolve(node.layout);
 *   const effective = composition.constraints.solve(base, overrides, 1280);
 */
export * from "./types";
export * from "./ComponentGraphOps";
export * from "./SlotValidator";
export * from "./LayoutEngine";
export * from "./ConstraintSolver";
export * from "./AppGraph";
export * from "./logic/LogicGenerator";
export * from "./interactions/InteractionEngine";

import { ComponentGraphOps } from "./ComponentGraphOps";
import { slotValidator } from "./SlotValidator";
import { layoutEngine } from "./LayoutEngine";
import { constraintSolver } from "./ConstraintSolver";
import { AppGraphOps } from "./AppGraph";
import { logicGenerator } from "./logic/LogicGenerator";
import { interactionEngine } from "./interactions/InteractionEngine";

export const composition = {
  graph: ComponentGraphOps,
  app: AppGraphOps,
  slots: slotValidator,
  layout: layoutEngine,
  constraints: constraintSolver,
  logic: logicGenerator,
  interactions: interactionEngine,
};
