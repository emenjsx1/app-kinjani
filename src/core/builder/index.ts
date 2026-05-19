/**
 * Builder orchestration entry point. Wires the engines together so feature
 * code talks to one façade instead of importing each subsystem directly.
 */
import { defaultPreviewEngine } from "@/core/preview";
import { TemplateJsonGenerator } from "@/core/generator";
import { NextProjectGenerator } from "@/core/codegen/NextProjectGenerator";
import { componentRegistry } from "@/core/registry";
import { NoopRuntime } from "@/core/runtime/types";
import { InMemoryFileSystem } from "@/core/filesystem";
import { websiteAIService } from "@/core/ai/services/WebsiteAIService";

export const builder = {
  preview: defaultPreviewEngine,
  /** Legacy JSON snapshot generator. */
  generator: new TemplateJsonGenerator(),
  /** Real code generator: emits a standalone Next.js App Router project. */
  codegen: new NextProjectGenerator(),
  runtime: new NoopRuntime(),
  registry: componentRegistry,
  filesystem: new InMemoryFileSystem(),
  ai: { website: websiteAIService },
};

export type Builder = typeof builder;
