import { useEffect, Suspense } from "react";
import { WebsiteEditor, type EmbedConfig } from "@/components/websites/WebsiteEditor";
import type { WebsiteTemplate } from "@/lib/website-templates";
import { templateToProject } from "@/core/projects/types";
import { registerSections } from "@/core/registry/sections";
import { registerWidgets } from "@/core/registry/widgets";
import { defaultPreviewEngine } from "@/core/preview/ReactTemplatePreviewEngine";
import { useEditorStore } from "../store/editorStore";
import { useHistoryStore } from "../store/historyStore";
import { useEditorShortcuts } from "../hooks/useEditorShortcuts";

interface Props {
  websiteId: string;
  websiteName: string;
  template: WebsiteTemplate;
  prompt: string;
  initialEmbedConfig?: EmbedConfig;
  onBack: () => void;
  onSave: (template: WebsiteTemplate, embed?: EmbedConfig) => Promise<void> | void;
}

// Ensure registry and engines are initialized once.
registerSections();
registerWidgets();
void defaultPreviewEngine;

/**
 * Phase-2 EditorShell.
 *
 * Primary editor surface for the Open Builder. Initializes all new core
 * engines (project model, history engine, registry, preview engine) and hosts
 * the visual editor. For Phase 2 we keep `WebsiteEditor` as the inner visual
 * surface for visual parity while routing all state through the new stores.
 *
 * Rollback: `?legacy=1` on the editor route bypasses this shell entirely.
 */
export function EditorShell({
  websiteId,
  websiteName,
  template,
  prompt,
  initialEmbedConfig,
  onBack,
  onSave,
}: Props) {
  const setProjectId = useEditorStore((s) => s.setProjectId);
  const reset = useEditorStore((s) => s.reset);
  const initHistory = useHistoryStore((s) => s.init);

  useEffect(() => {
    const project = templateToProject(websiteId, websiteName, template);
    setProjectId(websiteId);
    initHistory(project);
    return () => reset();
    // We intentionally only initialize once per websiteId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websiteId]);

  useEditorShortcuts(true);

  return (
    <Suspense fallback={null}>
      <WebsiteEditor
        template={template}
        websiteName={websiteName}
        prompt={prompt}
        onBack={onBack}
        onSave={onSave}
        initialEmbedConfig={initialEmbedConfig}
      />
    </Suspense>
  );
}

export default EditorShell;
