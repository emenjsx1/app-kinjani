import { useState } from "react";
import { MessageSquare, Plus, QrCode, Trash2, Copy, Link2, RefreshCw, Loader2, Key, Sparkles, Eye, EyeOff, Check, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useWhatsAppInstances } from "@/hooks/useWhatsAppInstances";
import { useProfile } from "@/hooks/useProfile";
import { useUserApiKeys } from "@/hooks/useUserApiKeys";
import { toast } from "sonner";

// API Key provider configurations
const apiProviders = [
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT-4, GPT-3.5 e outros modelos OpenAI",
    placeholder: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    icon: "🤖",
    docsUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Gemini Pro e outros modelos Google AI",
    placeholder: "AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxx",
    icon: "💎",
    docsUrl: "https://ai.google.dev/",
  },
];

export default function IntegrationsPage() {
  const { profile } = useProfile();
  const { 
    instances, 
    isLoading, 
    createInstance, 
    getQRCode, 
    getStatus, 
    deleteInstance,
    getClientConnectUrl 
  } = useWhatsAppInstances();

  const { keys, isLoading: isLoadingKeys, isSaving, saveKey, deleteKey, hasKey } = useUserApiKeys();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [instanceToDelete, setInstanceToDelete] = useState<string | null>(null);
  
  const [newInstanceName, setNewInstanceName] = useState("");
  const [isForClient, setIsForClient] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [currentQRCode, setCurrentQRCode] = useState<string | null>(null);
  const [currentInstanceName, setCurrentInstanceName] = useState("");
  const [isLoadingQR, setIsLoadingQR] = useState(false);

  // API Keys state
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<typeof apiProviders[0] | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [deleteKeyDialogOpen, setDeleteKeyDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<string | null>(null);

  const handleCreateInstance = async () => {
    if (!newInstanceName.trim()) {
      toast.error("Nome da instância é obrigatório");
      return;
    }

    setIsCreating(true);
    try {
      const result = await createInstance(newInstanceName, undefined, isForClient);
      
      if (result?.qrcode) {
        setCurrentQRCode(result.qrcode);
        setCurrentInstanceName(newInstanceName);
        setQrDialogOpen(true);
      }
      
      toast.success("Instância criada com sucesso!");
      setCreateDialogOpen(false);
      setNewInstanceName("");
      setIsForClient(false);
    } catch (error) {
      toast.error("Erro ao criar instância");
    } finally {
      setIsCreating(false);
    }
  };

  const handleShowQRCode = async (instanceKey: string, instanceName: string) => {
    setIsLoadingQR(true);
    setCurrentInstanceName(instanceName);
    setQrDialogOpen(true);

    try {
      const result = await getQRCode(instanceKey);
      if (result?.qrcode) {
        setCurrentQRCode(result.qrcode);
      } else {
        toast.error("Não foi possível obter o QR code");
      }
    } catch (error) {
      toast.error("Erro ao obter QR code");
    } finally {
      setIsLoadingQR(false);
    }
  };

  const handleRefreshStatus = async (instanceKey: string) => {
    const result = await getStatus(instanceKey);
    if (result?.status === 'connected') {
      toast.success("Instância conectada!");
    } else {
      toast.info(`Status: ${result?.status || 'desconhecido'}`);
    }
  };

  const handleCopyClientLink = (clientToken: string) => {
    const url = getClientConnectUrl(clientToken);
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência");
  };

  const handleDeleteInstance = async () => {
    if (!instanceToDelete) return;
    
    const success = await deleteInstance(instanceToDelete);
    if (success) {
      toast.success("Instância eliminada");
    } else {
      toast.error("Erro ao eliminar instância");
    }
    setDeleteDialogOpen(false);
    setInstanceToDelete(null);
  };

  const getStatusType = (status: string): "active" | "inactive" | "pending" => {
    switch (status) {
      case 'connected': return 'active';
      case 'connecting': return 'pending';
      default: return 'inactive';
    }
  };

  const handleOpenApiKeyDialog = (provider: typeof apiProviders[0]) => {
    setSelectedProvider(provider);
    setApiKeyInput("");
    setShowApiKey(false);
    setApiKeyDialogOpen(true);
  };

  const handleSaveApiKey = async () => {
    if (!selectedProvider || !apiKeyInput.trim()) return;
    const success = await saveKey(selectedProvider.id, apiKeyInput);
    if (success) {
      setApiKeyDialogOpen(false);
      setApiKeyInput("");
    }
  };

  const handleDeleteApiKey = async () => {
    if (!providerToDelete) return;
    await deleteKey(providerToDelete);
    setDeleteKeyDialogOpen(false);
    setProviderToDelete(null);
  };

  return (
    <AppLayout pageTitle="Integrações" credits={profile?.credits_balance || 0}>
      <div className="space-y-6">
        {/* API Keys Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Chaves de API Pessoais</CardTitle>
                <CardDescription>
                  Configure as suas próprias chaves de API para os modelos de IA
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {apiProviders.map((provider) => {
                const configured = hasKey(provider.id);
                return (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                        {provider.icon}
                      </div>
                      <div>
                        <p className="font-medium">{provider.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {provider.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {configured ? (
                        <>
                          <span className="text-sm text-green-600 flex items-center gap-1">
                            <Check className="h-4 w-4" />
                            Configurada
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenApiKeyDialog(provider)}
                          >
                            Alterar
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setProviderToDelete(provider.id);
                              setDeleteKeyDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => handleOpenApiKeyDialog(provider)}
                        >
                          <Key className="mr-2 h-4 w-4" />
                          Configurar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>
                  Se não configurar, usamos <strong>Lovable AI</strong> gratuitamente incluído no seu plano.
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Instances Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <CardTitle>WhatsApp (Evolution API)</CardTitle>
                  <CardDescription>
                    Crie instâncias WhatsApp para os seus agentes IA
                  </CardDescription>
                </div>
              </div>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Instância
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Instância WhatsApp</DialogTitle>
                    <DialogDescription>
                      A instância será criada e o webhook configurado automaticamente
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="instanceName">Nome da Instância</Label>
                      <Input
                        id="instanceName"
                        placeholder="Ex: Atendimento Principal"
                        value={newInstanceName}
                        onChange={(e) => setNewInstanceName(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">Modo Cliente</p>
                        <p className="text-sm text-muted-foreground">
                          Gera um link para o cliente conectar o WhatsApp dele
                        </p>
                      </div>
                      <Switch
                        checked={isForClient}
                        onCheckedChange={setIsForClient}
                      />
                    </div>
                    <Button 
                      onClick={handleCreateInstance} 
                      className="w-full"
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          A criar...
                        </>
                      ) : (
                        "Criar Instância"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : instances.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="Nenhuma instância WhatsApp"
                description="Crie a sua primeira instância para começar a usar os agentes no WhatsApp"
                action={{
                  label: "Criar Instância",
                  onClick: () => setCreateDialogOpen(true),
                }}
              />
            ) : (
              <div className="space-y-3">
                {instances.map((instance) => (
                  <div
                    key={instance.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">{instance.instance_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={getStatusType(instance.status)} />
                          {instance.phone_number && (
                            <span className="text-sm text-muted-foreground">
                              {instance.phone_number}
                            </span>
                          )}
                          {instance.is_for_client && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              Modo Cliente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRefreshStatus(instance.instance_key!)}
                        title="Atualizar status"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleShowQRCode(instance.instance_key!, instance.instance_name)}
                        title="Ver QR Code"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      {instance.is_for_client && instance.client_token && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopyClientLink(instance.client_token!)}
                          title="Copiar link do cliente"
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setInstanceToDelete(instance.instance_key!);
                          setDeleteDialogOpen(true);
                        }}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
            <DialogDescription>
              Aponte a câmera do WhatsApp para o QR code abaixo
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            {isLoadingQR ? (
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            ) : currentQRCode ? (
              <img 
                src={`data:image/png;base64,${currentQRCode}`} 
                alt="QR Code WhatsApp"
                className="w-64 h-64 rounded-lg"
              />
            ) : (
              <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground text-center">
                  QR code não disponível.<br />
                  Tente novamente.
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Instância: <strong>{currentInstanceName}</strong>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Instance Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Instância"
        description="Tem a certeza que deseja eliminar esta instância? A conexão WhatsApp será perdida."
        confirmLabel="Eliminar"
        onConfirm={handleDeleteInstance}
        variant="destructive"
      />

      {/* API Key Dialog */}
      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{selectedProvider?.icon}</span>
              Configurar {selectedProvider?.name}
            </DialogTitle>
            <DialogDescription>
              Introduza a sua chave de API. A chave será validada e guardada de forma segura.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Chave de API</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  placeholder={selectedProvider?.placeholder}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Não tem uma chave?{" "}
              <a
                href={selectedProvider?.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Obtenha aqui →
              </a>
            </p>
            <Button 
              onClick={handleSaveApiKey} 
              className="w-full"
              disabled={isSaving || !apiKeyInput.trim()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A validar e guardar...
                </>
              ) : (
                "Guardar Chave de API"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete API Key Confirmation Dialog */}
      <ConfirmDialog
        open={deleteKeyDialogOpen}
        onOpenChange={setDeleteKeyDialogOpen}
        title="Remover Chave de API"
        description="Tem a certeza que deseja remover esta chave de API? Os agentes passarão a usar Lovable AI."
        confirmLabel="Remover"
        onConfirm={handleDeleteApiKey}
        variant="destructive"
      />
    </AppLayout>
  );
}
