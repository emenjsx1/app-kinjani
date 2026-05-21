export function normalizeGeneratedHtml(html: string) {
  if (!html) return html;
  return html;
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