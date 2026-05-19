/**
 * Phase 5 — Export system types.
 *
 * The export pipeline takes a `Project`, runs codegen, joins the result
 * with synced assets, packages a README + lock-free package.json, and
 * produces a downloadable zip.
 *
 * The output is intentionally portable: no platform lock-in. The user
 * can `unzip && npm install && npm run dev` outside Lovable.
 */
import type { EmittedFile, SerializedFileGraph } from "@/core/codegen/types";

export type ExportFormat = "zip" | "files";

export interface ExportOptions {
  /** Output format. */
  format?: ExportFormat;
  /** Include a README in the output. Default true. */
  includeReadme?: boolean;
  /** Include lockfile placeholder. Default false. */
  includeLockfile?: boolean;
  /** Fetch remote asset URLs into public/. Default true. */
  inlineRemoteAssets?: boolean;
  /** Per-asset fetch timeout in ms. */
  assetFetchTimeoutMs?: number;
  /** Codegen target id. Defaults to "next-app-router". */
  target?: "next-app-router";
}

export interface ExportedAsset {
  /** Original asset id from the Project. */
  id: string;
  /** Output path inside the exported project (relative). */
  outputPath: string;
  /** Original source URL. */
  source: string;
  /** Bytes fetched. */
  size?: number;
  /** Whether the fetch succeeded. If false the asset is referenced but not bundled. */
  bundled: boolean;
  error?: string;
}

export interface ExportArtifact {
  /** Relative path inside the zip / output. */
  path: string;
  /** Text content (for binary assets, this is base64 + binary=true). */
  content: string;
  binary?: boolean;
}

export interface ExportResult {
  /** Files that compose the exported project. */
  artifacts: ExportArtifact[];
  /** Synced assets (success + failure). */
  assets: ExportedAsset[];
  /** Codegen file graph (for downstream tooling). */
  graph: SerializedFileGraph | null;
  /** Total bytes (rough estimate). */
  sizeBytes: number;
  /** Total time in ms. */
  durationMs: number;
  /** Warnings (asset failures, missing fields, etc.). */
  warnings: string[];
}

export interface ZipBlobResult extends ExportResult {
  blob: Blob;
  filename: string;
}

export interface ExportSource {
  /** Project files emitted by codegen. */
  files: EmittedFile[];
  /** Serialized file graph (optional). */
  graph: SerializedFileGraph | null;
}
