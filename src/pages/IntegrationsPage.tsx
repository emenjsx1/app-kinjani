import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Plus, QrCode, Trash2, Link2, RefreshCw, Loader2, Key, Sparkles, Eye, EyeOff, Check, CheckCircle2, Settings, ArrowRight } from "lucide-react";
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
    toast.success("Link copiado");
  };

  const handleDeleteInstance = async () => {
    if (!instanceToDelete) return;
    const ok = await deleteInstance(instanceToDelete);
    toast[ok ? "success" : "error"](ok ? "Eliminada" : "Erro");
    setDeleteDialogOpen(false); setInstanceToDelete(null);
  };

  const getStatusType = (status: string): "active" | "inactive" | "pending" =>
    status === 'connected' ? 'active' : status === 'connecting' ? 'pending' : 'inactive';

  const handleSaveApiKey = async () => {
    if (!selectedProvider || !apiKeyInput.trim()) return;
    const ok = await saveKey(selectedProvider.id, apiKeyInput);
    if (ok) { setApiKeyDialogOpen(false); setApiKeyInput(""); }
  };

  return (
    <AppLayout pageTitle="Integrações" credits={profile?.credits_balance || 0}>
      <div className="space-y-4">

        {/* Quick config shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link to="/integrations/whatsapp">
            <Card className="hover:border-primary/60 transition group">
              <CardContent className="flex items-center gap-3 p-4">
                <WhatsAppIcon className="h-9 w-9" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Configurações WhatsApp</p>
                  <p className="text-xs text-muted-foreground">Limites, atrasos e instância padrão</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/integrations/email">
            <Card className="hover:border-primary/60 transition group">
              <CardContent className="flex items-center gap-3 p-4">
                <GmailIcon className="h-9 w-9" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Configurações Email</p>
                  <p className="text-xs text-muted-foreground">Remetente, destinatários e limites diários</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* API Keys — compact */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Chaves de API</CardTitle>
            </div>
            <CardDescription className="text-xs">Use as suas chaves OpenAI/Gemini para não consumir créditos Kinjani</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {apiProviders.map((p) => {
              const configured = hasKey(p.id);
              return (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <p.Icon className="h-7 w-7" />
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {configured && <span className="text-xs text-green-600 flex items-center gap-1"><Check className="h-3 w-3" />Ativa</span>}
                    <Button variant="outline" size="sm" onClick={() => { setSelectedProvider(p); setApiKeyInput(""); setShowApiKey(false); setApiKeyDialogOpen(true); }}>
                      {configured ? "Alterar" : "Configurar"}
                    </Button>
                    {configured && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setProviderToDelete(p.id); setDeleteKeyDialogOpen(true); }}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 px-1 pt-1">
              <Sparkles className="h-3 w-3 text-primary" />
              Sem chave própria? Usamos <strong>Lovable AI</strong> incluído no seu plano.
            </p>
          </CardContent>
        </Card>

        {/* WhatsApp — compact */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WhatsAppIcon className="h-5 w-5" />
                <CardTitle className="text-base">WhatsApp (Evolution API)</CardTitle>
              </div>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" />Nova Instância</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Instância</DialogTitle>
                    <DialogDescription>A instância e o webhook serão configurados automaticamente</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input placeholder="Ex: Atendimento" value={newInstanceName} onChange={(e) => setNewInstanceName(e.target.value)} />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">Modo Cliente</p>
                        <p className="text-xs text-muted-foreground">Gera link para cliente conectar</p>
                      </div>
                      <Switch checked={isForClient} onCheckedChange={setIsForClient} />
                    </div>
                    <Button onClick={handleCreateInstance} className="w-full" disabled={isCreating}>
                      {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />A criar...</> : "Criar"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="mb-3 text-xs text-muted-foreground">
              <strong>{instances.length}</strong> instância(s) ativa(s) ·{" "}
              <span className="text-foreground">50 créditos/mês por instância</span>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : instances.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Nenhuma instância. Clique em "Nova Instância" para começar.
              </div>
            ) : (
              <div className="space-y-2">
                {instances.map((i) => (
                  <div key={i.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <WhatsAppIcon className="h-7 w-7" />
                      <div>
                        <p className="text-sm font-medium">{i.instance_name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StatusBadge status={getStatusType(i.status)} />
                          {i.phone_number && <span className="text-xs text-muted-foreground">{i.phone_number}</span>}
                          {i.is_for_client && <Badge variant="outline" className="text-[10px] h-4 px-1.5">Cliente</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRefreshStatus(i.instance_key!)} disabled={refreshingStatus === i.instance_key}>
                        <RefreshCw className={`h-3.5 w-3.5 ${refreshingStatus === i.instance_key ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleShowQRCode(i.instance_key!, i.instance_name)}>
                        <QrCode className="h-3.5 w-3.5" />
                      </Button>
                      {i.is_for_client && i.client_token && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopyClientLink(i.client_token!)}>
                          <Link2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setInstanceToDelete(i.instance_key!); setDeleteDialogOpen(true); }}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Outras integrações — em breve */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Outras integrações</CardTitle>
            <CardDescription className="text-xs">Em breve — em desenvolvimento</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {comingSoonIntegrations.map((it) => (
                <div key={it.name} className="flex items-center gap-2.5 p-3 rounded-lg border bg-card opacity-70 hover:opacity-100 transition">
                  <it.Icon className="h-7 w-7 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium truncate">{it.name}</p>
                      <Badge variant="secondary" className="text-[9px] h-4 px-1">Em breve</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{it.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
            <DialogDescription>Aponte a câmera do WhatsApp para o QR code</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            {isConnected ? (
              <div className="w-64 h-64 bg-green-50 dark:bg-green-950/20 rounded-lg flex flex-col items-center justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-3" />
                <p className="text-lg font-medium text-green-700 dark:text-green-400">Conectado!</p>
              </div>
            ) : isLoadingQR ? <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            : currentQRCode ? (
              <div className="flex flex-col items-center">
                <img src={currentQRCode.startsWith('data:') ? currentQRCode : `data:image/png;base64,${currentQRCode}`} alt="QR" className="w-64 h-64 rounded-lg" />
                {isPolling && <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /><span>Aguardando...</span></div>}
              </div>
            ) : (
              <div className="w-64 h-64 bg-muted rounded-lg flex flex-col items-center justify-center gap-3">
                <p className="text-muted-foreground text-center px-4">QR indisponível</p>
                <Button variant="outline" size="sm" onClick={() => currentInstanceKey && handleShowQRCode(currentInstanceKey, currentInstanceName)}>
                  <RefreshCw className="mr-2 h-4 w-4" />Tentar
                </Button>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-4 text-center">Instância: <strong>{currentInstanceName}</strong></p>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}
        title="Eliminar Instância" description="A conexão WhatsApp será perdida."
        confirmLabel="Eliminar" onConfirm={handleDeleteInstance} variant="destructive"
      />

      {/* API Key Dialog */}
      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedProvider && <selectedProvider.Icon className="h-5 w-5" />}
              Configurar {selectedProvider?.name}
            </DialogTitle>
            <DialogDescription>A chave será guardada de forma segura</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Chave de API</Label>
              <div className="relative">
                <Input type={showApiKey ? "text" : "password"} placeholder={selectedProvider?.placeholder} value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)} className="pr-10" />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowApiKey(!showApiKey)}>
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Não tem chave? <a href={selectedProvider?.docsUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Obtenha aqui →</a>
            </p>
            <Button onClick={handleSaveApiKey} className="w-full" disabled={isSaving || !apiKeyInput.trim()}>
              {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />A guardar...</> : "Guardar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteKeyDialogOpen} onOpenChange={setDeleteKeyDialogOpen}
        title="Remover Chave" description="Os agentes passarão a usar Lovable AI."
        confirmLabel="Remover" onConfirm={async () => { if (providerToDelete) { await deleteKey(providerToDelete); setDeleteKeyDialogOpen(false); setProviderToDelete(null); } }} variant="destructive"
      />
    </AppLayout>
  );
}
