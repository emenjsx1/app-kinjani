const UNSPLASH_URL_PATTERN = /https?:\/\/(?:images|source)\.unsplash\.com\/[^"'\s)<>]+/gi;

function sanitizeSeed(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "image";
}

function defaultHeight(width: number) {
  if (width <= 320) return width;
  if (width <= 640) return Math.round(width * 0.75);
  return Math.round(width * 0.5625);
}

function mapUnsplashToStableImage(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    let width = Number(url.searchParams.get("w")) || 1600;
    let height = Number(url.searchParams.get("h")) || defaultHeight(width);
    let seed = "image";

    if (url.hostname === "source.unsplash.com") {
      const sizeMatch = url.pathname.match(/\/(\d+)x(\d+)\/?$/);
      if (sizeMatch) {
        width = Number(sizeMatch[1]) || width;
        height = Number(sizeMatch[2]) || height;
      }
      seed = sanitizeSeed(url.search.slice(1) || url.pathname || "image");
    } else {
      const photoMatch = url.pathname.match(/photo-([a-z0-9-]+)/i);
      seed = sanitizeSeed(photoMatch?.[1] || `${width}x${height}`);
    }

    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
  } catch {
    return "https://picsum.photos/seed/image/1600/900";
  }
}

export function normalizeGeneratedHtml(html: string) {
  if (!html) return html;
  return html.replace(UNSPLASH_URL_PATTERN, mapUnsplashToStableImage);
}

export function extractFirstJsonObject(input: string) {
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaping = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (inString) {
      if (escaping) {
        escaping = false;
      } else if (char === "\\") {
        escaping = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      if (depth === 0) start = i;
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        return input.slice(start, i + 1);
      }
    }
  }

  return null;
}

export function parseAssistantJsonResponse(raw: string) {
  try {
    const direct = JSON.parse(raw);
    if (direct && typeof direct === "object") return direct;
  } catch {
    // noop
  }

  const extracted = extractFirstJsonObject(raw);
  if (!extracted) return null;

  try {
    const parsed = JSON.parse(extracted);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}