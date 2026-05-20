/**
 * VisualAIContextBuilder — Phase E
 *
 * Extends the text-only AIContextBuilder with VISUAL context:
 *   - canvas snapshots (data URLs)
 *   - composition graph summary
 *   - viewport state
 *   - design tokens
 *   - user-attached reference images
 *
 * Output is consumed by the multimodal AI gateway (vision-capable models)
 * via OpenAI-compatible content parts: [{type:"text"|"image_url"}].
 */

export interface VisualAttachment {
  /** "canvas" = snapshot of the live editor surface.
   *  "reference" = user-uploaded inspiration / screenshot.
   *  "node" = focused snapshot of a single composition node. */
  kind: "canvas" | "reference" | "node";
  /** data: URL (base64) or signed https URL. */
  url: string;
  label?: string;
  width?: number;
  height?: number;
}

export interface CompositionGraphSummary {
  rootKind?: string;
  nodeCount: number;
  themeTokens?: Record<string, string>;
  /** Compact textual outline of the graph for the model. */
  outline: string;
}

export interface ViewportState {
  width: number;
  height: number;
  devicePixelRatio: number;
  scroll?: { x: number; y: number };
  mode?: "desktop" | "tablet" | "mobile";
}

export interface VisualAIContext {
  instruction: string;
  attachments: VisualAttachment[];
  graph?: CompositionGraphSummary;
  viewport?: ViewportState;
  designTokens?: Record<string, string>;
  selection?: { nodeIds?: string[]; region?: string };
  moodboard?: VisualAttachment[];
}

export const VisualAIContextBuilder = {
  /** Capture the current editor canvas to a data URL using html-to-image-style
   *  drawWindow when available, falling back to a transparent 1px image so the
   *  call shape stays stable in non-DOM environments. */
  async captureElement(el: HTMLElement | null, maxWidth = 1280): Promise<VisualAttachment | null> {
    if (!el || typeof window === "undefined") return null;
    try {
      // Lazy import to avoid bundling cost when the editor isn't open.
      const mod: any = await import("html-to-image").catch(() => null);
      if (!mod?.toJpeg) return null;
      const rect = el.getBoundingClientRect();
      const scale = Math.min(1, maxWidth / Math.max(rect.width, 1));
      const url = await mod.toJpeg(el, {
        quality: 0.82,
        pixelRatio: scale,
        cacheBust: true,
        backgroundColor: getComputedStyle(document.body).backgroundColor || "#0a0a0a",
      });
      return { kind: "canvas", url, label: "Live canvas", width: rect.width, height: rect.height };
    } catch (err) {
      console.warn("[VisualAIContextBuilder] captureElement failed", err);
      return null;
    }
  },

  /** Build a compact textual outline of a CompositionGraph. */
  summarizeGraph(graph: any): CompositionGraphSummary | undefined {
    if (!graph || typeof graph !== "object") return undefined;
    const lines: string[] = [];
    let count = 0;
    const walk = (node: any, depth = 0) => {
      if (!node) return;
      count++;
      const pad = "  ".repeat(depth);
      const kind = node.kind ?? node.type ?? "node";
      const id = node.id ? `#${node.id}` : "";
      const variant = node.variant ? ` (${node.variant})` : "";
      lines.push(`${pad}${kind}${id}${variant}`);
      const children = node.children ?? node.nodes ?? [];
      if (Array.isArray(children)) children.forEach((c: any) => walk(c, depth + 1));
    };
    walk(graph.root ?? graph);
    return {
      rootKind: (graph.root ?? graph)?.kind,
      nodeCount: count,
      themeTokens: graph.theme,
      outline: lines.slice(0, 200).join("\n"),
    };
  },

  build(input: Partial<VisualAIContext> & { instruction: string }): VisualAIContext {
    return {
      attachments: input.attachments ?? [],
      moodboard: input.moodboard ?? [],
      ...input,
    };
  },

  /** Convert to OpenAI-compatible multimodal `messages[].content` parts. */
  toMessageContent(ctx: VisualAIContext): Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  > {
    const parts: Array<any> = [];
    const meta: string[] = [`INSTRUÇÃO: ${ctx.instruction}`];
    if (ctx.graph) {
      meta.push(`\nCOMPOSITION GRAPH (${ctx.graph.nodeCount} nodes):\n${ctx.graph.outline}`);
    }
    if (ctx.viewport) {
      meta.push(`\nVIEWPORT: ${ctx.viewport.width}x${ctx.viewport.height} (${ctx.viewport.mode ?? "desktop"})`);
    }
    if (ctx.designTokens && Object.keys(ctx.designTokens).length) {
      meta.push(`\nDESIGN TOKENS:\n${JSON.stringify(ctx.designTokens, null, 2)}`);
    }
    if (ctx.selection?.nodeIds?.length) {
      meta.push(`\nSELECTED NODES: ${ctx.selection.nodeIds.join(", ")}`);
    }
    parts.push({ type: "text", text: meta.join("\n") });
    for (const att of [...(ctx.attachments ?? []), ...(ctx.moodboard ?? [])]) {
      parts.push({ type: "image_url", image_url: { url: att.url } });
    }
    return parts;
  },
};
