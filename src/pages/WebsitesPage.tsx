import { useState } from "react";
import { Plus, Search, MoreHorizontal, Globe, Eye, Pencil, Copy, Trash2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      },
    });

    if (result) {
      toast.success(`Site "${result.name}" criado com sucesso!`);
      navigate(`/websites/${result.id}/edit`);
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
    navigate(`/websites/${id}/edit`);
  };

  const handleViewWebsite = (id: string) => {
    navigate(`/websites/${id}/edit`);
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
      <Badge variant="outline" className={type === "landing" ? "bg-blue-500/10 text-blue-600" : "bg-purple-500/10 text-purple-600"}>
        {type === "landing" ? "Landing Page" : "Institucional"}
      </Badge>
    );
  };

  const getNicheBadge = (niche?: string) => {
    if (!niche) return null;
    return (
      <Badge variant="secondary" className="text-xs">
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
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Sites" credits={profile?.credits_balance ?? 0}>
      <div className="space-y-6">
        {/* Ações do Cabeçalho */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar sites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setIsOpenCreatorOpen(true)} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Criar Site
          </Button>
        </div>

        {/* Grid de Sites */}
        {filteredWebsites.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <EmptyState
                icon={Globe}
                title="Nenhum site encontrado"
                description="Gere o seu primeiro site com IA"
                action={{
                  label: "Criar Site",
                  onClick: () => setIsWizardOpen(true),
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredWebsites.map((site) => (
              <Card 
                key={site.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewWebsite(site.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{site.name}</CardTitle>
                        <CardDescription className="text-xs">
                          Criado em {formatDate(site.created_at)}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleViewWebsite(site.id);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver / Pré-visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleEditWebsite(site.id);
                        }}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateWebsite(site);
                        }}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWebsite(site.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {getTypeBadge(site.config?.type)}
                    {getNicheBadge(site.config?.niche)}
                    <StatusBadge status={site.status} />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditWebsite(site.id);
                      }}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewWebsite(site.id);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateWebsiteWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onWebsiteCreated={handleWebsiteCreated}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Site"
        description="Tem a certeza que deseja eliminar este site? Esta ação não pode ser revertida."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </AppLayout>
  );
}
