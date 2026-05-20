import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useClients, Client } from "@/hooks/useClients";
import { useProfile } from "@/hooks/useProfile";
import { useAgents, Agent } from "@/hooks/useAgents";
import { useWebsites, Website } from "@/hooks/useWebsites";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ClientBrandingForm } from "@/components/clients/ClientBrandingForm";
import { LinkAgentDialog } from "@/components/clients/LinkAgentDialog";
import { LinkWebsiteDialog } from "@/components/clients/LinkWebsiteDialog";
import { AssetPriceInput } from "@/components/clients/AssetPriceInput";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Bot,
  Globe,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  Link2,
  Link2Off,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ClientDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { clients, updateClient, deleteClient } = useClients();
  const { agents, updateAgent, refetch: refetchAgents } = useAgents();
  const { websites, updateWebsite, refetch: refetchWebsites } = useWebsites();

  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLinkAgentDialog, setShowLinkAgentDialog] = useState(false);
  const [showLinkWebsiteDialog, setShowLinkWebsiteDialog] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

  // Fetch client data
  useEffect(() => {
    if (id && clients.length > 0) {
      const found = clients.find((c) => c.id === id);
      setClient(found || null);
      setIsLoading(false);
    } else if (clients.length > 0) {
      setIsLoading(false);
    }
  }, [id, clients]);

  // Get linked agents and websites
  const linkedAgents = agents.filter((a) => (a as Agent & { client_id?: string }).client_id === id);
  const linkedWebsites = websites.filter((w) => (w as Website & { client_id?: string }).client_id === id);
  const availableAgents = agents.filter((a) => !(a as Agent & { client_id?: string }).client_id);
  const availableWebsites = websites.filter((w) => !(w as Website & { client_id?: string }).client_id);

  const handleDelete = async () => {
    if (client) {
      await deleteClient.mutateAsync(client.id);
      navigate("/clients");
    }
  };

  const handleUnlinkAgent = async (agentId: string) => {
    setUnlinkingId(agentId);
    try {
      const { error } = await supabase
        .from("agents")
        .update({ client_id: null })
        .eq("id", agentId);

      if (error) throw error;
      toast.success("Agente desvinculado com sucesso!");
      refetchAgents();
    } catch (error) {
      toast.error("Erro ao desvincular agente");
    } finally {
      setUnlinkingId(null);
    }
  };

  const handleUnlinkWebsite = async (websiteId: string) => {
    setUnlinkingId(websiteId);
    try {
      const { error } = await supabase
        .from("websites")
        .update({ client_id: null })
        .eq("id", websiteId);

      if (error) throw error;
      toast.success("Website desvinculado com sucesso!");
      refetchWebsites();
    } catch (error) {
      toast.error("Erro ao desvincular website");
    } finally {
      setUnlinkingId(null);
    }
  };

  const handleLinkAgent = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from("agents")
        .update({ client_id: id })
        .eq("id", agentId);

      if (error) throw error;
      toast.success("Agente vinculado com sucesso!");
      refetchAgents();
      setShowLinkAgentDialog(false);
    } catch (error) {
      toast.error("Erro ao vincular agente");
    }
  };

  const handleLinkWebsite = async (websiteId: string) => {
    try {
      const { error } = await supabase
        .from("websites")
        .update({ client_id: id })
        .eq("id", websiteId);

      if (error) throw error;
      toast.success("Website vinculado com sucesso!");
      refetchWebsites();
      setShowLinkWebsiteDialog(false);
    } catch (error) {
      toast.error("Erro ao vincular website");
    }
  };

  if (isLoading) {
    return (
      <AppLayout pageTitle="Detalhes do Cliente" credits={profile?.credits_balance ?? 0}>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  if (!client) {
    return (
      <AppLayout pageTitle="Cliente não encontrado" credits={profile?.credits_balance ?? 0}>
        <EmptyState
          icon={Building2}
          title="Cliente não encontrado"
          description="O cliente que procura não existe ou foi removido."
          action={{
            label: "Voltar aos Clientes",
            onClick: () => navigate("/clients"),
          }}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle={client.name} credits={profile?.credits_balance ?? 0}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/clients")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>

        {/* Client Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Logo/Avatar */}
              <div
                className="w-24 h-24 rounded-xl flex items-center justify-center text-white text-3xl font-bold shrink-0"
                style={{ backgroundColor: client.primary_color }}
              >
                {client.logo_url ? (
                  <img
                    src={client.logo_url}
                    alt={client.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  client.name.charAt(0).toUpperCase()
                )}
              </div>

              {/* Details */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <h2 className="text-2xl font-bold">{client.name}</h2>
                  <Badge variant={client.status === "active" ? "default" : "secondary"}>
                    {client.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                  <Badge variant="outline">{client.plan}</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  {client.company && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>{client.company}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>{Number(client.monthly_value).toLocaleString('pt-PT', { maximumFractionDigits: 0 })} MZN/mês</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Criado em {format(new Date(client.created_at), "dd MMM yyyy", { locale: pt })}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 shrink-0">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Bot className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <div className="text-2xl font-bold">{linkedAgents.length}</div>
                  <div className="text-xs text-muted-foreground">Agentes</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Globe className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <div className="text-2xl font-bold">{linkedWebsites.length}</div>
                  <div className="text-xs text-muted-foreground">Sites</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="agents" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="agents">Agentes ({linkedAgents.length})</TabsTrigger>
            <TabsTrigger value="websites">Sites ({linkedWebsites.length})</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
          </TabsList>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Agentes Vinculados</h3>
              <Button onClick={() => setShowLinkAgentDialog(true)} disabled={availableAgents.length === 0}>
                <Link2 className="mr-2 h-4 w-4" />
                Vincular Agente
              </Button>
            </div>

            {linkedAgents.length === 0 ? (
              <EmptyState
                icon={Bot}
                title="Nenhum agente vinculado"
                description="Vincule agentes existentes a este cliente para gerir."
                action={{
                  label: "Vincular Primeiro Agente",
                  onClick: () => setShowLinkAgentDialog(true),
                }}
              />
            ) : (
              <div className="grid gap-4">
                {linkedAgents.map((agent) => (
                  <Card key={agent.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {agent.type} • {agent.channel} • {agent.messages_handled} mensagens
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                          {agent.status}
                        </Badge>
                        <AssetPriceInput clientId={client.id} assetType="agent" assetId={agent.id} />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/agents/${agent.id}`)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnlinkAgent(agent.id)}
                          disabled={unlinkingId === agent.id}
                        >
                          <Link2Off className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Websites Tab */}
          <TabsContent value="websites" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Sites Vinculados</h3>
              <Button onClick={() => setShowLinkWebsiteDialog(true)} disabled={availableWebsites.length === 0}>
                <Link2 className="mr-2 h-4 w-4" />
                Vincular Site
              </Button>
            </div>

            {linkedWebsites.length === 0 ? (
              <EmptyState
                icon={Globe}
                title="Nenhum site vinculado"
                description="Vincule sites existentes a este cliente para gerir."
                action={{
                  label: "Vincular Primeiro Site",
                  onClick: () => setShowLinkWebsiteDialog(true),
                }}
              />
            ) : (
              <div className="grid gap-4">
                {linkedWebsites.map((website) => (
                  <Card key={website.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Globe className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{website.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {website.template || "Personalizado"} • Criado em{" "}
                            {format(new Date(website.created_at), "dd MMM yyyy", { locale: pt })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={website.status === "active" ? "default" : "secondary"}>
                          {website.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/websites/${website.id}/edit`)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnlinkWebsite(website.id)}
                          disabled={unlinkingId === website.id}
                        >
                          <Link2Off className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <ClientBrandingForm
              client={client}
              onSave={async (data) => {
                await updateClient.mutateAsync({ id: client.id, ...data });
              }}
            />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Atividades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Cliente criado</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(client.created_at), "dd MMMM yyyy 'às' HH:mm", { locale: pt })}
                      </div>
                    </div>
                  </div>

                  {client.updated_at !== client.created_at && (
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Edit className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Última atualização</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(client.updated_at), "dd MMMM yyyy 'às' HH:mm", { locale: pt })}
                        </div>
                      </div>
                    </div>
                  )}

                  {linkedAgents.map((agent) => (
                    <div key={agent.id} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="p-2 bg-green-500/10 rounded-full">
                        <Bot className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <div className="font-medium">Agente vinculado: {agent.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {agent.messages_handled} mensagens processadas
                        </div>
                      </div>
                    </div>
                  ))}

                  {linkedWebsites.map((website) => (
                    <div key={website.id} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="p-2 bg-blue-500/10 rounded-full">
                        <Globe className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-medium">Site vinculado: {website.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Status: {website.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Eliminar Cliente"
        description={`Tem a certeza que deseja eliminar "${client.name}"? Esta ação não pode ser revertida. Os agentes e sites associados serão desvinculados.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteClient.isPending}
      />

      {/* Link Agent Dialog */}
      <LinkAgentDialog
        open={showLinkAgentDialog}
        onOpenChange={setShowLinkAgentDialog}
        availableAgents={availableAgents}
        onLink={handleLinkAgent}
      />

      {/* Link Website Dialog */}
      <LinkWebsiteDialog
        open={showLinkWebsiteDialog}
        onOpenChange={setShowLinkWebsiteDialog}
        availableWebsites={availableWebsites}
        onLink={handleLinkWebsite}
      />
    </AppLayout>
  );
}
