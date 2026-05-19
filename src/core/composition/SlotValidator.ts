/**
 * SlotValidator — enforces ComponentDefinition.slots rules when nodes are
 * inserted/moved. Backed by the GeneratedRegistry so it works equally well
 * for built-in and promoted generated components.
 */

import { generatedRegistry } from "../freeform/registry/GeneratedRegistry";
import type {
  ComponentGraph,
  CompositionNode,
  NodeId,
  SlotValidationResult,
} from "./types";

export class SlotValidator {
  canAccept(
    projectId: string,
    graph: ComponentGraph,
    parentId: NodeId,
    slotId: string,
    candidate: CompositionNode,
  ): SlotValidationResult {
    const parent = graph.nodes[parentId];
    if (!parent) return { ok: false, reason: "Parent not in graph" };

    const def = generatedRegistry.resolve(projectId, parent.componentId);
    if (!def) return { ok: false, reason: "Parent definition missing" };

    const slot = def.slots?.find((s) => s.id === slotId);
    // If a definition has no declared slots, allow "default" with any content
    // (dynamicProps containers, ad-hoc layouts).
    if (!slot) {
      if (slotId === "default") return { ok: true };
      return { ok: false, reason: `Slot "${slotId}" is not declared` };
    }
    if (!slot.accepts.includes(candidate.category)) {
      return {
        ok: false,
        reason: `Slot "${slotId}" accepts ${slot.accepts.join(",")} not ${candidate.category}`,
      };
    }
    const currentCount = parent.slots[slotId]?.length ?? 0;
    if (slot.max !== undefined && currentCount >= slot.max) {
      return { ok: false, reason: `Slot "${slotId}" max ${slot.max} reached` };
    }
    return { ok: true };
  }
}

export const slotValidator = new SlotValidator();
