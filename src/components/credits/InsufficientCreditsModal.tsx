import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CREDIT_LABELS } from "@/lib/credit-costs";
import { useInsufficientCredits } from "@/lib/credit-error";
import { Sparkles } from "lucide-react";

export function InsufficientCreditsModal() {
  const navigate = useNavigate();
  const { open, required, balance, action, hide } = useInsufficientCredits();

  const actionLabel = action && (CREDIT_LABELS as Record<string, string>)[action];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && hide()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Créditos insuficientes
          </DialogTitle>
          <DialogDescription>
            Esta acção {actionLabel ? `(${actionLabel})` : ""} precisa de {required ?? "mais"} créditos
            {typeof balance === "number" ? ` e tu tens ${balance}` : ""}.
            Recarrega a tua conta para continuar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2 my-4">
          <div className="rounded-lg border p-3 text-center">
            <p className="text-xs text-muted-foreground">Starter</p>
            <p className="font-semibold">500 créd</p>
            <p className="text-sm">499 MZN</p>
          </div>
          <div className="rounded-lg border border-primary/50 bg-primary/5 p-3 text-center">
            <p className="text-xs text-primary">Pro</p>
            <p className="font-semibold">1.500 créd</p>
            <p className="text-sm">1.299 MZN</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-xs text-muted-foreground">Business</p>
            <p className="font-semibold">5.000 créd</p>
            <p className="text-sm">3.999 MZN</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={hide}>Mais tarde</Button>
          <Button onClick={() => { hide(); navigate("/credits"); }}>
            Comprar créditos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
