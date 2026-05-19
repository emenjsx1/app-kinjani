import { memo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Layers, Sparkles, Settings2 } from "lucide-react";
import { LayerTreePanel } from "./LayerTreePanel";
import { SectionsPanel } from "./SectionsPanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { AIChatPanel } from "./AIChatPanel";
import type { Project } from "@/core/projects/types";
import type { WebsiteSection } from "@/lib/website-templates";

interface LeftPanelProps {
  project: Project | null;
  onAddSection: (s: WebsiteSection) => void;
  onToggleSectionVisible: (id: string, v: boolean) => void;
}

export const LeftSidebar = memo(function LeftSidebar({
  project,
  onAddSection,
  onToggleSectionVisible,
}: LeftPanelProps) {
  const [tab, setTab] = useState("layers");
  return (
    <Tabs value={tab} onValueChange={setTab} className="h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
        <TabsTrigger value="layers" className="text-xs">
          <Layers className="h-3.5 w-3.5 mr-1.5" /> Camadas
        </TabsTrigger>
        <TabsTrigger value="insert" className="text-xs">
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Inserir
        </TabsTrigger>
      </TabsList>
      <TabsContent value="layers" className="flex-1 overflow-y-auto m-0">
        <LayerTreePanel
          project={project}
          onSectionVisibilityToggle={onToggleSectionVisible}
        />
      </TabsContent>
      <TabsContent value="insert" className="flex-1 overflow-y-auto m-0">
        <SectionsPanel project={project} onAdd={onAddSection} />
      </TabsContent>
    </Tabs>
  );
});

interface RightPanelProps {
  project: Project | null;
  showAI: boolean;
  onPatchSection: (id: string, kv: Record<string, string>) => void;
}

export const RightSidebar = memo(function RightSidebar({
  project,
  showAI,
  onPatchSection,
}: RightPanelProps) {
  return (
    <Tabs value={showAI ? "ai" : "props"} className="h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
        <TabsTrigger value="props" className="text-xs">
          <Settings2 className="h-3.5 w-3.5 mr-1.5" /> Propriedades
        </TabsTrigger>
        <TabsTrigger value="ai" className="text-xs">
          <Sparkles className="h-3.5 w-3.5 mr-1.5" /> IA
        </TabsTrigger>
      </TabsList>
      <TabsContent value="props" className="flex-1 overflow-y-auto m-0">
        <PropertiesPanel project={project} onPatch={onPatchSection} />
      </TabsContent>
      <TabsContent value="ai" className="flex-1 overflow-y-auto m-0">
        <AIChatPanel project={project} />
      </TabsContent>
    </Tabs>
  );
});
