import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MessageSquare, Loader2, CheckCircle2, XCircle, ShieldCheck, QrCode, RefreshCw } from "lucide-react";
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
      setError("Link ou token de acesso inválido.");
      setIsLoading(false);
      return;
    }

    try {
      const supabaseUrl = 'https://mpxsivfiltwvnvqtixuo.supabase.co';
      const response = await fetch(
        `${supabaseUrl}/functions/v1/whatsapp-instance?action=client-connect&token=${token}`
      );

      if (!response.ok) {
        throw new Error("Link de conexão inválido ou expirado.");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setInstanceName(data.instance?.name || "WhatsApp Integration");
      setQrCode(data.qrcode);
      
      if (data.instance?.status === 'connected') {
        setIsConnected(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar os dados de conexão.");
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
        // Ignore polling errors silently
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [token, isConnected, error]);

  // Render Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#011612] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(69,253,148,0.05),transparent_50%)] pointer-events-none" />
        <Card className="w-full max-w-md bg-card/60 backdrop-blur-xl border-forest/30 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-pistachio/70 font-mono tracking-wider">A obter canal seguro...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#011612] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.05),transparent_50%)] pointer-events-none" />
        <Card className="w-full max-w-md bg-card/60 backdrop-blur-xl border-red-500/20 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Acesso Expirado</h2>
              <p className="text-xs text-pistachio/70 mt-1.5 px-4">{error}</p>
            </div>
            <p className="text-[10px] text-pistachio/40">Solicite um novo link de emparelhamento ao seu gestor de conta.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render Connected success state
  if (isConnected) {
    return (
      <div className="min-h-screen bg-[#011612] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(69,253,148,0.08),transparent_50%)] pointer-events-none" />
        <Card className="w-full max-w-md bg-card/60 backdrop-blur-xl border-forest/30 shadow-[0_0_30px_-5px_rgba(69,253,148,0.15)]">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 animate-pulse">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">WhatsApp Conectado com Sucesso!</h2>
              <p className="text-xs text-pistachio/70 mt-1.5 px-6 leading-relaxed">
                O seu canal de comunicação e credenciais de agente foram autorizados no AetherFactory AI.
              </p>
            </div>
            <div className="w-full pt-4 border-t border-forest/10">
              <p className="text-[10px] text-pistachio/50">Já pode fechar esta janela com segurança.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#011612] text-[#cfe8e1] flex flex-col relative overflow-hidden">
      
      {/* Top Navbar */}
      <header className="h-16 flex items-center px-6 bg-card/40 backdrop-blur-xl border-b border-forest/20 relative z-10 justify-between">
        <span className="text-sm font-extrabold tracking-tighter text-primary">AetherFactory Onboarding</span>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-forest/20 border border-forest/30 text-[10px] font-mono font-bold text-secondary">
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></span>
          SECURE CHANNEL
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 relative z-10">
        <div className="w-full max-w-4xl grid md:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Side: Branding & Secure Info (Col 5) */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider font-mono">
                Autorização Segura
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                Ligue o seu <br/>
                <span className="text-primary">WhatsApp Agent</span>
              </h1>
              <p className="text-sm text-pistachio/80 leading-relaxed max-w-xs">
                Sincronize o seu dispositivo móvel com a plataforma para permitir que a Inteligência Artificial responda a clientes de forma autónoma.
              </p>
            </div>

            <div className="bg-card/40 border border-forest/30 rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-xs text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Segurança dos Dados
              </h3>
              <ul className="space-y-2.5 text-xs text-pistachio/70 leading-normal">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Encriptação AES-256 ativa nos servidores.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Nenhuma palavra-passe ou histórico é exposto.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Desconexão imediata disponível a qualquer altura.</span>
                </li>
              </ul>
            </div>
            
            <p className="text-[10px] text-pistachio/40 font-mono">
              Protocolo v2.4.0 · Powered by Kinjani Engine
            </p>
          </div>

          {/* Right Side: QR Code Area (Col 7) */}
          <div className="md:col-span-7 flex flex-col justify-center">
            <Card className="bg-card/60 backdrop-blur-xl border-forest/30 shadow-[0_0_40px_-15px_rgba(69,253,148,0.15)] overflow-hidden">
              <div className="bg-forest/10 p-5 border-b border-forest/20 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-sm text-foreground">Emparelhar Dispositivo</h2>
                  <p className="text-xs text-pistachio/70 mt-0.5">Dispositivo: <span className="font-mono text-primary font-bold">{instanceName}</span></p>
                </div>
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              
              <CardContent className="p-6 flex flex-col items-center">
                {qrCode ? (
                  <div className="bg-white p-3.5 rounded-xl shadow-lg mb-5">
                    <img 
                      src={`data:image/png;base64,${qrCode}`} 
                      alt="QR Code WhatsApp"
                      className="w-52 h-52 rounded"
                    />
                  </div>
                ) : (
                  <div className="w-52 h-52 bg-forest/5 border border-dashed border-forest/30 rounded-xl flex items-center justify-center mb-5 text-center px-4">
                    <p className="text-xs text-pistachio/60">
                      QR Code indisponível. Aguarde ou clique em atualizar.
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs font-mono text-pistachio/80 mb-5 bg-forest/15 border border-forest/25 px-3 py-1.5 rounded-full">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>A aguardar leitura do dispositivo...</span>
                </div>

                <div className="w-full text-xs text-pistachio/80 space-y-2.5 bg-black/20 p-4 rounded-xl border border-forest/15">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-mono text-[9px] font-bold">1</span>
                    <span>Abra o <strong>WhatsApp</strong> no seu telemóvel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-mono text-[9px] font-bold">2</span>
                    <span>Aceda a <strong>Definições</strong> → <strong>Aparelhos conectados</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-mono text-[9px] font-bold">3</span>
                    <span>Selecione <strong>Conectar um aparelho</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-mono text-[9px] font-bold">4</span>
                    <span>Aponte a câmara para digitalizar o código QR</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="mt-6 border-forest/40 hover:bg-forest/20 text-pistachio hover:text-primary h-9"
                  onClick={() => {
                    setIsLoading(true);
                    fetchQRCode();
                  }}
                >
                  <RefreshCw className="mr-2 h-3.5 w-3.5" /> Atualizar QR Code
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>

      {/* Decorative Blur elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-forest/10 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}
