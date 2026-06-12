import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Globe, Link as LinkIcon, ExternalLink, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CustomDomain {
  id: string;
  domain: string;
  status: string;
  website_id: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  websiteId: string;
  currentSlug: string | null;
  currentDomain?: string | null;
  onPublished: (update: { slug: string | null; published_url: string }) => void;
}

const SLUG_RX = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;

export function PublishDialog({ open, onOpenChange, websiteId, currentSlug, onPublished }: Props) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"slug" | "domain">("slug");
  const [slug, setSlug] = useState(currentSlug || "");
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [publishing, setPublishing] = useState(false);
  const baseHost = window.location.host;

  useEffect(() => {
    if (!open) return;
    setSlug(currentSlug || "");
    supabase
      .from("custom_domains")
      .select("id,domain,status,website_id")
      .eq("status", "active")
      .then(({ data }) => {
        const list = (data as CustomDomain[]) || [];
        setDomains(list);
        const linked = list.find((d) => d.website_id === websiteId);
        if (linked) {
          setMode("domain");
          setSelectedDomain(linked.domain);
        }
      });
  }, [open, websiteId, currentSlug]);

  const publish = async () => {
    setPublishing(true);
    try {
      let finalSlug: string | null = null;
      let url = `${window.location.origin}/site/${websiteId}`;

      if (mode === "slug") {
        const cleanSlug = slug.trim().toLowerCase();
        if (cleanSlug) {
          if (!SLUG_RX.test(cleanSlug)) {
            toast.error("Slug inválido. Usa apenas letras, números e hífens (3-40 caracteres).");
            setPublishing(false);
            return;
          }
          finalSlug = cleanSlug;
          url = `${window.location.origin}/s/${cleanSlug}`;
        }
      } else if (mode === "domain" && selectedDomain) {
        url = `https://${selectedDomain}`;
      }

      console.log("[PublishDialog] Publishing website:", websiteId, "slug:", finalSlug, "url:", url);

      // Build update payload — only include slug if it's non-null (avoids unique constraint on empty)
      const updatePayload: Record<string, unknown> = {
        status: "active",
        published_url: url,
      };
      if (finalSlug !== null) {
        updatePayload.slug = finalSlug;
      }

      const { data, error } = await supabase
        .from("websites")
        .update(updatePayload)
        .eq("id", websiteId)
        .select()
        .single();

      console.log("[PublishDialog] Result:", { data, error });

      if (error) {
        console.error("[PublishDialog] Supabase error:", error);
        if (error.message.includes("websites_slug_unique") || error.message.includes("duplicate")) {
          toast.error("Esse slug já está a ser usado. Escolhe outro.");
        } else if (error.message.includes("column") && error.message.includes("slug")) {
          // Slug column may not exist — publish without slug
          console.warn("[PublishDialog] Slug column issue, retrying without slug");
          const fallbackUrl = `${window.location.origin}/site/${websiteId}`;
          const { error: fallbackError } = await supabase
            .from("websites")
            .update({ status: "active", published_url: fallbackUrl })
            .eq("id", websiteId);
          if (!fallbackError) {
            toast.success("Site publicado! (URL por ID)");
            onPublished({ slug: null, published_url: fallbackUrl });
            onOpenChange(false);
            return;
          }
          toast.error(fallbackError.message || "Erro ao publicar. Tenta de novo.");
        } else {
          toast.error(error.message || "Erro ao publicar. Verifica a tua ligação.");
        }
        setPublishing(false);
        return;
      }

      if (mode === "domain" && selectedDomain) {
        await supabase
          .from("custom_domains")
          .update({ website_id: websiteId })
          .eq("domain", selectedDomain);
      }

      toast.success("Site publicado com sucesso! 🎉");
      onPublished({ slug: finalSlug, published_url: url });
      onOpenChange(false);
    } catch (err: any) {
      console.error("[PublishDialog] Unexpected error:", err);
      toast.error(err?.message || "Erro inesperado ao publicar. Tenta de novo.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Publicar site</DialogTitle>
          <DialogDescription>Escolhe onde queres que o teu site fique disponível.</DialogDescription>
        </DialogHeader>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode("slug")}
            className={`p-3 rounded-lg border text-left transition ${
              mode === "slug" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
            }`}
          >
            <LinkIcon className="h-4 w-4 mb-1 text-primary" />
            <p className="text-sm font-medium">Subdomínio Kinjani</p>
            <p className="text-xs text-muted-foreground">grátis e imediato</p>
          </button>
          <button
            onClick={() => setMode("domain")}
            className={`p-3 rounded-lg border text-left transition ${
              mode === "domain" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
            }`}
          >
            <Globe className="h-4 w-4 mb-1 text-primary" />
            <p className="text-sm font-medium">Domínio próprio</p>
            <p className="text-xs text-muted-foreground">meusite.com</p>
          </button>
        </div>

        {mode === "slug" && (
          <div className="space-y-2">
            <Label htmlFor="slug">Nome da URL</Label>
            <div className="flex items-center rounded-md border border-input bg-background overflow-hidden focus-within:ring-1 focus-within:ring-ring">
              <span className="px-3 text-xs text-muted-foreground bg-muted/40 h-9 flex items-center">
                {baseHost}/s/
              </span>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="meu-site"
                className="border-0 focus-visible:ring-0"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Deixa em branco para usar o ID interno do site.
            </p>
          </div>
        )}

        {mode === "domain" && (
          <div className="space-y-2">
            {domains.length === 0 ? (
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-sm space-y-2">
                <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
                  <AlertCircle className="h-4 w-4" /> Sem domínios verificados
                </div>
                <p className="text-muted-foreground text-xs">
                  Adiciona o teu domínio na secção Domínios e configura o DNS para o verificar.
                </p>
                <Button size="sm" variant="outline" onClick={() => { onOpenChange(false); navigate("/domains"); }}>
                  <ExternalLink className="h-3 w-3 mr-1" /> Ir para Domínios
                </Button>
              </div>
            ) : (
              <>
                <Label>Escolhe um domínio verificado</Label>
                <div className="space-y-1.5">
                  {domains.map((d) => (
                    <label
                      key={d.id}
                      className={`flex items-center gap-3 p-2.5 rounded-md border cursor-pointer transition ${
                        selectedDomain === d.domain ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <input
                        type="radio"
                        name="domain"
                        value={d.domain}
                        checked={selectedDomain === d.domain}
                        onChange={(e) => setSelectedDomain(e.target.value)}
                      />
                      <span className="flex-1 text-sm font-medium">{d.domain}</span>
                      <Badge variant="secondary" className="text-[10px]">verificado</Badge>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={publish}
            disabled={publishing || (mode === "domain" && !selectedDomain)}
          >
            {publishing ? "A publicar…" : "Publicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
