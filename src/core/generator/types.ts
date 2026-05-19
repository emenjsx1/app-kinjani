import type { Project } from "@/core/projects/types";
import type { ProjectFile } from "@/core/filesystem/types";

/**
 * CodeGenerator abstracts code emission. Phase 1 ships a stub that emits the
 * project JSON; future phases emit real TSX/JSX files.
 */
export interface GenerateResult {
  files: ProjectFile[];
  warnings: string[];
}

export interface CodeGenerator {
  id: "template-json" | "tsx-emit";
  generate(project: Project): Promise<GenerateResult>;
}
