import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MessageSquare, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ClientConnectPage() {
  const { token } = useParams<{ token: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instanceName, setInstanceName] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchQRCode = async () => {
    if (!token) {
      setError("Token inválido");
      setIsLoading(false);
      return;
    }

    try {
      const supabaseUrl = 'https://mpxsivfiltwvnvqtixuo.supabase.co';
      const response = await fetch(
        `${supabaseUrl}/functions/v1/whatsapp-instance?action=client-connect&token=${token}`
      );

      if (!response.ok) {
        throw new Error("Link inválido ou expirado");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setInstanceName(data.instance?.name || "WhatsApp");
      setQrCode(data.qrcode);
      
      if (data.instance?.status === 'connected') {
        setIsConnected(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCode();
  }, [token]);

  // Poll for connection status
  useEffect(() => {
    if (isConnected || error) return;

    const interval = setInterval(async () => {
      try {
        const supabaseUrl = 'https://mpxsivfiltwvnvqtixuo.supabase.co';
        const response = await fetch(
          `${supabaseUrl}/functions/v1/whatsapp-instance?action=client-connect&token=${token}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.instance?.status === 'connected') {
            setIsConnected(true);
          }
        }
      } catch (e) {
        // Ignore polling errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [token, isConnected, error]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">A carregar...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erro</h2>
            <p className="text-muted-foreground text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">WhatsApp Conectado!</h2>
            <p className="text-muted-foreground text-center">
              A sua conta WhatsApp foi conectada com sucesso.
              <br />
              Pode fechar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle>Conectar WhatsApp</CardTitle>
          <CardDescription>
            Aponte a câmera do seu WhatsApp para o QR code abaixo
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {qrCode ? (
            <img 
              src={`data:image/png;base64,${qrCode}`} 
              alt="QR Code WhatsApp"
              className="w-64 h-64 rounded-lg mb-4"
            />
          ) : (
            <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center mb-4">
              <p className="text-muted-foreground text-center px-4">
                QR code não disponível. Tente atualizar a página.
              </p>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground text-center mb-4">
            <strong>{instanceName}</strong>
          </p>

          <div className="text-sm text-muted-foreground text-center space-y-2">
            <p>1. Abra o WhatsApp no seu telefone</p>
            <p>2. Toque em Configurações → Aparelhos conectados</p>
            <p>3. Toque em "Conectar um aparelho"</p>
            <p>4. Aponte a câmera para este QR code</p>
          </div>

          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => {
              setIsLoading(true);
              fetchQRCode();
            }}
          >
            Atualizar QR Code
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
