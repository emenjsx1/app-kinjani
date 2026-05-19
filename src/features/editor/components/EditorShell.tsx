import { useEffect, Suspense } from "react";
import { WebsiteEditor, type EmbedConfig } from "@/components/websites/WebsiteEditor";
import type { WebsiteTemplate } from "@/lib/website-templates";
import { templateToProject } from "@/core/projects/types";
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

/**
 * Phase-1 EditorShell.
 *
 * Hybrid bridge: the visual editor surface keeps using the battle-tested
 * `WebsiteEditor` while the new core engines (project model, history engine,
 * editor store) are initialized in parallel. Phase 2 will swap the legacy
 * surface for the new panel-based UI without touching the page route again.
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
