import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Building2, CheckCircle2, Sparkles, Loader2, Eye, EyeOff } from "lucide-react";
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

const STEPS = ["Tipo", "Categoria", "Template", "Prompt", "Nome", "A Gerar...", "Concluído"];

const WEBSITE_TYPES = [
  {
    id: "landing",
    title: "Landing Page",
    description: "Página única focada em conversão e captação de leads",
    icon: <Globe className="h-5 w-5" />,
  },
  {
    id: "institutional",
    title: "Site Institucional",
    description: "Site completo com múltiplas páginas (até 5 páginas)",
    icon: <Building2 className="h-5 w-5" />,
  },
];

// Helper to get all templates for a type (used when no category is selected)
const getAllTemplatesForType = (type: string) => {
  return TEMPLATE_CATEGORIES.flatMap(cat => cat.templates).filter(t => t.type === type);
};

export function CreateWebsiteWizard({ open, onOpenChange, onWebsiteCreated }: CreateWebsiteWizardProps) {
  const navigate = useNavigate();
  const { generateContent, applySectionsContent, isGenerating } = useWebsiteAI();
  const [currentStep, setCurrentStep] = useState(0);
  const [websiteType, setWebsiteType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WebsiteTemplate | null>(null);
  const [prompt, setPrompt] = useState("");
  const [websiteName, setWebsiteName] = useState("");
  const [createdWebsiteId, setCreatedWebsiteId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const resetWizard = () => {
    setCurrentStep(0);
    setWebsiteType(null);
    setSelectedCategory(null);
    setSelectedTemplate(null);
    setPrompt("");
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

  const handleCreate = async () => {
    if (!selectedTemplate || !websiteType) return;

    const category = selectedCategory 
      ? TEMPLATE_CATEGORIES.find((c) => c.id === selectedCategory)
      : TEMPLATE_CATEGORIES.find((c) => c.id === "blank");
    
    // Move to generating step
    setCurrentStep(5);

    // Get section types from template
    const sectionTypes = selectedTemplate.sections.map((s) => s.type);

    try {
      // Generate AI content
      const generatedContent = await generateContent({
        websiteType: websiteType as "landing" | "institutional",
        niche: category?.name || "Outro",
        templateName: selectedTemplate.name,
        prompt,
        websiteName,
        sections: sectionTypes,
      });

      let customTemplate = { ...selectedTemplate };

      if (generatedContent) {
        // Apply generated content to template sections
        customTemplate = {
          ...selectedTemplate,
          sections: applySectionsContent(selectedTemplate.sections, generatedContent),
        };
        toast({
          title: "Conteúdo gerado com IA!",
          description: "O conteúdo do seu site foi personalizado com sucesso.",
        });
      } else {
        toast({
          title: "Site criado",
          description: "Não foi possível gerar conteúdo com IA. A usar conteúdo padrão.",
          variant: "default",
        });
      }

      const newWebsite: Website = {
        id: Date.now().toString(),
        name: websiteName,
        type: websiteType as "landing" | "institutional",
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
      
      // Move to success step
      setCurrentStep(6);
    } catch (error) {
      console.error("Error creating website:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o site. Tente novamente.",
        variant: "destructive",
      });
      setCurrentStep(4); // Go back to name step
    }
  };

  const handleOpenEditor = () => {
    handleClose();
    if (createdWebsiteId) {
      navigate(`/websites/${createdWebsiteId}/edit`);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return websiteType !== null;
      case 1: return true; // Categoria é opcional
      case 2: return selectedTemplate !== null;
      case 3: return prompt.trim().length > 10;
      case 4: return websiteName.trim().length > 2;
      default: return true;
    }
  };

  // When category is selected, filter templates. Otherwise show all for the type.
  const filteredTemplates = selectedCategory
    ? TEMPLATE_CATEGORIES.find((c) => c.id === selectedCategory)?.templates.filter(
        (t) => t.type === websiteType
      ) || []
    : getAllTemplatesForType(websiteType || "landing");

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Tipo de Site</h3>
              <p className="text-sm text-muted-foreground">Escolha o tipo de site que deseja criar</p>
            </div>
            <CardSelect options={WEBSITE_TYPES} value={websiteType} onChange={setWebsiteType} className="grid-cols-2" />
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Categoria</h3>
              <p className="text-sm text-muted-foreground">Selecione o nicho do seu negócio</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TEMPLATE_CATEGORIES.map((cat) => {
                const Icon = getCategoryIcon(cat.icon);
                const isSelected = selectedCategory === cat.id;
                return (
                  <Card
                    key={cat.id}
                    className={cn("cursor-pointer transition-all hover:border-primary/50", isSelected && "border-primary ring-2 ring-primary/20")}
                    onClick={() => setSelectedCategory(cat.id)}
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

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Template</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedCategory 
                    ? "Escolha um template para começar" 
                    : "Escolha um template (ou volte para selecionar uma categoria)"}
                </p>
              </div>
              {selectedTemplate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Ocultar Preview
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Preview
                    </>
                  )}
                </Button>
              )}
            </div>
            
            {/* Live Preview */}
            {showPreview && selectedTemplate && (
              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="flex items-center gap-2 p-2 border-b bg-muted/50">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-muted-foreground flex-1 text-center">
                    Pré-visualização: {selectedTemplate.name}
                  </span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <div className="transform scale-[0.5] origin-top-left w-[200%]">
                    <WebsitePreview 
                      template={selectedTemplate} 
                      websiteName={websiteName || "O Seu Site"}
                      showChatWidget={false}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {filteredTemplates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum template disponível para esta combinação.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredTemplates.map((tmpl) => {
                  const categoryInfo = TEMPLATE_CATEGORIES.find(c => c.id === tmpl.categoryId);
                  return (
                    <Card
                      key={tmpl.id}
                      className={cn("cursor-pointer transition-all hover:border-primary/50", selectedTemplate?.id === tmpl.id && "border-primary ring-2 ring-primary/20")}
                      onClick={() => {
                        setSelectedTemplate(tmpl);
                        setShowPreview(true);
                      }}
                    >
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg" />
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm">{tmpl.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {tmpl.description}
                          {!selectedCategory && categoryInfo && (
                            <span className="block mt-1 text-primary/70">{categoryInfo.name}</span>
                          )}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Descreva o Seu Site</h3>
              <p className="text-sm text-muted-foreground">
                <Sparkles className="inline-block h-4 w-4 mr-1 text-primary" />
                A IA irá gerar conteúdo personalizado com base na sua descrição
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">Descrição do Negócio</Label>
              <Textarea
                id="prompt"
                placeholder={`Exemplo: Clínica de fisioterapia especializada em reabilitação desportiva. 
                
Oferecemos tratamentos personalizados com técnicas avançadas. 
                
Tom profissional mas acolhedor. 
                
Queremos transmitir confiança e expertise.`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[180px]"
              />
              <p className="text-xs text-muted-foreground">
                Quanto mais detalhes fornecer, melhor será o conteúdo gerado.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Nome do Site</h3>
              <p className="text-sm text-muted-foreground">Este será o nome visível no seu site</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" placeholder="ex: Clínica Saúde Total" value={websiteName} onChange={(e) => setWebsiteName(e.target.value)} />
            </div>
          </div>
        );

      case 5:
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
              <p className="text-muted-foreground max-w-sm">
                Estamos a criar textos personalizados para o seu site. Isto pode demorar alguns segundos.
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Site Criado com Sucesso!</h3>
              <p className="text-muted-foreground">
                O seu site <span className="font-medium text-foreground">{websiteName}</span> está pronto.
              </p>
              <p className="text-sm text-muted-foreground">
                O conteúdo foi gerado com IA. Pode editá-lo no editor visual.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn(
        "max-h-[90vh] flex flex-col transition-all duration-300",
        showPreview && currentStep === 2 ? "max-w-4xl" : "max-w-2xl"
      )}>
        <DialogHeader>
          <DialogTitle>Criar Novo Site</DialogTitle>
          <DialogDescription>
            <Sparkles className="inline-block h-4 w-4 mr-1" />
            Gere o seu site com IA em alguns passos
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex-1 overflow-hidden flex flex-col">
          <Stepper steps={STEPS} currentStep={currentStep} className="mb-6" />
          <ScrollArea className="flex-1 pr-4">{renderStep()}</ScrollArea>
        </div>

        <div className="flex justify-between pt-4 border-t">
          {currentStep < 5 ? (
            <>
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>Voltar</Button>
              {currentStep === 4 ? (
                <Button onClick={handleCreate} disabled={!canProceed() || isGenerating}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Site com IA
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={!canProceed()}>Continuar</Button>
              )}
            </>
          ) : currentStep === 5 ? (
            <div className="w-full text-center text-sm text-muted-foreground">
              Por favor aguarde...
            </div>
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