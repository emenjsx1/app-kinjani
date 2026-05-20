import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  clientId: string;
  assetType: "website" | "agent";
  assetId: string;
}

export function AssetPriceInput({ clientId, assetType, assetId }: Props) {
  const [price, setPrice] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("client_assets")
        .select("monthly_price")
        .eq("client_id", clientId)
        .eq("asset_type", assetType)
        .eq("asset_id", assetId)
        .maybeSingle();
      if (active) {
        setPrice(data?.monthly_price ? String(data.monthly_price) : "");
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [clientId, assetType, assetId]);

  const save = async () => {
    setSaving(true);
    const value = parseFloat(price) || 0;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { error } = await supabase.from("client_assets").upsert({
      user_id: user.id,
      client_id: clientId,
      asset_type: assetType,
      asset_id: assetId,
      monthly_price: value,
    }, { onConflict: "client_id,asset_type,asset_id" });
    if (error) toast.error("Erro ao guardar preço");
    else toast.success("Preço atualizado");
    setSaving(false);
  };

  if (loading) return <div className="h-9 w-32" />;

  return (
    <div className="flex items-center gap-1">
      <Input
        type="number"
        min="0"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="MZN/mês"
        className="h-9 w-28"
      />
      <Button size="icon" variant="ghost" onClick={save} disabled={saving} title="Guardar preço">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </Button>
    </div>
  );
}
