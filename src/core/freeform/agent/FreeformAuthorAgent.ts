/**
 * FreeformAuthorAgent
 *
 * The AI agent responsible for authoring arbitrary TSX (components, hooks,
 * utilities, etc.). It produces candidate source code with explicit
 * constraints — but never directly mutates runtime, registry, or store.
 *
 * The agent is transport-agnostic: it accepts an `LLMClient` function so the
 * platform can swap models (Lovable AI Gateway, Edge Function proxies, etc.)
 * without rewriting the pipeline.
 */

import type { FreeformGenerationRequest } from "../types";

export interface LLMClient {
  (req: { system: string; user: string; seed?: number }): Promise<string>;
}

export interface AuthorDraft {
  source: string;
  notes: string[];
}

const SYSTEM_BASE = `You are FreeformAuthorAgent, an AI that writes SAFE, MODERN, PRODUCTION-GRADE TSX.
Strict rules:
 - Output a SINGLE TypeScript React file. No markdown fences, no commentary.
 - Default export the main component / hook / utility.
 - Use ONLY allowed imports: react, framer-motion, motion/react, lucide-react,
   clsx, tailwind-merge, class-variance-authority, zod, plus project-relative imports.
 - Use Tailwind utility classes only. Inherit design tokens via CSS variables
   when provided (var(--token)).
 - NEVER use: eval, new Function, document.write, process.env, fs, child_process,
   raw <script> injection, direct window.location assignment.
 - Generate semantic, accessible markup. Always handle responsive states.
 - Keep components self-contained: no global side effects at module scope.
`;

export class FreeformAuthorAgent {
  constructor(private readonly llm: LLMClient) {}

  async draft(req: FreeformGenerationRequest): Promise<AuthorDraft> {
    const designTokensLine = req.designTokens
      ? "Design tokens (use as CSS variables): " +
        Object.keys(req.designTokens)
          .map((k) => `var(--${k})`)
          .join(", ")
      : "";

    const kindLine = `Artifact kind: ${req.kind}.`;
    const nameLine = req.name ? `Suggested export name: ${req.name}.` : "";
    const allowList = req.allowedImports?.length
      ? `Additionally-allowed imports: ${req.allowedImports.join(", ")}.`
      : "";

    const system = [SYSTEM_BASE, kindLine, nameLine, designTokensLine, allowList]
      .filter(Boolean)
      .join("\n");

    const source = await this.llm({
      system,
      user: req.prompt,
      seed: req.seed,
    });

    return {
      source: stripCodeFences(source),
      notes: [],
    };
  }

  async repair(
    req: FreeformGenerationRequest,
    previousSource: string,
    errors: string[],
  ): Promise<AuthorDraft> {
    const system =
      SYSTEM_BASE +
      "\nYou are repairing a previous draft. Return the FULL fixed file. Do not explain.";
    const user = `Errors to fix:\n${errors.map((e) => `- ${e}`).join("\n")}

Previous source:
${previousSource}

Original prompt:
${req.prompt}`;
    const source = await this.llm({ system, user, seed: req.seed });
    return { source: stripCodeFences(source), notes: errors };
  }
}

function stripCodeFences(s: string): string {
  const t = s.trim();
  if (t.startsWith("```")) {
    return t.replace(/^```(?:tsx|ts|jsx|js)?\s*/i, "").replace(/```\s*$/, "").trim();
  }
  return t;
}
