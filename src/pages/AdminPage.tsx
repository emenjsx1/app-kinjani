import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAdminGuard, useAdminData } from "@/hooks/useAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import {
  Users,
  CreditCard,
  Settings,
  MessageSquare,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Loader2,
  Key,
  Server,
  Crown,
} from "lucide-react";

export default function AdminPage() {
  const { isAdmin, isLoading: guardLoading } = useAdminGuard();
  const navigate = useNavigate();

  useEffect(() => {
    if (!guardLoading && isAdmin === false) {
      navigate("/dashboard");
    }
  }, [isAdmin, guardLoading, navigate]);

  const {
    users,
    paymentOrders,
    metrics,
    isLoading,
    refetch,
    updateUserPlan,
    addCreditsToUser,
    toggleAdmin,
    confirmPayment,
    rejectPayment,
    systemSettings,
    updateSystemSetting,
  } = useAdminData();

  const [creditModal, setCreditModal] = useState<{ userId: string; email: string } | null>(null);
  const [creditAmount, setCreditAmount] = useState("500");
  const [creditReason, setCreditReason] = useState("Adição manual pelo admin");

  if (guardLoading || (!isAdmin && guardLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#011612]">
        <Loader2 className="h-8 w-8 animate-spin text-[#45fd94]" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const pendingOrders = paymentOrders.filter(o => o.status === "pending");

  const planColor = (plan: string) => {
    switch (plan) {
      case "pro": return "bg-violet-500/20 text-violet-300 border-violet-500/30";
      case "business": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default: return "bg-[#45fd94]/10 text-[#45fd94] border-[#45fd94]/20";
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "rejected": return "bg-red-500/20 text-red-300 border-red-500/30";
      default: return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    }
  };

  return (
    <AppLayout pageTitle="Administração">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#45fd94]/10 border border-[#45fd94]/20 flex items-center justify-center">
              <Crown className="h-5 w-5 text-[#45fd94]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Painel de Administração</h1>
              <p className="text-xs text-pistachio/60">Gestão completa da plataforma Kinjani AI</p>
            </div>
          </div>
          <Button onClick={refetch} variant="outline" size="sm" className="border-forest/40 text-pistachio hover:bg-forest/20">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Utilizadores", value: metrics.totalUsers, icon: Users, color: "text-[#45fd94]" },
            { label: "Agentes IA", value: metrics.totalAgents, icon: MessageSquare, color: "text-violet-400" },
            { label: "WA Conectados", value: metrics.activeInstances, icon: Server, color: "text-emerald-400" },
            { label: "Pedidos Pendentes", value: pendingOrders.length, icon: AlertTriangle, color: "text-amber-400" },
            { label: "Receita (MZN)", value: metrics.totalRevenueMzn.toLocaleString("pt-PT"), icon: CreditCard, color: "text-[#45fd94]" },
          ].map(m => (
            <div key={m.label} className="bg-[#021f1b]/60 backdrop-blur-xl border border-forest/20 rounded-xl p-4">
              <m.icon className={`h-5 w-5 ${m.color} mb-2`} />
              <p className={`text-2xl font-black font-mono ${m.color}`}>{m.value}</p>
              <p className="text-[10px] text-pistachio/50 uppercase tracking-wider mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users">
          <TabsList className="bg-[#021f1b]/80 border border-forest/20 rounded-xl p-1">
            <TabsTrigger value="users" className="data-[state=active]:bg-[#45fd94]/20 data-[state=active]:text-[#45fd94] rounded-lg text-pistachio/70">
              <Users className="h-4 w-4 mr-2" />Utilizadores
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-[#45fd94]/20 data-[state=active]:text-[#45fd94] rounded-lg text-pistachio/70">
              <CreditCard className="h-4 w-4 mr-2" />Pagamentos
              {pendingOrders.length > 0 && (
                <span className="ml-2 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {pendingOrders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-[#45fd94]/20 data-[state=active]:text-[#45fd94] rounded-lg text-pistachio/70">
              <Settings className="h-4 w-4 mr-2" />Config Global
            </TabsTrigger>
          </TabsList>

          {/* ── Tab: Utilizadores ───────────────────────── */}
          <TabsContent value="users" className="mt-4">
            <div className="bg-[#021f1b]/60 backdrop-blur-xl border border-forest/20 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-forest/20 flex items-center justify-between">
                <p className="text-xs font-bold text-pistachio/60 uppercase tracking-widest">Todos os Utilizadores ({users.length})</p>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-[#45fd94]" />
                </div>
              ) : (
                <div className="divide-y divide-forest/10">
                  {users.map(user => (
                    <div key={user.id} className="px-4 py-3 flex items-center gap-4 hover:bg-forest/10 transition-all">
                      {/* Avatar */}
                      <div className="h-9 w-9 rounded-full bg-[#45fd94]/10 border border-[#45fd94]/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#45fd94] text-xs font-bold">
                          {(user.full_name || user.email || "?")[0].toUpperCase()}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white truncate">{user.full_name || "—"}</p>
                          {(user as any).is_admin && (
                            <ShieldCheck className="h-3.5 w-3.5 text-[#45fd94] flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-pistachio/50 truncate">{user.email || "Sem email"}</p>
                      </div>

                      {/* Plan badge */}
                      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase flex-shrink-0 ${planColor(user.plan)}`}>
                        {user.plan}
                      </span>

                      {/* Credits */}
                      <div className="text-right flex-shrink-0 w-20">
                        <p className="text-sm font-mono font-bold text-[#45fd94]">{user.credits_balance.toLocaleString()}</p>
                        <p className="text-[9px] text-pistachio/40">créditos</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Change plan */}
                        <Select
                          value={user.plan}
                          onValueChange={async (val) => {
                            const ok = await updateUserPlan(user.user_id, val);
                            if (ok) toast.success(`Plano alterado para ${val}`);
                          }}
                        >
                          <SelectTrigger className="h-7 w-24 text-[10px] bg-forest/10 border-forest/30 text-pistachio">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Add credits button */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 border-forest/30 text-pistachio hover:bg-forest/20 text-[10px]"
                          onClick={() => setCreditModal({ userId: user.user_id, email: user.email || "" })}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Créditos
                        </Button>

                        {/* Toggle admin */}
                        <Button
                          size="sm"
                          variant={(user as any).is_admin ? "default" : "ghost"}
                          className={`h-7 px-2 text-[10px] ${(user as any).is_admin ? "bg-[#45fd94]/20 text-[#45fd94] border border-[#45fd94]/30" : "text-pistachio/40 hover:text-pistachio"}`}
                          onClick={async () => {
                            await toggleAdmin(user.user_id, !(user as any).is_admin);
                            toast.success((user as any).is_admin ? "Admin removido" : "Promovido a Admin");
                          }}
                        >
                          <ShieldCheck className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Tab: Pagamentos ─────────────────────────── */}
          <TabsContent value="payments" className="mt-4">
            <div className="bg-[#021f1b]/60 backdrop-blur-xl border border-forest/20 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-forest/20">
                <p className="text-xs font-bold text-pistachio/60 uppercase tracking-widest">Pedidos de Pagamento ({paymentOrders.length})</p>
              </div>
              <div className="divide-y divide-forest/10">
                {paymentOrders.length === 0 ? (
                  <div className="py-12 text-center text-pistachio/40 text-sm">Nenhum pedido ainda</div>
                ) : (
                  paymentOrders.map(order => (
                    <div key={order.id} className="px-4 py-3 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{order.amount_mzn?.toLocaleString()} MZN</p>
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${statusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-pistachio/50">{order.credits_amount?.toLocaleString()} créditos · {order.method?.toUpperCase()} · {order.user_id?.slice(0, 12)}...</p>
                        <p className="text-[10px] text-pistachio/40">{new Date(order.created_at).toLocaleString("pt-PT")}</p>
                      </div>
                      {order.status === "pending" && (
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            className="h-7 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 text-[10px]"
                            onClick={async () => {
                              await confirmPayment(order.id, order.user_id, order.credits_amount || 0);
                              toast.success("Pagamento confirmado! Créditos adicionados.");
                            }}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 text-[10px]"
                            onClick={async () => {
                              await rejectPayment(order.id);
                              toast.success("Pedido rejeitado");
                            }}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── Tab: Config Global ──────────────────────── */}
          <TabsContent value="config" className="mt-4 space-y-4">
            {/* Evolution API */}
            <div className="bg-[#021f1b]/60 backdrop-blur-xl border border-forest/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <Server className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Evolution API</h3>
                  <p className="text-[10px] text-pistachio/50">Configuração do servidor WhatsApp</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-pistachio/60 mb-1.5 block font-semibold uppercase tracking-wider">URL Base</label>
                  <Input
                    value={systemSettings?.evolution_api_url ?? ""}
                    onChange={(e) => updateSystemSetting("evolution_api_url", e.target.value)}
                    className="bg-background/40 border-forest/30 text-white text-sm"
                    placeholder="https://evo.kinjani.ai"
                  />
                </div>
                <div>
                  <label className="text-xs text-pistachio/60 mb-1.5 block font-semibold uppercase tracking-wider">API Key</label>
                  <Input
                    type="password"
                    value={systemSettings?.evolution_api_key ?? ""}
                    onChange={(e) => updateSystemSetting("evolution_api_key", e.target.value)}
                    className="bg-background/40 border-forest/30 text-white text-sm"
                    placeholder="Chave da Evolution API"
                  />
                </div>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-[#45fd94]/10 border border-[#45fd94]/20">
                <p className="text-xs text-[#45fd94]">
                  ✅ Estas configurações são guardadas automaticamente na base de dados e aplicadas diretamente nas integrações (Evolution API e Webhooks).
                </p>
              </div>
            </div>

            {/* Global API Keys */}
            <div className="bg-[#021f1b]/60 backdrop-blur-xl border border-forest/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <Key className="h-5 w-5 text-violet-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">API Keys Globais (Fallback)</h3>
                  <p className="text-[10px] text-pistachio/50">Usadas quando o utilizador não configurou a sua própria chave</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-pistachio/60 mb-1.5 block font-semibold uppercase tracking-wider">OpenAI API Key (Global)</label>
                  <Input
                    type="password"
                    value={systemSettings?.openai_api_key ?? ""}
                    onChange={(e) => updateSystemSetting("openai_api_key", e.target.value)}
                    className="bg-background/40 border-forest/30 text-white text-sm"
                    placeholder="sk-..."
                  />
                </div>
                <div>
                  <label className="text-xs text-pistachio/60 mb-1.5 block font-semibold uppercase tracking-wider">Gemini API Key (Global)</label>
                  <Input
                    type="password"
                    value={systemSettings?.gemini_api_key ?? ""}
                    onChange={(e) => updateSystemSetting("gemini_api_key", e.target.value)}
                    className="bg-background/40 border-forest/30 text-white text-sm"
                    placeholder="AIza..."
                  />
                </div>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-[#45fd94]/5 border border-[#45fd94]/20">
                <p className="text-xs text-[#45fd94]/80">
                  ✅ As chaves da API também são geridas via base de dados para fallback.
                </p>
              </div>
            </div>

            {/* Platform limits */}
            <div className="bg-[#021f1b]/60 backdrop-blur-xl border border-forest/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <TrendingUp className="h-5 w-5 text-[#45fd94]" />
                <div>
                  <h3 className="text-sm font-bold text-white">Limites por Plano</h3>
                  <p className="text-[10px] text-pistachio/50">Créditos iniciais e instâncias WhatsApp</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { plan: "Free", credits: 500, instances: 1 },
                  { plan: "Pro", credits: 5000, instances: 5 },
                  { plan: "Business", credits: 20000, instances: 20 },
                ].map(p => (
                  <div key={p.plan} className="p-4 rounded-xl bg-forest/10 border border-forest/20">
                    <p className="text-xs font-bold text-pistachio/70 uppercase tracking-widest mb-3">{p.plan}</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-[10px] text-pistachio/40 uppercase">Créditos/mês</p>
                        <Input
                          defaultValue={p.credits}
                          className="h-7 text-xs bg-background/40 border-forest/30 text-white mt-1"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] text-pistachio/40 uppercase">Instâncias WA</p>
                        <Input
                          defaultValue={p.instances}
                          className="h-7 text-xs bg-background/40 border-forest/30 text-white mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SQL Runner hint */}
            <div className="bg-[#021f1b]/60 backdrop-blur-xl border border-amber-500/20 rounded-xl p-5">
              <p className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Para promover um utilizador a Admin via SQL:
              </p>
              <code className="block bg-black/40 text-[#45fd94] text-xs p-3 rounded-lg font-mono">
                {`UPDATE profiles SET is_admin = true WHERE email = 'emenjoseph7@gmail.com';`}
              </code>
              <p className="text-[10px] text-amber-300/70 mt-2">Corre este SQL no Supabase Dashboard → SQL Editor</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Credit Modal */}
      {creditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#021f1b] border border-forest/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-bold mb-1">Adicionar Créditos</h3>
            <p className="text-xs text-pistachio/60 mb-4">{creditModal.email}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-pistachio/60 mb-1.5 block">Quantidade</label>
                <Input
                  type="number"
                  value={creditAmount}
                  onChange={e => setCreditAmount(e.target.value)}
                  className="bg-background/40 border-forest/30 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-pistachio/60 mb-1.5 block">Motivo</label>
                <Input
                  value={creditReason}
                  onChange={e => setCreditReason(e.target.value)}
                  className="bg-background/40 border-forest/30 text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button
                className="flex-1 bg-[#45fd94] hover:bg-[#30a684] text-[#011612] font-bold"
                onClick={async () => {
                  await addCreditsToUser(creditModal.userId, parseInt(creditAmount), creditReason);
                  toast.success(`${creditAmount} créditos adicionados!`);
                  setCreditModal(null);
                }}
              >
                Adicionar
              </Button>
              <Button variant="outline" className="flex-1 border-forest/40 text-pistachio hover:bg-forest/20" onClick={() => setCreditModal(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
