import { useState, type ReactNode } from "react";
import { Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_REGISTRY,
  type TemplateCategory,
  type TemplateKit,
} from "../marketplace/registry";

/**
 * Premium onboarding wizard.
 *
 *  signup → business type → style → description → AI generation
 *
 * Fully controlled, headless-friendly: the host passes `onComplete` with
 * the captured payload and decides how to dispatch generation.
 */

export interface OnboardingPayload {
  businessName: string;
  businessType: TemplateCategory;
  styleKitId: string;
  description: string;
}

interface OnboardingWizardProps {
  defaultPayload?: Partial<OnboardingPayload>;
  onComplete: (payload: OnboardingPayload) => void;
  onCancel?: () => void;
}

const STEPS = [
  { id: "name", label: "Negócio" },
  { id: "type", label: "Tipo" },
  { id: "style", label: "Estilo" },
  { id: "describe", label: "Descrição" },
  { id: "generate", label: "Gerar" },
] as const;

export function OnboardingWizard({ defaultPayload, onComplete, onCancel }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [payload, setPayload] = useState<OnboardingPayload>({
    businessName: defaultPayload?.businessName ?? "",
    businessType: defaultPayload?.businessType ?? "restaurant",
    styleKitId: defaultPayload?.styleKitId ?? TEMPLATE_REGISTRY[0].id,
    description: defaultPayload?.description ?? "",
  });

  const canAdvance = stepValid(step, payload);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.25)]">
      <Stepper current={step} />

      <div className="min-h-[260px]">
        {step === 0 && (
          <StepShell title="Como se chama o seu negócio?" subtitle="Usaremos para personalizar tudo o resto.">
            <Label htmlFor="biz-name">Nome do negócio</Label>
            <Input
              id="biz-name"
              autoFocus
              value={payload.businessName}
              onChange={(e) => setPayload({ ...payload, businessName: e.target.value })}
              placeholder="Ex: Restaurante Costa do Sol"
            />
          </StepShell>
        )}

        {step === 1 && (
          <StepShell title="Que tipo de negócio?" subtitle="Escolha a categoria mais próxima.">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TEMPLATE_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setPayload({ ...payload, businessType: c.id })}
                  className={cn(
                    "rounded-lg border px-3 py-3 text-left text-sm transition-all",
                    payload.businessType === c.id
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell title="Escolha um estilo" subtitle="Selecione um kit base — pode ajustar depois.">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {filterByCategory(payload.businessType).map((kit) => (
                <button
                  key={kit.id}
                  type="button"
                  onClick={() => setPayload({ ...payload, styleKitId: kit.id })}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 text-left transition-all",
                    payload.styleKitId === kit.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <div
                    className="h-10 w-10 shrink-0 rounded-md"
                    style={{ background: kit.accent }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{kit.name}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{kit.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell title="Descreva o seu negócio" subtitle="Quanto mais detalhe, melhor a IA gera.">
            <Textarea
              autoFocus
              rows={6}
              value={payload.description}
              onChange={(e) => setPayload({ ...payload, description: e.target.value })}
              placeholder="Ex: Restaurante familiar em Maputo, especializado em marisco. Servimos almoço e jantar, com terraço sobre o mar. Aceitamos M-Pesa."
            />
          </StepShell>
        )}

        {step === 4 && (
          <StepShell title="Tudo pronto" subtitle="Vamos gerar o seu site agora.">
            <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4 text-sm">
              <SummaryRow label="Negócio" value={payload.businessName} />
              <SummaryRow
                label="Categoria"
                value={TEMPLATE_CATEGORIES.find((c) => c.id === payload.businessType)?.label ?? "—"}
              />
              <SummaryRow
                label="Estilo"
                value={TEMPLATE_REGISTRY.find((k) => k.id === payload.styleKitId)?.name ?? "—"}
              />
            </div>
          </StepShell>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button
          variant="ghost"
          onClick={() => (step === 0 ? onCancel?.() : setStep(step - 1))}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          {step === 0 ? "Cancelar" : "Voltar"}
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canAdvance} className="gap-1">
            Continuar
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={() => onComplete(payload)} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Gerar site
          </Button>
        )}
      </div>
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((s, idx) => {
        const done = idx < current;
        const active = idx === current;
        return (
          <li key={s.id} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-medium",
                done && "border-success bg-success text-success-foreground",
                active && "border-primary bg-primary text-primary-foreground",
                !done && !active && "border-border bg-card text-muted-foreground",
              )}
            >
              {done ? <Check className="h-3 w-3" /> : idx + 1}
            </span>
            {idx < STEPS.length - 1 && (
              <span
                className={cn(
                  "h-px flex-1 transition-colors",
                  done ? "bg-success" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function StepShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value || "—"}</span>
    </div>
  );
}

function stepValid(step: number, p: OnboardingPayload): boolean {
  if (step === 0) return p.businessName.trim().length >= 2;
  if (step === 3) return p.description.trim().length >= 10;
  return true;
}

function filterByCategory(cat: TemplateCategory): TemplateKit[] {
  const matches = TEMPLATE_REGISTRY.filter((k) => k.category === cat);
  return matches.length > 0 ? matches : TEMPLATE_REGISTRY.slice(0, 4);
}
