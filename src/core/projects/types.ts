/**
 * Core Project domain model.
 *
 * This is the canonical shape used by the new builder engine. The legacy
 * WebsiteTemplate continues to exist; adapters in `core/projects/adapters.ts`
 * convert between the two during the migration.
 */
import type { WebsiteSection, WebsiteTemplate } from "@/lib/website-templates";
import type { FileTree } from "@/core/filesystem/types";

export type ProjectKind = "website" | "agent" | "hybrid";

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
  kind: "image" | "video" | "file";
  url: string;
  meta?: Record<string, unknown>;
}

export interface ProjectPage {
  id: string;
  name: string;
  slug: string;
  isHomepage?: boolean;
  sections: WebsiteSection[];
}

export interface Project {
  id: string;
  name: string;
  kind: ProjectKind;
  template?: string;
  pages: ProjectPage[];
  assets: ProjectAsset[];
  theme: ProjectTheme;
  settings: ProjectSettings;
  metadata: Record<string, unknown>;
  /** Reserved for future code-generation runtime. Not used by template engine. */
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
