import JSZip from "jszip";
import type { ExportArtifact } from "./types";

/**
 * Deterministic zip packer. Emits one zip blob from a list of
 * ExportArtifacts (text or base64-binary).
 */
export class ZipPacker {
  async pack(artifacts: ExportArtifact[], filename: string): Promise<{ blob: Blob; size: number }> {
    const zip = new JSZip();
    for (const a of artifacts) {
      if (a.binary) {
        zip.file(a.path, a.content, { base64: true });
      } else {
        zip.file(a.path, a.content);
      }
    }
    const blob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });
    return { blob, size: blob.size };
  }

  /** Browser-only convenience: trigger a download for the produced blob. */
  download(blob: Blob, filename: string): void {
    if (typeof document === "undefined") return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
