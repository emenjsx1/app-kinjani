import { useState } from "react";
import { Sparkles, MessageCircle, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_REGISTRY,
  filterTemplates,
  type TemplateCategory,
  type TemplateKit,
  type TemplateTier,
} from "./registry";

export * from "./registry";

interface MarketplaceGridProps {
  templates?: TemplateKit[];
  onPick?: (kit: TemplateKit) => void;
}

export function MarketplaceGrid({ templates = TEMPLATE_REGISTRY, onPick }: MarketplaceGridProps) {
  const [category, setCategory] = useState<TemplateCategory | "all">("all");
  const [tier, setTier] = useState<TemplateTier | "all">("all");
  const [search, setSearch] = useState("");
  const visible = filterTemplates(templates, { category, tier, search });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar templates…"
          className="max-w-sm"
        />
        <div className="flex flex-wrap items-center gap-1">
          {(["all", "free", "premium"] as const).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={tier === t ? "default" : "outline"}
              onClick={() => setTier(t)}
            >
              {t === "all" ? "Todos" : t === "free" ? "Grátis" : "Premium"}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <CategoryChip active={category === "all"} onClick={() => setCategory("all")}>
          Todas
        </CategoryChip>
        {TEMPLATE_CATEGORIES.map((c) => (
          <CategoryChip
            key={c.id}
            active={category === c.id}
            onClick={() => setCategory(c.id)}
          >
            {c.label}
          </CategoryChip>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((kit) => (
          <KitCard key={kit.id} kit={kit} onPick={onPick} />
        ))}
      </div>
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function KitCard({ kit, onPick }: { kit: TemplateKit; onPick?: (kit: TemplateKit) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick?.(kit)}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-all hover:border-primary/40 hover:shadow-[0_10px_30px_-12px_hsl(var(--primary)/0.25)]"
    >
      <div
        className="relative aspect-video w-full overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${kit.accent}, transparent)` }}
      >
        {kit.thumbnailUrl ? (
          <img src={kit.thumbnailUrl} alt={kit.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-white/80">
            {kit.name.slice(0, 1)}
          </div>
        )}
        {kit.tier === "premium" && (
          <Badge className="absolute right-2 top-2 gap-1 bg-foreground text-background">
            <Sparkles className="h-3 w-3" /> Premium
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{kit.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{kit.description}</p>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          {kit.whatsappLeadCapture && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
              <MessageCircle className="h-3 w-3" /> WhatsApp
            </span>
          )}
          {kit.mzPayments && (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
              <Wallet className="h-3 w-3" /> M-Pesa · e-Mola
            </span>
          )}
          {kit.tags.slice(0, 2).map((t) => (
            <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
