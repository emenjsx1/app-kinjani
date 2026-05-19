/**
 * Asset pipeline: synchronizes a project's asset graph into the
 * generated `public/` folder so the exported project is fully self-
 * contained.
 *
 * - data: URLs are decoded and emitted verbatim.
 * - http(s) URLs are fetched (with timeout) and bundled.
 * - relative paths are passed through.
 */
import type { Project, ProjectAsset } from "@/core/projects/types";
import type { ExportArtifact, ExportedAsset } from "./types";

const DEFAULT_TIMEOUT = 8000;

const EXT_BY_KIND: Record<ProjectAsset["kind"], string> = {
  image: "png",
  video: "mp4",
  file: "bin",
  icon: "svg",
  font: "woff2",
};

export interface AssetPipelineOptions {
  fetchTimeoutMs?: number;
  inlineRemote?: boolean;
}

export class AssetPipeline {
  constructor(private opts: AssetPipelineOptions = {}) {}

  async sync(project: Project): Promise<{
    artifacts: ExportArtifact[];
    assets: ExportedAsset[];
    warnings: string[];
  }> {
    const artifacts: ExportArtifact[] = [];
    const assets: ExportedAsset[] = [];
    const warnings: string[] = [];
    const inline = this.opts.inlineRemote !== false;

    let i = 0;
    for (const asset of project.assets ?? []) {
      const filename = this.outputName(asset, i++);
      const outputPath = `public/${filename}`;

      if (asset.url.startsWith("data:")) {
        const artifact = decodeDataUrl(outputPath, asset.url);
        if (artifact) {
          artifacts.push(artifact);
          assets.push({ id: asset.id, outputPath, source: asset.url, bundled: true, size: artifact.content.length });
        } else {
          assets.push({ id: asset.id, outputPath, source: asset.url, bundled: false, error: "invalid data url" });
          warnings.push(`Asset ${asset.id}: invalid data URL`);
        }
        continue;
      }

      if (asset.url.startsWith("http://") || asset.url.startsWith("https://")) {
        if (!inline) {
          assets.push({ id: asset.id, outputPath, source: asset.url, bundled: false });
          continue;
        }
        try {
          const fetched = await this.fetchAsset(asset.url);
          artifacts.push({ path: outputPath, content: fetched.base64, binary: true });
          assets.push({ id: asset.id, outputPath, source: asset.url, bundled: true, size: fetched.size });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          assets.push({ id: asset.id, outputPath, source: asset.url, bundled: false, error: msg });
          warnings.push(`Asset ${asset.id} (${asset.url}): ${msg}`);
        }
        continue;
      }

      // Relative / unknown — record but do not bundle.
      assets.push({ id: asset.id, outputPath, source: asset.url, bundled: false });
    }

    return { artifacts, assets, warnings };
  }

  private outputName(asset: ProjectAsset, index: number): string {
    if (asset.path) return asset.path.replace(/^\/+/, "");
    const ext = guessExt(asset.url) ?? EXT_BY_KIND[asset.kind] ?? "bin";
    const safeId = asset.id.replace(/[^a-zA-Z0-9_-]/g, "_");
    return `assets/${safeId || `asset-${index}`}.${ext}`;
  }

  private async fetchAsset(url: string): Promise<{ base64: string; size: number }> {
    const timeout = this.opts.fetchTimeoutMs ?? DEFAULT_TIMEOUT;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      return { base64: arrayBufferToBase64(buf), size: buf.byteLength };
    } finally {
      clearTimeout(t);
    }
  }
}

function decodeDataUrl(outputPath: string, url: string): ExportArtifact | null {
  const match = /^data:([^;,]+)?(?:;base64)?,(.*)$/.exec(url);
  if (!match) return null;
  const isBase64 = url.includes(";base64,");
  return { path: outputPath, content: match[2], binary: isBase64 };
}

function guessExt(url: string): string | null {
  const m = /\.([a-zA-Z0-9]{2,5})(?:\?|$)/.exec(url);
  return m ? m[1].toLowerCase() : null;
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return typeof btoa !== "undefined" ? btoa(binary) : Buffer.from(binary, "binary").toString("base64");
}
