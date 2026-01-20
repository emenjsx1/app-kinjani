import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Building2, CheckCircle2, Heart, Scale, HardHat, GraduationCap, Briefcase } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TEMPLATE_CATEGORIES, WebsiteTemplate, getCategoryIcon } from "@/lib/website-templates";
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
}

interface CreateWebsiteWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWebsiteCreated: (website: Website) => void;
}

const STEPS = ["Tipo", "Categoria", "Template", "Prompt", "Nome", "Concluído"];

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

export function CreateWebsiteWizard({ open, onOpenChange, onWebsiteCreated }: CreateWebsiteWizardProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [websiteType, setWebsiteType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WebsiteTemplate | null>(null);
  const [prompt, setPrompt] = useState("");
  const [websiteName, setWebsiteName] = useState("");
  const [createdWebsiteId, setCreatedWebsiteId] = useState<string | null>(null);

  const resetWizard = () => {
    setCurrentStep(0);
    setWebsiteType(null);
    setSelectedCategory(null);
    setSelectedTemplate(null);
    setPrompt("");
    setWebsiteName("");
    setCreatedWebsiteId(null);
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

  const handleCreate = () => {
    const category = TEMPLATE_CATEGORIES.find((c) => c.id === selectedCategory);
    const newWebsite: Website = {
      id: Date.now().toString(),
      name: websiteName,
      type: websiteType as "landing" | "institutional",
      niche: category?.name || "Outro",
      nicheId: selectedCategory || "outro",
      templateId: selectedTemplate?.id || "",
      prompt: prompt,
      status: "draft",
      url: "",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setCreatedWebsiteId(newWebsite.id);
    onWebsiteCreated(newWebsite);
    handleNext();
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
      case 1: return selectedCategory !== null;
      case 2: return selectedTemplate !== null;
      case 3: return prompt.trim().length > 10;
      case 4: return websiteName.trim().length > 2;
      default: return true;
    }
  };

  const filteredTemplates = selectedCategory
    ? TEMPLATE_CATEGORIES.find((c) => c.id === selectedCategory)?.templates.filter(
        (t) => t.type === websiteType
      ) || []
    : [];

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
            <div>
              <h3 className="text-lg font-semibold">Template</h3>
              <p className="text-sm text-muted-foreground">Escolha um template para começar</p>
            </div>
            {filteredTemplates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum template disponível para esta combinação.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredTemplates.map((tmpl) => (
                  <Card
                    key={tmpl.id}
                    className={cn("cursor-pointer transition-all hover:border-primary/50", selectedTemplate?.id === tmpl.id && "border-primary ring-2 ring-primary/20")}
                    onClick={() => setSelectedTemplate(tmpl)}
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

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Descreva o Seu Site</h3>
              <p className="text-sm text-muted-foreground">A IA irá personalizar o conteúdo com base na sua descrição</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">Descrição</Label>
              <Textarea
                id="prompt"
                placeholder={`Descreva o seu negócio, serviços, tom de comunicação desejado...`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[150px]"
              />
              <p className="text-xs text-muted-foreground">Mínimo 10 caracteres.</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Nome do Site</h3>
              <p className="text-sm text-muted-foreground">Dê um nome ao seu site</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" placeholder="ex: Clínica Saúde Total" value={websiteName} onChange={(e) => setWebsiteName(e.target.value)} />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Site Criado!</h3>
              <p className="text-muted-foreground">O seu site <span className="font-medium text-foreground">{websiteName}</span> está pronto para edição.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Criar Novo Site</DialogTitle>
          <DialogDescription>Gere o seu site com IA em alguns passos</DialogDescription>
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
                <Button onClick={handleCreate} disabled={!canProceed()}>Criar Site</Button>
              ) : (
                <Button onClick={handleNext} disabled={!canProceed()}>Continuar</Button>
              )}
            </>
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