import { AlertTriangle, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { LOW_CREDIT_THRESHOLD } from "@/lib/credit-costs";
import { useState } from "react";

export function LowCreditsBanner() {
  const { profile } = useProfile();
  const [dismissed, setDismissed] = useState(false);

  if (!profile || dismissed) return null;
  const balance = profile.credits_balance ?? 0;
  if (balance >= LOW_CREDIT_THRESHOLD) return null;

  const isZero = balance <= 0;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 text-sm border-b ${
        isZero
          ? "bg-destructive/10 border-destructive/30 text-destructive"
          : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
      }`}
      role="alert"
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <p className="flex-1">
        {isZero ? (
          <>Não tens créditos disponíveis. Recarrega para continuar a usar agentes, sites e automações.</>
        ) : (
          <>Restam <strong>{balance} créditos</strong>. Recarrega para evitar interrupções.</>
        )}
      </p>
      <Link
        to="/credits"
        className="rounded-md bg-foreground/90 px-3 py-1 text-xs font-medium text-background hover:opacity-90"
      >
        Comprar créditos
      </Link>
      {!isZero && (
        <button
          onClick={() => setDismissed(true)}
          className="opacity-60 hover:opacity-100"
          aria-label="Dispensar aviso"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
