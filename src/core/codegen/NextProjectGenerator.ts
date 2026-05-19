/**
 * High-level CodeGenerator adapter that exposes the Next.js App Router target
 * through the existing CodeGenerator contract used by `core/builder`.
 *
 * This is the single entry point feature code (and the future Export UI)
 * should call when it wants real code out of a Project.
 */
import { InMemoryFileSystem } from "@/core/filesystem/InMemoryFileSystem";
import type { CodeGenerator, GenerateResult } from "@/core/generator/types";
import type { Project } from "@/core/projects/types";
import { CodegenPipeline } from "./pipeline/CodegenPipeline";
import { NextAppRouterTarget } from "./targets/NextAppRouterTarget";
import type { SerializedFileGraph } from "./types";

export class NextProjectGenerator implements CodeGenerator {
  id = "tsx-emit" as const;
  readonly target = new NextAppRouterTarget();
  readonly pipeline = new CodegenPipeline();

  /** Last serialized file graph for downstream tools (lineage / export). */
  lastGraph: SerializedFileGraph | null = null;

  async generate(project: Project): Promise<GenerateResult> {
    const result = await this.pipeline.run(this.target, project);
    this.lastGraph = result.graph;
    const files = result.files.map((f) =>
      InMemoryFileSystem.fileFrom(`/projects/${project.id}/${f.path}`, f.content),
    );
    return {
      files,
      warnings: result.diagnostics.map(
        (d) => `[${d.severity}] ${d.code}: ${d.message}${d.file ? ` (${d.file})` : ""}`,
      ),
    };
  }
}
