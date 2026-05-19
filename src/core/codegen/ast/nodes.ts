/**
 * Minimal JSX-AST abstraction.
 *
 * Phase 4 ships an internal node model so emitters never concatenate raw
 * strings. When ts-morph / Babel is wired in (Phase 4.x), only the printer
 * needs to change — emitters stay untouched.
 */
export type JsxAttrValue =
  | { kind: "string"; value: string }
  | { kind: "expr"; value: string }
  | { kind: "bool"; value: boolean }
  | { kind: "number"; value: number };

export interface JsxAttr {
  name: string;
  value?: JsxAttrValue;
  /** Spread attribute, e.g. {...props}. value is the expression text. */
  spread?: boolean;
}

export type JsxChild = JsxNode | JsxText | JsxExpression;

export interface JsxText {
  kind: "text";
  value: string;
}

export interface JsxExpression {
  kind: "expr";
  /** Raw TS expression. Must be syntactically valid. */
  value: string;
}

export interface JsxNode {
  kind: "element";
  name: string;
  attrs?: JsxAttr[];
  children?: JsxChild[];
  selfClose?: boolean;
}

export interface TsxModule {
  /** File path relative to project root. */
  path: string;
  /** Top-of-file directives, e.g. "use client". */
  directives?: string[];
  /** Raw header comment lines. */
  banner?: string[];
  /** Type-only and value imports, deduped by the resolver. */
  imports: ImportStatement[];
  /** Free-form declarations (interfaces, constants) inserted verbatim. */
  declarations?: string[];
  /** Default export — typically a React component function. */
  defaultExport?: ReactComponentDecl;
  /** Additional named exports. */
  namedExports?: string[];
}

export interface ImportStatement {
  module: string;
  named?: string[];
  defaultImport?: string;
  typeOnly?: boolean;
}

export interface ReactComponentDecl {
  name: string;
  /** Parameter signature, e.g. "({ children }: { children: ReactNode })". */
  params?: string;
  /** Hooks / setup statements before return. */
  body?: string[];
  /** Root JSX node returned by the component. */
  jsx: JsxNode;
  async?: boolean;
}
