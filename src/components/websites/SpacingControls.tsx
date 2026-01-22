import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpacingConfig, SPACING_OPTIONS, DEFAULT_SPACING } from "./widgets/WidgetTypes";

interface SpacingControlsProps {
  spacing: SpacingConfig;
  onChange: (spacing: SpacingConfig) => void;
}

export function SpacingControls({ spacing, onChange }: SpacingControlsProps) {
  const updateSpacing = (key: keyof SpacingConfig, value: string) => {
    onChange({ ...spacing, [key]: value });
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Espaçamento</h4>
      
      {/* Padding */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Padding Topo</Label>
          <Select
            value={spacing.paddingTop || DEFAULT_SPACING.paddingTop}
            onValueChange={(v) => updateSpacing("paddingTop", v)}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPACING_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Padding Base</Label>
          <Select
            value={spacing.paddingBottom || DEFAULT_SPACING.paddingBottom}
            onValueChange={(v) => updateSpacing("paddingBottom", v)}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPACING_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Padding Esq.</Label>
          <Select
            value={spacing.paddingLeft || DEFAULT_SPACING.paddingLeft}
            onValueChange={(v) => updateSpacing("paddingLeft", v)}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPACING_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Padding Dir.</Label>
          <Select
            value={spacing.paddingRight || DEFAULT_SPACING.paddingRight}
            onValueChange={(v) => updateSpacing("paddingRight", v)}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPACING_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Margin */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Margem Topo</Label>
          <Select
            value={spacing.marginTop || DEFAULT_SPACING.marginTop}
            onValueChange={(v) => updateSpacing("marginTop", v)}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPACING_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Margem Base</Label>
          <Select
            value={spacing.marginBottom || DEFAULT_SPACING.marginBottom}
            onValueChange={(v) => updateSpacing("marginBottom", v)}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPACING_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Visual Preview */}
      <div className="mt-2 border rounded-lg p-2 bg-muted/30">
        <div className="text-xs text-center text-muted-foreground mb-1">Pré-visualização</div>
        <div className="flex justify-center">
          <div 
            className="border-2 border-dashed border-primary/30 bg-primary/10 rounded"
            style={{
              padding: `${parseInt(spacing.paddingTop || "16") / 4}px ${parseInt(spacing.paddingRight || "8") / 4}px ${parseInt(spacing.paddingBottom || "16") / 4}px ${parseInt(spacing.paddingLeft || "8") / 4}px`,
              margin: `${parseInt(spacing.marginTop || "0") / 4}px 0 ${parseInt(spacing.marginBottom || "0") / 4}px 0`,
            }}
          >
            <div className="w-16 h-6 bg-primary/20 rounded text-xs flex items-center justify-center text-primary">
              Secção
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
