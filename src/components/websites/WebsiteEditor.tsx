import { useState, useRef, useEffect } from "react";
import { 
  Palette, Type, Layout, Image, Undo, Redo, Eye, Save, 
  ChevronLeft, Settings, Layers, Grid3X3, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, Plus, Minus, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WebsiteTemplate, WebsiteSection } from "@/lib/website-templates";
import { WebsitePreview } from "./WebsitePreview";
import { cn } from "@/lib/utils";

interface WebsiteEditorProps {
  template: WebsiteTemplate;
  websiteName: string;
  prompt: string;
  onBack: () => void;
  onSave: (website: WebsiteTemplate) => void;
}

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter" },
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Montserrat", label: "Montserrat" },
];

const PRESET_COLORS = [
  { name: "Azul", primary: "210 100% 50%", secondary: "200 70% 45%" },
  { name: "Verde", primary: "160 70% 45%", secondary: "140 60% 40%" },
  { name: "Roxo", primary: "260 70% 55%", secondary: "240 60% 50%" },
  { name: "Laranja", primary: "30 90% 55%", secondary: "20 80% 50%" },
  { name: "Rosa", primary: "340 80% 55%", secondary: "320 70% 50%" },
  { name: "Cinza", primary: "220 15% 35%", secondary: "220 10% 45%" },
];

export function WebsiteEditor({ template, websiteName, prompt, onBack, onSave }: WebsiteEditorProps) {
  const [editableTemplate, setEditableTemplate] = useState<WebsiteTemplate>({ ...template });
  const [activeTab, setActiveTab] = useState("sections");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateTemplate = (updates: Partial<WebsiteTemplate>) => {
    setEditableTemplate((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const updateSection = (sectionId: string, updates: Partial<WebsiteSection>) => {
    setEditableTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    }));
    setHasChanges(true);
  };

  const updateSectionContent = (sectionId: string, key: string, value: string) => {
    setEditableTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, content: { ...s.content, [key]: value } } : s
      ),
    }));
    setHasChanges(true);
  };

  const toggleSection = (sectionId: string) => {
    const section = editableTemplate.sections.find((s) => s.id === sectionId);
    if (section) {
      updateSection(sectionId, { enabled: !section.enabled });
    }
  };

  const handleSave = () => {
    onSave(editableTemplate);
    setHasChanges(false);
  };

  const getSectionLabel = (type: string) => {
    const labels: Record<string, string> = {
      hero: "Hero",
      about: "Sobre Nós",
      services: "Serviços",
      testimonials: "Testemunhos",
      contact: "Contacto",
      cta: "Call to Action",
      features: "Características",
      gallery: "Galeria",
      team: "Equipa",
      faq: "FAQ",
      pricing: "Preços",
    };
    return labels[type] || type;
  };

  if (previewMode) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" onClick={() => setPreviewMode(false)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar ao Editor
          </Button>
          <Badge variant="outline">Pré-visualização</Badge>
        </div>
        <div className="h-[calc(100vh-73px)] overflow-auto">
          <WebsitePreview template={editableTemplate} websiteName={websiteName} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar de Edição */}
      <div className="w-80 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-1" />
              Guardar
            </Button>
          </div>
          <h2 className="font-semibold truncate">{websiteName}</h2>
          <p className="text-xs text-muted-foreground">{template.name}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-3 mx-4 mt-4">
            <TabsTrigger value="sections">
              <Layers className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="design">
              <Palette className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="fonts">
              <Type className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 p-4">
            <TabsContent value="sections" className="m-0 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Secções do Site</h3>
                <div className="space-y-2">
                  {editableTemplate.sections
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                      <Card
                        key={section.id}
                        className={cn(
                          "cursor-pointer transition-all",
                          !section.enabled && "opacity-50",
                          editingSection === section.id && "ring-2 ring-primary"
                        )}
                      >
                        <CardHeader className="p-3">
                          <div className="flex items-center justify-between">
                            <div
                              className="flex-1"
                              onClick={() =>
                                setEditingSection(
                                  editingSection === section.id ? null : section.id
                                )
                              }
                            >
                              <CardTitle className="text-sm">
                                {getSectionLabel(section.type)}
                              </CardTitle>
                            </div>
                            <Switch
                              checked={section.enabled}
                              onCheckedChange={() => toggleSection(section.id)}
                            />
                          </div>
                        </CardHeader>
                        {editingSection === section.id && section.enabled && (
                          <CardContent className="p-3 pt-0 space-y-3">
                            {Object.entries(section.content).map(([key, value]) => (
                              <div key={key} className="space-y-1">
                                <Label className="text-xs capitalize">
                                  {key.replace(/([A-Z])/g, " $1").trim()}
                                </Label>
                                <Input
                                  value={value}
                                  onChange={(e) =>
                                    updateSectionContent(section.id, key, e.target.value)
                                  }
                                  className="text-sm h-8"
                                />
                              </div>
                            ))}
                          </CardContent>
                        )}
                      </Card>
                    ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="design" className="m-0 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Esquema de Cores</h3>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() =>
                        updateTemplate({
                          colors: {
                            ...editableTemplate.colors,
                            primary: preset.primary,
                            secondary: preset.secondary,
                          },
                        })
                      }
                      className={cn(
                        "p-2 rounded-lg border transition-all hover:scale-105",
                        editableTemplate.colors.primary === preset.primary &&
                          "ring-2 ring-primary"
                      )}
                    >
                      <div className="flex gap-1 mb-1">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: `hsl(${preset.primary})` }}
                        />
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: `hsl(${preset.secondary})` }}
                        />
                      </div>
                      <span className="text-xs">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-medium">Cores Personalizadas</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: `hsl(${editableTemplate.colors.primary})` }}
                    />
                    <Label className="text-xs flex-1">Cor Primária</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: `hsl(${editableTemplate.colors.secondary})` }}
                    />
                    <Label className="text-xs flex-1">Cor Secundária</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: `hsl(${editableTemplate.colors.accent})` }}
                    />
                    <Label className="text-xs flex-1">Cor de Destaque</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fonts" className="m-0 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Tipografia</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Fonte Principal</Label>
                    <Select
                      value={editableTemplate.font}
                      onValueChange={(value) => updateTemplate({ font: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <span style={{ fontFamily: font.value }}>{font.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 rounded-lg bg-muted">
                    <p
                      className="text-lg font-bold mb-1"
                      style={{ fontFamily: editableTemplate.font }}
                    >
                      Título de Exemplo
                    </p>
                    <p
                      className="text-sm text-muted-foreground"
                      style={{ fontFamily: editableTemplate.font }}
                    >
                      Este é um exemplo de como o texto vai aparecer no seu site.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setPreviewMode(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Pré-visualizar
          </Button>
        </div>
      </div>

      {/* Área de Preview */}
      <div className="flex-1 bg-muted/30 overflow-auto">
        <div className="p-4">
          <div className="bg-background rounded-lg shadow-lg overflow-hidden border">
            <div className="flex items-center gap-2 p-3 border-b bg-muted/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-muted-foreground">
                  {websiteName.toLowerCase().replace(/\s+/g, "-")}.kinja.ai
                </span>
              </div>
            </div>
            <WebsitePreview template={editableTemplate} websiteName={websiteName} />
          </div>
        </div>
      </div>
    </div>
  );
}
