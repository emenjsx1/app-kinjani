import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, CheckCircle2, Smartphone, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CheckoutPackage {
  credits: number;
  amountMzn: number;
  label: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pkg: CheckoutPackage | null;
}

const METHODS = [
  { id: "mpesa", label: "M-Pesa", icon: Smartphone, hint: "Vodacom" },
  { id: "emola", label: "e-Mola", icon: Smartphone, hint: "Movitel" },
  { id: "card", label: "Cartão", icon: CreditCard, hint: "Visa / Mastercard" },
];

export function CheckoutDialog({ open, onOpenChange, pkg }: Props) {
  const [method, setMethod] = useState("mpesa");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleConfirm = async () => {
    if (!pkg) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sem sessão");
      const { error } = await supabase.from("payment_orders").insert({
        user_id: user.id,
        amount_mzn: pkg.amountMzn,
        credits_amount: pkg.credits,
        method,
        status: "pending",
      });
      if (error) throw error;
      setDone(true);
      toast.success("Pedido registado. Em breve receberá instruções de pagamento.");
    } catch (e: any) {
      toast.error(e.message || "Erro ao registar pedido");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (next: boolean) => {
    if (!next) {
      setDone(false);
      setMethod("mpesa");
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Finalizar Compra</DialogTitle>
          <DialogDescription>
            {pkg ? `${pkg.credits.toLocaleString()} créditos por ${pkg.amountMzn.toLocaleString()} MZN` : ""}
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
            <h3 className="font-semibold text-lg">Pedido a ser processado</h3>
            <p className="text-sm text-muted-foreground">
              Recebemos o seu pedido. Vai receber as instruções de pagamento em breve.
            </p>
            <Button className="w-full" onClick={() => handleClose(false)}>Fechar</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Método de pagamento</Label>
              <RadioGroup value={method} onValueChange={setMethod} className="space-y-2">
                {METHODS.map((m) => {
                  const Icon = m.icon;
                  return (
                    <label
                      key={m.id}
                      htmlFor={m.id}
                      className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <RadioGroupItem value={m.id} id={m.id} />
                      <Icon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{m.label}</p>
                        <p className="text-xs text-muted-foreground">{m.hint}</p>
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>

            <Button className="w-full" onClick={handleConfirm} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar pedido
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
