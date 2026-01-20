import { useState } from "react";
import { Globe, Building2, ShoppingCart, Briefcase, Heart, Utensils, Dumbbell, GraduationCap, CheckCircle2 } from "lucide-react";
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

interface Website {
  id: string;
  name: string;
  type: "landing" | "institutional";
  niche: string;
  nicheId: string;
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

const STEPS = ["Tipo", "Nicho", "Prompt", "Nome", "Concluído"];

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
    description: "Site completo com múltiplas páginas para a sua empresa",
    icon: <Building2 className="h-5 w-5" />,
  },
];

const NICHE_OPTIONS = [
  {
    id: "ecommerce",
    title: "E-commerce",
    description: "Loja online e vendas",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    id: "servicos",
    title: "Serviços",
    description: "Consultoria, agências, freelancers",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    id: "saude",
    title: "Saúde",
    description: "Clínicas, médicos, bem-estar",
    icon: <Heart className="h-5 w-5" />,
  },
  {
    id: "restauracao",
    title: "Restauração",
    description: "Restaurantes, cafés, delivery",
    icon: <Utensils className="h-5 w-5" />,
  },
  {
    id: "fitness",
    title: "Fitness",
    description: "Ginásios, personal trainers",
    icon: <Dumbbell className="h-5 w-5" />,
  },
  {
    id: "educacao",
    title: "Educação",
    description: "Cursos, escolas, formação",
    icon: <GraduationCap className="h-5 w-5" />,
  },
];

export function CreateWebsiteWizard({ open, onOpenChange, onWebsiteCreated }: CreateWebsiteWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [websiteType, setWebsiteType] = useState<string | null>(null);
  const [niche, setNiche] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [websiteName, setWebsiteName] = useState("");

  const resetWizard = () => {
    setCurrentStep(0);
    setWebsiteType(null);
    setNiche(null);
    setPrompt("");
    setWebsiteName("");
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
    const selectedNiche = NICHE_OPTIONS.find((n) => n.id === niche);
    const newWebsite: Website = {
      id: Date.now().toString(),
      name: websiteName,
      type: websiteType as "landing" | "institutional",
      niche: selectedNiche?.title || "Outro",
      nicheId: niche || "outro",
      prompt: prompt,
      status: "draft",
      url: "",
      createdAt: new Date().toISOString().split("T")[0],
    };
    onWebsiteCreated(newWebsite);
    handleNext(); // Go to success step
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return websiteType !== null;
      case 1:
        return niche !== null;
      case 2:
        return prompt.trim().length > 10;
      case 3:
        return websiteName.trim().length > 2;
      default:
        return true;
    }
  };

  const getPromptPlaceholder = () => {
    const typeLabel = websiteType === "landing" ? "landing page" : "site institucional";
    const nicheLabel = NICHE_OPTIONS.find((n) => n.id === niche)?.title.toLowerCase() || "";
    
    return `Gere uma ${typeLabel} para ${nicheLabel}. A empresa chama-se [Nome] e oferece [serviços/produtos]. O tom deve ser [profissional/informal/moderno]. Incluir secções de [hero, serviços, testemunhos, contacto]...`;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Tipo de Site</h3>
              <p className="text-sm text-muted-foreground">
                Escolha o tipo de site que deseja criar
              </p>
            </div>
            <CardSelect
              options={WEBSITE_TYPES}
              value={websiteType}
              onChange={setWebsiteType}
              className="grid-cols-2"
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Nicho de Mercado</h3>
              <p className="text-sm text-muted-foreground">
                Selecione o nicho que melhor descreve o seu negócio
              </p>
            </div>
            <CardSelect
              options={NICHE_OPTIONS}
              value={niche}
              onChange={setNiche}
              className="grid-cols-2 md:grid-cols-3"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Prompt de Geração</h3>
              <p className="text-sm text-muted-foreground">
                Descreva como deseja que o seu site seja gerado
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">Descrição do Site</Label>
              <Textarea
                id="prompt"
                placeholder={getPromptPlaceholder()}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 10 caracteres. Quanto mais detalhado, melhor será o resultado.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Nome do Site</h3>
              <p className="text-sm text-muted-foreground">
                Dê um nome identificativo ao seu site
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Site</Label>
              <Input
                id="name"
                placeholder="ex: Site Clínica Dentária, Landing Curso Online"
                value={websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
              />
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
              <h3 className="text-xl font-semibold">Site Criado!</h3>
              <p className="text-muted-foreground">
                O seu site <span className="font-medium text-foreground">{websiteName}</span> está a ser gerado.
              </p>
              <p className="text-sm text-muted-foreground">
                Tipo: {websiteType === "landing" ? "Landing Page" : "Institucional"} • Nicho: {NICHE_OPTIONS.find((n) => n.id === niche)?.title}
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Site</DialogTitle>
          <DialogDescription>
            Gere o seu site com IA em apenas alguns passos
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Stepper steps={STEPS} currentStep={currentStep} className="mb-8" />
          {renderStep()}
        </div>

        <div className="flex justify-between pt-4 border-t">
          {currentStep < 4 ? (
            <>
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
                Voltar
              </Button>
              {currentStep === 3 ? (
                <Button onClick={handleCreate} disabled={!canProceed()}>
                  Criar Site
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Continuar
                </Button>
              )}
            </>
          ) : (
            <>
              <div />
              <Button onClick={handleClose}>
                Ver Sites
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
