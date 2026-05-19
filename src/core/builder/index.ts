/**
 * Builder orchestration entry point. Wires the engines together so feature
 * code talks to one façade instead of importing each subsystem directly.
 */
import { defaultPreviewEngine, previewEngineRegistry } from "@/core/preview";
import { TemplateJsonGenerator } from "@/core/generator";
import { NextProjectGenerator } from "@/core/codegen/NextProjectGenerator";
import { componentRegistry } from "@/core/registry";
import { NoopRuntime, runtimeRegistry } from "@/core/runtime";
import { InMemoryFileSystem } from "@/core/filesystem";
import { websiteAIService } from "@/core/ai/services/WebsiteAIService";
import { exporter } from "@/core/export";

export const builder = {
  preview: defaultPreviewEngine,
  previewEngines: previewEngineRegistry,
  /** Legacy JSON snapshot generator. */
  generator: new TemplateJsonGenerator(),
  /** Real code generator: emits a standalone Next.js App Router project. */
  codegen: new NextProjectGenerator(),
  /** Legacy default runtime. Real engines live in `runtimes`. */
  runtime: new NoopRuntime(),
  runtimes: runtimeRegistry,
  /** Phase 5 export pipeline (codegen + assets + zip). */
  export: exporter,
  registry: componentRegistry,
  filesystem: new InMemoryFileSystem(),
  ai: { website: websiteAIService },
};

export type Builder = typeof builder;
