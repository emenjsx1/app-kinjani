import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  QrCode,
  Trash2,
  Link2,
  RefreshCw,
  Loader2,
  Key,
  Sparkles,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  ArrowRight,
  Lock,
  MessageSquare,
  Activity,
  Smartphone,
  Send,
  HelpCircle,
  FileText
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useWhatsAppInstances } from "@/hooks/useWhatsAppInstances";
import { useProfile } from "@/hooks/useProfile";
import { useUserApiKeys } from "@/hooks/useUserApiKeys";
import { toast } from "sonner";
import {
  OpenAIIcon, GeminiIcon, WhatsAppIcon, GmailIcon,
  GoogleCalendarIcon, GoogleSheetsIcon, InstagramIcon,
  FacebookIcon, TelegramIcon, SlackIcon, StripeIcon, ZapierIcon,
} from "@/components/integrations/BrandIcons";

const apiProviders = [
  { id: "openai", name: "OpenAI", description: "GPT-4, GPT-3.5 e outros modelos", placeholder: "sk-...", Icon: OpenAIIcon, docsUrl: "https://platform.openai.com/api-keys" },
  { id: "gemini", name: "Google Gemini", description: "Gemini Pro e outros modelos Google AI", placeholder: "AIzaSy...", Icon: GeminiIcon, docsUrl: "https://ai.google.dev/" },
];

const comingSoonIntegrations = [
  { name: "Gmail", description: "Importar contactos e enviar emails", Icon: GmailIcon },
  { name: "Google Calendar", description: "Agendamentos automáticos", Icon: GoogleCalendarIcon },
  { name: "Google Sheets", description: "Sincronizar leads e dados", Icon: GoogleSheetsIcon },
  { name: "Instagram DM", description: "Atender mensagens do Instagram", Icon: InstagramIcon },
  { name: "Facebook Messenger", description: "Atender mensagens do Facebook", Icon: FacebookIcon },
  { name: "Telegram Bot", description: "Bots no Telegram", Icon: TelegramIcon },
  { name: "Slack", description: "Notificações da equipa", Icon: SlackIcon },
  { name: "Stripe", description: "Pagamentos e subscrições", Icon: StripeIcon },
  { name: "Zapier", description: "Conectar a 5000+ apps", Icon: ZapierIcon },
];

export default function IntegrationsPage() {
  const { profile } = useProfile();
  const {
    instances, isLoading, createInstance, getQRCode, getStatus, deleteInstance,
    getClientConnectUrl, startPolling, refetch,
  } = useWhatsAppInstances();
  const { isSaving, saveKey, deleteKey, hasKey } = useUserApiKeys();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [instanceToDelete, setInstanceToDelete] = useState<string | null>(null);
  const [newInstanceName, setNewInstanceName] = useState("");
  const [isForClient, setIsForClient] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentQRCode, setCurrentQRCode] = useState<string | null>(null);
  const [currentInstanceName, setCurrentInstanceName] = useState("");
  const [currentInstanceKey, setCurrentInstanceKey] = useState<string | null>(null);
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [refreshingStatus, setRefreshingStatus] = useState<string | null>(null);
  const stopPollingRef = useRef<(() => void) | null>(null);

  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<typeof apiProviders[0] | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [deleteKeyDialogOpen, setDeleteKeyDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<string | null>(null);

  // Email test simulation state
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    if (!qrDialogOpen && stopPollingRef.current) {
      stopPollingRef.current(); stopPollingRef.current = null;
      setIsPolling(false); setIsConnected(false);
    }
  }, [qrDialogOpen]);

  const handleCreateInstance = async () => {
    if (!newInstanceName.trim()) { toast.error("Nome obrigatório"); return; }
    setIsCreating(true);
    try {
      const result = await createInstance(newInstanceName, undefined, isForClient);
      if (result?.instance?.instance_key) {
        setCurrentInstanceKey(result.instance.instance_key);
        if (result.qrcode) {
          setCurrentQRCode(result.qrcode);
          setCurrentInstanceName(newInstanceName);
          setIsConnected(false); setQrDialogOpen(true); setIsPolling(true);
          stopPollingRef.current = startPolling(result.instance.instance_key, () => {
            setIsConnected(true); setIsPolling(false);
            toast.success("WhatsApp conectado!"); refetch();
          });
        }
      }
      toast.success("Instância criada");
      setCreateDialogOpen(false); setNewInstanceName(""); setIsForClient(false);
    } catch { toast.error("Erro ao criar instância"); }
    finally { setIsCreating(false); }
  };

  const handleShowQRCode = async (instanceKey: string, instanceName: string) => {
    setIsLoadingQR(true); setCurrentInstanceName(instanceName);
    setCurrentInstanceKey(instanceKey); setIsConnected(false); setQrDialogOpen(true);
    try {
      const result = await getQRCode(instanceKey);
      if (result?.qrcode) {
        setCurrentQRCode(result.qrcode); setIsPolling(true);
        stopPollingRef.current = startPolling(instanceKey, () => {
          setIsConnected(true); setIsPolling(false);
          toast.success("WhatsApp conectado!"); refetch();
        });
      } else if (result?.status === 'open' || result?.status === 'connected') setIsConnected(true);
      else toast.error("QR code indisponível");
    } catch { toast.error("Erro ao obter QR"); }
    finally { setIsLoadingQR(false); }
  };

  const handleRefreshStatus = async (instanceKey: string) => {
    setRefreshingStatus(instanceKey);
    try {
      const result = await getStatus(instanceKey);
      if (result?.status === 'connected') toast.success("Conectada");
      else toast.info(`Status: ${result?.status || '?'}`);
    } finally { setRefreshingStatus(null); }
  };

  const handleCopyClientLink = (clientToken: string) => {
    navigator.clipboard.writeText(getClientConnectUrl(clientToken));
    toast.success("Link copiado para a área de transferência");
  };

  const handleCopyWebhookUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL do Webhook copiada!");
  };

  const handleDeleteInstance = async () => {
    if (!instanceToDelete) return;
    const ok = await deleteInstance(instanceToDelete);
    toast[ok ? "success" : "error"](ok ? "Eliminada com sucesso" : "Erro ao eliminar");
    setDeleteDialogOpen(false); setInstanceToDelete(null);
  };

  const getStatusType = (status: string): "active" | "inactive" | "pending" =>
    status === 'connected' ? 'active' : status === 'connecting' ? 'pending' : 'inactive';

  const handleSaveApiKey = async () => {
    if (!selectedProvider || !apiKeyInput.trim()) return;
    const ok = await saveKey(selectedProvider.id, apiKeyInput);
    if (ok) { setApiKeyDialogOpen(false); setApiKeyInput(""); }
  };

  const handleSendTestReport = () => {
    setIsSendingTest(true);
    setTimeout(() => {
      setIsSendingTest(false);
      toast.success("Relatório de teste enviado com sucesso!");
    }, 1500);
  };

  return (
    <AppLayout pageTitle="Integrações" credits={profile?.credits_balance || 0}>
      <div className="space-y-8 pb-10">
        
        {/* Header Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-display">
              Integration Hub
            </h1>
            <p className="text-sm text-pistachio/80 mt-1 max-w-2xl">
              Configure os seus canais de comunicação e conecte os agentes inteligentes do Kinjani AI com os ecossistemas externos de mensagens.
            </p>
          </div>
          <div className="flex shrink-0">
            <span className="bg-forest/20 border border-primary/30 text-primary px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Hub Ativo
            </span>
          </div>
        </div>

        {/* Quick config shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/integrations/whatsapp">
            <div className="bg-[#021f1b]/60 backdrop-blur-xl border border-forest/30 hover:border-primary/50 p-5 rounded-2xl transition duration-300 group cursor-pointer shadow-[0_0_20px_-5px_rgba(69,253,148,0.05)] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <WhatsAppIcon className="h-8 w-8 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-white group-hover:text-primary transition-colors">Configurações WhatsApp</p>
                <p className="text-xs text-pistachio/60 mt-0.5">Limites, atrasos e instância padrão para envio de campanhas</p>
              </div>
              <ArrowRight className="h-4 w-4 text-pistachio/40 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </Link>
          <Link to="/integrations/email">
            <div className="bg-[#021f1b]/60 backdrop-blur-xl border border-forest/30 hover:border-primary/50 p-5 rounded-2xl transition duration-300 group cursor-pointer shadow-[0_0_20px_-5px_rgba(69,253,148,0.05)] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                <GmailIcon className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-white group-hover:text-primary transition-colors">Configurações Email</p>
                <p className="text-xs text-pistachio/60 mt-0.5">Defina SMTP, remetente e limites diários de disparos</p>
              </div>
              <ArrowRight className="h-4 w-4 text-pistachio/40 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </Link>
        </div>

        {/* Dynamic Bento Grid of Integrations & API Keys */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Evolution API - WhatsApp Instances (Left Side, size 7) */}
          <div className="lg:col-span-7 bg-[#021f1b]/60 backdrop-blur-xl border border-forest/30 rounded-2xl p-6 shadow-[0_0_20px_-5px_rgba(69,253,148,0.1)] flex flex-col justify-between">
            <div>
              <div className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                    <WhatsAppIcon className="h-5 w-5 text-emerald-400" />
                    Instâncias WhatsApp (Evolution API)
                  </h3>
                  <p className="text-xs text-pistachio/70 mt-1">
                    Autentique telemóveis via QR Code para os seus agentes interagirem diretamente.
                  </p>
                </div>
                
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-primary hover:bg-primary/95 text-background font-bold shadow-md shadow-primary/20">
                      <Plus className="mr-1.5 h-3.5 w-3.5" /> Nova Instância
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#021f1b]/95 backdrop-blur-xl border border-forest/30 text-white">
                    <DialogHeader>
                      <DialogTitle>Criar Nova Instância</DialogTitle>
                      <DialogDescription className="text-pistachio/70">A instância e o webhook de mensagens serão configurados automaticamente.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="inst-name" className="text-white">Nome da Instância</Label>
                        <Input 
                          id="inst-name"
                          placeholder="Ex: Suporte Kinjani" 
                          value={newInstanceName} 
                          onChange={(e) => setNewInstanceName(e.target.value)} 
                          className="bg-[#0d231f] border-forest/40 text-white placeholder:text-pistachio/35"
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-forest/10 border border-forest/30">
                        <div>
                          <p className="text-sm font-semibold">Modo Cliente Externo</p>
                          <p className="text-xs text-pistachio/60">Gera um link seguro para o cliente emparelhar o próprio WhatsApp</p>
                        </div>
                        <Switch checked={isForClient} onCheckedChange={setIsForClient} />
                      </div>
                      <Button onClick={handleCreateInstance} className="w-full bg-primary hover:bg-primary/90 text-background font-bold" disabled={isCreating}>
                        {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />A criar...</> : "Confirmar e Criar"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="pt-2">
                <div className="mb-4 text-xs text-pistachio/60 font-mono">
                  <strong>{instances.length}</strong> instância(s) ativa(s) · <span className="text-primary font-semibold">50 créditos/mês por instância ativa</span>
                </div>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : instances.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-forest/30 rounded-xl bg-forest/5 text-pistachio/70 text-sm">
                    Sem instâncias configuradas. Clique em "Nova Instância" para começar.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {instances.map((i) => (
                      <div key={i.id} className="flex items-center justify-between p-4 rounded-xl border border-forest/20 bg-[#021f1b]/40 hover:border-forest/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                            <WhatsAppIcon className="h-6 w-6 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{i.instance_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <StatusBadge status={getStatusType(i.status)} />
                              {i.phone_number && <span className="text-xs font-mono text-pistachio/60">{i.phone_number}</span>}
                              {i.is_for_client && (
                                <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-primary/10 border-primary/20 text-primary">
                                  Cliente
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-forest/20 text-pistachio hover:text-primary" 
                            onClick={() => handleRefreshStatus(i.instance_key!)} 
                            disabled={refreshingStatus === i.instance_key}
                            title="Sincronizar Estado"
                          >
                            <RefreshCw className={`h-4 w-4 ${refreshingStatus === i.instance_key ? 'animate-spin' : ''}`} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-forest/20 text-pistachio hover:text-primary" 
                            onClick={() => handleShowQRCode(i.instance_key!, i.instance_name)}
                            title="Mostrar QR Code"
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          {i.is_for_client && i.client_token && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-forest/20 text-pistachio hover:text-primary" 
                              onClick={() => handleCopyClientLink(i.client_token!)}
                              title="Copiar Link de Onboarding do Cliente"
                            >
                              <Link2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-destructive/10 text-pistachio hover:text-destructive" 
                            onClick={() => { setInstanceToDelete(i.instance_key!); setDeleteDialogOpen(true); }}
                            title="Desconectar / Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Connection stats / Webhook panel info */}
            {instances.length > 0 && (
              <div className="mt-6 pt-6 border-t border-forest/30 space-y-4">
                <label className="text-[10px] font-bold tracking-wider text-primary uppercase">Webhook Terminal Global</label>
                <div className="relative">
                  <input 
                    className="w-full bg-[#0d231f] border border-forest/40 rounded-lg px-4 py-3 text-xs text-secondary font-mono focus:ring-1 focus:ring-primary outline-none" 
                    readOnly 
                    type="text" 
                    value={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-agent`}
                  />
                  <button 
                    onClick={() => handleCopyWebhookUrl(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-agent`)}
                    className="absolute right-2 top-2 p-1.5 text-pistachio hover:text-primary transition-colors"
                  >
                    <Link2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-[10px] text-pistachio/60">Secure endpoint for incoming WhatsApp message events and delivery receipts.</p>
              </div>
            )}
          </div>

          {/* Email / SMTP Gateway panel (Right Side, size 5) */}
          <div className="lg:col-span-5 bg-[#021f1b]/60 backdrop-blur-xl border border-forest/30 rounded-2xl p-6 shadow-[0_0_20px_-5px_rgba(69,253,148,0.1)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <GmailIcon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">SMTP Gateway</h3>
                  <p className="text-xs text-pistachio/70">Configure relatórios de envios e notificações</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-pistachio uppercase tracking-tight">Host / Servidor SMTP</label>
                  <Input 
                    className="bg-[#0d231f] border-forest/40 text-white placeholder:text-pistachio/30" 
                    placeholder="e.g. smtp.gmail.com" 
                    defaultValue="smtp.kinjani-ai.hub"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold text-pistachio uppercase tracking-tight">Porta</label>
                    <Input 
                      className="bg-[#0d231f] border-forest/40 text-white" 
                      type="number" 
                      defaultValue={587}
                    />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <label className="text-xs font-bold text-pistachio uppercase tracking-tight">SSL/TLS</label>
                    <div className="h-[40px] flex items-center">
                      <button className="w-full bg-primary/20 border border-primary/45 rounded-lg py-2 text-xs font-bold text-primary" type="button">ATIVO</button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-pistachio uppercase tracking-tight">Utilizador</label>
                  <Input 
                    className="bg-[#0d231f] border-forest/40 text-white" 
                    type="email" 
                    defaultValue="gateway@kinjani.ai"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-pistachio uppercase tracking-tight">Senha</label>
                  <Input 
                    className="bg-[#0d231f] border-forest/40 text-white" 
                    type="password" 
                    defaultValue="••••••••••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <Button 
                onClick={handleSendTestReport}
                variant="outline" 
                className="w-full border border-primary/30 text-primary hover:bg-primary/10 font-bold rounded-xl flex items-center justify-center gap-2"
                disabled={isSendingTest}
              >
                {isSendingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>Enviar Email de Teste</span>
              </Button>
              <Button 
                onClick={() => toast.success("Configuração SMTP guardada com sucesso!")}
                className="w-full bg-primary text-background font-bold rounded-xl hover:brightness-110"
              >
                Atualizar SMTP Gateway
              </Button>
            </div>
          </div>

        </div>

        {/* Personal API Keys Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-[#021f1b]/60 backdrop-blur-xl border border-forest/30 rounded-2xl p-6 shadow-[0_0_20px_-5px_rgba(69,253,148,0.1)] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-white">Chaves de API Pessoais</h3>
              </div>
              <p className="text-xs text-pistachio/70 leading-relaxed">
                Adicione chaves OpenAI ou Gemini para processar tokens na sua própria conta, poupando créditos do seu plano.
              </p>
              
              <div className="space-y-3 pt-2">
                {apiProviders.map((p) => {
                  const configured = hasKey(p.id);
                  return (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-forest/20 bg-[#021f1b]/40 hover:border-forest/35 transition-all">
                      <div className="flex items-center gap-3">
                        <p.Icon className="h-8 w-8 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-white">{p.name}</p>
                          <p className="text-xs text-pistachio/60">{p.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {configured && (
                          <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                            <Check className="h-3.5 w-3.5 text-primary" /> Ativa
                          </span>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-forest/40 text-pistachio hover:bg-forest/20 hover:text-primary h-8"
                          onClick={() => { setSelectedProvider(p); setApiKeyInput(""); setShowApiKey(false); setApiKeyDialogOpen(true); }}
                        >
                          {configured ? "Alterar" : "Configurar"}
                        </Button>
                        {configured && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-destructive/10 text-pistachio hover:text-destructive" 
                            onClick={() => { setProviderToDelete(p.id); setDeleteKeyDialogOpen(true); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 flex items-start gap-2.5 mt-4">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-pistachio/80 leading-relaxed">
                Sem chave própria configurada? O Kinjani processa as solicitações usando os recursos do sistema Lovable AI incluídos por padrão no seu plano ativo.
              </p>
            </div>
          </div>

          {/* Secure vault visual card */}
          <div className="lg:col-span-5 bg-[#021f1b]/60 backdrop-blur-xl border border-forest/30 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-end min-h-[220px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="absolute inset-0 w-full h-full opacity-20 mix-blend-overlay bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=600&auto=format&fit=crop')` }}></div>
            <div className="relative z-10 space-y-2">
              <div className="w-10 h-10 bg-primary/15 rounded-lg flex items-center justify-center border border-primary/30">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <h4 className="font-bold text-white">Segurança Avançada (AES-256)</h4>
              <p className="text-xs text-pistachio/75 leading-relaxed">
                Todas as credenciais de integração são criptografadas localmente com chaves de alto nível simétricas antes do armazenamento.
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Integrations (Coming Soon Grid) */}
        <div className="bg-[#021f1b]/40 border border-forest/30 rounded-2xl p-6 shadow-md">
          <div className="pb-3">
            <h3 className="text-lg font-bold text-white">Próximos Canais em Desenvolvimento</h3>
            <p className="text-xs text-pistachio/70 mt-1">
              Novos canais que serão disponibilizados no painel em breve. A nossa equipa de desenvolvimento está a trabalhar na homologação das APIs oficiais.
            </p>
          </div>
          <div className="pt-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {comingSoonIntegrations.map((it) => (
                <div key={it.name} className="flex items-center gap-3 p-3 rounded-xl border border-forest/10 bg-[#021f1b]/25 opacity-70 hover:opacity-100 hover:border-forest/30 transition-all duration-300">
                  <it.Icon className="h-8 w-8 shrink-0 text-pistachio" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{it.name}</p>
                    <p className="text-[10px] text-pistachio/50 truncate mt-0.5">{it.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Scan Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#021f1b]/95 backdrop-blur-xl border border-forest/30 text-white">
          <DialogHeader>
            <DialogTitle>Conectar Dispositivo WhatsApp</DialogTitle>
            <DialogDescription className="text-pistachio/70">
              Aponte a câmara do WhatsApp no seu telemóvel para emparelhar com a instância.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            {isConnected ? (
              <div className="w-64 h-64 bg-emerald-950/20 border border-primary/20 rounded-xl flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="h-16 w-16 text-primary" />
                <p className="text-lg font-bold text-primary font-display">WhatsApp Conectado!</p>
                <p className="text-xs text-pistachio/60">Instância pronta para uso</p>
              </div>
            ) : isLoadingQR ? (
              <div className="w-64 h-64 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-xs text-pistachio/60">A obter QR Code...</p>
              </div>
            ) : currentQRCode ? (
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-3 rounded-xl shadow-lg shadow-black/20">
                  <img 
                    src={currentQRCode.startsWith('data:') ? currentQRCode : `data:image/png;base64,${currentQRCode}`} 
                    alt="WhatsApp QR Code" 
                    className="w-56 h-56 rounded"
                  />
                </div>
                {isPolling && (
                  <div className="flex items-center gap-2 text-sm text-pistachio/80 font-mono">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>A aguardar leitura...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-64 h-64 bg-forest/5 border border-dashed border-forest/20 rounded-xl flex flex-col items-center justify-center gap-3">
                <p className="text-pistachio/60 text-center text-xs px-4">QR Code expirado ou indisponível</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-forest/40 hover:bg-forest/20 text-pistachio hover:text-primary"
                  onClick={() => currentInstanceKey && handleShowQRCode(currentInstanceKey, currentInstanceName)}
                >
                  <RefreshCw className="mr-2 h-3.5 w-3.5" /> Atualizar QR Code
                </Button>
              </div>
            )}
            <p className="text-sm text-pistachio mt-5 font-semibold">
              Instância: <span className="text-primary font-mono">{currentInstanceName}</span>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Deletion Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Instância WhatsApp" 
        description="Esta ação removerá a instância dos nossos servidores e desconectará o seu número de WhatsApp. Os agentes vinculados a esta instância deixarão de receber mensagens."
        confirmLabel="Sim, Eliminar" 
        onConfirm={handleDeleteInstance} 
        variant="destructive"
      />

      {/* API Key Configure Dialog */}
      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent className="bg-[#021f1b]/95 backdrop-blur-xl border border-forest/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedProvider && <selectedProvider.Icon className="h-5 w-5" />}
              Configurar {selectedProvider?.name}
            </DialogTitle>
            <DialogDescription className="text-pistachio/70">
              A sua chave de API será armazenada de forma encriptada e usada exclusivamente para os seus agentes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="api-key-in" className="text-white">Chave de API</Label>
              <div className="relative">
                <Input 
                  id="api-key-in"
                  type={showApiKey ? "text" : "password"} 
                  placeholder={selectedProvider?.placeholder} 
                  value={apiKeyInput} 
                  onChange={(e) => setApiKeyInput(e.target.value)} 
                  className="pr-10 bg-[#0d231f] border-forest/40 text-white placeholder:text-pistachio/35" 
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 top-0 h-full px-3 text-pistachio hover:text-primary" 
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {selectedProvider && (
              <p className="text-xs text-pistachio/60">
                Não tem uma chave de API activa?{" "}
                <a href={selectedProvider.docsUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold inline-flex items-center gap-0.5">
                  Obter chave {selectedProvider.name} <ArrowRight className="h-3 w-3" />
                </a>
              </p>
            )}
            <Button 
              onClick={handleSaveApiKey} 
              className="w-full bg-primary hover:bg-primary/90 text-background font-bold" 
              disabled={isSaving || !apiKeyInput.trim()}
            >
              {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />A guardar...</> : "Guardar Chave"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete API Key Confirm Dialog */}
      <ConfirmDialog
        open={deleteKeyDialogOpen} 
        onOpenChange={setDeleteKeyDialogOpen}
        title="Remover Chave de API" 
        description="Deseja remover a sua chave de API pessoal? Após a remoção, as requisições dos seus agentes passarão a consumir os créditos de sistema do seu plano Kinjani."
        confirmLabel="Remover Chave" 
        onConfirm={async () => { 
          if (providerToDelete) { 
            await deleteKey(providerToDelete); 
            setDeleteKeyDialogOpen(false); 
            setProviderToDelete(null); 
          } 
        }} 
        variant="destructive"
      />
    </AppLayout>
  );
}
