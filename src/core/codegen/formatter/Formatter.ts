/**
 * Lightweight, dependency-free formatter for emitted source.
 *
 * The TSX printer already produces stable indentation, so this pass only:
 *  - normalizes EOLs to "\n"
 *  - trims trailing whitespace
 *  - collapses 3+ blank lines into 1
 *  - ensures the file ends with exactly one newline
 *
 * When a real formatter (prettier-wasm) is wired in, only this module changes.
 */
export interface FormatOptions {
  trailingNewline?: boolean;
}

export class Formatter {
  format(source: string, _file?: string, opts: FormatOptions = {}): string {
    const trailingNewline = opts.trailingNewline ?? true;
    const normalized = source
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+$/gm, "")
      .replace(/\n{3,}/g, "\n\n");
    if (!trailingNewline) return normalized;
    return normalized.endsWith("\n") ? normalized : normalized + "\n";
  }
}

export const defaultFormatter = new Formatter();
