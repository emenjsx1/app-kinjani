import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Globe, Plus, Trash2, RefreshCw, Copy, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface CustomDomain {
  id: string;
  domain: string;
  status: "pending" | "active" | "failed";
  verification_token: string;
  website_id: string | null;
  verified_at: string | null;
  created_at: string;
}

interface Website {
  id: string;
  name: string;
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [newWebsiteId, setNewWebsiteId] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: d }, { data: w }] = await Promise.all([
      supabase.from("custom_domains").select("*").order("created_at", { ascending: false }),
      supabase.from("websites").select("id,name").order("created_at", { ascending: false }),
    ]);
    setDomains((d as CustomDomain[]) || []);
    setWebsites(w || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const addDomain = async () => {
    const clean = newDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!clean || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(clean)) {
      toast.error("Domínio inválido. Exemplo: meusite.com");
      return;
    }
    setAdding(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setAdding(false); return; }
    const { error } = await supabase.from("custom_domains").insert({
      user_id: user.id,
      domain: clean,
      website_id: newWebsiteId || null,
      status: "pending",
    });
    if (error) {
      toast.error(error.message.includes("unique") ? "Este domínio já existe." : error.message);
    } else {
      toast.success("Domínio adicionado. Configura os DNS para verificar.");
      setNewDomain("");
      setNewWebsiteId("");
      load();
    }
    setAdding(false);
  };

  const verify = async (d: CustomDomain) => {
    setVerifyingId(d.id);
    try {
      const { data, error } = await supabase.functions.invoke("verify-domain", {
        body: { domainId: d.id },
      });
      if (error) throw error;
      if (data?.verified) {
        toast.success("Domínio verificado!");
        load();
      } else {
        toast.error(data?.message || "Verificação falhou.");
      }
    } catch (e: any) {
      toast.error(e.message || "Erro na verificação.");
    } finally {
      setVerifyingId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remover este domínio?")) return;
    await supabase.from("custom_domains").delete().eq("id", id);
    load();
  };

  const link = async (domainId: string, websiteId: string) => {
    await supabase.from("custom_domains").update({ website_id: websiteId || null }).eq("id", domainId);
    load();
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  const baseHost = window.location.host;

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" /> Domínios
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Adiciona o teu próprio domínio (ex: meusite.com) e liga-o a um site publicado.
          </p>
        </div>

        {/* Add new domain */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Adicionar novo domínio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="meusite.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="flex-1"
              />
              <select
                value={newWebsiteId}
                onChange={(e) => setNewWebsiteId(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">(Sem site associado)</option>
                {websites.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
              <Button onClick={addDomain} disabled={adding}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Depois de adicionar, segue as instruções DNS para verificar a posse.
            </p>
          </CardContent>
        </Card>

        {/* Domains list */}
        {loading ? (
          <div className="flex justify-center py-10"><LoadingSpinner /></div>
        ) : domains.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <Globe className="h-10 w-10 mx-auto mb-3 opacity-30" />
              Ainda não tens domínios. Adiciona um acima para começar.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {domains.map((d) => (
              <Card key={d.id}>
                <CardContent className="pt-5 space-y-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{d.domain}</h3>
                        {d.status === "active" ? (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Verificado
                          </Badge>
                        ) : d.status === "failed" ? (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" /> Falhou
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" /> Pendente
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Adicionado em {new Date(d.created_at).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {d.status !== "active" && (
                        <Button size="sm" variant="outline" onClick={() => verify(d)} disabled={verifyingId === d.id}>
                          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${verifyingId === d.id ? "animate-spin" : ""}`} />
                          Verificar
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => remove(d.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Site associado */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Site:</span>
                    <select
                      value={d.website_id || ""}
                      onChange={(e) => link(d.id, e.target.value)}
                      className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                    >
                      <option value="">(Nenhum)</option>
                      {websites.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* DNS instructions */}
                  {d.status !== "active" && (
                    <div className="bg-muted/40 rounded-lg p-4 space-y-3 text-sm">
                      <p className="font-medium">Configura estes 2 registos DNS no teu registador:</p>
                      <div className="space-y-2">
                        <DnsRow label="Tipo" value="TXT" />
                        <DnsRow label="Nome / Host" value={`_kinjani.${d.domain}`} onCopy={copy} />
                        <DnsRow label="Valor" value={d.verification_token} onCopy={copy} />
                      </div>
                      <div className="space-y-2 pt-3 border-t border-border/40">
                        <DnsRow label="Tipo" value="CNAME" />
                        <DnsRow label="Nome / Host" value={d.domain.split(".").length > 2 ? d.domain.split(".")[0] : "@"} />
                        <DnsRow label="Aponta para" value={baseHost} onCopy={copy} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        A propagação DNS pode demorar até 30 minutos. Clica em "Verificar" depois de configurar.
                      </p>
                    </div>
                  )}

                  {d.status === "active" && d.website_id && (
                    <a
                      href={`https://${d.domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Abrir https://{d.domain}
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function DnsRow({ label, value, onCopy }: { label: string; value: string; onCopy?: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground w-24 shrink-0">{label}:</span>
      <code className="flex-1 bg-background px-2 py-1 rounded border border-border/40 break-all">{value}</code>
      {onCopy && (
        <button onClick={() => onCopy(value)} className="p-1 hover:text-primary" title="Copiar">
          <Copy className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
