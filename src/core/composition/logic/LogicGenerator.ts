/**
 * LogicGenerator — bridges the freeform pipeline to produce hooks, state
 * machines, forms, handlers, and async flows. All generated logic flows
 * through FreeformPipeline (parse → lint → sandbox) before binding.
 *
 * The generator exposes typed convenience methods so the AI orchestrator
 * does not need to know the underlying prompt shape.
 */

import { freeform } from "../../freeform";
import type { FreeformOutcome } from "../../freeform/types";

export interface LogicSpec {
  projectId: string;
  /** Concise behavior description. */
  description: string;
  /** Optional input/output shape hints fed into the prompt. */
  shape?: { input?: Record<string, string>; output?: Record<string, string> };
  /** Optional design tokens / dependencies. */
  designTokens?: Record<string, string>;
  allowedImports?: string[];
  seed?: number;
}

export class LogicGenerator {
  hook(name: string, spec: LogicSpec): Promise<FreeformOutcome> {
    return freeform.pipeline.generate({
      projectId: spec.projectId,
      prompt: buildPrompt("hook", name, spec),
      kind: "hook",
      name,
      mode: "creative",
      designTokens: spec.designTokens,
      allowedImports: spec.allowedImports,
      seed: spec.seed,
      authorAgent: "LogicGenerator",
    });
  }

  stateMachine(name: string, spec: LogicSpec): Promise<FreeformOutcome> {
    return freeform.pipeline.generate({
      projectId: spec.projectId,
      prompt: buildPrompt("state-machine", name, spec),
      kind: "utility",
      name,
      mode: "creative",
      designTokens: spec.designTokens,
      allowedImports: spec.allowedImports,
      seed: spec.seed,
      authorAgent: "LogicGenerator",
    });
  }

  form(name: string, spec: LogicSpec): Promise<FreeformOutcome> {
    return freeform.pipeline.generate({
      projectId: spec.projectId,
      prompt: buildPrompt("form", name, spec),
      kind: "form",
      name,
      mode: "creative",
      designTokens: spec.designTokens,
      allowedImports: ["zod", "react-hook-form", ...(spec.allowedImports ?? [])],
      seed: spec.seed,
      authorAgent: "LogicGenerator",
    });
  }

  handler(name: string, spec: LogicSpec): Promise<FreeformOutcome> {
    return freeform.pipeline.generate({
      projectId: spec.projectId,
      prompt: buildPrompt("handler", name, spec),
      kind: "handler",
      name,
      mode: "creative",
      designTokens: spec.designTokens,
      allowedImports: spec.allowedImports,
      seed: spec.seed,
      authorAgent: "LogicGenerator",
    });
  }

  async(name: string, spec: LogicSpec): Promise<FreeformOutcome> {
    return freeform.pipeline.generate({
      projectId: spec.projectId,
      prompt: buildPrompt("async", name, spec),
      kind: "utility",
      name,
      mode: "creative",
      designTokens: spec.designTokens,
      allowedImports: spec.allowedImports,
      seed: spec.seed,
      authorAgent: "LogicGenerator",
    });
  }
}

function buildPrompt(kind: string, name: string, spec: LogicSpec): string {
  const shape = spec.shape
    ? `Input shape: ${JSON.stringify(spec.shape.input ?? {})}\nOutput shape: ${JSON.stringify(spec.shape.output ?? {})}\n`
    : "";
  return `Generate a ${kind} named ${name}.
${shape}Behavior:
${spec.description}`;
}

export const logicGenerator = new LogicGenerator();
