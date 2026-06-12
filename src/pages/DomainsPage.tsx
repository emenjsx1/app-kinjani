import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Globe,
  Plus,
  Trash2,
  RefreshCw,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
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
  const [selectedDomain, setSelectedDomain] = useState<CustomDomain | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: d }, { data: w }] = await Promise.all([
      supabase.from("custom_domains").select("*").order("created_at", { ascending: false }),
      supabase.from("websites").select("id,name").order("created_at", { ascending: false }),
    ]);
    const fetchedDomains = (d as CustomDomain[]) || [];
    setDomains(fetchedDomains);
    setWebsites(w || []);
    
    if (fetchedDomains.length > 0) {
      const pending = fetchedDomains.find((dom) => dom.status !== "active");
      setSelectedDomain(pending || fetchedDomains[0]);
    } else {
      setSelectedDomain(null);
    }
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
      toast.success("Domínio adicionado. Configure os DNS para verificar.");
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
        toast.success("Domínio verificado com sucesso!");
        load();
      } else {
        toast.error(data?.message || "Verificação falhou. DNS ainda não propagado.");
      }
    } catch (e: any) {
      toast.error(e.message || "Erro na verificação de domínio.");
    } finally {
      setVerifyingId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remover este domínio permanentemente?")) return;
    await supabase.from("custom_domains").delete().eq("id", id);
    load();
  };

  const link = async (domainId: string, websiteId: string) => {
    await supabase.from("custom_domains").update({ website_id: websiteId || null }).eq("id", domainId);
    toast.success("Site associado atualizado");
    load();
  };

  const copyVal = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado com sucesso!");
  };

  const baseHost = window.location.host;
  const verifiedCount = domains.filter((d) => d.status === "active").length;
  const sslCount = domains.filter((d) => d.status === "active").length;

  return (
    <AppLayout pageTitle="Domínios" credits={0}>
      <div className="space-y-8 pb-10">
        
        {/* Navigation Breadcrumb & Title */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-pistachio text-sm mb-2">
              <span className="font-label-sm text-label-sm">Rede</span>
              <ChevronRight className="h-3 w-3 text-pistachio/50" />
              <span className="font-label-sm text-label-sm text-primary">Domain Management</span>
            </nav>
            <h2 className="text-3xl font-extrabold text-white tracking-tight font-display">Active Domains</h2>
          </div>
        </header>

        {/* Stats Summary Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card/40 border border-forest/20 p-5 rounded-xl backdrop-blur-md">
            <p className="text-[10px] font-bold text-pistachio/60 uppercase tracking-widest font-mono">TOTAL DOMAINS</p>
            <p className="text-2xl font-bold text-white font-mono mt-1">{domains.length}</p>
          </div>
          <div className="bg-card/40 border border-forest/20 p-5 rounded-xl backdrop-blur-md">
            <p className="text-[10px] font-bold text-pistachio/60 uppercase tracking-widest font-mono">DNS VERIFIED</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold text-primary font-mono">{verifiedCount}</p>
              <span className="text-xs text-primary/60 font-mono">/ {domains.length}</span>
            </div>
          </div>
          <div className="bg-card/40 border border-forest/20 p-5 rounded-xl backdrop-blur-md">
            <p className="text-[10px] font-bold text-pistachio/60 uppercase tracking-widest font-mono">SSL SECURED</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold text-secondary font-mono">{sslCount}</p>
              <span className="text-xs text-secondary/60 font-mono">ativo</span>
            </div>
          </div>
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Domains Management Table */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* Add Domain Card */}
            <Card className="bg-card/40 backdrop-blur-md border border-forest/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Adicionar Novo Domínio</CardTitle>
                <CardDescription className="text-xs text-pistachio/70">Insira o seu domínio próprio e associe opcionalmente a um website Kinjani.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="exemplo: meusite.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="flex-1 bg-background/40 border-forest/30 text-white placeholder:text-pistachio/30 focus:border-primary/50"
                  />
                  <select
                    value={newWebsiteId}
                    onChange={(e) => setNewWebsiteId(e.target.value)}
                    className="rounded-lg border border-forest/30 bg-background/50 px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                  >
                    <option value="" className="bg-surface">(Sem site associado)</option>
                    {websites.map((w) => (
                      <option key={w.id} value={w.id} className="bg-surface">{w.name}</option>
                    ))}
                  </select>
                  <Button 
                    onClick={addDomain} 
                    disabled={adding}
                    className="bg-primary hover:bg-primary/95 text-background font-bold shadow-md shadow-primary/20 shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-1.5" /> Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Domains Table */}
            {loading ? (
              <div className="flex justify-center items-center py-16"><LoadingSpinner /></div>
            ) : domains.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-forest/30 rounded-xl bg-forest/5 text-pistachio/70 text-sm">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-40 text-primary" />
                Ainda não adicionou nenhum domínio customizado. Introduza um domínio acima para começar.
              </div>
            ) : (
              <div className="bg-card/30 backdrop-blur-md border border-forest/20 rounded-xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-forest/10 text-pistachio/65 border-b border-forest/20 text-[10px] font-mono uppercase tracking-wider">
                        <th className="px-6 py-4 font-semibold">Domain Name</th>
                        <th className="px-6 py-4 font-semibold text-center">DNS Status</th>
                        <th className="px-6 py-4 font-semibold text-center">SSL Certificate</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-forest/10">
                      {domains.map((d) => (
                        <tr 
                          key={d.id}
                          className={`hover:bg-white/5 transition-colors group cursor-pointer ${selectedDomain?.id === d.id ? "bg-forest/10" : ""}`}
                          onClick={() => setSelectedDomain(d)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${d.status === "active" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"}`}>
                                <Globe className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-bold text-white text-sm tracking-wide group-hover:text-primary transition-colors">
                                  {d.domain}
                                </p>
                                <span className="text-[11px] text-pistachio/50 font-mono">
                                  {new Date(d.created_at).toLocaleDateString("pt-PT")}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex">
                              {d.status === "active" ? (
                                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                  Verified
                                </span>
                              ) : d.status === "failed" ? (
                                <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                  Falhou
                                </span>
                              ) : (
                                <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                                  Pending
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                            {d.status === "active" ? (
                              <div className="inline-flex items-center gap-1.5 text-secondary text-xs font-semibold">
                                <Shield className="h-3.5 w-3.5 fill-secondary/20" />
                                <span>Active (ECC)</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 text-pistachio/50 text-xs">
                                <Clock className="h-3.5 w-3.5" />
                                <span>A aguardar verificação</span>
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              {d.status !== "active" && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 border-forest/40 hover:bg-forest/20 text-pistachio hover:text-primary text-[10px] font-bold"
                                  onClick={() => verify(d)} 
                                  disabled={verifyingId === d.id}
                                >
                                  <RefreshCw className={`h-3 w-3 mr-1 ${verifyingId === d.id ? "animate-spin" : ""}`} />
                                  Verify Now
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 w-7 p-0 hover:bg-destructive/10 text-pistachio hover:text-destructive"
                                onClick={() => remove(d.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* DNS Configuration Side Panel */}
          <div className="xl:col-span-4">
            {selectedDomain ? (
              <div className="bg-card/40 backdrop-blur-md border border-forest/30 rounded-xl p-6 shadow-lg space-y-6 sticky top-24">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-primary uppercase tracking-wider">DNS Settings</h3>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-forest"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-forest"></span>
              </div>
            )}
          </div>

        </div>

      </div>
    </AppLayout>
  );
}
