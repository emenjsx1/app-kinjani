import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, MoreHorizontal, Bot } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { CreateAgentWizard } from "@/components/agents/CreateAgentWizard";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  type: string;
  prompt: string;
  status: "active" | "inactive" | "pending" | "error";
  channel: "whatsapp" | "embed" | "both";
  messagesHandled: number;
  createdAt: string;
}

const defaultAgents: Agent[] = [
  {
    id: "1",
    name: "Assistente de Vendas",
    type: "Atendimento / FAQ",
    prompt: "Você é um assistente de vendas útil...",
    status: "active",
    channel: "whatsapp",
    messagesHandled: 1250,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Bot FAQ",
    type: "Atendimento / FAQ",
    prompt: "Você é um assistente de base de conhecimento...",
    status: "active",
    channel: "embed",
    messagesHandled: 890,
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    name: "Qualificador de Leads",
    type: "Captura de Leads",
    prompt: "Você é um agente de qualificação de leads...",
    status: "inactive",
    channel: "both",
    messagesHandled: 450,
    createdAt: "2024-02-01",
  },
];

export default function AgentsPage() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [search, setSearch] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

  // Carregar agentes do localStorage ao montar
  useEffect(() => {
    const storedAgents = localStorage.getItem("kinja-agents");
    if (storedAgents) {
      setAgents(JSON.parse(storedAgents));
    } else {
      // Inicializar com agentes padrão
      localStorage.setItem("kinja-agents", JSON.stringify(defaultAgents));
      setAgents(defaultAgents);
    }
  }, []);

  const saveAgents = (newAgents: Agent[]) => {
    localStorage.setItem("kinja-agents", JSON.stringify(newAgents));
    setAgents(newAgents);
  };

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(search.toLowerCase())
  );

  const getChannelBadge = (channel: Agent["channel"]) => {
    const config = {
      whatsapp: { label: "WhatsApp", className: "bg-green-500/10 text-green-600" },
      embed: { label: "Embed", className: "bg-blue-500/10 text-blue-600" },
      both: { label: "Ambos", className: "bg-purple-500/10 text-purple-600" },
    };
    const { label, className } = config[channel];
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const handleAgentCreated = (newAgent: Agent) => {
    const updatedAgents = [...agents, newAgent];
    saveAgents(updatedAgents);
    toast.success(`Agente "${newAgent.name}" criado com sucesso!`);
  };

  const handleDeleteAgent = (agent: Agent) => {
    setAgentToDelete(agent);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (agentToDelete) {
      const updatedAgents = agents.filter((a) => a.id !== agentToDelete.id);
      saveAgents(updatedAgents);
      toast.success(`Agente "${agentToDelete.name}" eliminado`);
      setAgentToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleRowClick = (agentId: string) => {
    navigate(`/agents/${agentId}`);
  };

  return (
    <AppLayout pageTitle="Agentes" credits={1250}>
      <div className="space-y-6">
        {/* Ações do Cabeçalho */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar agentes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setWizardOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Novo Agente
          </Button>
        </div>

        {/* Tabela de Agentes */}
        <Card>
          <CardHeader>
            <CardTitle>Os Seus Agentes</CardTitle>
            <CardDescription>
              Gerir e monitorizar todos os seus agentes IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAgents.length === 0 ? (
              <EmptyState
                icon={Bot}
                title="Nenhum agente encontrado"
                description="Crie o seu primeiro agente IA para começar"
                action={{
                  label: "Criar Agente",
                  onClick: () => setWizardOpen(true),
                }}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead className="text-right">Mensagens</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgents.map((agent) => (
                    <TableRow 
                      key={agent.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(agent.id)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                          {agent.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {agent.type}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={agent.status} />
                      </TableCell>
                      <TableCell>{getChannelBadge(agent.channel)}</TableCell>
                      <TableCell className="text-right">
                        {agent.messagesHandled.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/agents/${agent.id}`);
                            }}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/agents/${agent.id}?tab=test`);
                            }}>
                              Testar Agente
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/agents/${agent.id}?tab=embed`);
                            }}>
                              Copiar Código Embed
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAgent(agent);
                              }}
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Wizard de Criar Agente */}
      <CreateAgentWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onAgentCreated={handleAgentCreated}
      />

      {/* Diálogo de Confirmação de Eliminação */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Agente"
        description={`Tem a certeza que deseja eliminar "${agentToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Eliminar"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </AppLayout>
  );
}
