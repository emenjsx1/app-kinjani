import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Upload, Eye, Save } from "lucide-react";
import { useStorageUpload } from "@/hooks/useStorageUpload";
import { Client } from "@/hooks/useClients";

export interface ClientBrandingFormProps {
  // Mode 1: Standalone with client object
  client?: Client;
  onSave?: (data: {
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
  }) => Promise<void>;
  // Mode 2: Controlled with individual props
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  onChange?: (branding: {
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
  }) => void;
}

export function ClientBrandingForm({
  client,
  onSave,
  logoUrl,
  primaryColor,
  secondaryColor,
  accentColor,
  onChange,
}: ClientBrandingFormProps) {
  // Determine initial values from client or props
  const initialPrimary = client?.primary_color || primaryColor || "#6366f1";
  const initialSecondary = client?.secondary_color || secondaryColor || "#8b5cf6";
  const initialAccent = client?.accent_color || accentColor || "#06b6d4";
  const initialLogo = client?.logo_url || logoUrl || "";
  const [colors, setColors] = useState({
    primary: initialPrimary,
    secondary: initialSecondary,
    accent: initialAccent,
  });
  const [logo, setLogo] = useState(initialLogo);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { uploadFile, isUploading } = useStorageUpload();

  useEffect(() => {
    const newPrimary = client?.primary_color || primaryColor || "#6366f1";
    const newSecondary = client?.secondary_color || secondaryColor || "#8b5cf6";
    const newAccent = client?.accent_color || accentColor || "#06b6d4";
    const newLogo = client?.logo_url || logoUrl || "";
    
    setColors({
      primary: newPrimary,
      secondary: newSecondary,
      accent: newAccent,
    });
    setLogo(newLogo);
    setHasChanges(false);
  }, [client, primaryColor, secondaryColor, accentColor, logoUrl]);

  const handleColorChange = (key: "primary" | "secondary" | "accent", value: string) => {
    const newColors = { ...colors, [key]: value };
    setColors(newColors);
    setHasChanges(true);
    onChange?.({
      primary_color: newColors.primary,
      secondary_color: newColors.secondary,
      accent_color: newColors.accent,
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadFile(file, "website-assets");
    if (url) {
      setLogo(url);
      setHasChanges(true);
      onChange?.({ logo_url: url });
    }
  };

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave({
        logo_url: logo || undefined,
        primary_color: colors.primary,
        secondary_color: colors.secondary,
        accent_color: colors.accent,
      });
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="h-5 w-5" />
          Personalização White-Label
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Upload */}
        <div className="space-y-3">
          <Label>Logo do Cliente</Label>
          <div className="flex items-center gap-4">
            <div
              className="h-16 w-16 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted"
              style={{ borderColor: colors.primary }}
            >
              {logo ? (
                <img src={logo} alt="Logo" className="h-full w-full object-contain" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={isUploading}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG ou SVG. Máx 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Color Pickers */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary-color">Cor Primária</Label>
            <div className="flex gap-2">
              <Input
                id="primary-color"
                type="color"
                value={colors.primary}
                onChange={(e) => handleColorChange("primary", e.target.value)}
                className="h-10 w-14 p-1 cursor-pointer"
              />
              <Input
                value={colors.primary}
                onChange={(e) => handleColorChange("primary", e.target.value)}
                className="flex-1 font-mono text-sm"
                placeholder="#6366f1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary-color">Cor Secundária</Label>
            <div className="flex gap-2">
              <Input
                id="secondary-color"
                type="color"
                value={colors.secondary}
                onChange={(e) => handleColorChange("secondary", e.target.value)}
                className="h-10 w-14 p-1 cursor-pointer"
              />
              <Input
                value={colors.secondary}
                onChange={(e) => handleColorChange("secondary", e.target.value)}
                className="flex-1 font-mono text-sm"
                placeholder="#8b5cf6"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accent-color">Cor de Destaque</Label>
            <div className="flex gap-2">
              <Input
                id="accent-color"
                type="color"
                value={colors.accent}
                onChange={(e) => handleColorChange("accent", e.target.value)}
                className="h-10 w-14 p-1 cursor-pointer"
              />
              <Input
                value={colors.accent}
                onChange={(e) => handleColorChange("accent", e.target.value)}
                className="flex-1 font-mono text-sm"
                placeholder="#06b6d4"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Pré-visualização
          </Label>
          <div
            className="rounded-lg p-4 space-y-3"
            style={{ backgroundColor: colors.primary + "10" }}
          >
            <div className="flex items-center gap-3">
              {logo && (
                <img src={logo} alt="Preview" className="h-8 w-8 object-contain" />
              )}
              <span
                className="font-semibold"
                style={{ color: colors.primary }}
              >
                Nome do Cliente
              </span>
            </div>
            <div className="flex gap-2">
              <div
                className="px-4 py-2 rounded-md text-white text-sm font-medium"
                style={{ backgroundColor: colors.primary }}
              >
                Botão Primário
              </div>
              <div
                className="px-4 py-2 rounded-md text-white text-sm font-medium"
                style={{ backgroundColor: colors.secondary }}
              >
                Secundário
              </div>
              <div
                className="px-4 py-2 rounded-md text-white text-sm font-medium"
                style={{ backgroundColor: colors.accent }}
              >
                Destaque
              </div>
            </div>
          </div>
        </div>

        {/* Save Button (only in standalone mode) */}
        {onSave && (
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "A guardar..." : "Guardar Alterações"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
