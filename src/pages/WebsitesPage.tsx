import { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, Globe, ExternalLink } from "lucide-react";
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

interface Website {
  id: string;
  name: string;
  type: "landing" | "institutional";
  niche?: string;
  nicheId?: string;
  prompt?: string;
  status: "active" | "draft" | "inactive";
  url: string;
  createdAt: string;
}

const STORAGE_KEY = "kinja-websites";

const getStoredWebsites = (): Website[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveWebsites = (websites: Website[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(websites));
};

export default function WebsitesPage() {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState<Website[]>(getStoredWebsites);
  const [search, setSearch] = useState("");
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    saveWebsites(websites);
  }, [websites]);

  const handleWebsiteCreated = (newWebsite: Website) => {
    setWebsites((prev) => [...prev, newWebsite]);
  };

  const handleDeleteWebsite = (id: string) => {
    setWebsites((prev) => prev.filter((site) => site.id !== id));
  };

  const filteredWebsites = websites.filter((site) =>
    site.name.toLowerCase().includes(search.toLowerCase())
  );

  const getTypeBadge = (type: Website["type"]) => {
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

  return (
    <AppLayout pageTitle="Sites" credits={1250}>
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
          <Button onClick={() => setIsWizardOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
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
              <Card key={site.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{site.name}</CardTitle>
                        <CardDescription className="text-xs">
                          Criado em {site.createdAt}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                        {site.url && (
                          <DropdownMenuItem onClick={() => window.open(site.url, "_blank")}>
                            Ver Online
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteWebsite(site.id)}
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {getTypeBadge(site.type)}
                    {getNicheBadge(site.niche)}
                    <StatusBadge status={site.status} />
                  </div>
                  {site.url && (
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                      {site.url.replace("https://", "")}
                    </a>
                  )}
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
    </AppLayout>
  );
}
