import type { ComponentEmitter, EmitContext } from "../types";
import { attr, el, escapeText } from "../ast/builders";
import { printJsxToString } from "./printJsxToString";

/**
 * Used when no dedicated emitter is registered for a component id.
 *
 * Emits a typed `<SectionPlaceholder>` so the generated project still compiles
 * and renders something visible, while the dedicated emitter is built out.
 */
export const fallbackEmitter: ComponentEmitter = {
  componentId: "__fallback__",

  imports() {
    return [{ module: "@/components/SectionPlaceholder", defaultImport: "SectionPlaceholder" }];
  },

  emit(ctx: EmitContext) {
    const title =
      (ctx.section?.title as string | undefined) ??
      (ctx.props?.title as string | undefined) ??
      ctx.definition.label;
    const node = el("SectionPlaceholder", [
      attr.string("id", ctx.nodeId),
      attr.string("type", ctx.definition.type),
      attr.string("title", escapeText(String(title))),
    ]);
    return printJsxToString(node);
  },
};
