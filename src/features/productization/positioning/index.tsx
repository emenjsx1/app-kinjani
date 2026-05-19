import { useState, type ReactNode } from "react";
import { MessageCircle, Wallet, Copy, CheckCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Phase 6 — Product positioning primitives.
 *
 * Mozambique-first commerce building blocks: MZN formatting, WhatsApp
 * checkout handoff, and M-Pesa / e-Mola payment instruction blocks.
 *
 * These are UI primitives only — no payment SDK is bundled. Real payment
 * plumbing is intentionally deferred to a later phase.
 */

export type MZPaymentProvider = "mpesa" | "emola" | "cash";

export interface MZPaymentConfig {
  /** Mobile number receiving the payment, in international format. */
  receiver: string;
  /** Optional account / business label. */
  accountName?: string;
  /** Provider, defaults to mpesa. */
  provider?: MZPaymentProvider;
  /** Optional reference shown in instructions. */
  reference?: string;
}

const PROVIDER_LABEL: Record<MZPaymentProvider, string> = {
  mpesa: "M-Pesa",
  emola: "e-Mola",
  cash: "Dinheiro",
};

const PROVIDER_USSD: Record<MZPaymentProvider, string> = {
  mpesa: "*150#",
  emola: "*898#",
  cash: "",
};

/** Format an amount in MZN with Mozambican grouping (e.g. 1 200,00 MZN). */
export function formatMZN(amount: number): string {
  const fixed = amount.toFixed(2).replace(".", ",");
  const [intPart, decPart] = fixed.split(",");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${grouped},${decPart} MZN`;
}

/** Build a WhatsApp deep link with a pre-filled order message. */
export function buildWhatsAppOrderUrl(opts: {
  phone: string;
  items?: { name: string; qty: number; price?: number }[];
  total?: number;
  customerName?: string;
  reference?: string;
}): string {
  const phone = opts.phone.replace(/[^0-9]/g, "");
  const lines: string[] = ["Olá! Gostaria de fazer uma encomenda."];
  if (opts.customerName) lines.push(`Nome: ${opts.customerName}`);
  if (opts.items && opts.items.length > 0) {
    lines.push("", "Itens:");
    for (const it of opts.items) {
      const price = it.price != null ? ` — ${formatMZN(it.price * it.qty)}` : "";
      lines.push(`• ${it.qty}× ${it.name}${price}`);
    }
  }
  if (opts.total != null) lines.push("", `Total: ${formatMZN(opts.total)}`);
  if (opts.reference) lines.push(`Ref: ${opts.reference}`);
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${phone}?text=${text}`;
}

/* -------------------------------------------------------------------------- */
/*  Components                                                                */
/* -------------------------------------------------------------------------- */

interface WhatsAppCheckoutProps {
  phone: string;
  total?: number;
  defaultMessage?: string;
  children?: ReactNode;
}

export function WhatsAppCheckout({ phone, total, defaultMessage, children }: WhatsAppCheckoutProps) {
  const [name, setName] = useState("");
  const url = buildWhatsAppOrderUrl({
    phone,
    customerName: name || undefined,
    total,
    items: defaultMessage ? [{ name: defaultMessage, qty: 1 }] : undefined,
  });
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <MessageCircle className="h-4 w-4 text-success" />
        Finalizar via WhatsApp
      </div>
      <div className="space-y-2">
        <Label htmlFor="wa-name" className="text-xs">
          O seu nome
        </Label>
        <Input
          id="wa-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Mariana"
        />
      </div>
      {total != null && (
        <p className="text-sm text-muted-foreground">
          Total: <span className="font-semibold text-foreground">{formatMZN(total)}</span>
        </p>
      )}
      {children}
      <Button asChild className="w-full bg-success text-success-foreground hover:bg-success/90">
        <a href={url} target="_blank" rel="noreferrer">
          Enviar encomenda
        </a>
      </Button>
    </div>
  );
}

interface PaymentInstructionsProps {
  config: MZPaymentConfig;
  amount?: number;
  className?: string;
}

export function PaymentInstructions({ config, amount, className }: PaymentInstructionsProps) {
  const provider = config.provider ?? "mpesa";
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (typeof navigator === "undefined") return;
    navigator.clipboard?.writeText(config.receiver).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className={cn("space-y-3 rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Wallet className="h-4 w-4 text-warning" />
          Pagamento por {PROVIDER_LABEL[provider]}
        </div>
        {amount != null && (
          <span className="text-sm font-semibold text-foreground">{formatMZN(amount)}</span>
        )}
      </div>
      <ol className="space-y-1.5 text-sm text-muted-foreground">
        <li className="flex gap-2">
          <Smartphone className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Marque <span className="font-mono text-foreground">{PROVIDER_USSD[provider]}</span> no
            telemóvel e escolha <em>Enviar dinheiro</em>.
          </span>
        </li>
        <li>
          Envie para o número:
          <button
            onClick={copy}
            className="ml-2 inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs text-foreground hover:border-primary"
          >
            {config.receiver}
            {copied ? <CheckCheck className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
          </button>
        </li>
        {config.accountName && <li>Beneficiário: {config.accountName}</li>}
        {config.reference && (
          <li>
            Referência: <span className="font-mono text-foreground">{config.reference}</span>
          </li>
        )}
        <li>Após pagamento, envie o comprovativo via WhatsApp.</li>
      </ol>
    </div>
  );
}
