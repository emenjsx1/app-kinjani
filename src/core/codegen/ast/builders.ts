import type {
  JsxAttr,
  JsxAttrValue,
  JsxChild,
  JsxNode,
  ReactComponentDecl,
  TsxModule,
} from "./nodes";

/* ----------------- Attribute helpers ----------------- */

export const attr = {
  string(name: string, value: string): JsxAttr {
    return { name, value: { kind: "string", value } };
  },
  expr(name: string, value: string): JsxAttr {
    return { name, value: { kind: "expr", value } };
  },
  bool(name: string, value = true): JsxAttr {
    return { name, value: { kind: "bool", value } };
  },
  number(name: string, value: number): JsxAttr {
    return { name, value: { kind: "number", value } };
  },
  spread(value: string): JsxAttr {
    return { name: value, spread: true };
  },
  className(value: string): JsxAttr {
    return { name: "className", value: { kind: "string", value } };
  },
};

/* ----------------- Element helpers ----------------- */

export function el(
  name: string,
  attrs?: JsxAttr[],
  children?: JsxChild[],
): JsxNode {
  const node: JsxNode = { kind: "element", name };
  if (attrs && attrs.length) node.attrs = attrs;
  if (children && children.length) node.children = children;
  else node.selfClose = !children;
  return node;
}

export function text(value: string): JsxChild {
  return { kind: "text", value };
}

export function expr(value: string): JsxChild {
  return { kind: "expr", value };
}

export function fragment(children: JsxChild[]): JsxNode {
  return { kind: "element", name: "", children };
}

/* ----------------- Module helpers ----------------- */

export function tsxModule(path: string, init?: Partial<TsxModule>): TsxModule {
  return {
    path,
    imports: [],
    declarations: [],
    ...init,
  };
}

export function reactComponent(
  name: string,
  jsx: JsxNode,
  init?: Partial<ReactComponentDecl>,
): ReactComponentDecl {
  return { name, jsx, ...init };
}

/** Escape a string for use in JSX string-attribute value (double-quoted). */
export function escapeAttr(value: string): string {
  return value.replace(/"/g, "&quot;");
}

/** Escape a string for use in JSX text content. */
export function escapeText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;");
}

export function attrValueToSource(v: JsxAttrValue): string {
  switch (v.kind) {
    case "string":
      return `"${escapeAttr(v.value)}"`;
    case "expr":
      return `{${v.value}}`;
    case "bool":
      return v.value ? "" : "{false}";
    case "number":
      return `{${v.value}}`;
  }
}
