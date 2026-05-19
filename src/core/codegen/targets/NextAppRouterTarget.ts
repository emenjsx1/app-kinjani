/**
 * Next.js App Router target.
 *
 * Emits a portable, standalone Next.js 14 project:
 *
 *   app/
 *     layout.tsx
 *     page.tsx
 *     <slug>/page.tsx
 *     globals.css
 *   components/
 *     SectionPlaceholder.tsx
 *     sections/*.tsx              (one file per section type used)
 *   lib/
 *     theme.ts
 *   public/
 *   package.json
 *   tsconfig.json
 *   next.config.mjs
 *   tailwind.config.ts
 *   postcss.config.mjs
 *   README.md
 *
 * All code is produced by the structured emitters + AST printer.
 * No raw LLM strings ever land in generated files.
 */
import type {
  CodegenDiagnostic,
  CodegenResult,
  CodegenTarget,
  CodegenTargetId,
  EmitContext,
  EmittedFile,
  TargetContext,
} from "../types";
import type { Project, ProjectPage } from "@/core/projects/types";
import { ImportResolver } from "../resolver/ImportResolver";
import { ComponentResolver } from "../resolver/ComponentResolver";
import { FileGraph } from "../graph/FileGraph";
import { defaultFormatter } from "../formatter/Formatter";
import { defaultSyntaxValidator } from "../validators/syntaxValidator";
import {
  attr,
  el,
  reactComponent,
  tsxModule,
} from "../ast/builders";
import { printModule } from "../ast/printer";

export class NextAppRouterTarget implements CodegenTarget {
  id: CodegenTargetId = "next-app-router";
  label = "Next.js (App Router)";

  async emit(project: Project, ctx: TargetContext): Promise<CodegenResult> {
    const t0 = performance.now();
    const diagnostics: CodegenDiagnostic[] = [];
    const graph = new FileGraph();
    const files: EmittedFile[] = [];
    const resolver = new ComponentResolver(ctx.emitters);

    /* ---------- Per-section component files (dedup by component id) ---------- */
    const seenComponents = new Set<string>();
    for (const page of project.pages) {
      for (const section of page.sections) {
        const resolved = resolver.resolve("section", section.type);
        if (!resolved) {
          diagnostics.push({
            severity: "warn",
            code: "registry/missing-section",
            message: `No registry entry for section type "${section.type}". Using fallback.`,
            componentId: section.type,
          });
          continue;
        }
        if (seenComponents.has(resolved.definition.id)) continue;
        seenComponents.add(resolved.definition.id);
        const componentFiles = resolved.emitter.files?.(project) ?? [];
        for (const f of componentFiles) {
          files.push(f);
          graph.addNode({ path: f.path, kind: "component", componentId: resolved.definition.id });
        }
      }
    }

    /* ---------- Shared SectionPlaceholder ---------- */
    files.push(emitSectionPlaceholder());
    graph.addNode({ path: "components/SectionPlaceholder.tsx", kind: "component" });

    /* ---------- Pages ---------- */
    for (const page of project.pages) {
      const pageFile = this.emitPage(project, page, resolver, diagnostics);
      files.push(pageFile);
      const isHome = page.isHomepage || page.slug === "/";
      const path = isHome ? "app/page.tsx" : `app/${trimSlash(page.slug)}/page.tsx`;
      graph.addNode({ path, kind: "page" });
      // Section component imports become graph edges
      for (const section of page.sections) {
        const resolved = resolver.resolve("section", section.type);
        if (!resolved) continue;
        const compFile = resolved.emitter.files?.(project)?.[0];
        if (compFile) {
          graph.addEdge({ from: path, to: compFile.path, kind: "import" });
        }
      }
    }

    /* ---------- Layout + globals ---------- */
    files.push(this.emitRootLayout(project));
    files.push(emitGlobalsCss(project));
    files.push(emitThemeLib(project));
    graph.addNode({ path: "app/layout.tsx", kind: "layout" });
    graph.addNode({ path: "app/globals.css", kind: "style" });
    graph.addNode({ path: "lib/theme.ts", kind: "lib" });

    /* ---------- Config ---------- */
    if (ctx.flags?.packageJson !== false) {
      files.push(emitPackageJson(project));
      files.push(emitTsConfig());
      files.push(emitNextConfig());
      files.push(emitReadme(project));
      graph.addNode({ path: "package.json", kind: "config" });
      graph.addNode({ path: "tsconfig.json", kind: "config" });
      graph.addNode({ path: "next.config.mjs", kind: "config" });
      graph.addNode({ path: "README.md", kind: "config" });
    }
    if (ctx.flags?.tailwind !== false) {
      files.push(emitTailwindConfig());
      files.push(emitPostcssConfig());
      graph.addNode({ path: "tailwind.config.ts", kind: "config" });
      graph.addNode({ path: "postcss.config.mjs", kind: "config" });
    }

    /* ---------- Format + validate ---------- */
    const formatted = files.map((f) => ({
      ...f,
      content: ctx.flags?.format === false ? f.content : defaultFormatter.format(f.content, f.path),
    }));
    if (ctx.flags?.validate !== false) {
      for (const f of formatted) {
        diagnostics.push(...defaultSyntaxValidator.validate(f));
      }
      const cycle = graph.detectCycle();
      if (cycle) {
        diagnostics.push({
          severity: "error",
          code: "graph/cycle",
          message: `Import cycle detected: ${cycle.join(" -> ")}`,
        });
      }
      const dangling = graph.danglingImports();
      for (const d of dangling) {
        diagnostics.push({
          severity: "warn",
          code: "graph/dangling-import",
          message: `Dangling import ${d.from} -> ${d.to}`,
          file: d.from,
        });
      }
    }

    return {
      files: formatted,
      diagnostics,
      graph: graph.serialize(),
      durationMs: performance.now() - t0,
    };
  }

  /* ---------------- emitters: page + layout ---------------- */

  private emitPage(
    project: Project,
    page: ProjectPage,
    resolver: ComponentResolver,
    diagnostics: CodegenDiagnostic[],
  ): EmittedFile {
    const isHome = page.isHomepage || page.slug === "/";
    const path = isHome ? "app/page.tsx" : `app/${trimSlash(page.slug)}/page.tsx`;
    const imports = new ImportResolver();
    imports.add({ module: "react", named: ["type ReactNode"], typeOnly: true });

    const sectionJsx: string[] = [];
    for (const section of page.sections) {
      const resolved = resolver.resolve("section", section.type);
      const definition = resolved?.definition;
      const emitter = resolved?.emitter;
      if (!resolved || !definition || !emitter) {
        sectionJsx.push(`{/* unsupported section: ${section.type} */}`);
        continue;
      }
      const ctx: EmitContext = {
        project,
        page,
        target: "next-app-router",
        nodeId: section.id,
        definition,
        section,
        imports: {
          add: (r) => imports.add(r),
          list: () => imports.list(),
        },
        diagnostics,
      };
      const emitterImports = emitter.imports?.(ctx) ?? [];
      for (const i of emitterImports) imports.add(i);
      sectionJsx.push(emitter.emit(ctx));
    }

    const mod = tsxModule(path, {
      banner: [`Page: ${page.name}`, `Route: ${page.slug}`, `Auto-generated — do not edit by hand.`],
      imports: imports.toStatements(),
      declarations: [
        `export const metadata = ${JSON.stringify(buildPageMetadata(project, page), null, 2)};`,
      ],
      defaultExport: reactComponent(
        pageFunctionName(page),
        el("main", [attr.className("min-h-screen bg-background text-foreground")], [
          { kind: "expr", value: `/* sections */` },
        ]),
      ),
    });

    let source = printModule(mod);
    source = source.replace(
      `{/* sections */}`,
      sectionJsx.length ? sectionJsx.map((s) => indentBlock(s, 3)).join("\n") : `      {/* no sections */}`,
    );
    return { path, content: source, lang: "tsx", generatedBy: "next-page-emitter", sources: page.sections.map((s) => s.id) };
  }

  private emitRootLayout(project: Project): EmittedFile {
    const path = "app/layout.tsx";
    const meta = buildRootMetadata(project);
    const source = `import type { ReactNode } from "react";
import "./globals.css";
import { themeStyle } from "@/lib/theme";

export const metadata = ${JSON.stringify(meta, null, 2)};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt">
      <body style={themeStyle} className="antialiased">
        {children}
      </body>
    </html>
  );
}
`;
    return { path, content: source, lang: "tsx", generatedBy: "next-layout-emitter" };
  }
}

/* ===================== Helpers ===================== */

function trimSlash(slug: string): string {
  return slug.replace(/^\/+|\/+$/g, "") || "index";
}

function pageFunctionName(page: ProjectPage): string {
  const base = page.name?.replace(/[^a-zA-Z0-9]/g, "") || "Page";
  return `${base.charAt(0).toUpperCase()}${base.slice(1)}Page`;
}

function indentBlock(source: string, level: number): string {
  const p = "  ".repeat(level);
  return source
    .split("\n")
    .map((l) => (l ? p + l : l))
    .join("\n");
}

function buildPageMetadata(project: Project, page: ProjectPage) {
  const seo = page.seo ?? project.seo ?? {};
  return {
    title: seo.title ?? `${page.name} — ${project.name}`,
    description: seo.description ?? "",
  };
}

function buildRootMetadata(project: Project) {
  const seo = project.seo ?? {};
  return {
    title: seo.title ?? project.name,
    description: seo.description ?? "",
    icons: project.settings.faviconUrl ? { icon: project.settings.faviconUrl } : undefined,
    openGraph: seo.ogImage ? { images: [seo.ogImage] } : undefined,
  };
}

/* ---------------- Shared component files ---------------- */

function emitSectionPlaceholder(): EmittedFile {
  const path = "components/SectionPlaceholder.tsx";
  const content = `/**
 * Fallback section renderer used when a section type has no dedicated emitter.
 * Auto-generated — do not edit by hand.
 */
export interface SectionPlaceholderProps {
  id: string;
  type: string;
  title?: string;
}

export default function SectionPlaceholder({ id, type, title }: SectionPlaceholderProps) {
  return (
    <section data-section-id={id} data-section-type={type} className="w-full py-16 px-6 md:px-12 bg-muted/30 text-foreground">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{type}</p>
        {title && <h2 className="mt-2 text-3xl font-semibold">{title}</h2>}
      </div>
    </section>
  );
}
`;
  return { path, content, lang: "tsx", generatedBy: "placeholder-emitter" };
}

function emitGlobalsCss(_project: Project): EmittedFile {
  const path = "app/globals.css";
  const content = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 4%;
  --muted: 240 5% 96%;
  --muted-foreground: 240 4% 46%;
  --primary: 262 83% 58%;
  --primary-foreground: 0 0% 100%;
}

html, body { height: 100%; }
body { font-family: var(--app-font, system-ui, sans-serif); }
`;
  return { path, content, lang: "css", generatedBy: "globals-emitter" };
}

function emitThemeLib(project: Project): EmittedFile {
  const path = "lib/theme.ts";
  const t = project.theme;
  const content = `/**
 * Generated theme tokens. Edit via the platform — do not modify by hand.
 */
export const theme = ${JSON.stringify(t, null, 2)} as const;

export const themeStyle: React.CSSProperties = {
  // Surfaces / typography
  // @ts-expect-error CSS custom properties
  "--app-font": ${JSON.stringify(t.font)},
};
`;
  return { path, content, lang: "ts", generatedBy: "theme-emitter" };
}

function emitPackageJson(project: Project): EmittedFile {
  const pkg = {
    name: slugify(project.name) || "generated-site",
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
    },
    dependencies: {
      next: "^14.2.0",
      react: "^18.3.1",
      "react-dom": "^18.3.1",
    },
    devDependencies: {
      "@types/node": "^20.11.0",
      "@types/react": "^18.3.0",
      "@types/react-dom": "^18.3.0",
      autoprefixer: "^10.4.20",
      postcss: "^8.4.47",
      tailwindcss: "^3.4.13",
      typescript: "^5.4.0",
    },
  };
  return { path: "package.json", content: JSON.stringify(pkg, null, 2), lang: "json", generatedBy: "config-emitter" };
}

function emitTsConfig(): EmittedFile {
  const cfg = {
    compilerOptions: {
      target: "ES2022",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: false,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      plugins: [{ name: "next" }],
      paths: { "@/*": ["./*"] },
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
    exclude: ["node_modules"],
  };
  return { path: "tsconfig.json", content: JSON.stringify(cfg, null, 2), lang: "json", generatedBy: "config-emitter" };
}

function emitNextConfig(): EmittedFile {
  const content = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};
export default nextConfig;
`;
  return { path: "next.config.mjs", content, lang: "mjs", generatedBy: "config-emitter" };
}

function emitTailwindConfig(): EmittedFile {
  const content = `import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
      },
    },
  },
  plugins: [],
};
export default config;
`;
  return { path: "tailwind.config.ts", content, lang: "ts", generatedBy: "config-emitter" };
}

function emitPostcssConfig(): EmittedFile {
  const content = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
  return { path: "postcss.config.mjs", content, lang: "mjs", generatedBy: "config-emitter" };
}

function emitReadme(project: Project): EmittedFile {
  const content = `# ${project.name}

Generated by the platform code-generation engine (Next.js App Router target).

## Quickstart

\`\`\`bash
npm install
npm run dev
\`\`\`

This project is portable and standalone. You can edit it outside the platform
without losing the ability to re-import.
`;
  return { path: "README.md", content, lang: "md", generatedBy: "config-emitter" };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
