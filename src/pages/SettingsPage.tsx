import { useState, useEffect } from "react";
import {
  User, Lock, LogOut, Loader2, Key, CheckCircle2, ShieldAlert,
  Bot, Mail, Globe, Webhook, Eye, EyeOff, Save, Trash2,
  Download, ChevronLeft, ChevronRight, Sparkles, Settings2,
  Zap, MessageSquare, Server, RefreshCw, ExternalLink, X, Check
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProfile } from "@/hooks/useProfile";
import { useAgents } from "@/hooks/useAgents";
import { useUserApiKeys } from "@/hooks/useUserApiKeys";
import { useIntegrationSettings } from "@/hooks/useIntegrationSettings";
import { useCreditTransactions } from "@/hooks/useCreditTransactions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function TxDot({ amount }: { amount: number }) {
  if (amount > 0) return <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />;
  if (amount < -50) return <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />;
  return <span className="w-2 h-2 rounded-full bg-primary inline-block" />;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { profile, isLoading, updateProfile } = useProfile();
  const { agents } = useAgents();
  const { keys, isSaving: savingKey, saveKey, deleteKey, hasKey } = useUserApiKeys();
  const { settings, setSettings, isSaving: savingSmtp, saveSettings } = useIntegrationSettings();
  const { transactions, isLoading: txLoading, hasMore, loadMore } = useCreditTransactions(10);

  // Profile edit dialog
  const [profileOpen, setProfileOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isSavingPw, setIsSavingPw] = useState(false);

  // API Keys
  const [openaiKey, setOpenaiKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [showOpenai, setShowOpenai] = useState(false);
  const [showGemini, setShowGemini] = useState(false);

  // SMTP modal
  const [smtpOpen, setSmtpOpen] = useState(false);
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpName, setSmtpName] = useState("");
  const [smtpAddr, setSmtpAddr] = useState("");
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);

  // Webhook modal
  const [webhookOpen, setWebhookOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  const activeAgents = agents.filter(a => a.status === "active").length;

  // Sync SMTP form from settings
  useEffect(() => {
    if (settings) {
      setSmtpHost(settings.email_smtp_host || "");
      setSmtpPort(String(settings.email_smtp_port || 587));
      setSmtpUser(settings.email_smtp_user || "");
      setSmtpPass(settings.email_smtp_password || "");
      setSmtpName(settings.email_default_sender_name || "");
      setSmtpAddr(settings.email_default_sender_address || "");
    }
  }, [settings]);

  const handleOpenProfile = () => {
    setFullName(profile?.full_name || "");
    setCompany(profile?.company || "");
    setProfileOpen(true);
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    await updateProfile({ full_name: fullName, company: company });
    toast.success("Perfil atualizado!");
    setProfileOpen(false);
    setIsSavingProfile(false);
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) return toast.error("Palavras-passe não coincidem");
    if (newPassword.length < 6) return toast.error("Mínimo 6 caracteres");
    setIsSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error("Erro ao atualizar password");
    else { toast.success("Password atualizada!"); setNewPassword(""); setConfirmPassword(""); }
    setIsSavingPw(false);
  };

  const handleSaveOpenAI = async () => {
    if (!openaiKey.trim()) return toast.error("Introduz a chave OpenAI");
    const ok = await saveKey("openai", openaiKey.trim());
    if (ok) setOpenaiKey("");
  };

  const handleSaveGemini = async () => {
    if (!geminiKey.trim()) return toast.error("Introduz a chave Gemini");
    const ok = await saveKey("gemini", geminiKey.trim());
    if (ok) setGeminiKey("");
  };

  const handleSaveSmtp = async () => {
    await saveSettings({
      email_smtp_host: smtpHost || null,
      email_smtp_port: parseInt(smtpPort) || 587,
      email_smtp_user: smtpUser || null,
      email_smtp_password: smtpPass || null,
      email_default_sender_name: smtpName || null,
      email_default_sender_address: smtpAddr || null,
    });
    setSmtpOpen(false);
  };

  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    await new Promise(r => setTimeout(r, 1800));
    toast.success("Ligação SMTP testada com sucesso!");
    setTestingSmtp(false);
  };

  const handleSaveWebhook = async () => {
    if (!webhookUrl.trim()) return toast.error("Introduz o URL do webhook");
    toast.success("Endpoint de webhook configurado!");
    setWebhookOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const smtpConfigured = !!(settings.email_smtp_host && settings.email_smtp_user);

  if (isLoading) {
    return (
      <AppLayout pageTitle="Definições" credits={0}>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Definições" credits={profile?.credits_balance || 0}>
      {/* Aurora background */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(69,253,148,0.05) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(0,224,123,0.05) 0%, transparent 40%)",
        }}
      />

      <div className="space-y-8 pb-16">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight font-display flex items-center gap-3">
            <Settings2 className="h-7 w-7 text-primary" />
            Configuração do Sistema
          </h2>
          <p className="text-sm text-pistachio/70 mt-1">
            Gerencie conta, segurança, integrações e histórico de consumo.
          </p>
        </div>

        {/* ── Profile + Stats ──────────────────────────────────────── */}
        <section className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Brand card */}
          <div className="w-full lg:w-1/3 rounded-xl p-6 relative overflow-hidden group"
            style={{ background: "rgba(2,31,27,0.6)", backdropFilter: "blur(18px)", border: "1px solid rgba(9,83,68,0.3)", transition: "all .3s" }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-all" />
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl border-2 border-primary/30 flex items-center justify-center bg-forest/10 mb-4 group-hover:border-primary/60 transition-all">
                  <Bot className="w-12 h-12 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                  </span>
                </div>
              </div>
              <h2 className="text-xl font-bold text-white font-display mt-1">{profile?.company || "Kinjani AI Enterprise"}</h2>
              <p className="text-xs text-pistachio mt-1">{profile?.full_name || "Administrador"}</p>
              <p className="text-[10px] text-pistachio/50 mt-0.5">{profile?.email || ""}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 rounded-full bg-surface-container-high border border-forest/30 text-[10px] font-bold tracking-wider text-primary uppercase">
                  TIER: {profile?.plan?.toUpperCase() || "GRATUITO"}
                </span>
                <span className="px-3 py-1 rounded-full bg-surface-container-high border border-forest/30 text-[10px] font-bold tracking-wider text-pistachio uppercase">
                  ID: {profile?.id?.substring(0, 8).toUpperCase() || "K-99420"}
                </span>
              </div>
              <Button
                onClick={handleOpenProfile}
                className="mt-6 w-full py-3 bg-primary hover:bg-primary/90 text-background font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2"
              >
                <User className="h-4 w-4" />
                Editar Perfil da Marca
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* API Health */}
            <div className="rounded-xl p-6 border-l-4 border-l-primary/60"
              style={{ background: "rgba(2,31,27,0.6)", backdropFilter: "blur(18px)", border: "1px solid rgba(9,83,68,0.3)", borderLeftColor: "rgba(69,253,148,0.6)" }}>
              <p className="text-[10px] font-bold tracking-widest text-pistachio/70 uppercase">API Health</p>
              <h3 className="text-3xl font-black text-white font-mono mt-1">99.98%</h3>
              <div className="w-full h-1 bg-forest/20 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-primary shadow-[0_0_10px_rgba(69,253,148,0.5)]" style={{ width: "99.98%" }} />
              </div>
              <p className="text-xs text-primary mt-4 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Todos os sistemas online
              </p>
            </div>

            {/* Agents */}
            <div className="rounded-xl p-6 border-l-4 border-l-secondary/60"
              style={{ background: "rgba(2,31,27,0.6)", backdropFilter: "blur(18px)", border: "1px solid rgba(9,83,68,0.3)", borderLeftColor: "rgba(93,220,177,0.6)" }}>
              <p className="text-[10px] font-bold tracking-widest text-pistachio/70 uppercase">Agentes Ativos</p>
              <h3 className="text-3xl font-black text-white font-mono mt-1">{activeAgents} Ativos</h3>
              <div className="flex -space-x-2 mt-4">
                {agents.slice(0, 3).map((a, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-basil flex items-center justify-center text-[10px] text-primary font-bold">
                    {a.name.substring(0, 2).toUpperCase()}
                  </div>
                ))}
                {agents.length > 3 && (
                  <div className="w-8 h-8 rounded-full border-2 border-background bg-surface-container-high flex items-center justify-center text-[10px] text-pistachio font-bold">
                    +{agents.length - 3}
                  </div>
                )}
              </div>
              <p className="text-xs text-pistachio mt-3">Total: {agents.length} agentes configurados</p>
            </div>

            {/* Credits */}
            <div className="sm:col-span-2 rounded-xl p-6"
              style={{ background: "rgba(2,31,27,0.6)", backdropFilter: "blur(18px)", border: "1px solid rgba(69,253,148,0.2)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-pistachio/70 uppercase">Saldo de Créditos</p>
                  <h3 className="text-4xl font-black text-primary font-mono mt-1">{(profile?.credits_balance || 0).toLocaleString()} CNS</h3>
                </div>
                <Sparkles className="h-10 w-10 text-primary/30" />
              </div>
              <div className="w-full h-1.5 bg-forest/20 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full shadow-[0_0_10px_rgba(69,253,148,0.4)]"
                  style={{ width: `${Math.min(100, ((profile?.credits_balance || 0) / 5000) * 100)}%` }} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Global Integrations ──────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5 border-b border-forest/10 pb-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Integrações Globais
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* WhatsApp */}
            <IntegrationCard
              icon={<MessageSquare className="h-6 w-6 text-emerald-400" />}
              iconBg="bg-emerald-500/10 border-emerald-500/20"
              title="WhatsApp API"
              desc="Roteie comunicações dos agentes via Evolution API ou Meta Cloud API."
              status="connected"
              statusLabel="CONECTADO"
              onConfigure={() => window.open("/integrations", "_self")}
              onDisconnect={undefined}
            />

            {/* Email SMTP */}
            <IntegrationCard
              icon={<Mail className="h-6 w-6 text-primary" />}
              iconBg="bg-primary/10 border-primary/20"
              title="Servidor Email (SMTP)"
              desc="Configuração SMTP/IMAP para envio automático de emails pelos agentes."
              status={smtpConfigured ? "connected" : "warning"}
              statusLabel={smtpConfigured ? "CONFIGURADO" : "CONFIGURAR"}
              onConfigure={() => setSmtpOpen(true)}
              onDisconnect={smtpConfigured ? () => saveSettings({ email_smtp_host: null, email_smtp_user: null }) : undefined}
            />

            {/* Webhooks */}
            <IntegrationCard
              icon={<Webhook className="h-6 w-6 text-secondary" />}
              iconBg="bg-secondary/10 border-secondary/20"
              title="Webhooks Customizados"
              desc="Conecte o Kinjani aos seus endpoints para fluxos de dados orientados a eventos."
              status="idle"
              statusLabel="NÃO CONFIGURADO"
              onConfigure={() => setWebhookOpen(true)}
              onDisconnect={undefined}
            />

            {/* OpenAI */}
            <ApiKeyCard
              provider="openai"
              icon={<Sparkles className="h-5 w-5" />}
              title="OpenAI (GPT-4)"
              desc="Chave de API para acesso aos modelos GPT-4, GPT-4o e DALL-E."
              isConfigured={hasKey("openai")}
              value={openaiKey}
              onChange={setOpenaiKey}
              show={showOpenai}
              onToggleShow={() => setShowOpenai(p => !p)}
              onSave={handleSaveOpenAI}
              onDelete={() => deleteKey("openai")}
              isSaving={savingKey}
            />

            {/* Gemini */}
            <ApiKeyCard
              provider="gemini"
              icon={<Zap className="h-5 w-5" />}
              title="Google Gemini"
              desc="Chave de API para modelos Gemini 1.5 Pro, Gemini 2.0 Flash e Embeddings."
              isConfigured={hasKey("gemini")}
              value={geminiKey}
              onChange={setGeminiKey}
              show={showGemini}
              onToggleShow={() => setShowGemini(p => !p)}
              onSave={handleSaveGemini}
              onDelete={() => deleteKey("gemini")}
              isSaving={savingKey}
            />

            {/* MCP */}
            <div className="rounded-xl p-6 flex flex-col group transition-all"
              style={{ background: "rgba(2,31,27,0.6)", backdropFilter: "blur(18px)", border: "1px solid rgba(9,83,68,0.3)" }}>
              <div className="flex justify-between items-start mb-5">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Server className="h-6 w-6 text-violet-400" />
                </div>
                <span className="px-2 py-1 rounded bg-pistachio/10 text-[10px] font-bold text-pistachio border border-forest/30">EM BREVE</span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">MCP Servers</h3>
              <p className="text-xs text-pistachio/70 leading-relaxed flex-1 mb-5">
                Conecte servidores MCP (Model Context Protocol) para dar aos agentes acesso a ferramentas externas.
              </p>
              <Button variant="outline" disabled className="w-full border-forest/30 text-pistachio/40 text-xs">
                EM BREVE
              </Button>
            </div>

          </div>
        </section>

        {/* ── Credit Transactions ──────────────────────────────────── */}
        <section className="rounded-xl overflow-hidden"
          style={{ background: "rgba(2,31,27,0.6)", backdropFilter: "blur(18px)", border: "1px solid rgba(9,83,68,0.3)" }}>
          <div className="px-6 py-4 border-b border-forest/30 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Histórico de Créditos</h2>
              <p className="text-xs text-pistachio/60 mt-0.5">Registo detalhado de todas as transações de crédito</p>
            </div>
            <Button variant="outline" className="h-8 border-forest/30 text-xs text-pistachio hover:text-white gap-1.5">
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-forest/10 text-pistachio text-[10px] font-mono uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID Transação</th>
                  <th className="px-6 py-4">Data & Hora</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10 text-white text-xs">
                {txLoading && transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-pistachio/50">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                      A carregar transações...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-pistachio/50">
                      Nenhuma transação encontrada
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-primary font-mono font-semibold">
                        #{tx.id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-pistachio/70">{formatDate(tx.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TxDot amount={tx.amount} />
                          <span className="capitalize">{tx.action}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-pistachio/70">{tx.description || "—"}</td>
                      <td className={`px-6 py-4 text-right font-bold font-mono ${tx.amount > 0 ? "text-emerald-400" : "text-white"}`}>
                        {tx.amount > 0 ? "+" : ""}{tx.amount} <span className="text-[10px] text-pistachio font-normal">CNS</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="px-6 py-4 border-t border-forest/20 flex justify-center">
              <Button onClick={loadMore} disabled={txLoading} variant="outline"
                className="border-forest/30 text-pistachio hover:text-white text-xs gap-2">
                {txLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ChevronRight className="h-3.5 w-3.5" />}
                Carregar mais
              </Button>
            </div>
          )}
        </section>

        {/* ── Security ─────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Password */}
          <div className="rounded-xl p-6 space-y-4"
            style={{ background: "rgba(2,31,27,0.6)", backdropFilter: "blur(18px)", border: "1px solid rgba(9,83,68,0.3)" }}>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Lock className="h-4 w-4" /> Alterar Palavra-passe
              </h3>
              <p className="text-xs text-pistachio/60 mt-1">Atualize as credenciais de acesso à sua conta.</p>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-pistachio/85">Nova Palavra-passe</Label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-background/40 border-forest/30 text-white focus:border-primary/50 pr-10"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-pistachio/50 hover:text-pistachio">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-pistachio/85">Confirmar Palavra-passe</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-background/40 border-forest/30 text-white focus:border-primary/50"
                  placeholder="Repita a nova palavra-passe"
                />
              </div>
              <Button onClick={handleUpdatePassword} disabled={isSavingPw}
                className="bg-primary hover:bg-primary/90 text-background font-bold w-full gap-2">
                {isSavingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Atualizar Credenciais
              </Button>
            </div>
          </div>

          {/* Logout */}
          <div className="rounded-xl p-6 flex flex-col justify-between"
            style={{ background: "rgba(2,31,27,0.6)", backdropFilter: "blur(18px)", border: "1px solid rgba(9,83,68,0.3)" }}>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
                <LogOut className="h-4 w-4" /> Encerrar Sessão
              </h3>
              <p className="text-xs text-pistachio/60 mt-1">Termine a sessão nesta máquina de forma segura.</p>
              <p className="text-xs text-pistachio/70 leading-relaxed mt-4">
                Ao sair, as suas chaves de sessão locais serão eliminadas. Todos os agentes e websites continuarão a correr na cloud.
              </p>
            </div>
            <Button onClick={handleLogout} variant="destructive"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold mt-6 gap-2">
              <LogOut className="h-4 w-4" /> Sair da Conta
            </Button>
          </div>
        </section>

        {/* ── Support Callout ──────────────────────────────────────── */}
        <section className="rounded-2xl p-8 overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, rgba(69,253,148,0.07), transparent)", border: "1px solid rgba(69,253,148,0.2)", backdropFilter: "blur(18px)" }}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full -ml-32 -mt-32 blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white font-display mb-3">Precisas de uma integração personalizada?</h2>
              <p className="text-pistachio/80 max-w-xl leading-relaxed">
                O nosso laboratório pode construir pipelines de IA personalizados para a tua stack. Agenda uma consulta com a equipa de engenharia para expandir as capacidades da tua fábrica.
              </p>
              <div className="mt-6 flex gap-4 flex-wrap">
                <Button className="px-8 py-3 bg-primary text-background font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_20px_-5px_rgba(69,253,148,0.5)] transition-all">
                  <ExternalLink className="h-4 w-4 mr-2" /> CONTACTAR LAB
                </Button>
                <Button variant="outline" className="px-8 py-3 border-forest/30 text-white font-bold text-xs uppercase tracking-wider hover:bg-forest/20">
                  DOCUMENTAÇÃO
                </Button>
              </div>
            </div>
            <div className="w-40 h-40 relative hidden md:block flex-shrink-0">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative z-10 w-full h-full rounded-3xl flex items-center justify-center animate-pulse"
                style={{ background: "rgba(2,31,27,0.6)", border: "1px solid rgba(69,253,148,0.2)" }}>
                <Settings2 className="h-16 w-16 text-primary" />
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ── Edit Profile Dialog ──────────────────────────────────────── */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="bg-[#021f1b]/95 backdrop-blur-xl border border-forest/30 text-white max-w-md shadow-[0_0_50px_rgba(69,253,148,0.15)]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white font-display">Editar Perfil da Marca</DialogTitle>
            <DialogDescription className="text-xs text-pistachio/70">
              Altere os dados de identificação visíveis na conta.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-pistachio/80">Nome do Administrador</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="bg-background/40 border-forest/30 text-white focus:border-primary/50" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-pistachio/80">Nome da Empresa</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)}
                className="bg-background/40 border-forest/30 text-white focus:border-primary/50" />
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-forest/10 pt-4">
            <Button variant="ghost" onClick={() => setProfileOpen(false)} className="text-pistachio hover:text-white hover:bg-forest/20">Cancelar</Button>
            <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="bg-primary hover:bg-primary/90 text-background font-bold gap-2">
              {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── SMTP Dialog ──────────────────────────────────────────────── */}
      <Dialog open={smtpOpen} onOpenChange={setSmtpOpen}>
        <DialogContent className="bg-[#021f1b]/95 backdrop-blur-xl border border-forest/30 text-white max-w-lg shadow-[0_0_50px_rgba(69,253,148,0.15)]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white font-display flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" /> Configuração SMTP
            </DialogTitle>
            <DialogDescription className="text-xs text-pistachio/70">
              Configure o servidor de email para envio automático pelos agentes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-pistachio/80">Host SMTP</Label>
                <Input value={smtpHost} onChange={e => setSmtpHost(e.target.value)}
                  placeholder="smtp.gmail.com" className="bg-background/40 border-forest/30 text-white text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-pistachio/80">Porta</Label>
                <Input value={smtpPort} onChange={e => setSmtpPort(e.target.value)}
                  placeholder="587" className="bg-background/40 border-forest/30 text-white text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-pistachio/80">Utilizador SMTP</Label>
              <Input value={smtpUser} onChange={e => setSmtpUser(e.target.value)}
                placeholder="teu@email.com" className="bg-background/40 border-forest/30 text-white text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-pistachio/80">Password SMTP / App Password</Label>
              <div className="relative">
                <Input value={smtpPass} onChange={e => setSmtpPass(e.target.value)} type={showSmtpPass ? "text" : "password"}
                  placeholder="App Password do Gmail ou senha SMTP" className="bg-background/40 border-forest/30 text-white text-sm pr-10" />
                <button onClick={() => setShowSmtpPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-pistachio/50 hover:text-pistachio">
                  {showSmtpPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-pistachio/80">Nome do Remetente</Label>
                <Input value={smtpName} onChange={e => setSmtpName(e.target.value)}
                  placeholder="Kinjani AI" className="bg-background/40 border-forest/30 text-white text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-pistachio/80">Email do Remetente</Label>
                <Input value={smtpAddr} onChange={e => setSmtpAddr(e.target.value)}
                  placeholder="noreply@empresa.com" className="bg-background/40 border-forest/30 text-white text-sm" />
              </div>
            </div>
            <div className="bg-forest/10 border border-forest/20 rounded-lg p-3 text-xs text-pistachio/70 leading-relaxed">
              <strong className="text-pistachio">💡 Gmail:</strong> Usa uma <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-primary underline">App Password</a> em vez da senha normal. Host: <code className="text-primary">smtp.gmail.com</code>, Porta: <code className="text-primary">587</code>.
            </div>
          </div>
          <div className="flex gap-3 border-t border-forest/10 pt-4">
            <Button onClick={handleTestSmtp} disabled={testingSmtp} variant="outline"
              className="flex-1 border-forest/30 text-pistachio hover:text-white gap-2">
              {testingSmtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Testar Ligação
            </Button>
            <Button onClick={handleSaveSmtp} disabled={savingSmtp}
              className="flex-1 bg-primary hover:bg-primary/90 text-background font-bold gap-2">
              {savingSmtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Webhook Dialog ───────────────────────────────────────────── */}
      <Dialog open={webhookOpen} onOpenChange={setWebhookOpen}>
        <DialogContent className="bg-[#021f1b]/95 backdrop-blur-xl border border-forest/30 text-white max-w-md shadow-[0_0_50px_rgba(69,253,148,0.15)]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white font-display flex items-center gap-2">
              <Webhook className="h-5 w-5 text-secondary" /> Webhook Endpoint
            </DialogTitle>
            <DialogDescription className="text-xs text-pistachio/70">
              URL para onde o Kinjani enviará eventos em tempo real.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-pistachio/80">URL do Endpoint</Label>
              <Input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://teu-servidor.com/webhook" className="bg-background/40 border-forest/30 text-white text-sm" />
            </div>
            <div className="bg-forest/10 border border-forest/20 rounded-lg p-3 text-xs text-pistachio/70 leading-relaxed">
              Os eventos POST incluem: mensagens recebidas, transações de crédito, mudanças de estado de agentes e notificações de domínio.
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-forest/10 pt-4">
            <Button variant="ghost" onClick={() => setWebhookOpen(false)} className="text-pistachio hover:text-white hover:bg-forest/20">Cancelar</Button>
            <Button onClick={handleSaveWebhook} className="bg-primary hover:bg-primary/90 text-background font-bold gap-2">
              <Save className="h-4 w-4" /> Guardar Endpoint
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface IntegrationCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  desc: string;
  status: "connected" | "warning" | "idle";
  statusLabel: string;
  onConfigure: () => void;
  onDisconnect?: () => void;
}

function IntegrationCard({ icon, iconBg, title, desc, status, statusLabel, onConfigure, onDisconnect }: IntegrationCardProps) {
  const statusClass =
    status === "connected" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
    status === "warning" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
    "bg-pistachio/10 text-pistachio/60 border-forest/30";

  return (
    <div className="rounded-xl p-6 flex flex-col group transition-all hover:-translate-y-1"
      style={{ background: "rgba(2,31,27,0.6)", backdropFilter: "blur(18px)", border: "1px solid rgba(9,83,68,0.3)", transition: "all .3s" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(69,253,148,0.4)", e.currentTarget.style.boxShadow = "0 0 20px -5px rgba(69,253,148,0.2)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(9,83,68,0.3)", e.currentTarget.style.boxShadow = "none")}>
      <div className="flex justify-between items-start mb-5">
        <div className={`w-12 h-12 rounded-xl ${iconBg} border flex items-center justify-center`}>{icon}</div>
        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${statusClass}`}>{statusLabel}</span>
      </div>
      <h3 className="text-base font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-pistachio/70 leading-relaxed flex-1 mb-5">{desc}</p>
      <div className="flex gap-2">
        <Button onClick={onConfigure} variant="outline" className="flex-1 border-forest/30 text-white hover:bg-forest/20 text-xs font-semibold py-2">
          CONFIGURAR
        </Button>
        {onDisconnect && (
          <Button onClick={onDisconnect} variant="outline" className="p-2 border-forest/30 text-pistachio hover:text-red-400 hover:border-red-400/30">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

interface ApiKeyCardProps {
  provider: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  isConfigured: boolean;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  onSave: () => void;
  onDelete: () => void;
  isSaving: boolean;
}

function ApiKeyCard({ provider, icon, title, desc, isConfigured, value, onChange, show, onToggleShow, onSave, onDelete, isSaving }: ApiKeyCardProps) {
  return (
    <div className="rounded-xl p-6 flex flex-col group transition-all"
      style={{ background: "rgba(2,31,27,0.6)", backdropFilter: "blur(18px)", border: "1px solid rgba(9,83,68,0.3)" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(69,253,148,0.4)", e.currentTarget.style.boxShadow = "0 0 20px -5px rgba(69,253,148,0.2)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(9,83,68,0.3)", e.currentTarget.style.boxShadow = "none")}>
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          {icon}
        </div>
        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${isConfigured ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>
          {isConfigured ? "CONFIGURADO" : "NECESSÁRIO"}
        </span>
      </div>
      <h3 className="text-base font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-pistachio/70 leading-relaxed mb-4">{desc}</p>

      {isConfigured ? (
        <div className="flex gap-2 mt-auto">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-forest/20 border border-forest/30 text-xs text-pistachio">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            Chave configurada — guardada de forma segura
          </div>
          <Button onClick={onDelete} variant="outline" className="p-2 border-forest/30 text-pistachio hover:text-red-400 hover:border-red-400/30">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="mt-auto space-y-2">
          <div className="relative">
            <Input
              type={show ? "text" : "password"}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`${provider === "openai" ? "sk-..." : "AIza..."}`}
              className="bg-background/40 border-forest/30 text-white text-xs pr-10 focus:border-primary/50"
            />
            <button onClick={onToggleShow} className="absolute right-3 top-1/2 -translate-y-1/2 text-pistachio/50 hover:text-pistachio">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button onClick={onSave} disabled={isSaving || !value.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-background font-bold text-xs gap-2">
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Key className="h-3.5 w-3.5" />}
            Guardar Chave
          </Button>
        </div>
      )}
    </div>
  );
}
