import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useClients, Client } from "@/hooks/useClients";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateClientDialog } from "@/components/clients/CreateClientDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Users,
  Plus,
  Search,
  DollarSign,
  Bot,
  Globe,
  Mail,
  Phone,
  Building2,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  Activity,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function ClientsPage() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { clientsWithStats, isLoading, stats, deleteClient } = useClients();
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const filteredClients = clientsWithStats.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };

  const handleViewDetails = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };

  const handleDeleteConfirm = async () => {
    if (clientToDelete) {
      await deleteClient.mutateAsync(clientToDelete.id);
      setClientToDelete(null);
    }
  };

  const statusColors: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    inactive: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  const planLabels: Record<string, string> = {
    basic: "Básico",
    pro: "Profissional",
    enterprise: "Enterprise",
  };

  return (
    <AppLayout pageTitle="Clientes" credits={profile?.credits_balance ?? 0}>
      <div className="space-y-8 pb-10">
        
        {/* Analytics Overview Section - Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Retention LineChart */}
          <div className="lg:col-span-8 bg-card/60 backdrop-blur-xl border border-forest/30 rounded-xl p-6 shadow-[0_0_20px_-5px_rgba(69,253,148,0.1)]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-headline-sm text-lg font-bold text-foreground">Retenção de Clientes</h3>
                <p className="text-sm text-pistachio/70">Análise mensal de coortes</p>
              </div>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold border border-primary/20 tracking-wider">
                98.2% LTV
              </span>
            </div>
            
            <div className="relative h-48 w-full flex items-end justify-between px-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 800 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#45fd94" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#45fd94" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 150 Q 100 130 200 140 T 400 60 T 600 80 T 800 20 L 800 180 L 0 180 Z" fill="url(#chartGradient)"></path>
                <path d="M0 150 Q 100 130 200 140 T 400 60 T 600 80 T 800 20" fill="none" stroke="#45fd94" strokeWidth="3" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(69,253,148,0.4)]"></path>
                <circle cx="400" cy="60" fill="#45fd94" r="5" className="animate-pulse" />
              </svg>
            </div>
            
            <div className="flex justify-between mt-4 px-2 text-[10px] text-pistachio/50 uppercase tracking-widest font-bold font-mono">
              <span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span><span>Jul</span><span>Ago</span>
            </div>
          </div>

          {/* Traffic Mix & Summary */}
          <div className="lg:col-span-4 bg-card/60 backdrop-blur-xl border border-forest/30 rounded-xl p-6 flex flex-col justify-between shadow-[0_0_20px_-5px_rgba(69,253,148,0.1)]">
            <div>
              <h3 className="font-headline-sm text-lg font-bold text-foreground">Mix de Tráfego</h3>
              <p className="text-sm text-pistachio/70">Canais de Agentes Ativos</p>
            </div>

            <div className="space-y-5 my-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs tracking-wider font-semibold font-mono text-pistachio">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" /> WHATSAPP
                  </span>
                  <span className="text-foreground">64%</span>
                </div>
                <div className="h-2 bg-surface-container-low border border-forest/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(69,253,148,0.4)]" style={{ width: "64%" }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs tracking-wider font-semibold font-mono text-pistachio">
                  <span className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-secondary" /> WEB CHAT
                  </span>
                  <span className="text-foreground">36%</span>
                </div>
                <div className="h-2 bg-surface-container-low border border-forest/20 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary/70 rounded-full" style={{ width: "36%" }}></div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-forest/20">
              <div className="flex items-center justify-between text-center">
                <div>
                  <p className="text-primary font-bold text-lg font-mono">
                    {stats.activeClients}
                  </p>
                  <p className="text-[10px] text-pistachio/50 uppercase tracking-widest font-mono">Ativos</p>
                </div>
                <div className="h-8 w-px bg-forest/20"></div>
                <div>
                  <p className="text-foreground font-bold text-lg font-mono">
                    {stats.totalAgents}
                  </p>
                  <p className="text-[10px] text-pistachio/50 uppercase tracking-widest font-mono">Agentes</p>
                </div>
                <div className="h-8 w-px bg-forest/20"></div>
                <div>
                  <p className="text-foreground font-bold text-lg font-mono">
                    {stats.totalWebsites}
                  </p>
                  <p className="text-[10px] text-pistachio/50 uppercase tracking-widest font-mono">Sites</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card/40 border border-forest/20 rounded-xl p-5 hover:border-primary/30 transition-all">
            <p className="text-xs font-semibold text-pistachio/60 uppercase tracking-widest mb-1">Receita Mensal</p>
            <h4 className="text-2xl font-bold text-foreground font-mono">
              {stats.totalMonthlyRevenue.toLocaleString('pt-PT', { maximumFractionDigits: 0 })} MZN
            </h4>
            <p className="text-xs text-primary mt-1 font-mono">↑ 12% vs mês anterior</p>
          </div>
          <div className="bg-card/40 border border-forest/20 rounded-xl p-5 hover:border-primary/30 transition-all">
            <p className="text-xs font-semibold text-pistachio/60 uppercase tracking-widest mb-1">Clientes Ativos</p>
            <h4 className="text-2xl font-bold text-foreground font-mono">
              {stats.activeClients}
            </h4>
            <p className="text-xs text-pistachio/55 mt-1">De {clientsWithStats.length} registados</p>
          </div>
          <div className="bg-card/40 border border-forest/20 rounded-xl p-5 hover:border-primary/30 transition-all">
            <p className="text-xs font-semibold text-pistachio/60 uppercase tracking-widest mb-1">Agentes Criados</p>
            <h4 className="text-2xl font-bold text-foreground font-mono">
              {stats.totalAgents}
            </h4>
            <p className="text-xs text-primary mt-1 font-mono">↑ 8% este mês</p>
          </div>
          <div className="bg-card/40 border border-forest/20 rounded-xl p-5 hover:border-primary/30 transition-all">
            <p className="text-xs font-semibold text-pistachio/60 uppercase tracking-widest mb-1">Websites Vinculados</p>
            <h4 className="text-2xl font-bold text-foreground font-mono">
              {stats.totalWebsites}
            </h4>
            <p className="text-xs text-pistachio/55 mt-1">Publicados na cloud</p>
          </div>
        </div>

        {/* Toolbar (Search + New Client Button) */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pistachio/50" />
            <Input
              placeholder="Pesquisar clientes por nome ou empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card/40 border-forest/30 focus:border-primary/50 text-foreground"
            />
          </div>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="bg-primary hover:bg-primary/95 text-on-primary font-bold shadow-md shadow-primary/20"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        {/* Clients Table / Content Section */}
        {isLoading ? (
          <div className="border border-forest/30 rounded-xl bg-card/30 p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg bg-forest/10" />
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum cliente encontrado"
            description={
              searchQuery
                ? "Tente ajustar a sua pesquisa."
                : "Comece a adicionar clientes para gerir os seus agentes e sites."
            }
            action={
              !searchQuery ? {
                label: "Adicionar Primeiro Cliente",
                onClick: () => setCreateDialogOpen(true),
              } : undefined
            }
          />
        ) : (
          <div className="bg-card/40 border border-forest/30 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-forest/20 text-pistachio/60 border-b border-forest/30 text-[10px] font-mono uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Cliente / Empresa</th>
                    <th className="px-6 py-4 font-semibold">Recursos</th>
                    <th className="px-6 py-4 font-semibold">Estado</th>
                    <th className="px-6 py-4 font-semibold">Plano</th>
                    <th className="px-6 py-4 font-semibold text-right">Faturação Mensal</th>
                    <th className="px-6 py-4 font-semibold w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest/10">
                  {filteredClients.map((client) => (
                    <tr 
                      key={client.id}
                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                      onClick={() => handleViewDetails(client)}
                    >
                      {/* Logo and Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-10 w-10 rounded-lg flex items-center justify-center border border-forest/30 shrink-0"
                            style={{ backgroundColor: (client.primary_color || "#45fd94") + "15" }}
                          >
                            {client.logo_url ? (
                              <img 
                                src={client.logo_url} 
                                alt={client.name} 
                                className="h-7 w-7 object-contain"
                              />
                            ) : (
                              <Building2 
                                className="h-5 w-5" 
                                style={{ color: client.primary_color || "#45fd94" }}
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm tracking-wide group-hover:text-primary transition-colors">
                              {client.name}
                            </p>
                            <span className="text-xs text-pistachio/60 font-mono">
                              {client.company || "Sem Empresa"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Usage details */}
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-4 text-xs font-mono">
                          <div className="flex items-center gap-1 text-pistachio/80">
                            <Bot className="h-3.5 w-3.5 text-primary" />
                            <span>{client.agents_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 text-pistachio/80">
                            <Globe className="h-3.5 w-3.5 text-secondary" />
                            <span>{client.websites_count || 0}</span>
                          </div>
                          <div className="w-16 h-1 bg-surface-container rounded-full overflow-hidden shrink-0 hidden sm:block">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${Math.min(100, ((client.agents_count || 0) + (client.websites_count || 0)) * 20)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Status dot */}
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${client.status === "active" ? "bg-emerald-400 animate-pulse" : client.status === "pending" ? "bg-amber-400" : "bg-zinc-500"}`}></span>
                          <Badge variant="outline" className={`text-xs px-2 py-0 border-none ${statusColors[client.status]}`}>
                            {client.status === "active" ? "Ativo" : client.status === "pending" ? "Pendente" : "Inativo"}
                          </Badge>
                        </div>
                      </td>

                      {/* Plan badge */}
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs font-mono bg-forest/20 text-pistachio border border-forest/30 rounded px-2 py-0.5 uppercase">
                          {planLabels[client.plan] || client.plan}
                        </span>
                      </td>

                      {/* Billing value */}
                      <td className="px-6 py-4 text-right font-mono font-bold text-foreground">
                        {Number(client.monthly_value || 0).toLocaleString('pt-PT', { maximumFractionDigits: 0 })} MZN
                      </td>

                      {/* Dropdown Menu actions */}
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-forest/20 text-pistachio hover:text-primary">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border border-forest/30 text-foreground">
                            <DropdownMenuItem onClick={() => onViewDetails(client)}>
                              <Eye className="mr-2 h-4 w-4 text-primary" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(client)}>
                              <Edit className="mr-2 h-4 w-4 text-secondary" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-forest/20" />
                            <DropdownMenuItem
                              onClick={() => setClientToDelete(client)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <CreateClientDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!clientToDelete}
        onOpenChange={(open) => !open && setClientToDelete(null)}
        title="Eliminar Cliente"
        description={`Tem a certeza que deseja eliminar "${clientToDelete?.name}"? Esta ação não pode ser revertida. Os agentes e sites associados não serão eliminados, apenas desvinculados.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteClient.isPending}
      />
    </AppLayout>
  );
}
