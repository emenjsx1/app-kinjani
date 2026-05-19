/**
 * GeneratedRegistry — read-only union view across the global registry and
 * the per-project ProjectRegistry. Used by the editor + AI for lookup while
 * keeping write paths separated.
 */

import { componentRegistry } from "../../registry/registry";
import type { ComponentDefinition } from "../../registry/types";
import { projectRegistry } from "./ProjectRegistry";

export class GeneratedRegistry {
  forProject(projectId: string): ComponentDefinition[] {
    const promoted = projectRegistry.listPromoted(projectId).map((p) => p.definition);
    return [...componentRegistry.all(), ...promoted];
  }

  resolve(projectId: string, id: string): ComponentDefinition | undefined {
    const global = componentRegistry.get(id);
    if (global) return global;
    return projectRegistry
      .listPromoted(projectId)
      .find((p) => p.definition.id === id)?.definition;
  }
}

export const generatedRegistry = new GeneratedRegistry();
