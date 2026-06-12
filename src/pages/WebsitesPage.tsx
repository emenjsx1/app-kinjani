import { useState } from "react";
import { Search, MoreHorizontal, Globe, Eye, Pencil, Copy, Trash2, Sparkles, Plus, Play, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CreateWebsiteWizard } from "@/components/websites/CreateWebsiteWizard";
import { OpenCreator } from "@/components/websites/OpenCreator";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { useWebsites, Website } from "@/hooks/useWebsites";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useProfile } from "@/hooks/useProfile";
import type { GenerativeResult } from "@/core/genesis";

export default function WebsitesPage() {
  const navigate = useNavigate();
  const { websites, isLoading, createWebsite, deleteWebsite, duplicateWebsite } = useWebsites();
  const { profile } = useProfile();
  const [search, setSearch] = useState("");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isOpenCreatorOpen, setIsOpenCreatorOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [websiteToDelete, setWebsiteToDelete] = useState<string | null>(null);

  const handleWebsiteCreated = async (newWebsiteData: {
    name: string;
    type: 'landing' | 'institutional';
    niche?: string;
    nicheId?: string;
    templateId?: string;
    prompt?: string;
    customTemplate?: unknown;
    compositionGraph?: unknown;
    generationSession?: GenerativeResult;
  }) => {
    const result = await createWebsite({
      name: newWebsiteData.name,
      template: newWebsiteData.templateId || null,
      status: 'draft',
      config: {
        type: newWebsiteData.type,
        niche: newWebsiteData.niche,
        nicheId: newWebsiteData.nicheId,
        templateId: newWebsiteData.templateId,
        prompt: newWebsiteData.prompt,
        customTemplate: newWebsiteData.customTemplate as Website['config']['customTemplate'],
        compositionGraph: newWebsiteData.compositionGraph as never,
        generationSession: newWebsiteData.generationSession as never,
      },
    });

    if (result) {
      toast.success(`Site "${result.name}" criado com sucesso!`);
      navigate(`/editor/${result.id}`);
      return { id: result.id };
    } else {
      toast.error("Erro ao criar site");
      return null;
    }
  };

  const handleDeleteWebsite = (id: string) => {
    setWebsiteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (websiteToDelete) {
      const success = await deleteWebsite(websiteToDelete);
      if (success) {
        toast.success("Site eliminado com sucesso");
      } else {
        toast.error("Erro ao eliminar site");
      }
      setWebsiteToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleEditWebsite = (id: string) => {
    navigate(`/editor/${id}`);
  };

  const handleViewWebsite = (id: string) => {
    navigate(`/editor/${id}`);
  };

  const handleDuplicateWebsite = async (site: Website) => {
    const result = await duplicateWebsite(site);
    if (result) {
      toast.success("Site duplicado com sucesso");
    } else {
      toast.error("Erro ao duplicar site");
    }
  };

  const filteredWebsites = websites.filter((site) =>
    site.name.toLowerCase().includes(search.toLowerCase())
  );

  const getTypeBadge = (type?: 'landing' | 'institutional') => {
    if (!type) return null;
    return (
      <Badge variant="outline" className={type === "landing" ? "bg-primary/10 text-primary border-primary/20" : "bg-[#5ddcb1]/10 text-[#5ddcb1] border-[#5ddcb1]/20"}>
        {type === "landing" ? "Landing Page" : "Institucional"}
      </Badge>
    );
  };

  const getNicheBadge = (niche?: string) => {
    if (!niche) return null;
    return (
      <Badge variant="secondary" className="text-xs bg-forest/20 text-pistachio hover:bg-forest/30 border border-forest/30">
        {niche}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-PT");
  };

  if (isLoading) {
    return (
      <AppLayout pageTitle="Sites" credits={profile?.credits_balance ?? 0}>
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Fábrica de Sites" credits={profile?.credits_balance ?? 0}>
      <div className="space-y-8 pb-12">
        
        {/* Page Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl font-extrabold text-white mb-2 flex items-center gap-3">
              <span className="text-primary material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>factory</span>
              Fábrica de Sites
            </h2>
            <p className="text-sm text-pistachio/80 max-w-xl">
              Crie e gerencie ecossistemas digitais gerados por IA com performance cinematográfica e infraestrutura de ponta.
            </p>
          </div>
          <Button 
            onClick={() => setIsOpenCreatorOpen(true)}
            className="bg-primary hover:brightness-110 text-background font-bold px-8 py-6 rounded-lg flex items-center gap-3 glow-button shadow-xl shadow-primary/20 border border-primary/20"
          >
            <Sparkles className="h-4 w-4" />
            <span className="tracking-widest uppercase text-xs">Criar com IA</span>
          </Button>
        </header>

        {/* Action Bar / Search input */}
        <section className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#021f1b]/40 backdrop-blur-md p-4 rounded-2xl border border-forest/30">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pistachio/50 h-4 w-4" />
            <Input
              placeholder="Pesquisar projetos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#011612]/50 border border-forest/30 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-pistachio/30 text-white"
            />
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-pistachio border border-forest/30 font-label-caps">REACT</span>
            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-pistachio border border-forest/30 font-label-caps">TAILWIND</span>
            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-pistachio border border-forest/30 font-label-caps">NEXT.JS</span>
          </div>
        </section>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredWebsites.map((site) => {
            const isProduction = site.status === 'published';
            const isDraft = site.status === 'draft';
            return (
              <div 
                key={site.id} 
                className="bg-[#081f1b]/40 backdrop-blur-md border border-forest/20 rounded-2xl overflow-hidden group hover:border-primary/40 hover:shadow-[0_0_25px_-5px_rgba(0,224,123,0.25)] hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between"
                onClick={() => handleViewWebsite(site.id)}
              >
                <div className="relative aspect-video overflow-hidden bg-[#0d231f] flex items-center justify-center border-b border-forest/20">
                  {/* Site preview iframe or placeholder image */}
                  {(site as any).generated_html ? (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div style={{ transform: "scale(0.33)", transformOrigin: "top left", width: "303%", height: "303%" }}>
                        <iframe
                          srcDoc={(site as any).generated_html}
                          sandbox="allow-same-origin"
                          className="w-full border-0"
                          style={{ height: "100%" }}
                          title={`Preview: ${site.name}`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/5 via-forest/10 to-secondary/5">
                      <Sparkles className="h-7 w-7 text-primary/30" />
                      <p className="text-[10px] text-pistachio/50 font-mono">Abra o editor para compilar</p>
                    </div>
                  )}

                  {/* Status Overlay */}
                  <div className="absolute top-4 left-4 z-10">
                    {isProduction ? (
                      <span className="bg-primary/95 backdrop-blur-md text-background px-3 py-1 rounded-full text-[10px] font-bold border border-primary/30 flex items-center gap-2 shadow-lg">
                        <span className="w-1.5 h-1.5 bg-background rounded-full animate-pulse"></span>
                        EM PRODUÇÃO
                      </span>
                    ) : (
                      <span className="bg-[#273d38]/80 backdrop-blur-md text-pistachio px-3 py-1 rounded-full text-[10px] font-bold border border-white/10">
                        RASCUNHO
                      </span>
                    )}
                  </div>

                  {/* Hover Overlay Actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 z-20 translate-y-4 group-hover:translate-y-0">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-background font-bold shadow-xl shadow-primary/10 px-4 py-2 rounded-lg flex items-center gap-2 font-label-caps text-[10px]"
                      onClick={(e) => { e.stopPropagation(); handleEditWebsite(site.id); }}
                    >
                      <Eye className="h-3.5 w-3.5" /> VISUALIZAR
                    </Button>
                  </div>
                </div>

                {/* Info Container */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-display text-base font-bold text-white group-hover:text-primary transition-colors">{site.name}</h3>
                      <p className="text-xs text-pistachio/60 mt-1">
                        {site.config?.type === 'landing' ? 'Landing Page' : 'Institucional'} · {site.config?.niche || 'Geral'}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-pistachio/40 uppercase">Criado {formatDate(site.created_at)}</span>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-forest/20">
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-forest/60 border border-card flex items-center justify-center text-[8px] font-bold text-primary">AI</div>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost" 
                        size="icon" 
                        className="p-2 h-9 w-9 rounded-lg bg-[#233934] hover:bg-primary/20 text-pistachio hover:text-primary border border-transparent hover:border-primary/30 transition-all"
                        onClick={() => handleEditWebsite(site.id)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="p-2 h-9 w-9 rounded-lg bg-[#233934] hover:bg-primary/20 text-pistachio hover:text-primary border border-transparent hover:border-primary/30 transition-all"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#021713] border border-forest/30 text-white">
                          <DropdownMenuItem onClick={() => handleViewWebsite(site.id)}>
                            <Eye className="h-4 w-4 mr-2 text-primary" /> Ver e Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateWebsite(site)}>
                            <Copy className="h-4 w-4 mr-2 text-secondary" /> Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-forest/20" />
                          <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleDeleteWebsite(site.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* New Website Card Button Placeholder */}
          <div 
            onClick={() => setIsOpenCreatorOpen(true)}
            className="bg-[#08312b]/20 border-dashed border-2 border-forest/40 flex flex-col items-center justify-center p-12 rounded-2xl group cursor-pointer hover:border-primary/60 hover:bg-white/5 transition-all shadow-lg hover:shadow-primary/5 min-h-[300px]"
          >
            <div className="w-16 h-16 rounded-full bg-forest/20 flex items-center justify-center mb-6 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-500 relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-0 group-hover:opacity-100"></div>
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-display text-base font-bold text-white mb-2">Novo Ecossistema</h3>
            <p className="text-sm text-pistachio/50 text-center max-w-[200px]">Inicie um projeto do zero com o assistente Kinjani AI</p>
          </div>
        </div>
      </div>

      <OpenCreator
        open={isOpenCreatorOpen}
        onOpenChange={setIsOpenCreatorOpen}
        onWebsiteCreated={handleWebsiteCreated}
        onOpenAdvanced={() => setIsWizardOpen(true)}
      />

      <CreateWebsiteWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onWebsiteCreated={handleWebsiteCreated}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Site"
        description="Tem a certeza que deseja eliminar este site? Esta ação não pode ser revertida e a URL publicada ficará inacessível."
        confirmLabel="Eliminar permanentemente"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </AppLayout>
  );
}
