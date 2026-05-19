import { createElement } from "react";
import { WebsitePreview } from "@/components/websites/WebsitePreview";
import { projectToTemplate, type Project } from "@/core/projects/types";
import type { PreviewEngine, PreviewOptions } from "./PreviewEngine";

/**
 * Default preview engine: delegates to the legacy template renderer.
 * This is the engine wired in Phase 1; Sandpack/runtime engines plug in here.
 */
export class ReactTemplatePreviewEngine implements PreviewEngine {
  id = "react-template" as const;
  render(project: Project, opts?: PreviewOptions) {
    const template = projectToTemplate(project);
    return createElement(WebsitePreview, {
      template,
      websiteName: project.name,
      embedConfig: opts?.embedConfig as never,
    });
  }
}

export const defaultPreviewEngine = new ReactTemplatePreviewEngine();
