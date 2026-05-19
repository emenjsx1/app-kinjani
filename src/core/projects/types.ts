/**
 * Core Project domain model.
 *
 * Phase-2 universal builder entity. Extended to host:
 *  - multiple pages, layouts, routing
 *  - assets graph
 *  - SEO metadata
 *  - deployment metadata
 *  - environment configuration
 *
 * The legacy WebsiteTemplate continues to exist; the adapters below convert
 * between the two during the migration.
 */
import type { WebsiteSection, WebsiteTemplate } from "@/lib/website-templates";
import type { FileTree } from "@/core/filesystem/types";

export type ProjectKind = "website" | "agent" | "hybrid" | "app";

export interface ProjectTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  font: string;
}

export interface ProjectSettings {
  logoUrl?: string;
  faviconUrl?: string;
  bannerUrl?: string;
  ogImageUrl?: string;
  navItems?: { label: string; href: string }[];
  [key: string]: unknown;
}

export interface ProjectAsset {
  id: string;
  kind: "image" | "video" | "file" | "icon" | "font";
  path?: string;
  url: string;
  /** Component / file ids that reference this asset. */
  refs?: string[];
  meta?: Record<string, unknown>;
}

export interface ProjectLayout {
  id: string;
  name: string;
  /** Section ids placed in this layout (e.g. header, footer wrappers). */
  sections: WebsiteSection[];
}

export interface ProjectRoute {
  path: string;
  pageId: string;
  layoutId?: string;
}

export interface ProjectSEO {
  title?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
  keywords?: string[];
  jsonLd?: unknown;
}

export interface ProjectDeployment {
  target?: "vercel" | "netlify" | "lovable" | "static";
  lastDeployedAt?: string;
  url?: string;
  status?: "idle" | "queued" | "building" | "deployed" | "failed";
}

export interface ProjectPage {
  id: string;
  name: string;
  slug: string;
  isHomepage?: boolean;
  sections: WebsiteSection[];
  layoutId?: string;
  seo?: ProjectSEO;
}

export interface Project {
  id: string;
  name: string;
  kind: ProjectKind;
  template?: string;
  pages: ProjectPage[];
  layouts?: ProjectLayout[];
  routes?: ProjectRoute[];
  assets: ProjectAsset[];
  theme: ProjectTheme;
  settings: ProjectSettings;
  seo?: ProjectSEO;
  deployment?: ProjectDeployment;
  env?: Record<string, string>;
  metadata: Record<string, unknown>;
  /** Reserved for the code-generation runtime. Not used by template engine. */
  files?: FileTree;
}

/* -------------------------------------------------------------------------- */
/*  Adapters: legacy WebsiteTemplate <-> Project                              */
/* -------------------------------------------------------------------------- */

export function templateToProject(
  id: string,
  name: string,
  template: WebsiteTemplate,
): Project {
  const pages: ProjectPage[] =
    template.pages && template.pages.length > 0
      ? template.pages.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          isHomepage: p.isHomepage,
          sections: p.sections,
        }))
      : [
          {
            id: "home",
            name: "Home",
            slug: "/",
            isHomepage: true,
            sections: template.sections,
          },
        ];

  return {
    id,
    name,
    kind: "website",
    template: template.id,
    pages,
    layouts: [],
    routes: pages.map((p) => ({ path: p.slug, pageId: p.id })),
    assets: [],
    theme: {
      primary: template.colors.primary,
      secondary: template.colors.secondary,
      accent: template.colors.accent,
      background: template.colors.background,
      text: template.colors.text,
      font: template.font,
    },
    settings: {
      logoUrl: template.logoUrl,
      faviconUrl: template.faviconUrl,
      bannerUrl: template.bannerUrl,
      ogImageUrl: template.ogImageUrl,
      navItems: template.navItems,
    },
    seo: {
      title: name,
      description: template.description,
      ogImage: template.ogImageUrl,
    },
    metadata: {
      category: template.category,
      categoryId: template.categoryId,
      type: template.type,
      thumbnail: template.thumbnail,
      description: template.description,
    },
  };
}

export function projectToTemplate(project: Project): WebsiteTemplate {
  const home = project.pages.find((p) => p.isHomepage) ?? project.pages[0];
  return {
    id: project.template ?? project.id,
    name: project.name,
    description: (project.metadata.description as string) ?? "",
    category: (project.metadata.category as string) ?? "",
    categoryId: (project.metadata.categoryId as string) ?? "",
    type: (project.metadata.type as "landing" | "institutional") ?? "landing",
    thumbnail: (project.metadata.thumbnail as string) ?? "",
    sections: home?.sections ?? [],
    pages: project.pages.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      isHomepage: p.isHomepage,
      sections: p.sections,
    })),
    logoUrl: project.settings.logoUrl,
    faviconUrl: project.settings.faviconUrl,
    bannerUrl: project.settings.bannerUrl,
    ogImageUrl: project.settings.ogImageUrl,
    navItems: project.settings.navItems,
    colors: {
      primary: project.theme.primary,
      secondary: project.theme.secondary,
      accent: project.theme.accent,
      background: project.theme.background,
      text: project.theme.text,
    },
    font: project.theme.font,
  };
}
