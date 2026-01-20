import { useState } from "react";
import { MessageSquare, Plus, QrCode, Trash2, Copy, Link2, RefreshCw, Loader2 } from "lucide-react";
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
import { toast } from "sonner";

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

  return (
    <AppLayout pageTitle="Integrações" credits={profile?.credits_balance || 0}>
      <div className="space-y-6">
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Instância"
        description="Tem a certeza que deseja eliminar esta instância? A conexão WhatsApp será perdida."
        confirmLabel="Eliminar"
        onConfirm={handleDeleteInstance}
        variant="destructive"
      />
    </AppLayout>
  );
}
