/**
 * Deterministic printer: AST nodes -> TSX source code.
 *
 * Keeps output stable (sorted imports, normalized whitespace) so generated
 * projects diff cleanly across runs. When ts-morph is wired in, this printer
 * is replaced without touching emitters.
 */
import { attrValueToSource, escapeText } from "./builders";
import type {
  ImportStatement,
  JsxAttr,
  JsxChild,
  JsxNode,
  ReactComponentDecl,
  TsxModule,
} from "./nodes";

const INDENT = "  ";

function indent(level: number, line: string): string {
  return INDENT.repeat(level) + line;
}

/* ----------------- Imports ----------------- */

function compareImports(a: ImportStatement, b: ImportStatement): number {
  const rank = (m: string): number => {
    if (m.startsWith(".")) return 3;
    if (m.startsWith("@/")) return 2;
    if (m.startsWith("next") || m === "react") return 0;
    return 1;
  };
  const ra = rank(a.module);
  const rb = rank(b.module);
  if (ra !== rb) return ra - rb;
  return a.module.localeCompare(b.module);
}

function printImport(i: ImportStatement): string {
  const prefix = i.typeOnly ? "import type " : "import ";
  const parts: string[] = [];
  if (i.defaultImport) parts.push(i.defaultImport);
  if (i.named && i.named.length) {
    const named = [...new Set(i.named)].sort().join(", ");
    parts.push(`{ ${named} }`);
  }
  if (!parts.length) return `${prefix}"${i.module}";`;
  return `${prefix}${parts.join(", ")} from "${i.module}";`;
}

/* ----------------- JSX ----------------- */

function printAttrs(attrs: JsxAttr[]): string {
  return attrs
    .map((a) => {
      if (a.spread) return `{...${a.name}}`;
      if (!a.value) return a.name;
      const v = attrValueToSource(a.value);
      return v === "" ? a.name : `${a.name}=${v}`;
    })
    .join(" ");
}

function printJsxChild(child: JsxChild, level: number): string[] {
  if (child.kind === "text") {
    const value = escapeText(child.value).trim();
    return value ? [indent(level, value)] : [];
  }
  if (child.kind === "expr") {
    return [indent(level, `{${child.value}}`)];
  }
  return printJsxNode(child, level);
}

function printJsxNode(node: JsxNode, level: number): string[] {
  // Fragment
  if (!node.name) {
    const lines: string[] = [indent(level, "<>")];
    for (const c of node.children ?? []) lines.push(...printJsxChild(c, level + 1));
    lines.push(indent(level, "</>"));
    return lines;
  }

  const attrs = node.attrs?.length ? " " + printAttrs(node.attrs) : "";
  const hasChildren = !!node.children?.length;

  if (!hasChildren) {
    return [indent(level, `<${node.name}${attrs} />`)];
  }

  // Single short text child -> inline
  if (
    node.children!.length === 1 &&
    node.children![0].kind === "text" &&
    node.children![0].value.length < 60
  ) {
    const t = escapeText(node.children![0].value).trim();
    return [indent(level, `<${node.name}${attrs}>${t}</${node.name}>`)];
  }

  const lines: string[] = [indent(level, `<${node.name}${attrs}>`)];
  for (const c of node.children!) lines.push(...printJsxChild(c, level + 1));
  lines.push(indent(level, `</${node.name}>`));
  return lines;
}

/* ----------------- Component ----------------- */

function printComponent(decl: ReactComponentDecl): string[] {
  const lines: string[] = [];
  const asyncKw = decl.async ? "async " : "";
  const params = decl.params ?? "()";
  lines.push(`export default ${asyncKw}function ${decl.name}${params} {`);
  for (const stmt of decl.body ?? []) lines.push(indent(1, stmt));
  lines.push(indent(1, "return ("));
  const jsxLines = printJsxNode(decl.jsx, 2);
  lines.push(...jsxLines);
  lines.push(indent(1, ");"));
  lines.push("}");
  return lines;
}

/* ----------------- Module ----------------- */

export function printModule(mod: TsxModule): string {
  const out: string[] = [];

  if (mod.directives?.length) {
    for (const d of mod.directives) out.push(`"${d}";`);
    out.push("");
  }
  if (mod.banner?.length) {
    out.push("/**");
    for (const b of mod.banner) out.push(` * ${b}`);
    out.push(" */");
  }

  const imports = [...mod.imports].sort(compareImports);
  for (const imp of imports) out.push(printImport(imp));
  if (imports.length) out.push("");

  if (mod.declarations?.length) {
    for (const d of mod.declarations) {
      out.push(d);
      out.push("");
    }
  }

  if (mod.defaultExport) {
    out.push(...printComponent(mod.defaultExport));
    out.push("");
  }

  if (mod.namedExports?.length) {
    for (const ne of mod.namedExports) {
      out.push(ne);
      out.push("");
    }
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}
