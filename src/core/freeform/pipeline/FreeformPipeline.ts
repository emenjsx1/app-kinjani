/**
 * FreeformPipeline
 *
 * Orchestrates the freeform generation lane end-to-end:
 *
 *   draft → parse → forbidden/imports/exports → render-sandbox
 *      → on failure: repair loop (bounded)
 *      → on success: persist as GeneratedArtifact (draft → validated)
 *
 * The pipeline is fully independent of the deterministic registry/emitter
 * pipeline. It only writes to the ProjectRegistry; runtime/codegen consume
 * its output through the GeneratedRegistry view.
 */

import { tsxParser } from "../parser/tsxParser";
import { renderSandbox } from "../sandbox/RenderSandbox";
import { projectRegistry } from "../registry/ProjectRegistry";
import type { FreeformAuthorAgent } from "../agent/FreeformAuthorAgent";
import type {
  FreeformGenerationRequest,
  FreeformOutcome,
  FreeformValidationReport,
  GeneratedArtifact,
} from "../types";

export class FreeformPipeline {
  constructor(private readonly agent: FreeformAuthorAgent) {}

  async generate(req: FreeformGenerationRequest): Promise<FreeformOutcome> {
    if (req.mode !== "creative") {
      return {
        status: "rejected",
        reason: "Freeform pipeline requires mode=creative",
      };
    }

    const maxRepairs = Math.max(0, Math.min(req.maxRepairs ?? 2, 4));
    let attempt = 0;
    let source = (await this.agent.draft(req)).source;
    let report: FreeformValidationReport = await this.validateAll(source, req);
    let repairs = 0;

    while (!report.ok && attempt < maxRepairs) {
      attempt++;
      const errors = report.issues
        .filter((i) => i.severity === "error")
        .map((i) => `[${i.code}] ${i.message}`);
      const repaired = await this.agent.repair(req, source, errors);
      source = repaired.source;
      report = await this.validateAll(source, req);
      repairs++;
    }

    if (!report.ok) {
      return {
        status: "rejected",
        reason: "Validation failed after repair attempts",
        lastSource: source,
        report,
      };
    }

    const artifact = this.persist(req, source, report, repairs);
    return { status: "accepted", artifact };
  }

  private async validateAll(
    source: string,
    req: FreeformGenerationRequest,
  ): Promise<FreeformValidationReport> {
    const report = tsxParser.parse(source, {
      allowedImports: req.allowedImports,
    });
    if (!report.ok) return report;

    const runtime = await renderSandbox.run(source, {
      designTokens: req.designTokens,
    });
    report.passed.runtime = runtime.ok;
    if (!runtime.ok) {
      report.ok = false;
      report.issues.push(...runtime.issues);
    }
    return report;
  }

  private persist(
    req: FreeformGenerationRequest,
    source: string,
    report: FreeformValidationReport,
    repairs: number,
  ): GeneratedArtifact {
    const now = Date.now();
    const id = `art_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const name = req.name ?? deriveName(report.ast.exports, req.kind);
    const modulePath = `src/__generated__/${req.projectId}/${name}.tsx`;

    const artifact: GeneratedArtifact = {
      id,
      projectId: req.projectId,
      kind: req.kind,
      name,
      source,
      modulePath,
      lifecycle: "validated",
      validation: report,
      metadata: {
        authorAgent: req.authorAgent ?? "FreeformAuthorAgent",
        generationPrompt: req.prompt,
        validationStatus: repairs > 0 ? "repaired" : "passed",
        dependencyMap: report.ast.imports,
        runtimeCompatibility: req.runtimeTargets ?? ["sandpack", "webcontainer", "export-tsx"],
        createdAt: now,
        updatedAt: now,
        seed: req.seed,
        repairs,
      },
      history: [
        {
          version: 1,
          source,
          createdAt: now,
          validation: report,
          reason: "initial",
        },
      ],
    };
    projectRegistry.upsertArtifact(artifact);
    return artifact;
  }
}

function deriveName(exports: string[], kind: string): string {
  const named = exports.find((e) => e !== "default");
  if (named) return named;
  const cap = kind.charAt(0).toUpperCase() + kind.slice(1);
  return `Generated${cap}`;
}
