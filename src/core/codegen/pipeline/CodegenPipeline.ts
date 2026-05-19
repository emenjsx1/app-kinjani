/**
 * End-to-end code generation pipeline.
 *
 *   project
 *     ↓ target.emit            (structured AST -> source)
 *     ↓ formatter              (deterministic whitespace)
 *     ↓ validator              (balanced syntax, mandatory exports)
 *     ↓ graph                  (cycle + dangling-import checks)
 *     ↓ result                 (files + diagnostics + graph)
 *
 * Targets call into formatter/validator themselves so the pipeline just
 * orchestrates target selection + emitter registration + diagnostics gating.
 *
 * This pipeline produces no runtime side-effects — emitted files are returned
 * to the caller, who decides where to land them (FileSystem, ZIP, Sandpack).
 */
import type {
  CodegenFlags,
  CodegenResult,
  CodegenTarget,
  ComponentEmitterRegistry,
} from "../types";
import type { Project } from "@/core/projects/types";
import { componentEmitterRegistry } from "../emitter/EmitterRegistry";
import { registerBuiltinEmitters } from "../emitter";

export interface CodegenPipelineOptions {
  emitters?: ComponentEmitterRegistry;
  flags?: CodegenFlags;
}

export class CodegenPipeline {
  private readonly emitters: ComponentEmitterRegistry;

  constructor(opts: CodegenPipelineOptions = {}) {
    registerBuiltinEmitters();
    this.emitters = opts.emitters ?? componentEmitterRegistry;
  }

  async run(target: CodegenTarget, project: Project, flags?: CodegenFlags): Promise<CodegenResult> {
    return target.emit(project, { emitters: this.emitters, flags });
  }

  /** True iff there are no error-level diagnostics. */
  static isClean(result: CodegenResult): boolean {
    return !result.diagnostics.some((d) => d.severity === "error");
  }
}
