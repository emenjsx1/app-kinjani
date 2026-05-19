import type { Project, ProjectPage } from "@/core/projects/types";
import type { WebsiteSection } from "@/lib/website-templates";

/**
 * Pure project mutation commands. They always return a new Project instance —
 * never mutate in place — so the history engine can snapshot safely.
 */

function mapHomepage(
  project: Project,
  fn: (page: ProjectPage) => ProjectPage,
): Project {
  const home = project.pages.find((p) => p.isHomepage) ?? project.pages[0];
  if (!home) return project;
  return {
    ...project,
    pages: project.pages.map((p) => (p.id === home.id ? fn(p) : p)),
  };
}

export const commands = {
  setSectionContent(
    project: Project,
    sectionId: string,
    patch: Record<string, string>,
  ): Project {
    return mapHomepage(project, (page) => ({
      ...page,
      sections: page.sections.map((s) =>
        s.id === sectionId ? { ...s, content: { ...s.content, ...patch } } : s,
      ),
    }));
  },

  toggleSection(project: Project, sectionId: string, enabled: boolean): Project {
    return mapHomepage(project, (page) => ({
      ...page,
      sections: page.sections.map((s) =>
        s.id === sectionId ? { ...s, enabled } : s,
      ),
    }));
  },

  reorderSections(project: Project, orderedIds: string[]): Project {
    return mapHomepage(project, (page) => ({
      ...page,
      sections: orderedIds
        .map((id, i) => {
          const s = page.sections.find((x) => x.id === id);
          return s ? { ...s, order: i } : null;
        })
        .filter((s): s is WebsiteSection => Boolean(s)),
    }));
  },

  addSection(project: Project, section: WebsiteSection): Project {
    return mapHomepage(project, (page) => ({
      ...page,
      sections: [...page.sections, { ...section, order: page.sections.length }],
    }));
  },

  removeSection(project: Project, sectionId: string): Project {
    return mapHomepage(project, (page) => ({
      ...page,
      sections: page.sections.filter((s) => s.id !== sectionId),
    }));
  },

  setTheme(project: Project, theme: Partial<Project["theme"]>): Project {
    return { ...project, theme: { ...project.theme, ...theme } };
  },

  setSettings(project: Project, settings: Partial<Project["settings"]>): Project {
    return { ...project, settings: { ...project.settings, ...settings } };
  },
};

export type EditorCommands = typeof commands;
