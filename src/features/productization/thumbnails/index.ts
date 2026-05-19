/**
 * Project Thumbnail Engine.
 *
 * Generates a visual preview snapshot from a live DOM node and caches it
 * per project id. Uses an SVG-foreignObject pipeline so it works without
 * any third-party dep (html2canvas etc). Thumbnails are stored as
 * `data:image/svg+xml` URLs for fast in-memory access; consumers can
 * convert to PNG via canvas if needed.
 */

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  background?: string;
}

interface CacheEntry {
  url: string;
  generatedAt: number;
}

class ThumbnailEngineImpl {
  private cache = new Map<string, CacheEntry>();
  private listeners = new Set<(projectId: string, url: string) => void>();

  /** Capture a DOM node into a serialized SVG data URL. */
  async capture(
    projectId: string,
    node: HTMLElement,
    opts: ThumbnailOptions = {},
  ): Promise<string> {
    const w = opts.width ?? node.clientWidth ?? 1280;
    const h = opts.height ?? node.clientHeight ?? 720;
    const bg = opts.background ?? "hsl(var(--background))";

    const cloned = node.cloneNode(true) as HTMLElement;
    cloned.style.background = bg;
    cloned.style.width = `${w}px`;
    cloned.style.height = `${h}px`;

    const html = new XMLSerializer().serializeToString(cloned);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><foreignObject width="100%" height="100%">${wrapXhtml(html)}</foreignObject></svg>`;
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

    this.cache.set(projectId, { url, generatedAt: Date.now() });
    for (const l of this.listeners) l(projectId, url);
    return url;
  }

  /** Synchronous lookup. */
  get(projectId: string): string | undefined {
    return this.cache.get(projectId)?.url;
  }

  /** Persist a precomputed thumbnail URL (e.g. uploaded screenshot). */
  set(projectId: string, url: string): void {
    this.cache.set(projectId, { url, generatedAt: Date.now() });
    for (const l of this.listeners) l(projectId, url);
  }

  subscribe(listener: (projectId: string, url: string) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  invalidate(projectId: string): void {
    this.cache.delete(projectId);
  }

  /** Convert any captured thumbnail to a PNG data URL via canvas. */
  async toPng(projectId: string): Promise<string | null> {
    const entry = this.cache.get(projectId);
    if (!entry || typeof document === "undefined") return null;
    return await rasterize(entry.url);
  }
}

function wrapXhtml(html: string): string {
  return `<div xmlns="http://www.w3.org/1999/xhtml" style="all:initial;font-family:inherit;">${html}</div>`;
}

async function rasterize(svgUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0);
      try {
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = svgUrl;
  });
}

export const thumbnailEngine = new ThumbnailEngineImpl();
