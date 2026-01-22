import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Building2, CheckCircle2, Sparkles, Loader2, Eye, EyeOff, Wand2, LayoutTemplate, ShoppingBag, FileText, Rocket, Utensils, Calendar, Briefcase } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Stepper, CardSelect } from "@/components/ui/stepper";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TEMPLATE_CATEGORIES, WebsiteTemplate, getCategoryIcon } from "@/lib/website-templates";
import { WebsitePreview } from "@/components/websites/WebsitePreview";
import { useWebsiteAI } from "@/hooks/useWebsiteAI";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Website {
  id: string;
  name: string;
  type: "landing" | "institutional";
  niche: string;
  nicheId: string;
  templateId: string;
  prompt: string;
  status: "active" | "draft" | "inactive";
  url: string;
  createdAt: string;
  customTemplate?: WebsiteTemplate;
}

interface CreateWebsiteWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWebsiteCreated: (website: Website) => void;
}

const STEPS_GUIDED = ["Modo", "Tipo", "Categoria", "Template", "Prompt", "Nome", "A Gerar...", "Concluído"];
const STEPS_OPEN = ["Modo", "Descreva Tudo", "Nome", "A Gerar...", "Concluído"];

const WEBSITE_TYPES = [
  { id: "landing", title: "Landing Page", description: "Página única focada em conversão", icon: <Globe className="h-5 w-5" /> },
  { id: "institutional", title: "Site Institucional", description: "Site completo multi-página", icon: <Building2 className="h-5 w-5" /> },
  { id: "portfolio", title: "Portfólio", description: "Mostre trabalhos e projetos", icon: <Briefcase className="h-5 w-5" /> },
  { id: "ecommerce", title: "E-commerce", description: "Loja online para produtos", icon: <ShoppingBag className="h-5 w-5" /> },
  { id: "blog", title: "Blog / Conteúdo", description: "Blog ou site de conteúdo", icon: <FileText className="h-5 w-5" /> },
  { id: "saas", title: "SaaS / App", description: "Apresentação de software", icon: <Rocket className="h-5 w-5" /> },
  { id: "restaurant", title: "Restaurante / Café", description: "Menu, reservas e mais", icon: <Utensils className="h-5 w-5" /> },
  { id: "event", title: "Evento / Casamento", description: "Página para eventos", icon: <Calendar className="h-5 w-5" /> },
];

const BUILD_MODES = [
  {
    id: "open",
    title: "Open Build ✨",
    description: "Descreva tudo e a IA cria automaticamente (tipo Bolt/v0)",
    icon: <Wand2 className="h-5 w-5" />,
  },
  {
    id: "guided",
    title: "Modo Assistido",
    description: "Escolha template e categoria, IA preenche conteúdo",
    icon: <LayoutTemplate className="h-5 w-5" />,
  },
];

// Helper to get all templates for a type
const getAllTemplatesForType = (type: string) => {
  return TEMPLATE_CATEGORIES.flatMap(cat => cat.templates).filter(t => t.type === type || t.type === "landing");
};

// Default blank template for Open Build
const getBlankTemplate = (): WebsiteTemplate => ({
  id: "open-build-generated",
  name: "Site Gerado por IA",
  description: "Template gerado automaticamente",
  category: "Em Branco",
  categoryId: "blank",
  type: "landing",
  thumbnail: "/placeholder.svg",
  colors: {
    primary: "220 70% 50%",
    secondary: "200 60% 45%",
    accent: "340 80% 55%",
    background: "0 0% 100%",
    text: "220 30% 15%",
  },
  font: "Inter",
  sections: [
    { id: "hero", type: "hero", title: "Hero", enabled: true, order: 0, content: { headline: "", subheadline: "", ctaText: "", ctaSecondaryText: "" } },
    { id: "about", type: "about", title: "Sobre", enabled: true, order: 1, content: { title: "", description: "", mission: "" } },
    { id: "services", type: "services", title: "Serviços", enabled: true, order: 2, content: { title: "", subtitle: "", service1Title: "", service1Description: "", service2Title: "", service2Description: "", service3Title: "", service3Description: "" } },
    { id: "features", type: "features", title: "Características", enabled: true, order: 3, content: { title: "", feature1Title: "", feature1Description: "", feature2Title: "", feature2Description: "", feature3Title: "", feature3Description: "" } },
    { id: "testimonials", type: "testimonials", title: "Testemunhos", enabled: true, order: 4, content: { title: "", testimonial1Text: "", testimonial1Author: "", testimonial1Role: "", testimonial2Text: "", testimonial2Author: "", testimonial2Role: "" } },
    { id: "cta", type: "cta", title: "CTA", enabled: true, order: 5, content: { title: "", description: "", buttonText: "" } },
    { id: "contact", type: "contact", title: "Contacto", enabled: true, order: 6, content: { title: "", subtitle: "", email: "", phone: "", address: "" } },
  ],
});

export function CreateWebsiteWizard({ open, onOpenChange, onWebsiteCreated }: CreateWebsiteWizardProps) {
  const navigate = useNavigate();
  const { generateContent, applySectionsContent, isGenerating } = useWebsiteAI();
  
  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [buildMode, setBuildMode] = useState<"open" | "guided" | null>(null);
  const [websiteType, setWebsiteType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WebsiteTemplate | null>(null);
  const [prompt, setPrompt] = useState("");
  const [openBuildPrompt, setOpenBuildPrompt] = useState("");
  const [websiteName, setWebsiteName] = useState("");
  const [createdWebsiteId, setCreatedWebsiteId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const STEPS = buildMode === "open" ? STEPS_OPEN : STEPS_GUIDED;
  const generatingStepIndex = buildMode === "open" ? 3 : 6;
  const successStepIndex = buildMode === "open" ? 4 : 7;
  const nameStepIndex = buildMode === "open" ? 2 : 5;

  const resetWizard = () => {
    setCurrentStep(0);
    setBuildMode(null);
    setWebsiteType(null);
    setSelectedCategory(null);
    setSelectedTemplate(null);
    setPrompt("");
    setOpenBuildPrompt("");
    setWebsiteName("");
    setCreatedWebsiteId(null);
    setShowPreview(false);
  };

  const handleClose = () => {
    resetWizard();
    onOpenChange(false);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Guided mode creation
  const handleCreateGuided = async () => {
    if (!selectedTemplate || !websiteType) return;

    const category = selectedCategory 
      ? TEMPLATE_CATEGORIES.find((c) => c.id === selectedCategory)
      : TEMPLATE_CATEGORIES.find((c) => c.id === "blank");
    
    setCurrentStep(generatingStepIndex);
    const sectionTypes = selectedTemplate.sections.map((s) => s.type);

    try {
      const generatedContent = await generateContent({
        websiteType: (websiteType === "landing" || websiteType === "institutional") ? websiteType : "landing",
        niche: category?.name || "Outro",
        templateName: selectedTemplate.name,
        prompt,
        websiteName,
        sections: sectionTypes,
      });

      let customTemplate = { ...selectedTemplate };

      if (generatedContent) {
        customTemplate = {
          ...selectedTemplate,
          sections: applySectionsContent(selectedTemplate.sections, generatedContent),
        };
        toast({ title: "Conteúdo gerado com IA!", description: "O conteúdo do seu site foi personalizado." });
      } else {
        toast({ title: "Site criado", description: "A usar conteúdo padrão.", variant: "default" });
      }

      const newWebsite: Website = {
        id: Date.now().toString(),
        name: websiteName,
        type: (websiteType === "landing" || websiteType === "institutional") ? websiteType : "landing",
        niche: category?.name || "Outro",
        nicheId: selectedCategory || "outro",
        templateId: selectedTemplate.id,
        prompt: prompt,
        status: "draft",
        url: "",
        createdAt: new Date().toISOString().split("T")[0],
        customTemplate,
      };

      setCreatedWebsiteId(newWebsite.id);
      onWebsiteCreated(newWebsite);
      setCurrentStep(successStepIndex);
    } catch (error) {
      console.error("Error creating website:", error);
      toast({ title: "Erro", description: "Ocorreu um erro. Tente novamente.", variant: "destructive" });
      setCurrentStep(nameStepIndex);
    }
  };

  // Open Build mode creation
  const handleCreateOpenBuild = async () => {
    if (!openBuildPrompt.trim() || !websiteName.trim()) return;

    setCurrentStep(generatingStepIndex);
    const blankTemplate = getBlankTemplate();
    const sectionTypes = blankTemplate.sections.map((s) => s.type);

    try {
      const generatedContent = await generateContent({
        websiteType: "landing",
        niche: "Open Build",
        templateName: "Gerado por IA",
        prompt: openBuildPrompt,
        websiteName,
        sections: sectionTypes,
      });

      let customTemplate = { ...blankTemplate };

      if (generatedContent) {
        customTemplate = {
          ...blankTemplate,
          sections: applySectionsContent(blankTemplate.sections, generatedContent),
        };
        toast({ title: "Site criado com IA! ✨", description: "O seu site foi gerado automaticamente." });
      } else {
        toast({ title: "Site criado", description: "A usar conteúdo padrão.", variant: "default" });
      }

      const newWebsite: Website = {
        id: Date.now().toString(),
        name: websiteName,
        type: "landing",
        niche: "Open Build",
        nicheId: "open-build",
        templateId: "open-build-generated",
        prompt: openBuildPrompt,
        status: "draft",
        url: "",
        createdAt: new Date().toISOString().split("T")[0],
        customTemplate,
      };

      setCreatedWebsiteId(newWebsite.id);
      onWebsiteCreated(newWebsite);
      setCurrentStep(successStepIndex);
    } catch (error) {
      console.error("Error creating website:", error);
      toast({ title: "Erro", description: "Ocorreu um erro. Tente novamente.", variant: "destructive" });
      setCurrentStep(nameStepIndex);
    }
  };

  const handleCreate = () => {
    if (buildMode === "open") {
      handleCreateOpenBuild();
    } else {
      handleCreateGuided();
    }
  };

  const handleOpenEditor = () => {
    handleClose();
    if (createdWebsiteId) {
      navigate(`/websites/${createdWebsiteId}/edit`);
    }
  };

  const canProceed = () => {
    if (buildMode === "open") {
      switch (currentStep) {
        case 0: return buildMode !== null;
        case 1: return openBuildPrompt.trim().length > 20;
        case 2: return websiteName.trim().length > 2;
        default: return true;
      }
    } else {
      switch (currentStep) {
        case 0: return buildMode !== null;
        case 1: return websiteType !== null;
        case 2: return true; // Category optional
        case 3: return selectedTemplate !== null;
        case 4: return prompt.trim().length > 10;
        case 5: return websiteName.trim().length > 2;
        default: return true;
      }
    }
  };

  const filteredTemplates = selectedCategory
    ? TEMPLATE_CATEGORIES.find((c) => c.id === selectedCategory)?.templates.filter((t) => t.type === websiteType) || []
    : getAllTemplatesForType(websiteType || "landing");

  const renderStep = () => {
    // Step 0: Choose mode
    if (currentStep === 0) {
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Como quer criar o site?</h3>
            <p className="text-sm text-muted-foreground">Escolha o modo de criação</p>
          </div>
          <CardSelect 
            options={BUILD_MODES} 
            value={buildMode} 
            onChange={(val) => setBuildMode(val as "open" | "guided")} 
            className="grid-cols-2" 
          />
        </div>
      );
    }

    // Open Build mode steps
    if (buildMode === "open") {
      switch (currentStep) {
        case 1:
          return (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-primary" />
                  Descreva o que quer criar
                </h3>
                <p className="text-sm text-muted-foreground">
                  Seja detalhado: tipo de negócio, serviços, tom, cores preferidas, tudo!
                </p>
              </div>
              <Textarea
                placeholder={`Exemplo: Quero um site para a minha clínica de estética chamada "BeautyLab". 

Oferecemos tratamentos faciais, massagens e depilação a laser. 

Quero um design moderno e elegante, com cores rosa suave e dourado. 

O site deve ter: página inicial com hero impactante, secção de serviços com preços, testemunhos de clientes, galeria de fotos e formulário de contacto.

Tom: sofisticado mas acolhedor.`}
                value={openBuildPrompt}
                onChange={(e) => setOpenBuildPrompt(e.target.value)}
                className="min-h-[250px]"
              />
              <p className="text-xs text-muted-foreground">
                💡 Dica: Quanto mais detalhes, melhor o resultado. Inclua: nome, serviços, cores, estilo, secções desejadas.
              </p>
            </div>
          );
        case 2:
          return (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Nome do Site</h3>
                <p className="text-sm text-muted-foreground">Este será o nome visível no seu site</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input 
                  id="name" 
                  placeholder="ex: BeautyLab, Clínica Saúde Total, etc." 
                  value={websiteName} 
                  onChange={(e) => setWebsiteName(e.target.value)} 
                />
              </div>
            </div>
          );
        case 3:
          return (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-primary animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">A Gerar o Seu Site com IA...</h3>
                <p className="text-muted-foreground max-w-sm">
                  Estamos a criar estrutura, conteúdo e design personalizados. Isto pode demorar alguns segundos.
                </p>
              </div>
            </div>
          );
        case 4:
          return (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Site Criado com Sucesso! ✨</h3>
                <p className="text-muted-foreground">
                  O seu site <span className="font-medium text-foreground">{websiteName}</span> foi gerado.
                </p>
                <p className="text-sm text-muted-foreground">
                  Pode editar tudo no editor visual.
                </p>
              </div>
            </div>
          );
      }
    }

    // Guided mode steps
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Tipo de Site</h3>
              <p className="text-sm text-muted-foreground">Escolha o tipo de site</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {WEBSITE_TYPES.map((type) => (
                <Card
                  key={type.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary/50",
                    websiteType === type.id && "border-primary ring-2 ring-primary/20"
                  )}
                  onClick={() => setWebsiteType(type.id)}
                >
                  <CardHeader className="p-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center mb-2",
                      websiteType === type.id ? "bg-primary/10 text-primary" : "bg-muted"
                    )}>
                      {type.icon}
                    </div>
                    <CardTitle className="text-sm">{type.title}</CardTitle>
                    <CardDescription className="text-xs">{type.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Categoria (Opcional)</h3>
              <p className="text-sm text-muted-foreground">Selecione o nicho ou avance sem selecionar</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TEMPLATE_CATEGORIES.map((cat) => {
                const Icon = getCategoryIcon(cat.icon);
                const isSelected = selectedCategory === cat.id;
                return (
                  <Card
                    key={cat.id}
                    className={cn("cursor-pointer transition-all hover:border-primary/50", isSelected && "border-primary ring-2 ring-primary/20")}
                    onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                  >
                    <CardHeader className="p-4">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-2", isSelected ? "bg-primary/10 text-primary" : "bg-muted")}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-sm">{cat.name}</CardTitle>
                      <CardDescription className="text-xs">{cat.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Template</h3>
                <p className="text-sm text-muted-foreground">Escolha um template base</p>
              </div>
              {selectedTemplate && (
                <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                  {showPreview ? <><EyeOff className="h-4 w-4 mr-2" />Ocultar</> : <><Eye className="h-4 w-4 mr-2" />Preview</>}
                </Button>
              )}
            </div>
            
            {showPreview && selectedTemplate && (
              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="flex items-center gap-2 p-2 border-b bg-muted/50">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-muted-foreground flex-1 text-center">{selectedTemplate.name}</span>
                </div>
                <div className="max-h-[250px] overflow-y-auto">
                  <div className="transform scale-[0.4] origin-top-left w-[250%]">
                    <WebsitePreview template={selectedTemplate} websiteName={websiteName || "O Seu Site"} showChatWidget={false} />
                  </div>
                </div>
              </div>
            )}
            
            {filteredTemplates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum template disponível.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredTemplates.map((tmpl) => (
                  <Card
                    key={tmpl.id}
                    className={cn("cursor-pointer transition-all hover:border-primary/50", selectedTemplate?.id === tmpl.id && "border-primary ring-2 ring-primary/20")}
                    onClick={() => { setSelectedTemplate(tmpl); setShowPreview(true); }}
                  >
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg" />
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">{tmpl.name}</CardTitle>
                      <CardDescription className="text-xs">{tmpl.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Descreva o Seu Site</h3>
              <p className="text-sm text-muted-foreground">
                <Sparkles className="inline-block h-4 w-4 mr-1 text-primary" />
                A IA irá gerar conteúdo personalizado
              </p>
            </div>
            <Textarea
              placeholder="Descreva o seu negócio, serviços, tom desejado..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Nome do Site</h3>
              <p className="text-sm text-muted-foreground">Este será o nome visível no seu site</p>
            </div>
            <Input placeholder="ex: Clínica Saúde Total" value={websiteName} onChange={(e) => setWebsiteName(e.target.value)} />
          </div>
        );

      case 6:
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-primary animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">A Gerar Conteúdo com IA...</h3>
              <p className="text-muted-foreground max-w-sm">Estamos a criar textos personalizados.</p>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Site Criado com Sucesso!</h3>
              <p className="text-muted-foreground">O seu site <span className="font-medium text-foreground">{websiteName}</span> está pronto.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isGeneratingStep = currentStep === generatingStepIndex;
  const isSuccessStep = currentStep === successStepIndex;
  const isLastInputStep = currentStep === nameStepIndex;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn(
        "max-h-[90vh] flex flex-col transition-all duration-300",
        showPreview && buildMode === "guided" && currentStep === 3 ? "max-w-4xl" : "max-w-2xl"
      )}>
        <DialogHeader>
          <DialogTitle>Criar Novo Site</DialogTitle>
          <DialogDescription>
            <Sparkles className="inline-block h-4 w-4 mr-1" />
            {buildMode === "open" ? "Descreva tudo e a IA cria automaticamente" : "Gere o seu site com IA"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex-1 overflow-hidden flex flex-col">
          <Stepper steps={STEPS} currentStep={currentStep} className="mb-6" />
          <ScrollArea className="flex-1 pr-4">{renderStep()}</ScrollArea>
        </div>

        <div className="flex justify-between pt-4 border-t">
          {!isGeneratingStep && !isSuccessStep ? (
            <>
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>Voltar</Button>
              {isLastInputStep ? (
                <Button onClick={handleCreate} disabled={!canProceed() || isGenerating}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {buildMode === "open" ? "Gerar Site ✨" : "Gerar com IA"}
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={!canProceed()}>Continuar</Button>
              )}
            </>
          ) : isGeneratingStep ? (
            <div className="w-full text-center text-sm text-muted-foreground">Por favor aguarde...</div>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>Ver Sites</Button>
              <Button onClick={handleOpenEditor}>Editar Site</Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}