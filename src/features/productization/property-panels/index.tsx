import { useState, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * Professional property panels for the editor.
 *
 * Eight expert controls — typography, spacing, shadows, gradients,
 * animations, responsive visibility, SEO, accessibility — implemented as
 * controlled, side-effect-free components. The host wires them to its
 * node/section state.
 *
 * All panels share the same value/onChange pattern so they can be
 * composed inside the editor's right-hand inspector.
 */

/* -------------------------------------------------------------------------- */
/*  Shared primitives                                                         */
/* -------------------------------------------------------------------------- */

export function PanelSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 border-b border-border py-4 last:border-b-0">
      <header>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/80">{hint}</p>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Typography                                                                */
/* -------------------------------------------------------------------------- */

export interface TypographyValue {
  fontFamily: string;
  weight: 300 | 400 | 500 | 600 | 700 | 800;
  size: number;
  lineHeight: number;
  letterSpacing: number;
  transform: "none" | "uppercase" | "capitalize";
}

const FONT_OPTIONS = ["Plus Jakarta Sans", "Inter", "DM Sans", "Space Grotesk", "Manrope"];

export function TypographyPanel({
  value,
  onChange,
}: {
  value: TypographyValue;
  onChange: (v: TypographyValue) => void;
}) {
  return (
    <PanelSection title="Tipografia" description="Família, peso e ritmo do texto.">
      <Field label="Família">
        <Select value={value.fontFamily} onValueChange={(v) => onChange({ ...value, fontFamily: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Peso">
          <Select
            value={String(value.weight)}
            onValueChange={(v) => onChange({ ...value, weight: Number(v) as TypographyValue["weight"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[300, 400, 500, 600, 700, 800].map((w) => (
                <SelectItem key={w} value={String(w)}>
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Transformar">
          <Select
            value={value.transform}
            onValueChange={(v) => onChange({ ...value, transform: v as TypographyValue["transform"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Normal</SelectItem>
              <SelectItem value="uppercase">MAIÚSCULAS</SelectItem>
              <SelectItem value="capitalize">Capitalizar</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <SliderField
        label={`Tamanho · ${value.size}px`}
        min={10}
        max={96}
        step={1}
        value={value.size}
        onChange={(n) => onChange({ ...value, size: n })}
      />
      <SliderField
        label={`Altura de linha · ${value.lineHeight.toFixed(2)}`}
        min={0.9}
        max={2}
        step={0.05}
        value={value.lineHeight}
        onChange={(n) => onChange({ ...value, lineHeight: n })}
      />
      <SliderField
        label={`Espaçamento · ${value.letterSpacing.toFixed(2)}em`}
        min={-0.05}
        max={0.2}
        step={0.01}
        value={value.letterSpacing}
        onChange={(n) => onChange({ ...value, letterSpacing: n })}
      />
    </PanelSection>
  );
}

/* -------------------------------------------------------------------------- */
/*  Spacing                                                                   */
/* -------------------------------------------------------------------------- */

export interface SpacingValue {
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  gap: number;
}

export function SpacingPanel({ value, onChange }: { value: SpacingValue; onChange: (v: SpacingValue) => void }) {
  return (
    <PanelSection title="Espaçamento" description="Padding interno e gap entre filhos.">
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ["paddingTop", "Topo"],
            ["paddingRight", "Direita"],
            ["paddingBottom", "Fundo"],
            ["paddingLeft", "Esquerda"],
          ] as const
        ).map(([k, label]) => (
          <Field key={k} label={label}>
            <Input
              type="number"
              value={value[k]}
              onChange={(e) => onChange({ ...value, [k]: Number(e.target.value) || 0 })}
            />
          </Field>
        ))}
      </div>
      <SliderField
        label={`Gap · ${value.gap}px`}
        min={0}
        max={96}
        step={2}
        value={value.gap}
        onChange={(n) => onChange({ ...value, gap: n })}
      />
    </PanelSection>
  );
}

/* -------------------------------------------------------------------------- */
/*  Shadows                                                                   */
/* -------------------------------------------------------------------------- */

export interface ShadowValue {
  enabled: boolean;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

export function ShadowPanel({ value, onChange }: { value: ShadowValue; onChange: (v: ShadowValue) => void }) {
  const preview = value.enabled
    ? `${value.inset ? "inset " : ""}${value.x}px ${value.y}px ${value.blur}px ${value.spread}px ${value.color}`
    : "none";
  return (
    <PanelSection title="Sombras">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Ativar sombra</Label>
        <Switch checked={value.enabled} onCheckedChange={(b) => onChange({ ...value, enabled: b })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <SliderField label={`X · ${value.x}`} min={-50} max={50} step={1} value={value.x} onChange={(n) => onChange({ ...value, x: n })} />
        <SliderField label={`Y · ${value.y}`} min={-50} max={50} step={1} value={value.y} onChange={(n) => onChange({ ...value, y: n })} />
        <SliderField label={`Blur · ${value.blur}`} min={0} max={120} step={1} value={value.blur} onChange={(n) => onChange({ ...value, blur: n })} />
        <SliderField label={`Spread · ${value.spread}`} min={-40} max={40} step={1} value={value.spread} onChange={(n) => onChange({ ...value, spread: n })} />
      </div>
      <Field label="Cor">
        <Input type="color" value={value.color} onChange={(e) => onChange({ ...value, color: e.target.value })} />
      </Field>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Sombra interna</Label>
        <Switch checked={value.inset} onCheckedChange={(b) => onChange({ ...value, inset: b })} />
      </div>
      <div
        className="h-12 w-full rounded-md border border-border bg-card"
        style={{ boxShadow: preview }}
      />
    </PanelSection>
  );
}

/* -------------------------------------------------------------------------- */
/*  Gradients                                                                 */
/* -------------------------------------------------------------------------- */

export interface GradientValue {
  enabled: boolean;
  type: "linear" | "radial";
  angle: number;
  from: string;
  to: string;
}

export function GradientPanel({ value, onChange }: { value: GradientValue; onChange: (v: GradientValue) => void }) {
  const css =
    value.type === "linear"
      ? `linear-gradient(${value.angle}deg, ${value.from}, ${value.to})`
      : `radial-gradient(circle, ${value.from}, ${value.to})`;
  return (
    <PanelSection title="Gradientes">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Ativar gradiente</Label>
        <Switch checked={value.enabled} onCheckedChange={(b) => onChange({ ...value, enabled: b })} />
      </div>
      <Field label="Tipo">
        <Select value={value.type} onValueChange={(v) => onChange({ ...value, type: v as GradientValue["type"] })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linear">Linear</SelectItem>
            <SelectItem value="radial">Radial</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      {value.type === "linear" && (
        <SliderField label={`Ângulo · ${value.angle}°`} min={0} max={360} step={5} value={value.angle} onChange={(n) => onChange({ ...value, angle: n })} />
      )}
      <div className="grid grid-cols-2 gap-2">
        <Field label="De"><Input type="color" value={value.from} onChange={(e) => onChange({ ...value, from: e.target.value })} /></Field>
        <Field label="Para"><Input type="color" value={value.to} onChange={(e) => onChange({ ...value, to: e.target.value })} /></Field>
      </div>
      <div className="h-12 w-full rounded-md border border-border" style={{ background: css }} />
    </PanelSection>
  );
}

/* -------------------------------------------------------------------------- */
/*  Animation                                                                 */
/* -------------------------------------------------------------------------- */

export type AnimationPreset = "none" | "fade-in" | "slide-up" | "scale-in" | "rotate-in";

export interface AnimationValue {
  preset: AnimationPreset;
  duration: number;
  delay: number;
  easing: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";
  repeat: boolean;
}

export function AnimationPanel({ value, onChange }: { value: AnimationValue; onChange: (v: AnimationValue) => void }) {
  return (
    <PanelSection title="Animações">
      <Field label="Preset">
        <Select value={value.preset} onValueChange={(v) => onChange({ ...value, preset: v as AnimationPreset })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma</SelectItem>
            <SelectItem value="fade-in">Fade in</SelectItem>
            <SelectItem value="slide-up">Slide up</SelectItem>
            <SelectItem value="scale-in">Scale in</SelectItem>
            <SelectItem value="rotate-in">Rotate in</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <SliderField label={`Duração · ${value.duration}ms`} min={100} max={2000} step={50} value={value.duration} onChange={(n) => onChange({ ...value, duration: n })} />
      <SliderField label={`Atraso · ${value.delay}ms`} min={0} max={2000} step={50} value={value.delay} onChange={(n) => onChange({ ...value, delay: n })} />
      <Field label="Easing">
        <Select value={value.easing} onValueChange={(v) => onChange({ ...value, easing: v as AnimationValue["easing"] })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["linear", "ease", "ease-in", "ease-out", "ease-in-out"] as const).map((e) => (
              <SelectItem key={e} value={e}>{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Repetir</Label>
        <Switch checked={value.repeat} onCheckedChange={(b) => onChange({ ...value, repeat: b })} />
      </div>
    </PanelSection>
  );
}

/* -------------------------------------------------------------------------- */
/*  Responsive visibility                                                     */
/* -------------------------------------------------------------------------- */

export interface ResponsiveVisibilityValue {
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;
}

export function ResponsiveVisibilityPanel({
  value,
  onChange,
}: {
  value: ResponsiveVisibilityValue;
  onChange: (v: ResponsiveVisibilityValue) => void;
}) {
  return (
    <PanelSection title="Visibilidade Responsiva" description="Mostrar/esconder por dispositivo.">
      {(["mobile", "tablet", "desktop"] as const).map((bp) => (
        <div key={bp} className="flex items-center justify-between">
          <Label className="text-xs capitalize">{bp === "mobile" ? "Telemóvel" : bp === "tablet" ? "Tablet" : "Desktop"}</Label>
          <Switch checked={value[bp]} onCheckedChange={(b) => onChange({ ...value, [bp]: b })} />
        </div>
      ))}
    </PanelSection>
  );
}

/* -------------------------------------------------------------------------- */
/*  SEO                                                                       */
/* -------------------------------------------------------------------------- */

export interface SEOValue {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogImage: string;
  noindex: boolean;
}

export function SEOPanel({ value, onChange }: { value: SEOValue; onChange: (v: SEOValue) => void }) {
  return (
    <PanelSection title="SEO" description="Metadados para pesquisa e partilhas.">
      <Field label="Título" hint={`${value.title.length}/60`}>
        <Input value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} maxLength={60} />
      </Field>
      <Field label="Descrição" hint={`${value.description.length}/160`}>
        <Textarea
          rows={3}
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          maxLength={160}
        />
      </Field>
      <Field label="Palavras-chave">
        <Input value={value.keywords} onChange={(e) => onChange({ ...value, keywords: e.target.value })} placeholder="restaurante, maputo, marisco" />
      </Field>
      <Field label="URL canónico">
        <Input value={value.canonical} onChange={(e) => onChange({ ...value, canonical: e.target.value })} placeholder="https://…" />
      </Field>
      <Field label="Imagem OG">
        <Input value={value.ogImage} onChange={(e) => onChange({ ...value, ogImage: e.target.value })} placeholder="https://…" />
      </Field>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Não indexar</Label>
        <Switch checked={value.noindex} onCheckedChange={(b) => onChange({ ...value, noindex: b })} />
      </div>
    </PanelSection>
  );
}

/* -------------------------------------------------------------------------- */
/*  Accessibility                                                             */
/* -------------------------------------------------------------------------- */

export interface AccessibilityValue {
  ariaLabel: string;
  role: string;
  altText: string;
  reduceMotion: boolean;
  highContrast: boolean;
}

export function AccessibilityPanel({
  value,
  onChange,
}: {
  value: AccessibilityValue;
  onChange: (v: AccessibilityValue) => void;
}) {
  return (
    <PanelSection title="Acessibilidade" description="WAI-ARIA, alternativas e preferências.">
      <Field label="aria-label">
        <Input value={value.ariaLabel} onChange={(e) => onChange({ ...value, ariaLabel: e.target.value })} />
      </Field>
      <Field label="role">
        <Input value={value.role} onChange={(e) => onChange({ ...value, role: e.target.value })} placeholder="ex: region, button" />
      </Field>
      <Field label="Texto alternativo (img)">
        <Input value={value.altText} onChange={(e) => onChange({ ...value, altText: e.target.value })} />
      </Field>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Reduzir movimento</Label>
        <Switch checked={value.reduceMotion} onCheckedChange={(b) => onChange({ ...value, reduceMotion: b })} />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Alto contraste</Label>
        <Switch checked={value.highContrast} onCheckedChange={(b) => onChange({ ...value, highContrast: b })} />
      </div>
    </PanelSection>
  );
}

/* -------------------------------------------------------------------------- */
/*  Reusable                                                                  */
/* -------------------------------------------------------------------------- */

function SliderField({
  label,
  min,
  max,
  step,
  value,
  onChange,
  className,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Slider min={min} max={max} step={step} value={[value]} onValueChange={(v) => onChange(v[0])} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Composed inspector — convenience                                          */
/* -------------------------------------------------------------------------- */

export interface InspectorValue {
  typography: TypographyValue;
  spacing: SpacingValue;
  shadow: ShadowValue;
  gradient: GradientValue;
  animation: AnimationValue;
  responsive: ResponsiveVisibilityValue;
  seo: SEOValue;
  accessibility: AccessibilityValue;
}

export const INSPECTOR_DEFAULTS: InspectorValue = {
  typography: { fontFamily: "Plus Jakarta Sans", weight: 500, size: 16, lineHeight: 1.5, letterSpacing: 0, transform: "none" },
  spacing: { paddingTop: 24, paddingRight: 24, paddingBottom: 24, paddingLeft: 24, gap: 16 },
  shadow: { enabled: false, x: 0, y: 10, blur: 30, spread: -10, color: "#000000", opacity: 0.25, inset: false },
  gradient: { enabled: false, type: "linear", angle: 135, from: "#06b6d4", to: "#2563eb" },
  animation: { preset: "fade-in", duration: 400, delay: 0, easing: "ease-out", repeat: false },
  responsive: { mobile: true, tablet: true, desktop: true },
  seo: { title: "", description: "", keywords: "", canonical: "", ogImage: "", noindex: false },
  accessibility: { ariaLabel: "", role: "", altText: "", reduceMotion: false, highContrast: false },
};

export function PropertyInspector({
  value,
  onChange,
}: {
  value: InspectorValue;
  onChange: (v: InspectorValue) => void;
}) {
  const patch = <K extends keyof InspectorValue>(k: K, v: InspectorValue[K]) =>
    onChange({ ...value, [k]: v });
  return (
    <div className="divide-y divide-border">
      <TypographyPanel value={value.typography} onChange={(v) => patch("typography", v)} />
      <SpacingPanel value={value.spacing} onChange={(v) => patch("spacing", v)} />
      <ShadowPanel value={value.shadow} onChange={(v) => patch("shadow", v)} />
      <GradientPanel value={value.gradient} onChange={(v) => patch("gradient", v)} />
      <AnimationPanel value={value.animation} onChange={(v) => patch("animation", v)} />
      <ResponsiveVisibilityPanel value={value.responsive} onChange={(v) => patch("responsive", v)} />
      <SEOPanel value={value.seo} onChange={(v) => patch("seo", v)} />
      <AccessibilityPanel value={value.accessibility} onChange={(v) => patch("accessibility", v)} />
    </div>
  );
}

/** Convenience hook for the showcase / standalone usage. */
export function useInspectorState(initial: InspectorValue = INSPECTOR_DEFAULTS) {
  const [value, setValue] = useState<InspectorValue>(initial);
  return { value, setValue };
}
