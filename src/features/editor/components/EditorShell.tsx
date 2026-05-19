import { useCallback, useEffect, useMemo, useState } from "react";
import type { EmbedConfig } from "@/components/websites/WebsiteEditor";
import { WebsitePreview } from "@/components/websites/WebsitePreview";
import type { WebsiteTemplate } from "@/lib/website-templates";
import { registerSections } from "@/core/registry/sections";
import { registerWidgets } from "@/core/registry/widgets";
import { defaultPreviewEngine } from "@/core/preview/ReactTemplatePreviewEngine";
import { CanvasFrame } from "../canvas/CanvasFrame";
import { EditorHeader } from "./EditorHeader";
import { EditorToolbar } from "./EditorToolbar";
import { LeftSidebar, RightSidebar } from "./SidebarPanels";
import { useEditorShortcuts } from "../hooks/useEditorShortcuts";
import { useTemplateState } from "../hooks/useTemplateState";
import { TemplateBridgeContext } from "../hooks/useTemplateBridge";
import { useEditorStore } from "../store/editorStore";
import { toast } from "sonner";

interface Props {
  websiteId: string;
  websiteName: string;
  template: WebsiteTemplate;
  prompt: string;
  initialEmbedConfig?: EmbedConfig;
  onBack: () => void;
  onSave: (template: WebsiteTemplate, embed?: EmbedConfig) => Promise<void> | void;
}

// One-shot registry / engine bootstrap.
registerSections();
registerWidgets();
void defaultPreviewEngine;

/**
 * EditorShell (Phase 2.5 — Visual Builder Engine).
 *
 * Canvas-first editor surface:
 *
 *   ┌─ Header (back, title, undo, redo, save) ───────────────────────┐
 *   ├─ Toolbar (mode, outlines/grid/spacing, device, zoom, AI) ──────┤
 *   │┌──────────┬─────────────────────────────────┬─────────────────┐│
 *   ││ LeftBar  │   CanvasFrame (Viewport)        │   RightBar      ││
 *   ││ Layers   │   ├─ Content (WebsitePreview)   │   Properties    ││
 *   ││ Insert   │   └─ OverlayLayer (portal)      │   AI Chat       ││
 *   │└──────────┴─────────────────────────────────┴─────────────────┘│
 *   └────────────────────────────────────────────────────────────────┘
 *
 * Architectural guarantees:
 *  - Visual state (zoom, device, grid)    → canvasStore
 *  - Selection / panels / dirty           → editorStore
 *  - Hover / drag / drop indicator        → interactionStore
 *  - Snapshot history                     → historyStore
 *  - Project/template data                → useTemplateState + bridge
 *  These four stores never write into each other; overlay re-renders are
 *  fully decoupled from content re-renders.
 */
export function EditorShell({
  websiteId,
  websiteName,
  template: initialTemplate,
  prompt: _prompt,
  initialEmbedConfig,
  onBack,
  onSave,
}: Props) {
  const tpl = useTemplateState(websiteId, websiteName, initialTemplate);
  const setProjectId = useEditorStore((s) => s.setProjectId);
  const setDirty = useEditorStore((s) => s.setDirty);
  const [embedConfig, setEmbedConfig] = useState<EmbedConfig | undefined>(initialEmbedConfig);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setProjectId(websiteId);
  }, [websiteId, setProjectId]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await onSave(tpl.template, embedConfig);
      setDirty(false);
      toast.success("Site guardado");
    } catch {
      toast.error("Erro ao guardar");
    } finally {
      setSaving(false);
    }
  }, [onSave, tpl.template, embedConfig, setDirty]);

  useEditorShortcuts(true, { onSave: handleSave });

  const orderedSections = useMemo(
    () => [...tpl.template.sections].filter((s) => s.enabled).sort((a, b) => a.order - b.order),
    [tpl.template.sections],
  );
  const orderedIds = useMemo(() => orderedSections.map((s) => s.id), [orderedSections]);
  const sectionLabels = useMemo(() => {
    const m: Record<string, string> = {};
    for (const s of tpl.template.sections) m[s.id] = s.title || s.type;
    return m;
  }, [tpl.template.sections]);
  const sectionEnabled = useMemo(() => {
    const m: Record<string, boolean> = {};
    for (const s of tpl.template.sections) m[s.id] = s.enabled;
    return m;
  }, [tpl.template.sections]);

  const handleAIEdit = useCallback(() => {
    useEditorStore.getState().toggleAIPanel(true);
  }, []);

  const aiOpen = useEditorStore((s) => s.aiPanelOpen);

  return (
    <TemplateBridgeContext.Provider value={tpl}>
      <div className="flex h-screen flex-col bg-background">
        <EditorHeader
          title={websiteName}
          onBack={onBack}
          onSave={handleSave}
          saving={saving}
        />
        <EditorToolbar />
        <div className="flex flex-1 min-h-0">
          <aside className="w-64 border-r bg-background overflow-hidden">
            <LeftSidebar
              project={tpl.project}
              onAddSection={tpl.addSection}
              onToggleSectionVisible={(id) => tpl.toggleSection(id)}
            />
          </aside>
          <main className="flex-1 relative min-w-0">
            <CanvasFrame
              version={tpl.version}
              orderedIds={orderedIds}
              sectionLabels={sectionLabels}
              sectionEnabled={sectionEnabled}
              onReorder={tpl.reorderSections}
              onMoveUp={(id) => tpl.moveSection(id, -1)}
              onMoveDown={(id) => tpl.moveSection(id, 1)}
              onDuplicate={tpl.duplicateSection}
              onDelete={tpl.removeSection}
              onToggleVisible={tpl.toggleSection}
              onAIEdit={handleAIEdit}
            >
              <WebsitePreview
                template={tpl.template}
                websiteName={websiteName}
                embedConfig={embedConfig}
                fullscreen={false}
                showChatWidget={false}
              />
            </CanvasFrame>
          </main>
          <aside className="w-72 border-l bg-background overflow-hidden">
            <RightSidebar
              project={tpl.project}
              showAI={aiOpen}
              onPatchSection={tpl.updateSectionContent}
            />
          </aside>
        </div>
      </div>
    </TemplateBridgeContext.Provider>
  );
}

export default EditorShell;
