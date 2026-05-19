/**
 * Phase 5 — Export Pipeline.
 *
 * Composes:
 *   1. CodegenPipeline (real code emission)
 *   2. AssetPipeline   (syncs Project.assets into public/)
 *   3. README          (portability docs)
 *   4. ZipPacker       (downloadable archive)
 *
 * The result is a standalone, editable, deployable Next.js project.
 */
import type { Project } from "@/core/projects/types";
import { CodegenPipeline } from "@/core/codegen/pipeline/CodegenPipeline";
import { NextAppRouterTarget } from "@/core/codegen/targets/NextAppRouterTarget";
import type { CodegenResult } from "@/core/codegen/types";
import { AssetPipeline } from "./AssetPipeline";
import { ZipPacker } from "./ZipPacker";
import { renderReadme } from "./readme";
import type {
  ExportArtifact,
  ExportOptions,
  ExportResult,
  ZipBlobResult,
} from "./types";

export class ExportPipeline {
  private codegen = new CodegenPipeline();
  private target = new NextAppRouterTarget();
  private packer = new ZipPacker();

  /** Run the full export pipeline and return an in-memory artifact list. */
  async run(project: Project, opts: ExportOptions = {}): Promise<ExportResult> {
    const started = Date.now();
    const result = await this.codegen.run(this.target, project);
    const assetPipeline = new AssetPipeline({
      fetchTimeoutMs: opts.assetFetchTimeoutMs,
      inlineRemote: opts.inlineRemoteAssets,
    });
    const synced = await assetPipeline.sync(project);

    const artifacts: ExportArtifact[] = [
      ...this.codegenArtifacts(result),
      ...synced.artifacts,
    ];

    if (opts.includeReadme !== false) {
      artifacts.push({ path: "README.md", content: renderReadme(project) });
    }

    const sizeBytes = artifacts.reduce((sum, a) => sum + a.content.length, 0);

    return {
      artifacts,
      assets: synced.assets,
      graph: result.graph,
      sizeBytes,
      durationMs: Date.now() - started,
      warnings: [
        ...synced.warnings,
        ...result.diagnostics
          .filter((d) => d.severity !== "info")
          .map((d) => `[${d.severity}] ${d.code}: ${d.message}`),
      ],
    };
  }

  /** Run the pipeline and pack the result into a downloadable zip blob. */
  async runToZip(project: Project, opts: ExportOptions = {}): Promise<ZipBlobResult> {
    const result = await this.run(project, opts);
    const filename = `${slug(project.name) || "project"}.zip`;
    const { blob, size } = await this.packer.pack(result.artifacts, filename);
    return { ...result, blob, filename, sizeBytes: size };
  }

  /** Run + pack + trigger browser download. */
  async download(project: Project, opts: ExportOptions = {}): Promise<ZipBlobResult> {
    const result = await this.runToZip(project, opts);
    this.packer.download(result.blob, result.filename);
    return result;
  }

  private codegenArtifacts(result: CodegenResult): ExportArtifact[] {
    return result.files.map((f) => ({ path: f.path, content: f.content }));
  }
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
