import type { JsxNode } from "../ast/nodes";
import { attrValueToSource, escapeText } from "../ast/builders";

/**
 * Inline JSX printer used by component emitters that return a single
 * JSX expression string (composed by the page emitter).
 *
 * Indentation is relative to the consumer; we emit a flat single-line
 * representation when the node is small, and a multi-line representation
 * otherwise. The page emitter re-indents the result.
 */
const SHORT_LINE = 80;

export function printJsxToString(node: JsxNode, level = 0): string {
  const flat = printFlat(node);
  if (flat.length <= SHORT_LINE && !flat.includes("\n")) return pad(flat, level);
  return printPretty(node, level);
}

function pad(s: string, level: number): string {
  const p = "  ".repeat(level);
  return s
    .split("\n")
    .map((l) => (l ? p + l : l))
    .join("\n");
}

function printFlat(node: JsxNode): string {
  if (!node.name) {
    const inner = (node.children ?? [])
      .map((c) => (c.kind === "element" ? printFlat(c) : c.kind === "text" ? escapeText(c.value) : `{${c.value}}`))
      .join("");
    return `<>${inner}</>`;
  }
  const attrs = (node.attrs ?? [])
    .map((a) => {
      if (a.spread) return `{...${a.name}}`;
      if (!a.value) return a.name;
      const v = attrValueToSource(a.value);
      return v === "" ? a.name : `${a.name}=${v}`;
    })
    .join(" ");
  const attrStr = attrs ? " " + attrs : "";
  if (!node.children?.length) return `<${node.name}${attrStr} />`;
  const inner = node.children
    .map((c) => (c.kind === "element" ? printFlat(c) : c.kind === "text" ? escapeText(c.value).trim() : `{${c.value}}`))
    .join("");
  return `<${node.name}${attrStr}>${inner}</${node.name}>`;
}

function printPretty(node: JsxNode, level: number): string {
  const p = "  ".repeat(level);
  const c = "  ".repeat(level + 1);
  if (!node.name) {
    const lines = [`${p}<>`];
    for (const child of node.children ?? []) {
      lines.push(child.kind === "element" ? printPretty(child, level + 1) : c + (child.kind === "text" ? escapeText(child.value).trim() : `{${child.value}}`));
    }
    lines.push(`${p}</>`);
    return lines.join("\n");
  }
  const attrs = (node.attrs ?? [])
    .map((a) => {
      if (a.spread) return `{...${a.name}}`;
      if (!a.value) return a.name;
      const v = attrValueToSource(a.value);
      return v === "" ? a.name : `${a.name}=${v}`;
    })
    .join(" ");
  const attrStr = attrs ? " " + attrs : "";
  if (!node.children?.length) return `${p}<${node.name}${attrStr} />`;
  const lines = [`${p}<${node.name}${attrStr}>`];
  for (const child of node.children) {
    lines.push(child.kind === "element" ? printPretty(child, level + 1) : c + (child.kind === "text" ? escapeText(child.value).trim() : `{${child.value}}`));
  }
  lines.push(`${p}</${node.name}>`);
  return lines.join("\n");
}
