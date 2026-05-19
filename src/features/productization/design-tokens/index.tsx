import { useState } from "react";
import { Palette, Type, CornerDownRight, Sun, Moon, Square, Layers } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Global Design Tokens UI.
 *
 * Visual control of the project's design system: brand colors, typography
 * scale, border radius, shadow scale, spacing scale, button presets, and
 * theme variants. Outputs `DesignTokens` that the host can persist and
 * inject as CSS variables.
 */

export interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseSize: number;
    scale: number;
  };
  radius: number;
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  spacing: number;
  button: {
    variant: "solid" | "outline" | "ghost";
    weight: 400 | 500 | 600 | 700;
    uppercase: boolean;
  };
  theme: "light" | "dark";
}

export const DEFAULT_TOKENS: DesignTokens = {
  colors: {
    primary: "#00DF80",
    secondary: "#2DBE82",
    accent: "#1E8E5B",
    background: "#F4F7F6",
    foreground: "#031413",
    muted: "#B4C8C2",
  },
  typography: { headingFont: "Plus Jakarta Sans", bodyFont: "Plus Jakarta Sans", baseSize: 16, scale: 1.25 },
  radius: 8,
  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    md: "0 4px 12px rgba(0,0,0,0.08)",
    lg: "0 20px 60px -20px rgba(0,0,0,0.25)",
  },
  spacing: 4,
  button: { variant: "solid", weight: 600, uppercase: false },
  theme: "dark",
};

interface DesignTokensPanelProps {
  value?: DesignTokens;
  onChange?: (v: DesignTokens) => void;
}

export function DesignTokensPanel({ value, onChange }: DesignTokensPanelProps) {
  const [internal, setInternal] = useState<DesignTokens>(value ?? DEFAULT_TOKENS);
  const v = value ?? internal;
  const update = (next: DesignTokens) => {
    if (onChange) onChange(next);
    else setInternal(next);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <TokenGroup icon={<Palette className="h-4 w-4" />} title="Cores">
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(v.colors) as (keyof DesignTokens["colors"])[]).map((k) => (
              <ColorField
                key={k}
                label={k}
                value={v.colors[k]}
                onChange={(c) => update({ ...v, colors: { ...v.colors, [k]: c } })}
              />
            ))}
          </div>
        </TokenGroup>

        <TokenGroup icon={<Type className="h-4 w-4" />} title="Tipografia">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Títulos">
              <Input value={v.typography.headingFont} onChange={(e) => update({ ...v, typography: { ...v.typography, headingFont: e.target.value } })} />
            </Field>
            <Field label="Corpo">
              <Input value={v.typography.bodyFont} onChange={(e) => update({ ...v, typography: { ...v.typography, bodyFont: e.target.value } })} />
            </Field>
          </div>
          <SliderRow
            label={`Tamanho base · ${v.typography.baseSize}px`}
            min={12}
            max={22}
            step={1}
            value={v.typography.baseSize}
            onChange={(n) => update({ ...v, typography: { ...v.typography, baseSize: n } })}
          />
          <SliderRow
            label={`Escala · ${v.typography.scale.toFixed(2)}`}
            min={1.1}
            max={1.6}
            step={0.05}
            value={v.typography.scale}
            onChange={(n) => update({ ...v, typography: { ...v.typography, scale: n } })}
          />
        </TokenGroup>

        <TokenGroup icon={<CornerDownRight className="h-4 w-4" />} title="Border radius">
          <SliderRow label={`${v.radius}px`} min={0} max={32} step={1} value={v.radius} onChange={(n) => update({ ...v, radius: n })} />
        </TokenGroup>

        <TokenGroup icon={<Layers className="h-4 w-4" />} title="Sombras">
          {(["sm", "md", "lg"] as const).map((k) => (
            <Field key={k} label={k.toUpperCase()}>
              <Input
                value={v.shadows[k]}
                onChange={(e) => update({ ...v, shadows: { ...v.shadows, [k]: e.target.value } })}
              />
            </Field>
          ))}
        </TokenGroup>

        <TokenGroup icon={<Square className="h-4 w-4" />} title="Espaçamento base">
          <SliderRow label={`${v.spacing}px (1 unit)`} min={2} max={12} step={1} value={v.spacing} onChange={(n) => update({ ...v, spacing: n })} />
        </TokenGroup>

        <TokenGroup icon={v.theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} title="Tema">
          <div className="flex gap-2">
            {(["light", "dark"] as const).map((t) => (
              <Button
                key={t}
                size="sm"
                variant={v.theme === t ? "default" : "outline"}
                onClick={() => update({ ...v, theme: t })}
              >
                {t === "light" ? "Claro" : "Escuro"}
              </Button>
            ))}
          </div>
        </TokenGroup>
      </div>

      <DesignTokensPreview value={v} />
    </div>
  );
}

function TokenGroup({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <header className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon}
        {title}
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs capitalize text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function SliderRow({
  label, min, max, step, value, onChange,
}: { label: string; min: number; max: number; step: number; value: number; onChange: (n: number) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Slider min={min} max={max} step={step} value={[value]} onValueChange={(vv) => onChange(vv[0])} />
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (s: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs capitalize text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-md border border-border bg-transparent"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono text-xs" />
      </div>
    </div>
  );
}

function DesignTokensPreview({ value }: { value: DesignTokens }) {
  const headingSize = value.typography.baseSize * Math.pow(value.typography.scale, 2);
  return (
    <aside
      className={cn(
        "sticky top-4 flex h-fit flex-col gap-4 rounded-xl border border-border p-5 shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.25)]",
      )}
      style={{
        background: value.colors.background,
        color: value.colors.foreground,
        borderRadius: value.radius,
      }}
    >
      <p style={{ fontFamily: value.typography.headingFont, fontSize: headingSize, fontWeight: 700, lineHeight: 1.1 }}>
        Aa
      </p>
      <p style={{ fontFamily: value.typography.bodyFont, fontSize: value.typography.baseSize }}>
        Pré-visualização em tempo real dos tokens.
      </p>
      <div className="flex flex-wrap gap-2">
        {Object.values(value.colors).map((c, i) => (
          <span
            key={i}
            className="h-8 w-8"
            style={{ background: c, borderRadius: value.radius }}
            title={c}
          />
        ))}
      </div>
      <button
        style={{
          background: value.button.variant === "solid" ? value.colors.primary : "transparent",
          color: value.button.variant === "solid" ? value.colors.background : value.colors.primary,
          borderRadius: value.radius,
          padding: `${value.spacing * 2}px ${value.spacing * 4}px`,
          fontWeight: value.button.weight,
          textTransform: value.button.uppercase ? "uppercase" : "none",
          border: `2px solid ${value.colors.primary}`,
          boxShadow: value.shadows.md,
        }}
      >
        Botão exemplo
      </button>
    </aside>
  );
}
