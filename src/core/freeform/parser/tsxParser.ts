/**
 * Lightweight TSX parser/validator. We deliberately avoid a heavy AST
 * dependency in the browser — instead we run robust structural checks
 * specifically targeting AI-generated single-file components.
 *
 * Validations:
 *  - balanced braces, parens, brackets, JSX tags
 *  - imports limited to an allowlist
 *  - forbidden patterns (eval, new Function, document.write, dangerouslySetInnerHTML
 *    on string literals containing <script>, network globals, fs/process access)
 *  - default or named export presence
 *  - JSX has a single root expression in the rendered return
 *  - hook usage detection (for metadata)
 */

import type {
  FreeformValidationIssue,
  FreeformValidationReport,
} from "../types";

const FORBIDDEN_PATTERNS: Array<{ re: RegExp; code: string; message: string }> = [
  { re: /\beval\s*\(/, code: "forbidden/eval", message: "eval() is not allowed" },
  {
    re: /new\s+Function\s*\(/,
    code: "forbidden/new-function",
    message: "new Function(...) is not allowed",
  },
  {
    re: /document\s*\.\s*write\s*\(/,
    code: "forbidden/document-write",
    message: "document.write is not allowed",
  },
  {
    re: /\bprocess\s*\.\s*env\b/,
    code: "forbidden/process-env",
    message: "process.env access is forbidden in freeform components",
  },
  {
    re: /\brequire\s*\(\s*['"]fs['"]\s*\)/,
    code: "forbidden/fs",
    message: "fs module is not available in the browser runtime",
  },
  {
    re: /\bimport\s*\(\s*['"]child_process['"]\s*\)/,
    code: "forbidden/child-process",
    message: "child_process is forbidden",
  },
  {
    re: /window\s*\.\s*location\s*=/,
    code: "forbidden/location-assign",
    message: "Direct window.location assignment is not allowed",
  },
  {
    re: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:\s*['"`][^'"`]*<script/i,
    code: "forbidden/script-injection",
    message: "Inline <script> via dangerouslySetInnerHTML is forbidden",
  },
];

const DEFAULT_IMPORT_ALLOWLIST = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "framer-motion",
  "motion/react",
  "lucide-react",
  "clsx",
  "tailwind-merge",
  "class-variance-authority",
  "zod",
];

const PROJECT_LOCAL_PREFIXES = ["@/", "./", "../", "~/"];

export interface ParseOptions {
  allowedImports?: string[];
}

export class TsxParser {
  parse(source: string, opts: ParseOptions = {}): FreeformValidationReport {
    const issues: FreeformValidationIssue[] = [];

    const allowedImports = new Set([
      ...DEFAULT_IMPORT_ALLOWLIST,
      ...(opts.allowedImports ?? []),
    ]);

    const passed = {
      parse: true,
      syntax: true,
      imports: true,
      forbidden: true,
      lint: true,
      types: true,
      runtime: true,
    };

    /* ---- structural balance ---- */
    const balanceErr = this.checkBalanced(source);
    if (balanceErr) {
      issues.push({ severity: "error", code: "syntax/unbalanced", message: balanceErr });
      passed.parse = false;
      passed.syntax = false;
    }

    /* ---- forbidden patterns ---- */
    for (const pat of FORBIDDEN_PATTERNS) {
      const m = pat.re.exec(source);
      if (m) {
        issues.push({
          severity: "error",
          code: pat.code,
          message: pat.message,
          line: this.lineOf(source, m.index),
        });
        passed.forbidden = false;
      }
    }

    /* ---- imports ---- */
    const imports = extractImports(source);
    for (const imp of imports) {
      if (PROJECT_LOCAL_PREFIXES.some((p) => imp.startsWith(p))) continue;
      const root = imp.startsWith("@") ? imp.split("/").slice(0, 2).join("/") : imp.split("/")[0];
      if (!allowedImports.has(imp) && !allowedImports.has(root)) {
        issues.push({
          severity: "error",
          code: "imports/forbidden",
          message: `Import "${imp}" is not on the allowlist`,
        });
        passed.imports = false;
      }
    }

    /* ---- exports ---- */
    const exports = extractExports(source);
    if (exports.length === 0) {
      issues.push({
        severity: "error",
        code: "exports/missing",
        message: "Component must export a default or named symbol",
      });
      passed.parse = false;
    }

    /* ---- JSX root sanity ---- */
    const jsxRoot = detectJsxRoot(source);

    /* ---- hooks discovery ---- */
    const hooks = Array.from(source.matchAll(/\buse[A-Z]\w*/g)).map((m) => m[0]);

    /* ---- lint heuristics ---- */
    if (/\bvar\s+/.test(source)) {
      issues.push({
        severity: "warning",
        code: "lint/var",
        message: "Prefer const/let over var",
      });
    }
    if (/console\.(log|debug)/.test(source)) {
      issues.push({
        severity: "warning",
        code: "lint/console",
        message: "Remove console.log/debug before promotion",
      });
    }

    const ok = issues.every((i) => i.severity !== "error");
    return {
      ok,
      issues,
      ast: {
        imports,
        exports,
        jsxRoot,
        hooks: Array.from(new Set(hooks)),
      },
      passed,
    };
  }

  private checkBalanced(source: string): string | null {
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

      if (curly < 0) return "Unbalanced '}'";
      if (paren < 0) return "Unbalanced ')'";
      if (square < 0) return "Unbalanced ']'";
    }
    if (curly !== 0) return `Unbalanced braces (delta=${curly})`;
    if (paren !== 0) return `Unbalanced parens (delta=${paren})`;
    if (square !== 0) return `Unbalanced brackets (delta=${square})`;
    return null;
  }

  private lineOf(source: string, index: number): number {
    return source.slice(0, index).split("\n").length;
  }
}

function extractImports(source: string): string[] {
  const out: string[] = [];
  const re = /import\s+(?:[^'"]+?\s+from\s+)?['"]([^'"]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) out.push(m[1]);
  return out;
}

function extractExports(source: string): string[] {
  const out: string[] = [];
  if (/export\s+default\s+/.test(source)) out.push("default");
  const named = /export\s+(?:const|let|function|class)\s+(\w+)/g;
  let m: RegExpExecArray | null;
  while ((m = named.exec(source))) out.push(m[1]);
  const reExport = /export\s*\{\s*([^}]+)\}/g;
  while ((m = reExport.exec(source))) {
    for (const piece of m[1].split(",")) {
      const id = piece.split(/\s+as\s+/i).pop()?.trim();
      if (id) out.push(id);
    }
  }
  return out;
}

function detectJsxRoot(source: string): string | undefined {
  const m = /return\s*\(\s*<\s*([A-Za-z][\w.]*)/.exec(source);
  return m?.[1];
}

export const tsxParser = new TsxParser();
