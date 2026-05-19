import { componentRegistry } from "@/core/registry";
import type { ComponentDefinition } from "@/core/registry/types";
import type { ComponentEmitter, ComponentEmitterRegistry } from "../types";
import { fallbackEmitter } from "../emitter/fallbackEmitter";

/**
 * Resolves a section/widget instance to:
 *  - its ComponentDefinition (from the registry)
 *  - its ComponentEmitter (from the emitter registry, or fallback)
 *
 * The resolver is the single bridge between the editor model and the code
 * generation pipeline.
 */
export interface ResolvedComponent {
  definition: ComponentDefinition;
  emitter: ComponentEmitter;
}

export class ComponentResolver {
  constructor(private readonly emitters: ComponentEmitterRegistry) {}

  resolve(category: "section" | "widget", type: string): ResolvedComponent | null {
    const definition = componentRegistry.getByType(category, type);
    if (!definition) return null;
    const emitter = this.emitters.get(definition.id) ?? fallbackEmitter;
    return { definition, emitter };
  }

  resolveById(id: string): ResolvedComponent | null {
    const definition = componentRegistry.get(id);
    if (!definition) return null;
    const emitter = this.emitters.get(id) ?? fallbackEmitter;
    return { definition, emitter };
  }
}
