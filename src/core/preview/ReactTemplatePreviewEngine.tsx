import { createElement } from "react";
import { WebsitePreview } from "@/components/websites/WebsitePreview";
import { projectToTemplate, type Project } from "@/core/projects/types";
import {
  previewEngineRegistry,
  type PreviewEngine,
  type PreviewEngineCapabilities,
  type PreviewOptions,
} from "./PreviewEngine";
import { DiagnosticsBus, type PreviewHealth } from "./diagnostics";

/**
 * Default preview engine: delegates to the legacy template renderer.
 * Sandpack/WebContainer/Remote engines plug into the same interface.
 */
export class ReactTemplatePreviewEngine implements PreviewEngine {
  id = "react-template" as const;
  capabilities: PreviewEngineCapabilities = {
    interactive: true,
    isolated: false,
    supportsConsole: false,
    supportsNetwork: false,
    supportsHmr: true,
  };

  private bus = new DiagnosticsBus();
  private healthState: PreviewHealth = { status: "idle" };

  render(project: Project, opts?: PreviewOptions) {
    this.healthState = { status: "rendering", lastRenderAt: Date.now() };
    try {
      const template = projectToTemplate(project);
      const node = createElement(WebsitePreview, {
        template,
        websiteName: project.name,
        embedConfig: opts?.embedConfig as never,
      });
      this.healthState = { status: "ready", lastRenderAt: Date.now() };
      return node;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.bus.error({ message, source: this.id });
      this.healthState = { status: "error", lastError: message };
      throw err;
    }
  }

  health(): PreviewHealth {
    return { ...this.healthState };
  }

  diagnostics() {
    return this.bus.snapshot();
  }

  dispose(): void {
    this.bus.clear();
    this.healthState = { status: "disposed" };
  }
}

export const defaultPreviewEngine = new ReactTemplatePreviewEngine();

previewEngineRegistry.register(
  "react-template",
  () => new ReactTemplatePreviewEngine(),
);
