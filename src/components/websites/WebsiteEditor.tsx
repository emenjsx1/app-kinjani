import { useState, useRef, useEffect } from "react";
import { 
  Palette, Type, Layers, Image, Eye, Save, ChevronLeft, 
  Plus, GripVertical, Sparkles, Upload, Trash2, ImagePlus,
  Coins, CheckCircle2, AlertCircle, Loader2, MessageCircle, Copy, Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WebsiteTemplate, WebsiteSection } from "@/lib/website-templates";
import { WebsitePreview } from "./WebsitePreview";
import { EditorAIChat } from "./EditorAIChat";
import { useSectionAI } from "@/hooks/useSectionAI";
import { useStorageUpload } from "@/hooks/useStorageUpload";
import { useAgents } from "@/hooks/useAgents";
import { generateEmbedCode } from "@/components/chat/EmbedWidget";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface EmbedConfig {
  enabled: boolean;
  agentId?: string;
  position?: "right" | "left";
  primaryColor?: string;
  welcomeMessage?: string;
}

interface WebsiteEditorProps {
  template: WebsiteTemplate;
  websiteName: string;
  prompt: string;
  onBack: () => void;
  onSave: (website: WebsiteTemplate, embedConfig?: EmbedConfig) => void;
  niche?: string;
  initialEmbedConfig?: EmbedConfig;
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

// Extended section type for widgets
type ExtendedSectionType = WebsiteSection["type"] | "counter" | "accordion" | "tabs" | "slider" | "pricing-table" | "video" | "divider" | "spacer" | "image-text" | "icon-box";

interface AvailableSectionDef {
  type: ExtendedSectionType;
  label: string;
  description: string;
  category: "content" | "interactive" | "media" | "layout";
}

const AVAILABLE_SECTIONS: AvailableSectionDef[] = [
  // Content
  { type: "hero", label: "Hero", description: "Secção principal com título e CTA", category: "content" },
  { type: "about", label: "Sobre Nós", description: "Informação sobre a empresa", category: "content" },
  { type: "services", label: "Serviços", description: "Lista de serviços oferecidos", category: "content" },
  { type: "features", label: "Características", description: "Pontos fortes do negócio", category: "content" },
  { type: "testimonials", label: "Testemunhos", description: "Opiniões de clientes", category: "content" },
  { type: "team", label: "Equipa", description: "Membros da equipa", category: "content" },
  { type: "cta", label: "Call to Action", description: "Apelo à ação", category: "content" },
  { type: "contact", label: "Contacto", description: "Informações de contacto", category: "content" },
  
  // Interactive
  { type: "counter", label: "Contadores", description: "Números animados com estatísticas", category: "interactive" },
  { type: "accordion", label: "Acordeão", description: "Conteúdo expansível", category: "interactive" },
  { type: "tabs", label: "Tabs", description: "Conteúdo em abas", category: "interactive" },
  { type: "faq", label: "FAQ", description: "Perguntas frequentes", category: "interactive" },
  
  // Media
  { type: "gallery", label: "Galeria", description: "Galeria de imagens", category: "media" },
  { type: "slider", label: "Slider", description: "Carrossel de imagens", category: "media" },
  { type: "video", label: "Vídeo", description: "Embed de vídeo", category: "media" },
  { type: "image-text", label: "Imagem + Texto", description: "Layout imagem com texto", category: "media" },
  
  // Layout
  { type: "pricing", label: "Preços", description: "Tabela de preços simples", category: "layout" },
  { type: "pricing-table", label: "Tabela Comparativa", description: "Comparativo de planos", category: "layout" },
  { type: "icon-box", label: "Caixas de Ícones", description: "Grid de ícones", category: "layout" },
  { type: "divider", label: "Divisor", description: "Linha separadora", category: "layout" },
  { type: "spacer", label: "Espaçador", description: "Espaço em branco", category: "layout" },
];

// Widget defaults for new types
const WIDGET_DEFAULTS: Record<string, Record<string, string>> = {
  counter: {
    title: "Os Nossos Números",
    counter1Value: "500", counter1Label: "Clientes", counter1Suffix: "+",
    counter2Value: "150", counter2Label: "Projetos", counter2Suffix: "+",
    counter3Value: "10", counter3Label: "Anos", counter3Suffix: "",
    counter4Value: "24", counter4Label: "Suporte", counter4Suffix: "/7",
  },
  accordion: {
    title: "Informações",
    item1Title: "Primeiro Item", item1Content: "Conteúdo do primeiro item.",
    item2Title: "Segundo Item", item2Content: "Conteúdo do segundo item.",
    item3Title: "Terceiro Item", item3Content: "Conteúdo do terceiro item.",
  },
  tabs: {
    title: "Descubra Mais",
    tab1Title: "Visão Geral", tab1Content: "Conteúdo da primeira aba.",
    tab2Title: "Características", tab2Content: "Características principais.",
    tab3Title: "Especificações", tab3Content: "Detalhes técnicos.",
  },
  slider: {
    title: "Galeria em Destaque",
    slide1Image: "", slide1Title: "Slide 1", slide1Description: "Descrição",
    slide2Image: "", slide2Title: "Slide 2", slide2Description: "Descrição",
    slide3Image: "", slide3Title: "Slide 3", slide3Description: "Descrição",
    autoplay: "true", interval: "5000",
  },
  "pricing-table": {
    title: "Escolha o Seu Plano", subtitle: "Planos flexíveis",
    plan1Name: "Starter", plan1Price: "€19", plan1Period: "/mês",
    plan1Feature1: "5 Utilizadores", plan1Feature2: "10GB", plan1Feature3: "Suporte Email", plan1Highlight: "false",
    plan2Name: "Pro", plan2Price: "€49", plan2Period: "/mês",
    plan2Feature1: "25 Utilizadores", plan2Feature2: "100GB", plan2Feature3: "Suporte Prioritário", plan2Feature4: "API", plan2Highlight: "true",
    plan3Name: "Empresarial", plan3Price: "€99", plan3Period: "/mês",
    plan3Feature1: "Ilimitado", plan3Feature2: "1TB", plan3Feature3: "Suporte 24/7", plan3Feature4: "White Label", plan3Highlight: "false",
  },
  video: { title: "Veja em Ação", videoUrl: "", description: "Descubra o nosso serviço." },
  divider: { style: "line", color: "primary", width: "50" },
  spacer: { height: "64" },
  "image-text": {
    title: "Título da Secção", description: "Descrição detalhada.",
    image: "", imagePosition: "left", ctaText: "Saber Mais", ctaUrl: "",
  },
  "icon-box": {
    title: "Vantagens",
    box1Icon: "shield", box1Title: "Segurança", box1Description: "Proteção total",
    box2Icon: "zap", box2Title: "Rapidez", box2Description: "Resultados rápidos",
    box3Icon: "heart", box3Title: "Dedicação", box3Description: "Compromisso",
    box4Icon: "award", box4Title: "Qualidade", box4Description: "Padrões elevados",
  },
};

const createDefaultSection = (type: ExtendedSectionType, order: number): WebsiteSection => {
  const defaults: Record<string, Record<string, string>> = {
    hero: { headline: "Título Principal", subheadline: "Subtítulo descritivo", ctaText: "Começar", ctaSecondaryText: "Saber Mais" },
    about: { title: "Sobre Nós", description: "Descrição da empresa...", mission: "Nossa missão..." },
    services: { title: "Serviços", subtitle: "O que fazemos", service1Title: "Serviço 1", service1Description: "Descrição", service1Image: "", service2Title: "Serviço 2", service2Description: "Descrição", service2Image: "", service3Title: "Serviço 3", service3Description: "Descrição", service3Image: "" },
    features: { title: "Porquê Escolher-nos", feature1Title: "Característica 1", feature1Description: "Descrição", feature1Image: "", feature2Title: "Característica 2", feature2Description: "Descrição", feature2Image: "", feature3Title: "Característica 3", feature3Description: "Descrição", feature3Image: "" },
    testimonials: { title: "Testemunhos", testimonial1Text: "Testemunho do cliente", testimonial1Author: "Nome", testimonial1Role: "Cliente", testimonial1Image: "", testimonial2Text: "Outro testemunho", testimonial2Author: "Nome", testimonial2Role: "Cliente", testimonial2Image: "" },
    team: { title: "A Nossa Equipa", subtitle: "Conheça-nos", member1Name: "Membro 1", member1Role: "Cargo", member1Image: "", member1Bio: "", member2Name: "Membro 2", member2Role: "Cargo", member2Image: "", member2Bio: "", member3Name: "", member3Role: "", member3Image: "", member4Name: "", member4Role: "", member4Image: "" },
    gallery: { title: "Galeria", subtitle: "Os nossos trabalhos", image1: "", image2: "", image3: "", image4: "", image5: "", image6: "" },
    faq: { title: "Perguntas Frequentes", faq1Question: "Pergunta 1?", faq1Answer: "Resposta 1", faq2Question: "Pergunta 2?", faq2Answer: "Resposta 2", faq3Question: "", faq3Answer: "", faq4Question: "", faq4Answer: "" },
    pricing: { title: "Preços", plan1Name: "Básico", plan1Price: "€29/mês", plan1Features: "Recurso 1, Recurso 2", plan2Name: "Profissional", plan2Price: "€59/mês", plan2Features: "Tudo do Básico, Recurso 3", plan3Name: "Empresarial", plan3Price: "€99/mês", plan3Features: "Tudo incluído" },
    cta: { title: "Pronto para Começar?", description: "Entre em contacto connosco", buttonText: "Fale Connosco" },
    contact: { title: "Contacto", subtitle: "Fale Connosco", email: "email@exemplo.pt", phone: "+351 912 345 678", whatsappNumber: "", address: "Lisboa, Portugal" },
    // New widget defaults
    ...WIDGET_DEFAULTS,
  };

  return {
    id: `${type}-${Date.now()}`,
    type: type as WebsiteSection["type"],
    title: AVAILABLE_SECTIONS.find(s => s.type === type)?.label || type,
    enabled: true,
    order,
    content: defaults[type] || {},
  };
};

export function WebsiteEditor({ template, websiteName, prompt, onBack, onSave, niche = "", initialEmbedConfig }: WebsiteEditorProps) {
  const [editableTemplate, setEditableTemplate] = useState<WebsiteTemplate>({ ...template });
  const [activeTab, setActiveTab] = useState("sections");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAIEdit, setShowAIEdit] = useState(false);
  const [aiInstruction, setAiInstruction] = useState("");
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  
  // Embed config state
  const [embedConfig, setEmbedConfig] = useState<EmbedConfig>(
    initialEmbedConfig || {
      enabled: false,
      position: "right",
      primaryColor: "#00DF81",
      welcomeMessage: "Olá! Como posso ajudá-lo?",
    }
  );
  
  const { editSectionWithAI, isEditing: isAIEditing } = useSectionAI();
  const { uploadFile, isUploading } = useStorageUpload();
  const { agents } = useAgents();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFor, setUploadingFor] = useState<{ sectionId: string; field: string } | null>(null);

  // Handle AI chat template updates
  const handleAIChatUpdate = (newTemplate: WebsiteTemplate) => {
    setEditableTemplate(newTemplate);
    setHasChanges(true);
  };


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

  const addSection = (type: WebsiteSection["type"]) => {
    const maxOrder = Math.max(...editableTemplate.sections.map(s => s.order), -1);
    const newSection = createDefaultSection(type, maxOrder + 1);
    setEditableTemplate((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
    setHasChanges(true);
    setShowAddSection(false);
    toast.success(`Secção "${AVAILABLE_SECTIONS.find(s => s.type === type)?.label}" adicionada`);
  };

  const removeSection = (sectionId: string) => {
    setEditableTemplate((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId),
    }));
    setHasChanges(true);
    setEditingSection(null);
    toast.success("Secção removida");
  };

  const handleDragStart = (sectionId: string) => {
    setDraggedSection(sectionId);
  };

  const handleDragOver = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    if (!draggedSection || draggedSection === targetSectionId) return;
  };

  const handleDrop = (targetSectionId: string) => {
    if (!draggedSection || draggedSection === targetSectionId) {
      setDraggedSection(null);
      return;
    }

    const sections = [...editableTemplate.sections];
    const draggedIndex = sections.findIndex(s => s.id === draggedSection);
    const targetIndex = sections.findIndex(s => s.id === targetSectionId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [removed] = sections.splice(draggedIndex, 1);
      sections.splice(targetIndex, 0, removed);
      
      // Update order values
      sections.forEach((section, index) => {
        section.order = index;
      });

      setEditableTemplate((prev) => ({ ...prev, sections }));
      setHasChanges(true);
    }
    setDraggedSection(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Upload to Supabase Storage
    const publicUrl = await uploadFile(file, "website-assets", websiteName.toLowerCase().replace(/\s+/g, "-"));
    
    if (!publicUrl) {
      toast.error("Erro ao fazer upload da imagem");
      setUploadingFor(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Check if this is a special asset upload
    if (uploadingFor?.sectionId === 'logo' && uploadingFor?.field === 'logoUrl') {
      setEditableTemplate(prev => ({ ...prev, logoUrl: publicUrl }));
      setHasChanges(true);
      toast.success("Logo carregado com sucesso");
    } else if (uploadingFor?.sectionId === 'favicon' && uploadingFor?.field === 'faviconUrl') {
      setEditableTemplate(prev => ({ ...prev, faviconUrl: publicUrl }));
      setHasChanges(true);
      toast.success("Favicon carregado com sucesso");
    } else if (uploadingFor?.sectionId === 'banner' && uploadingFor?.field === 'bannerUrl') {
      setEditableTemplate(prev => ({ ...prev, bannerUrl: publicUrl }));
      setHasChanges(true);
      toast.success("Banner carregado com sucesso");
    } else if (uploadingFor?.sectionId === 'ogImage' && uploadingFor?.field === 'ogImageUrl') {
      setEditableTemplate(prev => ({ ...prev, ogImageUrl: publicUrl }));
      setHasChanges(true);
      toast.success("Imagem de partilha carregada com sucesso");
    } else if (uploadingFor) {
      updateSectionContent(uploadingFor.sectionId, uploadingFor.field, publicUrl);
      toast.success("Imagem adicionada");
    }
    
    setUploadingFor(null);
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAIEdit = async () => {
    if (!editingSection || !aiInstruction.trim()) return;

    const section = editableTemplate.sections.find(s => s.id === editingSection);
    if (!section) return;

    const result = await editSectionWithAI({
      sectionType: section.type,
      currentContent: section.content,
      instruction: aiInstruction,
      websiteName,
      niche,
    });

    if (result.success && result.content) {
      updateSection(editingSection, { content: result.content });
      toast.success(`Secção editada com IA (${result.creditsUsed} crédito${result.creditsUsed !== 1 ? 's' : ''} usado${result.creditsUsed !== 1 ? 's' : ''})`);
      setShowAIEdit(false);
      setAiInstruction("");
    } else {
      toast.error(result.error || "Erro ao editar com IA");
    }
  };

  const handleSave = () => {
    onSave(editableTemplate, embedConfig);
    setHasChanges(false);
    toast.success("Alterações guardadas");
  };

  const handleCopyEmbedCode = () => {
    if (!embedConfig.agentId) {
      toast.error("Selecione um agente primeiro");
      return;
    }
    const code = generateEmbedCode({
      agentId: embedConfig.agentId,
      primaryColor: embedConfig.primaryColor,
      position: embedConfig.position,
      welcomeMessage: embedConfig.welcomeMessage,
    });
    navigator.clipboard.writeText(code);
    toast.success("Código copiado!");
  };

  const getSectionLabel = (type: string) => {
    return AVAILABLE_SECTIONS.find(s => s.type === type)?.label || type;
  };

  const existingSectionTypes = editableTemplate.sections.map(s => s.type);
  const availableToAdd = AVAILABLE_SECTIONS.filter(s => !existingSectionTypes.includes(s.type as WebsiteSection["type"]));

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
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

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
          <TabsList className="grid grid-cols-5 mx-4 mt-4">
            <TabsTrigger value="sections">
              <Layers className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="design">
              <Palette className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="fonts">
              <Type className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="images">
              <Image className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="embed">
              <MessageCircle className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 p-4">
            {/* Sections Tab */}
            <TabsContent value="sections" className="m-0 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Secções do Site</h3>
                <Button size="sm" variant="outline" onClick={() => setShowAddSection(true)}>
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar
                </Button>
              </div>
              
              <div className="space-y-2">
                {editableTemplate.sections
                  .sort((a, b) => a.order - b.order)
                  .map((section) => (
                    <Card
                      key={section.id}
                      className={cn(
                        "cursor-pointer transition-all",
                        !section.enabled && "opacity-50",
                        editingSection === section.id && "ring-2 ring-primary",
                        draggedSection === section.id && "opacity-30"
                      )}
                      draggable
                      onDragStart={() => handleDragStart(section.id)}
                      onDragOver={(e) => handleDragOver(e, section.id)}
                      onDrop={() => handleDrop(section.id)}
                    >
                      <CardHeader className="p-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
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
                          {/* AI Edit Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => setShowAIEdit(true)}
                          >
                            <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
                            Editar com IA
                            <Badge variant="secondary" className="ml-auto text-xs">
                              <Coins className="h-3 w-3 mr-1" />1
                            </Badge>
                          </Button>

                          <Separator />

                          {/* Content fields */}
                          {Object.entries(section.content).map(([key, value]) => (
                            <div key={key} className="space-y-1">
                              <Label className="text-xs capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </Label>
                              {key.toLowerCase().includes('image') ? (
                                <div className="flex gap-2">
                                  <Input
                                    value={value}
                                    onChange={(e) =>
                                      updateSectionContent(section.id, key, e.target.value)
                                    }
                                    className="text-sm h-8 flex-1"
                                    placeholder="URL da imagem"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setUploadingFor({ sectionId: section.id, field: key });
                                      fileInputRef.current?.click();
                                    }}
                                  >
                                    <Upload className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : value.length > 60 ? (
                                <Textarea
                                  value={value}
                                  onChange={(e) =>
                                    updateSectionContent(section.id, key, e.target.value)
                                  }
                                  className="text-sm min-h-[60px]"
                                />
                              ) : (
                                <Input
                                  value={value}
                                  onChange={(e) =>
                                    updateSectionContent(section.id, key, e.target.value)
                                  }
                                  className="text-sm h-8"
                                />
                              )}
                            </div>
                          ))}

                          <Separator />

                          <Button
                            size="sm"
                            variant="destructive"
                            className="w-full"
                            onClick={() => removeSection(section.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remover Secção
                          </Button>
                        </CardContent>
                      )}
                    </Card>
                  ))}
              </div>
            </TabsContent>

            {/* Design Tab */}
            <TabsContent value="design" className="m-0 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Logo</h3>
                <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center bg-background cursor-pointer hover:border-primary transition-colors overflow-hidden"
                      onClick={() => {
                        setUploadingFor({ sectionId: 'logo', field: 'logoUrl' });
                        fileInputRef.current?.click();
                      }}
                    >
                      {editableTemplate.logoUrl ? (
                        <img 
                          src={editableTemplate.logoUrl} 
                          alt="Logo" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ImagePlus className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {editableTemplate.logoUrl ? "Alterar Logo" : "Carregar Logo"}
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, SVG ou JPG</p>
                    </div>
                    {editableTemplate.logoUrl && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditableTemplate(prev => ({ ...prev, logoUrl: undefined }));
                          setHasChanges(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Favicon */}
              <div>
                <h3 className="text-sm font-medium mb-3">Favicon</h3>
                <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg border-2 border-dashed flex items-center justify-center bg-background cursor-pointer hover:border-primary transition-colors overflow-hidden"
                      onClick={() => {
                        setUploadingFor({ sectionId: 'favicon', field: 'faviconUrl' });
                        fileInputRef.current?.click();
                      }}
                    >
                      {editableTemplate.faviconUrl ? (
                        <img src={editableTemplate.faviconUrl} alt="Favicon" className="w-full h-full object-contain" />
                      ) : (
                        <ImagePlus className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{editableTemplate.faviconUrl ? "Alterar Favicon" : "Carregar Favicon"}</p>
                      <p className="text-xs text-muted-foreground">ICO, PNG ou SVG (32x32px)</p>
                    </div>
                    {editableTemplate.faviconUrl && (
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditableTemplate(prev => ({ ...prev, faviconUrl: undefined })); setHasChanges(true); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Banner / Hero Background */}
              <div>
                <h3 className="text-sm font-medium mb-3">Banner / Capa</h3>
                <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                  <div 
                    className="w-full h-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-background cursor-pointer hover:border-primary transition-colors overflow-hidden"
                    onClick={() => {
                      setUploadingFor({ sectionId: 'banner', field: 'bannerUrl' });
                      fileInputRef.current?.click();
                    }}
                  >
                    {editableTemplate.bannerUrl ? (
                      <img src={editableTemplate.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <ImagePlus className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">Imagem de fundo do Hero</p>
                      </div>
                    )}
                  </div>
                  {editableTemplate.bannerUrl && (
                    <Button size="sm" variant="ghost" className="w-full" onClick={() => { setEditableTemplate(prev => ({ ...prev, bannerUrl: undefined })); setHasChanges(true); }}>
                      <Trash2 className="h-3 w-3 mr-1 text-destructive" />
                      Remover Banner
                    </Button>
                  )}
                </div>
              </div>

              <Separator />

              {/* OG Image */}
              <div>
                <h3 className="text-sm font-medium mb-3">Imagem de Partilha (OG Image)</h3>
                <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                  <div 
                    className="w-full h-20 rounded-lg border-2 border-dashed flex items-center justify-center bg-background cursor-pointer hover:border-primary transition-colors overflow-hidden"
                    onClick={() => {
                      setUploadingFor({ sectionId: 'ogImage', field: 'ogImageUrl' });
                      fileInputRef.current?.click();
                    }}
                  >
                    {editableTemplate.ogImageUrl ? (
                      <img src={editableTemplate.ogImageUrl} alt="OG Image" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <ImagePlus className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">1200×630px recomendado</p>
                      </div>
                    )}
                  </div>
                  {editableTemplate.ogImageUrl && (
                    <Button size="sm" variant="ghost" className="w-full" onClick={() => { setEditableTemplate(prev => ({ ...prev, ogImageUrl: undefined })); setHasChanges(true); }}>
                      <Trash2 className="h-3 w-3 mr-1 text-destructive" />
                      Remover
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">Aparece ao partilhar o link nas redes sociais</p>
                </div>
              </div>

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

            {/* Fonts Tab */}
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

            {/* Images Tab */}
            <TabsContent value="images" className="m-0 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Imagens do Site</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Faça upload de imagens para usar nas secções do site.
                </p>
                
                <div className="space-y-3">
                  <div 
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Carregar Imagem</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG até 5MB</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Dica</h4>
                  <p className="text-xs text-muted-foreground">
                    Também pode adicionar imagens diretamente em cada secção editando os campos de imagem.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Embed Tab */}
            <TabsContent value="embed" className="m-0 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Widget de Chat IA</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Adicione um assistente IA ao seu site para atender visitantes automaticamente.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                <div>
                  <p className="font-medium text-sm">Ativar Chat IA</p>
                  <p className="text-xs text-muted-foreground">
                    Mostrar widget de chat no seu site
                  </p>
                </div>
                <Switch
                  checked={embedConfig.enabled}
                  onCheckedChange={(checked) => {
                    setEmbedConfig((prev) => ({ ...prev, enabled: checked }));
                    setHasChanges(true);
                  }}
                />
              </div>

              {embedConfig.enabled && (
                <div className="space-y-4">
                  <Separator />

                  <div className="space-y-2">
                    <Label>Selecionar Agente</Label>
                    <Select
                      value={embedConfig.agentId || ""}
                      onValueChange={(value) => {
                        setEmbedConfig((prev) => ({ ...prev, agentId: value }));
                        setHasChanges(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Escolher agente..." />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.length > 0 ? (
                          agents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>
                              {agent.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            Nenhum agente disponível
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {agents.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Crie primeiro um agente na secção de Agentes.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Posição</Label>
                    <Select
                      value={embedConfig.position || "right"}
                      onValueChange={(value: "right" | "left") => {
                        setEmbedConfig((prev) => ({ ...prev, position: value }));
                        setHasChanges(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="right">Canto inferior direito</SelectItem>
                        <SelectItem value="left">Canto inferior esquerdo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Cor do Widget</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={embedConfig.primaryColor || "#00DF81"}
                        onChange={(e) => {
                          setEmbedConfig((prev) => ({ ...prev, primaryColor: e.target.value }));
                          setHasChanges(true);
                        }}
                        className="w-12 h-8 p-1 cursor-pointer"
                      />
                      <Input
                        value={embedConfig.primaryColor || "#00DF81"}
                        onChange={(e) => {
                          setEmbedConfig((prev) => ({ ...prev, primaryColor: e.target.value }));
                          setHasChanges(true);
                        }}
                        className="flex-1 h-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Mensagem de Boas-vindas</Label>
                    <Textarea
                      value={embedConfig.welcomeMessage || ""}
                      onChange={(e) => {
                        setEmbedConfig((prev) => ({ ...prev, welcomeMessage: e.target.value }));
                        setHasChanges(true);
                      }}
                      placeholder="Olá! Como posso ajudá-lo?"
                      className="min-h-[60px]"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Código para Incorporar
                    </Label>
                    <div className="relative">
                      <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto max-h-[120px]">
                        <code>
                          {embedConfig.agentId
                            ? generateEmbedCode({
                                agentId: embedConfig.agentId,
                                primaryColor: embedConfig.primaryColor,
                                position: embedConfig.position,
                                welcomeMessage: embedConfig.welcomeMessage,
                              })
                            : "// Selecione um agente primeiro"}
                        </code>
                      </pre>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2"
                        onClick={handleCopyEmbedCode}
                        disabled={!embedConfig.agentId}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copiar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cole este código antes do &lt;/body&gt; do seu site externo.
                    </p>
                  </div>
                </div>
              )}
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

      {/* Add Section Dialog */}
      <Dialog open={showAddSection} onOpenChange={setShowAddSection}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Secção</DialogTitle>
            <DialogDescription>
              Escolha uma secção para adicionar ao seu site.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2 pr-4">
              {availableToAdd.length > 0 ? (
                availableToAdd.map((section) => (
                  <div
                    key={section.type}
                    className="p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors"
                    onClick={() => addSection(section.type as WebsiteSection["type"])}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{section.label}</p>
                        <p className="text-xs text-muted-foreground">{section.description}</p>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm text-muted-foreground">
                    Todas as secções já foram adicionadas!
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* AI Edit Dialog */}
      <Dialog open={showAIEdit} onOpenChange={setShowAIEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Editar com IA
            </DialogTitle>
            <DialogDescription>
              Descreva as alterações que deseja fazer nesta secção.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
              <Coins className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-700 dark:text-amber-400">
                Esta ação gasta 1 crédito
              </span>
            </div>

            <div className="space-y-2">
              <Label>Instruções</Label>
              <Textarea
                placeholder="Ex: Torne o texto mais profissional, adicione um tom mais amigável, mude o foco para..."
                value={aiInstruction}
                onChange={(e) => setAiInstruction(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAIEdit(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAIEdit} 
              disabled={!aiInstruction.trim() || isAIEditing}
            >
              {isAIEditing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  A editar...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Editar com IA
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Chat */}
      <EditorAIChat
        template={editableTemplate}
        websiteName={websiteName}
        onTemplateUpdate={handleAIChatUpdate}
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
      />

      {/* AI Chat Toggle Button */}
      {!showAIChat && (
        <button
          onClick={() => setShowAIChat(true)}
          className="fixed bottom-4 left-4 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          title="Editar com IA"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
