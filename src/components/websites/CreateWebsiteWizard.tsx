import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Globe, Building2, CheckCircle2, Sparkles, Loader2, Eye, EyeOff, Wand2, LayoutTemplate, 
  ShoppingBag, FileText, Rocket, Utensils, Calendar, Briefcase, Camera, Heart, 
  Music, Dumbbell, GraduationCap, Plane, Car, Home, Scissors, Users
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Stepper, CardSelect } from "@/components/ui/stepper";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TEMPLATE_CATEGORIES, WebsiteTemplate, getCategoryIcon } from "@/lib/website-templates";
import { WebsitePreview } from "@/components/websites/WebsitePreview";
import { useWebsiteAI } from "@/hooks/useWebsiteAI";
import { useClients } from "@/hooks/useClients";
import { getCreativeComposition } from "@/lib/creative-composition";
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
  clientId?: string;
}

interface CreateWebsiteWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWebsiteCreated: (website: Website) => Promise<{ id: string } | null>;
}

const STEPS_GUIDED = ["Modo", "Tipo", "Categoria", "Template", "Prompt", "Nome", "Geração IA", "A Gerar...", "Concluído"];
const STEPS_OPEN = ["Modo", "Descreva Tudo", "Nome", "Geração IA", "A Gerar...", "Concluído"];

// Expanded website types
const WEBSITE_TYPES = [
  { id: "landing", title: "Landing Page", description: "Página única focada em conversão", icon: <Globe className="h-5 w-5" /> },
  { id: "institutional", title: "Site Institucional", description: "Site completo multi-página", icon: <Building2 className="h-5 w-5" /> },
  { id: "portfolio", title: "Portfólio", description: "Mostre trabalhos e projetos", icon: <Briefcase className="h-5 w-5" /> },
  { id: "ecommerce", title: "E-commerce", description: "Loja online para produtos", icon: <ShoppingBag className="h-5 w-5" /> },
  { id: "blog", title: "Blog / Conteúdo", description: "Blog ou site de conteúdo", icon: <FileText className="h-5 w-5" /> },
  { id: "saas", title: "SaaS / App", description: "Apresentação de software", icon: <Rocket className="h-5 w-5" /> },
  { id: "restaurant", title: "Restaurante / Menu", description: "Cardápio digital e reservas", icon: <Utensils className="h-5 w-5" /> },
  { id: "event", title: "Evento / Casamento", description: "Página para eventos", icon: <Calendar className="h-5 w-5" /> },
  { id: "leadform", title: "Formulário de Leads", description: "Captura de contactos simples", icon: <Users className="h-5 w-5" /> },
  { id: "photography", title: "Fotógrafo", description: "Galeria e portfólio visual", icon: <Camera className="h-5 w-5" /> },
  { id: "beauty", title: "Beleza / Estética", description: "Salão, spa ou clínica", icon: <Scissors className="h-5 w-5" /> },
  { id: "fitness", title: "Fitness / Gym", description: "Academia ou personal trainer", icon: <Dumbbell className="h-5 w-5" /> },
  { id: "education", title: "Educação / Curso", description: "Escola ou curso online", icon: <GraduationCap className="h-5 w-5" /> },
  { id: "travel", title: "Turismo / Viagens", description: "Agência ou destino", icon: <Plane className="h-5 w-5" /> },
  { id: "automotive", title: "Automóvel", description: "Stand ou oficina", icon: <Car className="h-5 w-5" /> },
  { id: "realestate", title: "Imobiliária", description: "Imóveis e propriedades", icon: <Home className="h-5 w-5" /> },
  { id: "music", title: "Música / DJ", description: "Artista ou banda", icon: <Music className="h-5 w-5" /> },
  { id: "wedding", title: "Casamento", description: "Site de casamento", icon: <Heart className="h-5 w-5" /> },
];

const BUILD_MODES = [
  { id: "open", title: "Open Build ✨", description: "Descreva tudo e a IA cria automaticamente", icon: <Wand2 className="h-5 w-5" /> },
  { id: "guided", title: "Modo Assistido", description: "Escolha template, IA preenche conteúdo", icon: <LayoutTemplate className="h-5 w-5" /> },
];

const getAllTemplatesForType = (type: string) => {
  // Map extended types to base template types - all non-standard types show all templates
  const baseType = (type === "landing" || type === "institutional") ? type : null;
  const allTemplates = TEMPLATE_CATEGORIES.flatMap(cat => cat.templates);
  if (!baseType) return allTemplates; // Show all templates for non-standard types
  return allTemplates.filter(t => t.type === baseType);
};

// Color palettes for variety
const COLOR_PALETTES = [
  { primary: "220 70% 50%", secondary: "200 60% 45%", accent: "340 80% 55%", background: "0 0% 100%", text: "220 30% 15%" },
  { primary: "160 70% 40%", secondary: "140 60% 35%", accent: "45 100% 50%", background: "160 10% 98%", text: "160 40% 15%" },
  { primary: "260 65% 55%", secondary: "240 55% 50%", accent: "30 90% 55%", background: "260 10% 98%", text: "260 40% 15%" },
  { primary: "0 75% 50%", secondary: "20 70% 45%", accent: "45 100% 55%", background: "0 0% 100%", text: "0 30% 15%" },
  { primary: "30 80% 50%", secondary: "15 70% 45%", accent: "200 60% 45%", background: "30 10% 98%", text: "30 30% 15%" },
  { primary: "340 75% 50%", secondary: "320 65% 45%", accent: "200 70% 50%", background: "0 0% 100%", text: "340 30% 15%" },
  { primary: "180 60% 40%", secondary: "200 50% 45%", accent: "340 80% 55%", background: "180 10% 98%", text: "180 40% 15%" },
  { primary: "45 85% 50%", secondary: "30 75% 45%", accent: "220 70% 50%", background: "45 10% 98%", text: "45 40% 15%" },
];

const FONT_CHOICES = ["Inter", "Plus Jakarta Sans", "Playfair Display", "Montserrat", "Lato", "Open Sans"];

const getBlankTemplate = (siteType: string): WebsiteTemplate => {
  // Different section configurations based on site type
  const sectionConfigs: Record<string, string[]> = {
    restaurant: ["hero", "about", "services", "gallery", "testimonials", "contact"],
    leadform: ["hero", "features", "cta", "contact"],
    portfolio: ["hero", "about", "gallery", "testimonials", "contact"],
    photography: ["hero", "gallery", "about", "testimonials", "contact"],
    wedding: ["hero", "about", "gallery", "contact"],
    ecommerce: ["hero", "features", "services", "testimonials", "cta", "contact"],
    default: ["hero", "about", "services", "features", "testimonials", "cta", "contact"],
  };

  // Max variants per section type
  const VARIANT_COUNTS: Record<string, number> = {
    hero: 3, about: 3, services: 3, features: 3, testimonials: 3,
    cta: 3, contact: 3, team: 2, gallery: 2, pricing: 1, faq: 1,
  };

  const sections = (sectionConfigs[siteType] || sectionConfigs.default).map((type, idx) => ({
    id: type,
    type: type as any,
    title: type.charAt(0).toUpperCase() + type.slice(1),
    enabled: true,
    order: idx,
    content: {},
    variant: Math.floor(Math.random() * (VARIANT_COUNTS[type] || 1)) + 1,
  }));

  // Pick random colors and font for variety
  const randomColors = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
  const randomFont = FONT_CHOICES[Math.floor(Math.random() * FONT_CHOICES.length)];

  return {
    id: "open-build-generated",
    name: "Site Gerado por IA",
    description: "Template gerado automaticamente",
    category: "Gerado",
    categoryId: "generated",
    type: "landing",
    thumbnail: "/placeholder.svg",
    colors: randomColors,
    font: randomFont,
    sections,
  };
};

export function CreateWebsiteWizard({ open, onOpenChange, onWebsiteCreated }: CreateWebsiteWizardProps) {
  const navigate = useNavigate();
  const { generateContent, applySectionsContent, isGenerating } = useWebsiteAI();
  const { clients } = useClients();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [buildMode, setBuildMode] = useState<"open" | "guided" | null>("open");
  const [websiteType, setWebsiteType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WebsiteTemplate | null>(null);
  const [prompt, setPrompt] = useState("");
  const [openBuildPrompt, setOpenBuildPrompt] = useState("");
  const [websiteName, setWebsiteName] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [createdWebsiteId, setCreatedWebsiteId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [useAIGeneration, setUseAIGeneration] = useState(true);

  const STEPS = buildMode === "open" ? STEPS_OPEN : STEPS_GUIDED;
  const aiQuestionStepIndex = buildMode === "open" ? 3 : 6;
  const generatingStepIndex = buildMode === "open" ? 4 : 7;
  const successStepIndex = buildMode === "open" ? 5 : 8;
  const nameStepIndex = buildMode === "open" ? 2 : 5;

  const resetWizard = () => {
    setCurrentStep(0);
    setBuildMode("open");
    setWebsiteType(null);
    setSelectedCategory(null);
    setSelectedTemplate(null);
    setPrompt("");
    setOpenBuildPrompt("");
    setWebsiteName("");
    setSelectedClientId(null);
    setCreatedWebsiteId(null);
    setShowPreview(false);
    setUseAIGeneration(true);
  };

  const handleClose = () => { resetWizard(); onOpenChange(false); };
  const handleNext = () => { if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1); };
  const handleBack = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };

  const persistWebsite = async (website: Website) => {
    const persistedWebsite = await onWebsiteCreated(website);

    if (!persistedWebsite?.id) {
      throw new Error("Falha ao guardar o site criado");
    }

    setCreatedWebsiteId(persistedWebsite.id);
    return persistedWebsite;
  };

  const handleCreateGuided = async () => {
    if (!selectedTemplate || !websiteType) return;
    
    // Add random variants to sections
    const VARIANT_COUNTS: Record<string, number> = {
      hero: 3, about: 3, services: 3, features: 3, testimonials: 3,
      cta: 3, contact: 3, team: 2, gallery: 2, pricing: 1, faq: 1,
    };
    const sectionsWithVariants = selectedTemplate.sections.map(s => ({
      ...s,
      variant: s.variant || Math.floor(Math.random() * (VARIANT_COUNTS[s.type] || 1)) + 1,
    }));

    if (!useAIGeneration) {
      // Skip AI, create with default/template content
      const customTemplate = { ...selectedTemplate, sections: sectionsWithVariants };
      const category = selectedCategory ? TEMPLATE_CATEGORIES.find((c) => c.id === selectedCategory) : null;
      const newWebsite: Website = {
        id: Date.now().toString(),
        name: websiteName,
        type: (websiteType === "landing" || websiteType === "institutional") ? websiteType : "landing",
        niche: category?.name || websiteType || "Outro",
        nicheId: selectedCategory || websiteType || "outro",
        templateId: selectedTemplate.id,
        prompt,
        status: "draft",
        url: "",
        createdAt: new Date().toISOString().split("T")[0],
        customTemplate,
        clientId: selectedClientId || undefined,
      };

      await persistWebsite(newWebsite);
      setCurrentStep(successStepIndex);
      toast({ title: "Site criado!", description: "Pode editá-lo manualmente no editor." });
      return;
    }

    const category = selectedCategory ? TEMPLATE_CATEGORIES.find((c) => c.id === selectedCategory) : null;
    setCurrentStep(generatingStepIndex);

    try {
      const generatedContent = await generateContent({
        websiteType: (websiteType === "landing" || websiteType === "institutional") ? websiteType : "landing",
        niche: category?.name || websiteType || "Outro",
        templateName: selectedTemplate.name,
        prompt,
        websiteName,
        sections: selectedTemplate.sections.map((s) => s.type),
      });

      let customTemplate = { ...selectedTemplate, sections: sectionsWithVariants };
      if (generatedContent) {
        customTemplate = { ...customTemplate, sections: applySectionsContent(sectionsWithVariants, generatedContent).map((s, i) => ({ ...s, variant: sectionsWithVariants[i]?.variant || s.variant })) };
        toast({ title: "Conteúdo gerado com IA!", description: "O conteúdo do seu site foi personalizado." });
      }

      const newWebsite: Website = {
        id: Date.now().toString(),
        name: websiteName,
        type: (websiteType === "landing" || websiteType === "institutional") ? websiteType : "landing",
        niche: category?.name || websiteType || "Outro",
        nicheId: selectedCategory || websiteType || "outro",
        templateId: selectedTemplate.id,
        prompt,
        status: "draft",
        url: "",
        createdAt: new Date().toISOString().split("T")[0],
        customTemplate,
        clientId: selectedClientId || undefined,
      };

      await persistWebsite(newWebsite);
      setCurrentStep(successStepIndex);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível criar e guardar o site. Tente novamente.", variant: "destructive" });
      setCurrentStep(aiQuestionStepIndex);
    }
  };

  const handleCreateOpenBuild = async () => {
    if (!openBuildPrompt.trim() || !websiteName.trim()) return;

    // Creative composition replaces the deterministic stacked template.
    // Each generation is uniquely seeded → no two sites look alike.
    const creativeTemplate = getCreativeComposition({
      prompt: openBuildPrompt,
      siteType: websiteType || "default",
      websiteName,
    });

    if (!useAIGeneration) {
      const newWebsite: Website = {
        id: Date.now().toString(),
        name: websiteName,
        type: "landing",
        niche: websiteType || "Open Build",
        nicheId: websiteType || "open-build",
        templateId: "open-build-generated",
        prompt: openBuildPrompt,
        status: "draft",
        url: "",
        createdAt: new Date().toISOString().split("T")[0],
        customTemplate: creativeTemplate,
        clientId: selectedClientId || undefined,
      };

      await persistWebsite(newWebsite);
      setCurrentStep(successStepIndex);
      toast({ title: "Site criado!", description: "Composição criativa gerada — edite no editor." });
      return;
    }

    setCurrentStep(generatingStepIndex);

    try {
      const generatedContent = await generateContent({
        websiteType: "landing",
        niche: websiteType || "Open Build",
        templateName: "Composição Criativa",
        prompt: openBuildPrompt,
        websiteName,
        sections: creativeTemplate.sections.map((s) => s.type),
      });

      let customTemplate = creativeTemplate;
      if (generatedContent) {
        customTemplate = {
          ...creativeTemplate,
          sections: applySectionsContent(creativeTemplate.sections, generatedContent).map((s, i) => ({
            ...s,
            variant: creativeTemplate.sections[i]?.variant ?? s.variant,
          })),
        };
        toast({ title: "Composição criativa pronta ✨", description: "Site único gerado pela IA." });
      }

      const newWebsite: Website = {
        id: Date.now().toString(),
        name: websiteName,
        type: "landing",
        niche: websiteType || "Open Build",
        nicheId: websiteType || "open-build",
        templateId: "open-build-generated",
        prompt: openBuildPrompt,
        status: "draft",
        url: "",
        createdAt: new Date().toISOString().split("T")[0],
        customTemplate,
        clientId: selectedClientId || undefined,
      };

      await persistWebsite(newWebsite);
      setCurrentStep(successStepIndex);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível criar e guardar o site. Tente novamente.", variant: "destructive" });
      setCurrentStep(aiQuestionStepIndex);
    }
  };

  const handleCreate = () => { buildMode === "open" ? handleCreateOpenBuild() : handleCreateGuided(); };
  const handleOpenEditor = () => { handleClose(); if (createdWebsiteId) navigate(`/websites/${createdWebsiteId}/edit`); };

  const canProceed = () => {
    if (buildMode === "open") {
      switch (currentStep) {
        case 0: return buildMode !== null;
        case 1: return openBuildPrompt.trim().length > 20;
        case 2: return websiteName.trim().length > 2;
        case 3: return true; // AI question step
        default: return true;
      }
    } else {
      switch (currentStep) {
        case 0: return buildMode !== null;
        case 1: return websiteType !== null;
        case 2: return true;
        case 3: return selectedTemplate !== null;
        case 4: return prompt.trim().length > 10;
        case 5: return websiteName.trim().length > 2;
        case 6: return true; // AI question step
        default: return true;
      }
    }
  };

const filteredTemplates = selectedCategory
    ? TEMPLATE_CATEGORIES.find((c) => c.id === selectedCategory)?.templates || []
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
          <CardSelect options={BUILD_MODES} value={buildMode} onChange={(val) => setBuildMode(val as "open" | "guided")} className="grid-cols-2" />
        </div>
      );
    }

    // Open Build mode
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
                <p className="text-sm text-muted-foreground">Seja detalhado: negócio, serviços, cores, estilo, tudo!</p>
              </div>
              
              {/* Optional: Select site type for better generation */}
              <div className="space-y-2">
                <Label>Tipo de site (opcional)</Label>
                <Select value={websiteType || ""} onValueChange={(v) => setWebsiteType(v || null)}>
                  <SelectTrigger><SelectValue placeholder="Selecionar tipo..." /></SelectTrigger>
                  <SelectContent>
                    {WEBSITE_TYPES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Textarea
                placeholder={`Exemplo: Quero um cardápio digital para o restaurante "Sabores de Lisboa".

Pratos: entradas (caldo verde, salada), pratos principais (bacalhau, francesinha, polvo), sobremesas (pastel de nata, pudim).

Design moderno, cores quentes (laranja e castanho). Incluir fotos, preços e botão WhatsApp para pedidos.`}
                value={openBuildPrompt}
                onChange={(e) => setOpenBuildPrompt(e.target.value)}
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">💡 Quanto mais detalhes, melhor o resultado!</p>
            </div>
          );
        case 2:
          return (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Nome e Cliente</h3>
                <p className="text-sm text-muted-foreground">Informações finais do site</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Site *</Label>
                  <Input id="name" placeholder="ex: Sabores de Lisboa" value={websiteName} onChange={(e) => setWebsiteName(e.target.value)} />
                </div>
                {clients && clients.length > 0 && (
                  <div className="space-y-2">
                    <Label>Associar a Cliente (opcional)</Label>
                    <Select value={selectedClientId || ""} onValueChange={(v) => setSelectedClientId(v || null)}>
                      <SelectTrigger><SelectValue placeholder="Sem cliente (site próprio)" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sem cliente</SelectItem>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name} {c.company && `(${c.company})`}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Vincule o site a um cliente para gestão centralizada</p>
                  </div>
                )}
              </div>
            </div>
          );
        case 3:
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Gerar conteúdo com IA?</h3>
                <p className="text-sm text-muted-foreground">A IA pode criar textos personalizados para o seu site</p>
              </div>
              <CardSelect
                options={[
                  { id: "yes", title: "Sim, gerar com IA ✨", description: "A IA cria textos únicos baseados na sua descrição", icon: <Sparkles className="h-5 w-5" /> },
                  { id: "no", title: "Não, criar manualmente", description: "Usar conteúdo padrão e editar depois", icon: <LayoutTemplate className="h-5 w-5" /> },
                ]}
                value={useAIGeneration ? "yes" : "no"}
                onChange={(val) => setUseAIGeneration(val === "yes")}
                className="grid-cols-2"
              />
            </div>
          );
        case 4:
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
                <p className="text-muted-foreground max-w-sm">Estamos a criar estrutura, conteúdo e design personalizados.</p>
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
                <h3 className="text-xl font-semibold">Site Criado com Sucesso! ✨</h3>
                <p className="text-muted-foreground">
                  O seu site <span className="font-medium text-foreground">{websiteName}</span> foi gerado.
                </p>
              </div>
            </div>
          );
      }
    }

    // Guided mode
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Tipo de Site</h3>
              <p className="text-sm text-muted-foreground">Escolha o tipo que melhor descreve o seu projeto</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {WEBSITE_TYPES.map((type) => (
                <Card
                  key={type.id}
                  className={cn("cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm", websiteType === type.id && "border-primary ring-2 ring-primary/20")}
                  onClick={() => setWebsiteType(type.id)}
                >
                  <CardHeader className="p-3">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-2", websiteType === type.id ? "bg-primary/10 text-primary" : "bg-muted")}>
                      {type.icon}
                    </div>
                    <CardTitle className="text-xs">{type.title}</CardTitle>
                    <CardDescription className="text-[10px]">{type.description}</CardDescription>
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
              <p className="text-sm text-muted-foreground">Selecione o nicho ou avance</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TEMPLATE_CATEGORIES.map((cat) => {
                const Icon = getCategoryIcon(cat.icon);
                const isSelected = selectedCategory === cat.id;
                return (
                  <Card key={cat.id} className={cn("cursor-pointer transition-all hover:border-primary/50", isSelected && "border-primary ring-2 ring-primary/20")} onClick={() => setSelectedCategory(isSelected ? null : cat.id)}>
                    <CardHeader className="p-4">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-2", isSelected ? "bg-primary/10 text-primary" : "bg-muted")}><Icon className="h-5 w-5" /></div>
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
                  <div className="flex gap-1"><div className="w-2.5 h-2.5 rounded-full bg-destructive" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /><div className="w-2.5 h-2.5 rounded-full bg-green-500" /></div>
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
                  <Card key={tmpl.id} className={cn("cursor-pointer transition-all hover:border-primary/50", selectedTemplate?.id === tmpl.id && "border-primary ring-2 ring-primary/20")} onClick={() => { setSelectedTemplate(tmpl); setShowPreview(true); }}>
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
              <h3 className="text-lg font-semibold">Descreva o Seu Negócio</h3>
              <p className="text-sm text-muted-foreground"><Sparkles className="inline-block h-4 w-4 mr-1 text-primary" />A IA irá gerar conteúdo personalizado</p>
            </div>
            <Textarea placeholder="Descreva o seu negócio, serviços, tom desejado..." value={prompt} onChange={(e) => setPrompt(e.target.value)} className="min-h-[120px]" />
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Nome e Cliente</h3>
              <p className="text-sm text-muted-foreground">Informações finais</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Site *</Label>
                <Input id="name" placeholder="ex: Clínica Saúde Total" value={websiteName} onChange={(e) => setWebsiteName(e.target.value)} />
              </div>
              {clients && clients.length > 0 && (
                <div className="space-y-2">
                  <Label>Associar a Cliente (opcional)</Label>
                  <Select value={selectedClientId || ""} onValueChange={(v) => setSelectedClientId(v || null)}>
                    <SelectTrigger><SelectValue placeholder="Sem cliente (site próprio)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sem cliente</SelectItem>
                      {clients.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Gerar conteúdo com IA?</h3>
              <p className="text-sm text-muted-foreground">A IA pode criar textos personalizados para o seu site</p>
            </div>
            <CardSelect
              options={[
                { id: "yes", title: "Sim, gerar com IA ✨", description: "A IA cria textos únicos baseados na sua descrição", icon: <Sparkles className="h-5 w-5" /> },
                { id: "no", title: "Não, criar manualmente", description: "Usar conteúdo padrão e editar depois", icon: <LayoutTemplate className="h-5 w-5" /> },
              ]}
              value={useAIGeneration ? "yes" : "no"}
              onChange={(val) => setUseAIGeneration(val === "yes")}
              className="grid-cols-2"
            />
          </div>
        );

      case 7:
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="relative"><div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div><Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-primary animate-pulse" /></div>
            <div className="text-center space-y-2"><h3 className="text-xl font-semibold">A Gerar o Seu Site...</h3><p className="text-muted-foreground">Isto pode demorar alguns segundos.</p></div>
          </div>
        );

      case 8:
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center"><CheckCircle2 className="h-8 w-8 text-primary" /></div>
            <div className="text-center space-y-2"><h3 className="text-xl font-semibold">Site Criado! ✨</h3><p className="text-muted-foreground">O seu site <span className="font-medium text-foreground">{websiteName}</span> está pronto.</p></div>
          </div>
        );
    }
  };

  const isGeneratingStep = currentStep === generatingStepIndex;
  const isSuccessStep = currentStep === successStepIndex;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Criar Novo Site</DialogTitle>
          <DialogDescription>Crie um site profissional com IA</DialogDescription>
        </DialogHeader>

        <div className="px-2 py-4"><Stepper steps={STEPS} currentStep={currentStep} /></div>

        <ScrollArea className="flex-1 px-2">{renderStep()}</ScrollArea>

        <div className="flex justify-between pt-4 border-t">
          {currentStep > 0 && !isGeneratingStep && !isSuccessStep ? (
            <Button variant="outline" onClick={handleBack}>Voltar</Button>
          ) : (<div />)}
          
          {isSuccessStep ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>Fechar</Button>
              <Button onClick={handleOpenEditor}>Editar Site</Button>
            </div>
          ) : isGeneratingStep ? null : currentStep === aiQuestionStepIndex ? (
            <Button onClick={handleCreate} disabled={!canProceed() || isGenerating}>{isGenerating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />A Gerar...</> : useAIGeneration ? <><Sparkles className="h-4 w-4 mr-2" />Gerar com IA</> : <>Criar Site</>}</Button>
          ) : (
            <Button onClick={handleNext} disabled={!canProceed()}>Seguinte</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
