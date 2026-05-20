import { CSSProperties, ReactNode, useCallback } from "react";
import { CompositionGraph, CompositionNode, GraphTheme } from "@/core/render/composition-graph";
import { dnaToCSSVars } from "@/core/dna";
import { cn } from "@/lib/utils";

/* Tailwind-safe lookup maps (so JIT picks them up) */
const GAP: Record<number, string> = {
  0: "gap-0", 1: "gap-1", 2: "gap-2", 4: "gap-4", 6: "gap-6", 8: "gap-8",
  12: "gap-12", 16: "gap-16", 24: "gap-24",
};
const PY: Record<number, string> = {
  0: "py-0", 4: "py-4", 8: "py-8", 12: "py-12", 16: "py-16", 20: "py-20",
  24: "py-24", 32: "py-32", 40: "py-40",
};
const PX: Record<number, string> = {
  0: "px-0", 4: "px-4", 6: "px-6", 8: "px-8", 12: "px-12", 16: "px-16",
};
const ALIGN: Record<string, string> = {
  start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch",
};
const JUSTIFY: Record<string, string> = {
  start: "justify-start", center: "justify-center", end: "justify-end",
  between: "justify-between", around: "justify-around",
};
const CONTAIN: Record<string, string> = {
  none: "", narrow: "max-w-3xl mx-auto", default: "max-w-6xl mx-auto",
  wide: "max-w-7xl mx-auto", full: "w-full",
};
const ASPECT: Record<string, string> = {
  square: "aspect-square", video: "aspect-video",
  portrait: "aspect-[3/4]", wide: "aspect-[16/9]", ultra: "aspect-[21/9]",
};
const ROUNDED: Record<string, string> = {
  none: "", md: "rounded-md", xl: "rounded-xl",
  "2xl": "rounded-2xl", "3xl": "rounded-3xl", full: "rounded-full",
};
const HEADING_SIZE: Record<string, string> = {
  hero: "text-5xl md:text-7xl lg:text-8xl leading-[0.95]",
  display: "text-4xl md:text-6xl leading-tight",
  xl: "text-3xl md:text-5xl",
  lg: "text-2xl md:text-4xl",
  md: "text-xl md:text-2xl",
};
const TEXT_SIZE: Record<string, string> = {
  xs: "text-xs", sm: "text-sm", base: "text-base", lg: "text-lg", xl: "text-xl",
};

export interface RendererContext {
  theme: GraphTheme;
  onCtaClick?: (action?: string, target?: string) => void;
  /** Optional: notify selection on node click (editor mode) */
  onNodeClick?: (id: string) => void;
  selectedId?: string | null;
  /** Escape-hatch renderer for legacy-section nodes */
  legacyRenderer?: (sectionType: string, content: Record<string, unknown>, variant?: number) => ReactNode;
}

interface NodeProps {
  node: CompositionNode;
  ctx: RendererContext;
}

function themeVars(theme: GraphTheme): CSSProperties {
  const dnaVars = theme.dna ? dnaToCSSVars(theme.dna) : {};
  return {
    // Expose theme as CSS variables so deep nodes can reference them
    ["--g-primary" as never]: theme.primary,
    ["--g-secondary" as never]: theme.secondary,
    ["--g-accent" as never]: theme.accent,
    ["--g-bg" as never]: theme.background,
    ["--g-text" as never]: theme.text,
    ...(dnaVars as CSSProperties),
    fontFamily: theme.font,
    color: `hsl(${theme.text})`,
    background: `hsl(${theme.background})`,
    // DNA-driven base rhythm — descendants can opt in via var(--dna-*)
    letterSpacing: theme.dna ? `var(--dna-tracking)` : undefined,
    lineHeight: theme.dna ? `var(--dna-body-lh)` : undefined,
  };
}

export function CompositionRenderer({
  graph,
  onCtaClick,
  onNodeClick,
  selectedId,
  legacyRenderer,
}: {
  graph: CompositionGraph;
  onCtaClick?: (action?: string, target?: string) => void;
  onNodeClick?: (id: string) => void;
  selectedId?: string | null;
  legacyRenderer?: RendererContext["legacyRenderer"];
}) {
  const ctx: RendererContext = { theme: graph.theme, onCtaClick, onNodeClick, selectedId, legacyRenderer };
  return (
    <div
      data-dna={graph.theme.dna?.signature}
      style={themeVars(graph.theme)}
      className="min-h-screen w-full"
    >
      <RenderNode node={graph.root} ctx={ctx} />
    </div>
  );
}

function RenderNode({ node, ctx }: NodeProps): JSX.Element | null {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!ctx.onNodeClick) return;
      e.stopPropagation();
      ctx.onNodeClick(node.id);
    },
    [ctx, node.id],
  );

  const selectedRing = ctx.selectedId === node.id ? "outline outline-2 outline-primary outline-offset-2" : "";
  const interactive = ctx.onNodeClick ? "cursor-pointer hover:outline hover:outline-1 hover:outline-primary/40" : "";

  switch (node.type) {
    case "stack": {
      const dir = node.direction === "h" ? "flex-row" : "flex-col";
      return (
        <div
          id={`n-${node.id}`}
          onClick={ctx.onNodeClick ? handleClick : undefined}
          className={cn(
            "flex", dir,
            GAP[node.gap ?? 6],
            PY[node.py ?? 0], PX[node.px ?? 0],
            ALIGN[node.align ?? "stretch"], JUSTIFY[node.justify ?? "start"],
            interactive, selectedRing,
            node.className,
          )}
          style={node.style}
        >
          <div className={cn(CONTAIN[node.contain ?? "none"], dir === "flex-row" ? "flex flex-row" : "flex flex-col", GAP[node.gap ?? 6], "w-full")}>
            {node.children.map((c) => <RenderNode key={c.id} node={c} ctx={ctx} />)}
          </div>
        </div>
      );
    }

    case "grid": {
      const colsStyle: CSSProperties = typeof node.cols === "string"
        ? { gridTemplateColumns: node.cols }
        : { gridTemplateColumns: `repeat(${node.cols}, minmax(0, 1fr))` };
      const rowsStyle: CSSProperties = node.rows
        ? typeof node.rows === "string"
          ? { gridTemplateRows: node.rows }
          : { gridTemplateRows: `repeat(${node.rows}, minmax(0, 1fr))` }
        : {};
      return (
        <div
          id={`n-${node.id}`}
          onClick={ctx.onNodeClick ? handleClick : undefined}
          className={cn(PY[node.py ?? 0], PX[node.px ?? 0], interactive, selectedRing, node.className)}
          style={node.style}
        >
          <div
            className={cn("grid w-full", GAP[node.gap ?? 6], CONTAIN[node.contain ?? "none"])}
            style={{ ...colsStyle, ...rowsStyle }}
          >
            {node.children.map((c, i) => {
              const span = node.spans?.[i];
              const spanStyle: CSSProperties = {};
              if (span?.col) spanStyle.gridColumn = `span ${span.col} / span ${span.col}`;
              if (span?.row) spanStyle.gridRow = `span ${span.row} / span ${span.row}`;
              if (span?.colStart) spanStyle.gridColumnStart = span.colStart;
              if (span?.rowStart) spanStyle.gridRowStart = span.rowStart;
              return (
                <div key={c.id} style={spanStyle}>
                  <RenderNode node={c} ctx={ctx} />
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    case "overlay":
      return (
        <div
          id={`n-${node.id}`}
          onClick={ctx.onNodeClick ? handleClick : undefined}
          className={cn("relative w-full", PY[node.py ?? 0], PX[node.px ?? 0], interactive, selectedRing, node.className)}
          style={{ minHeight: node.minH, ...node.style }}
        >
          {node.children.map((c) => <RenderNode key={c.id} node={c} ctx={ctx} />)}
        </div>
      );

    case "flex": {
      const dir = node.direction === "row" ? "flex-row" : "flex-col";
      return (
        <div
          id={`n-${node.id}`}
          onClick={ctx.onNodeClick ? handleClick : undefined}
          className={cn(
            "flex", dir, node.wrap && "flex-wrap",
            GAP[node.gap ?? 4],
            ALIGN[node.align ?? "stretch"], JUSTIFY[node.justify ?? "start"],
            interactive, selectedRing, node.className,
          )}
          style={node.style}
        >
          {node.children.map((c) => <RenderNode key={c.id} node={c} ctx={ctx} />)}
        </div>
      );
    }

    case "floating":
      return (
        <div
          id={`n-${node.id}`}
          onClick={ctx.onNodeClick ? handleClick : undefined}
          className={cn("absolute", interactive, selectedRing, node.className)}
          style={{
            top: node.top, left: node.left, right: node.right, bottom: node.bottom,
            zIndex: node.z, transform: node.rotate ? `rotate(${node.rotate}deg)` : undefined,
            ...node.style,
          }}
        >
          {node.children.map((c) => <RenderNode key={c.id} node={c} ctx={ctx} />)}
        </div>
      );

    case "heading": {
      const Tag = (`h${node.level ?? 1}`) as keyof JSX.IntrinsicElements;
      const tracking =
        node.tracking === "tighter" ? "tracking-tighter" :
        node.tracking === "tight" ? "tracking-tight" :
        node.tracking === "wide" ? "tracking-wide" :
        node.tracking === "widest" ? "tracking-widest uppercase" : "";
      const weight = {
        normal: "font-normal", medium: "font-medium", semibold: "font-semibold",
        bold: "font-bold", black: "font-black",
      }[node.weight ?? "bold"];
      return (
        <Tag
          id={`n-${node.id}`}
          onClick={ctx.onNodeClick ? handleClick : undefined}
          className={cn(
            HEADING_SIZE[node.size ?? "xl"],
            weight, tracking,
            node.italic && "italic",
            node.uppercase && "uppercase tracking-wider",
            node.serif && "font-serif",
            interactive, selectedRing,
            node.className,
          )}
          style={node.style}
        >
          {node.text}
        </Tag>
      );
    }

    case "text":
      return (
        <p
          id={`n-${node.id}`}
          onClick={ctx.onNodeClick ? handleClick : undefined}
          className={cn(
            TEXT_SIZE[node.size ?? "base"],
            node.muted && "opacity-70",
            node.serif && "font-serif",
            "leading-relaxed",
            interactive, selectedRing,
            node.className,
          )}
          style={{ maxWidth: node.maxW, ...node.style }}
        >
          {node.text}
        </p>
      );

    case "image":
      return (
        <div
          id={`n-${node.id}`}
          onClick={ctx.onNodeClick ? handleClick : undefined}
          className={cn(
            "overflow-hidden w-full",
            node.aspect && ASPECT[node.aspect],
            ROUNDED[node.rounded ?? "none"],
            interactive, selectedRing, node.className,
          )}
          style={node.style}
        >
          <img
            src={node.src}
            alt={node.alt ?? ""}
            className={cn(
              "w-full h-full",
              node.fit === "contain" ? "object-contain" : "object-cover",
              node.grayscale && "grayscale",
            )}
          />
        </div>
      );

    case "button": {
      const sizeCls = node.size === "lg" ? "px-7 py-4 text-base" : node.size === "sm" ? "px-3 py-1.5 text-xs" : "px-5 py-3 text-sm";
      const variantStyle: CSSProperties =
        node.variant === "secondary"   ? { background: `hsl(${ctx.theme.secondary})`, color: "white" } :
        node.variant === "ghost"       ? { background: "transparent", color: `hsl(${ctx.theme.text})` } :
        node.variant === "outline"     ? { background: "transparent", color: `hsl(${ctx.theme.text})`, border: `1px solid hsl(${ctx.theme.text} / 0.3)` } :
                                          { background: `hsl(${ctx.theme.primary})`, color: "white" };
      return (
        <button
          id={`n-${node.id}`}
          onClick={(e) => {
            if (ctx.onNodeClick) { handleClick(e); return; }
            ctx.onCtaClick?.(node.action, node.target);
          }}
          className={cn("inline-flex items-center gap-2 rounded-full font-medium transition hover:opacity-90", sizeCls, interactive, selectedRing, node.className)}
          style={{ ...variantStyle, ...node.style }}
        >
          {node.label}
        </button>
      );
    }

    case "shape": {
      const color =
        node.color === "secondary" ? `hsl(${ctx.theme.secondary})` :
        node.color === "accent"    ? `hsl(${ctx.theme.accent})` :
        node.color === "muted"     ? `hsl(${ctx.theme.text} / 0.08)` :
                                     `hsl(${ctx.theme.primary})`;
      const common = cn("pointer-events-none", interactive, selectedRing, node.className);
      switch (node.shape) {
        case "blob":
          return (
            <div id={`n-${node.id}`} className={cn(common, "rounded-[60%_40%_30%_70%/60%_30%_70%_40%] blur-3xl opacity-40")} style={{ background: color, ...node.style }} />
          );
        case "gradient":
          return (
            <div id={`n-${node.id}`} className={cn(common, "absolute inset-0")} style={{ background: `radial-gradient(60% 60% at 30% 30%, ${color} 0%, transparent 60%)`, ...node.style }} />
          );
        case "line":
          return <div id={`n-${node.id}`} className={cn(common, "h-px w-full")} style={{ background: color, ...node.style }} />;
        case "dot-grid":
          return (
            <div id={`n-${node.id}`} className={cn(common, "absolute inset-0 opacity-30")}
              style={{ backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`, backgroundSize: "24px 24px", ...node.style }} />
          );
        case "noise":
          return (
            <div id={`n-${node.id}`} className={cn(common, "absolute inset-0 mix-blend-overlay opacity-20")}
              style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")", ...node.style }} />
          );
        case "circle":
          return <div id={`n-${node.id}`} className={cn(common, "rounded-full")} style={{ background: color, ...node.style }} />;
      }
      return null;
    }

    case "spacer":
      return <div id={`n-${node.id}`} className={cn(PY[node.size] ?? "py-8", node.className)} />;

    case "legacy-section":
      if (ctx.legacyRenderer) {
        return (
          <div id={`n-${node.id}`} onClick={ctx.onNodeClick ? handleClick : undefined} className={cn(interactive, selectedRing, node.className)}>
            {ctx.legacyRenderer(node.sectionType, node.content, node.variant)}
          </div>
        );
      }
      return null;
  }
}

/** Utility: collect all node ids in graph order */
export function flattenNodes(node: CompositionNode, out: CompositionNode[] = []): CompositionNode[] {
  out.push(node);
  if ("children" in node && Array.isArray(node.children)) {
    node.children.forEach((c) => flattenNodes(c, out));
  }
  return out;
}
