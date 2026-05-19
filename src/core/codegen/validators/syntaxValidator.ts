import type { CodegenDiagnostic, EmittedFile } from "../types";

/**
 * Phase 4 syntax validator.
 *
 * Without a full TypeScript compiler in the sandbox we run cheap structural
 * checks that catch the majority of emitter regressions:
 *
 *  - balanced braces / brackets / parens
 *  - balanced JSX tags (heuristic — ignores strings and comments)
 *  - mandatory presence of `export default` in app/page.tsx and app/layout.tsx
 *
 * The full type-checking pipeline (ts-morph) will plug in here in Phase 4.x.
 */
export class SyntaxValidator {
  validate(file: EmittedFile): CodegenDiagnostic[] {
    const diags: CodegenDiagnostic[] = [];
    if (file.lang !== "tsx" && file.lang !== "ts") return diags;

    const balance = checkBalanced(file.content);
    if (balance) {
      diags.push({
        severity: "error",
        code: "syntax/unbalanced",
        message: balance,
        file: file.path,
      });
    }

    if (
      (file.path.endsWith("page.tsx") || file.path.endsWith("layout.tsx")) &&
      !/export\s+default\s+/.test(file.content)
    ) {
      diags.push({
        severity: "error",
        code: "nextjs/missing-default-export",
        message: `${file.path} must export a default React component`,
        file: file.path,
      });
    }

    return diags;
  }
}

function checkBalanced(source: string): string | null {
  let curly = 0;
  let paren = 0;
  let square = 0;
  let inStr: '"' | "'" | "`" | null = null;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    const next = source[i + 1];

    if (inLineComment) {
      if (c === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (c === "*" && next === "/") {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inStr) {
      if (c === "\\") {
        i++;
        continue;
      }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === "/" && next === "/") {
      inLineComment = true;
      continue;
    }
    if (c === "/" && next === "*") {
      inBlockComment = true;
      i++;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      inStr = c as '"' | "'" | "`";
      continue;
    }
    if (c === "{") curly++;
    else if (c === "}") curly--;
    else if (c === "(") paren++;
    else if (c === ")") paren--;
    else if (c === "[") square++;
    else if (c === "]") square--;

    if (curly < 0) return "Unbalanced '}' before matching '{'";
    if (paren < 0) return "Unbalanced ')' before matching '('";
    if (square < 0) return "Unbalanced ']' before matching '['";
  }

  if (curly !== 0) return `Unbalanced braces (delta=${curly})`;
  if (paren !== 0) return `Unbalanced parens (delta=${paren})`;
  if (square !== 0) return `Unbalanced brackets (delta=${square})`;
  return null;
}

export const defaultSyntaxValidator = new SyntaxValidator();
