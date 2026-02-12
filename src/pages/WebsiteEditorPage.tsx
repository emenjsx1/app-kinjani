import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Globe, Pencil, Trash2, ExternalLink } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { WebsiteEditor, EmbedConfig } from "@/components/websites/WebsiteEditor";
import { WebsitePreview } from "@/components/websites/WebsitePreview";
import { getTemplateById, WebsiteTemplate } from "@/lib/website-templates";
import { toast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useWebsites, Website } from "@/hooks/useWebsites";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useProfile } from "@/hooks/useProfile";

export default function WebsiteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getWebsite, updateWebsite, deleteWebsite } = useWebsites();
  const { profile } = useProfile();
  const [website, setWebsite] = useState<Website | null>(null);
  const [template, setTemplate] = useState<WebsiteTemplate | null>(null);
  const [activeTab, setActiveTab] = useState("preview");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWebsite = async () => {
      if (!id) {
        navigate("/websites");
        return;
      }

      setIsLoading(true);
      const found = await getWebsite(id);
      
      if (found) {
        setWebsite(found);
        // Use custom template if exists, otherwise get from catalog
        const tmpl = found.config?.customTemplate || getTemplateById(found.config?.templateId || '');
        if (tmpl) {
          setTemplate(tmpl);
        }
      } else {
        navigate("/websites");
      }
      setIsLoading(false);
    };

    loadWebsite();
  }, [id, navigate, getWebsite]);

  if (isLoading) {
    return (
      <AppLayout pageTitle="Carregando..." credits={profile?.credits_balance ?? 0}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (!website || !template) {
    return (
      <AppLayout pageTitle="Site não encontrado" credits={profile?.credits_balance ?? 0}>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Site não encontrado</p>
        </div>
      </AppLayout>
    );
  }

  const handleSaveTemplate = async (updatedTemplate: WebsiteTemplate, embedCfg?: EmbedConfig) => {
    const updatedConfig = {
      ...website.config,
      customTemplate: updatedTemplate,
      embedConfig: embedCfg,
    };

    const result = await updateWebsite(website.id, { config: updatedConfig });
    
    if (result) {
      setTemplate(updatedTemplate);
      setWebsite(result);
      toast({
        title: "Site guardado!",
        description: "As alterações foram guardadas com sucesso.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Erro ao guardar o site.",
        variant: "destructive",
      });
    }
  };

  // Generate real preview URL
  const getPreviewUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/site/${website.id}`;
  };

  const handlePublish = async () => {
    const realUrl = getPreviewUrl();
    const result = await updateWebsite(website.id, {
      status: "active",
      published_url: realUrl,
    });

    if (result) {
      setWebsite(result);
      toast({
        title: "Site publicado!",
        description: "O seu site está agora online.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Erro ao publicar o site.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    const success = await deleteWebsite(website.id);
    if (success) {
      toast({
        title: "Site eliminado",
        description: "O site foi removido com sucesso.",
      });
      navigate("/websites");
    } else {
      toast({
        title: "Erro",
        description: "Erro ao eliminar o site.",
        variant: "destructive",
      });
    }
  };

  if (isEditing) {
    return (
      <div className="h-screen">
        <WebsiteEditor
          template={template}
          websiteName={website.name}
          prompt={website.config?.prompt || ""}
          onBack={() => setIsEditing(false)}
          onSave={handleSaveTemplate}
          initialEmbedConfig={website.config?.embedConfig}
        />
      </div>
    );
  }

  const displayUrl = website.published_url || getPreviewUrl();
  const websiteType = website.config?.type;
  const websiteNiche = website.config?.niche;

  return (
    <AppLayout pageTitle={website.name} credits={profile?.credits_balance ?? 0}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/websites")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{website.name}</h1>
                <StatusBadge status={website.status} />
              </div>
              <div className="flex items-center gap-2 mt-1">
                {websiteType && (
                  <Badge variant="outline">
                    {websiteType === "landing" ? "Landing Page" : "Institucional"}
                  </Badge>
                )}
                {websiteNiche && <Badge variant="secondary">{websiteNiche}</Badge>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
            {website.status === "draft" ? (
              <Button onClick={handlePublish}>
                <Globe className="h-4 w-4 mr-2" />
                Publicar
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <a
                  href={displayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Online
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Pré-visualização
            </TabsTrigger>
            <TabsTrigger value="details">
              Detalhes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-4">
            <div className="bg-background rounded-lg shadow-lg overflow-hidden border">
              <div className="flex items-center gap-2 p-3 border-b bg-muted/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-muted-foreground">
                    {displayUrl}
                  </span>
                </div>
              </div>
              <WebsitePreview 
                template={template} 
                websiteName={website.name}
                embedConfig={website.config?.embedConfig}
              />
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4 p-6 rounded-lg border bg-card">
                <h3 className="font-semibold">Informações do Site</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{website.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium">
                      {websiteType === "landing" ? "Landing Page" : "Site Institucional"}
                    </p>
                  </div>
                  {websiteNiche && (
                    <div>
                      <p className="text-sm text-muted-foreground">Nicho</p>
                      <p className="font-medium">{websiteNiche}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Template</p>
                    <p className="font-medium">{template.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Criação</p>
                    <p className="font-medium">
                      {new Date(website.created_at).toLocaleDateString("pt-PT")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6 rounded-lg border bg-card">
                <h3 className="font-semibold">Prompt de Geração</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {website.config?.prompt || "Nenhum prompt especificado."}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Eliminar Site"
        description={`Tem a certeza que deseja eliminar o site "${website.name}"? Esta ação não pode ser revertida.`}
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </AppLayout>
  );
}
