/**
 * Project-scoped component registry.
 *
 * Sits BESIDE the global componentRegistry. Generated artifacts are stored
 * here as first-class project citizens. Promotion produces a normalized
 * ComponentDefinition that the editor and codegen can consume.
 *
 * Architecture:
 *   global componentRegistry  — built-in widgets/sections (read-only)
 *   ProjectRegistry           — per-project store of generated artifacts
 *   GeneratedRegistry (export) — union view used by editor/AI for lookup
 */

import type { ComponentDefinition } from "../../registry/types";
import type { GeneratedArtifact, PromotedComponent } from "../types";

export class ProjectRegistry {
  private artifacts = new Map<string, Map<string, GeneratedArtifact>>();
  private promoted = new Map<string, Map<string, PromotedComponent>>();

  upsertArtifact(artifact: GeneratedArtifact): void {
    const bucket = this.bucket(this.artifacts, artifact.projectId);
    bucket.set(artifact.id, artifact);
  }

  removeArtifact(projectId: string, artifactId: string): void {
    this.artifacts.get(projectId)?.delete(artifactId);
    this.promoted.get(projectId)?.delete(artifactId);
  }

  getArtifact(projectId: string, artifactId: string): GeneratedArtifact | undefined {
    return this.artifacts.get(projectId)?.get(artifactId);
  }

  listArtifacts(projectId: string): GeneratedArtifact[] {
    return Array.from(this.artifacts.get(projectId)?.values() ?? []);
  }

  promote(projectId: string, artifactId: string, definition: ComponentDefinition): PromotedComponent {
    const artifact = this.getArtifact(projectId, artifactId);
    if (!artifact) throw new Error(`Artifact ${artifactId} not found`);
    artifact.lifecycle = "promoted";
    artifact.metadata.updatedAt = Date.now();
    const promoted: PromotedComponent = { artifact, definition };
    this.bucket(this.promoted, projectId).set(artifactId, promoted);
    return promoted;
  }

  listPromoted(projectId: string): PromotedComponent[] {
    return Array.from(this.promoted.get(projectId)?.values() ?? []);
  }

  deprecate(projectId: string, artifactId: string): void {
    const a = this.getArtifact(projectId, artifactId);
    if (a) {
      a.lifecycle = "deprecated";
      a.metadata.updatedAt = Date.now();
    }
  }

  rollback(projectId: string, artifactId: string, version: number): GeneratedArtifact | undefined {
    const artifact = this.getArtifact(projectId, artifactId);
    if (!artifact) return undefined;
    const target = artifact.history.find((h) => h.version === version);
    if (!target) return undefined;
    artifact.source = target.source;
    artifact.validation = target.validation;
    artifact.lifecycle = "rolled-back";
    artifact.metadata.updatedAt = Date.now();
    artifact.history.push({
      version: artifact.history.length + 1,
      source: target.source,
      createdAt: Date.now(),
      validation: target.validation,
      reason: "rollback",
    });
    return artifact;
  }

  private bucket<V>(map: Map<string, Map<string, V>>, key: string): Map<string, V> {
    let b = map.get(key);
    if (!b) {
      b = new Map();
      map.set(key, b);
    }
    return b;
  }
}

export const projectRegistry = new ProjectRegistry();
