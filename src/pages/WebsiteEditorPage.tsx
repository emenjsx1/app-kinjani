import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Save, Globe, Pencil, Trash2, ExternalLink } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { WebsiteEditor } from "@/components/websites/WebsiteEditor";
import { WebsitePreview } from "@/components/websites/WebsitePreview";
import { getTemplateById, WebsiteTemplate } from "@/lib/website-templates";
import { toast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface StoredWebsite {
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

const STORAGE_KEY = "kinja-websites";

const getStoredWebsites = (): StoredWebsite[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveWebsites = (websites: StoredWebsite[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(websites));
};

export default function WebsiteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [website, setWebsite] = useState<StoredWebsite | null>(null);
  const [template, setTemplate] = useState<WebsiteTemplate | null>(null);
  const [activeTab, setActiveTab] = useState("editor");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      const websites = getStoredWebsites();
      const found = websites.find((w) => w.id === id);
      if (found) {
        setWebsite(found);
        // Use custom template if exists, otherwise get from catalog
        const tmpl = found.customTemplate || getTemplateById(found.templateId);
        if (tmpl) {
          setTemplate(tmpl);
        }
      } else {
        navigate("/websites");
      }
    }
  }, [id, navigate]);

  if (!website || !template) {
    return (
      <AppLayout pageTitle="Carregando..." credits={1250}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  const handleSaveTemplate = (updatedTemplate: WebsiteTemplate) => {
    const websites = getStoredWebsites();
    const updatedWebsites = websites.map((w) =>
      w.id === website.id ? { ...w, customTemplate: updatedTemplate } : w
    );
    saveWebsites(updatedWebsites);
    setTemplate(updatedTemplate);
    toast({
      title: "Site guardado!",
      description: "As alterações foram guardadas com sucesso.",
    });
  };

  const handlePublish = () => {
    const websites = getStoredWebsites();
    const updatedWebsites = websites.map((w) =>
      w.id === website.id
        ? {
            ...w,
            status: "active" as const,
            url: `https://${website.name.toLowerCase().replace(/\s+/g, "-")}.kinja.ai`,
          }
        : w
    );
    saveWebsites(updatedWebsites);
    setWebsite((prev) =>
      prev
        ? {
            ...prev,
            status: "active",
            url: `https://${prev.name.toLowerCase().replace(/\s+/g, "-")}.kinja.ai`,
          }
        : prev
    );
    toast({
      title: "Site publicado!",
      description: "O seu site está agora online.",
    });
  };

  const handleDelete = () => {
    const websites = getStoredWebsites();
    const updatedWebsites = websites.filter((w) => w.id !== website.id);
    saveWebsites(updatedWebsites);
    toast({
      title: "Site eliminado",
      description: "O site foi removido com sucesso.",
    });
    navigate("/websites");
  };

  if (isEditing) {
    return (
      <div className="h-screen">
        <WebsiteEditor
          template={template}
          websiteName={website.name}
          prompt={website.prompt}
          onBack={() => setIsEditing(false)}
          onSave={handleSaveTemplate}
        />
      </div>
    );
  }

  return (
    <AppLayout pageTitle={website.name} credits={1250}>
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
                <Badge variant="outline">
                  {website.type === "landing" ? "Landing Page" : "Institucional"}
                </Badge>
                <Badge variant="secondary">{website.niche}</Badge>
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
                  href={website.url}
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
                    {website.url || `${website.name.toLowerCase().replace(/\s+/g, "-")}.kinja.ai`}
                  </span>
                </div>
              </div>
              <WebsitePreview template={template} websiteName={website.name} />
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
                      {website.type === "landing" ? "Landing Page" : "Site Institucional"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nicho</p>
                    <p className="font-medium">{website.niche}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Template</p>
                    <p className="font-medium">{template.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Criação</p>
                    <p className="font-medium">{website.createdAt}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6 rounded-lg border bg-card">
                <h3 className="font-semibold">Prompt de Geração</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {website.prompt || "Nenhum prompt especificado."}
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
