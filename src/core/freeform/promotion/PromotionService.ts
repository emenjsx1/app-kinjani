/**
 * PromotionService — turn a validated GeneratedArtifact into a first-class
 * ComponentDefinition that the editor + codegen can consume just like a
 * registry-native widget. Promotion is reversible (deprecate / rollback).
 */

import type { ComponentDefinition, RuntimeTarget } from "../../registry/types";
import { projectRegistry } from "../registry/ProjectRegistry";
import type { PromotedComponent, PromotionRequest } from "../types";

export class PromotionService {
  promote(projectId: string, req: PromotionRequest): PromotedComponent {
    const artifact = projectRegistry.getArtifact(projectId, req.artifactId);
    if (!artifact) throw new Error(`Artifact ${req.artifactId} not found`);
    if (artifact.lifecycle !== "validated" && artifact.lifecycle !== "promoted") {
      throw new Error(`Cannot promote artifact in lifecycle=${artifact.lifecycle}`);
    }

    const id = req.registryId ?? `generated/${artifact.projectId}/${artifact.name}`;
    const definition: ComponentDefinition = {
      id,
      category: artifact.kind === "section" || artifact.kind === "layout" ? "section" : "widget",
      type: artifact.name,
      label: humanize(artifact.name),
      description: artifact.metadata.generationPrompt.slice(0, 240),
      variants: [1],
      defaultProps: {},
      schema: { fields: [] },
      dynamicProps: true,
      runtimeCompatibility: artifact.metadata.runtimeCompatibility as RuntimeTarget[],
      exportCompatibility: { tsx: true },
      generationPrompt: artifact.metadata.generationPrompt,
      aiHints: req.exposeToAI ? { promptableFields: [] } : undefined,
    };

    return projectRegistry.promote(projectId, artifact.id, definition);
  }

  deprecate(projectId: string, artifactId: string): void {
    projectRegistry.deprecate(projectId, artifactId);
  }
}

function humanize(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const promotionService = new PromotionService();
