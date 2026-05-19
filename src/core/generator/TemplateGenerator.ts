import { InMemoryFileSystem } from "@/core/filesystem/InMemoryFileSystem";
import type { CodeGenerator, GenerateResult } from "./types";
import type { Project } from "@/core/projects/types";

/**
 * Phase 1 stub: emits the project as a single JSON file. Real TSX emission
 * lives in a future TsxEmitGenerator.
 */
export class TemplateJsonGenerator implements CodeGenerator {
  id = "template-json" as const;
  async generate(project: Project): Promise<GenerateResult> {
    const file = InMemoryFileSystem.fileFrom(
      `/projects/${project.id}/project.json`,
      JSON.stringify(project, null, 2),
    );
    return { files: [file], warnings: [] };
  }
}
