import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientBrandingForm } from "./ClientBrandingForm";
import { useClients, CreateClientData } from "@/hooks/useClients";
import { Loader2, UserPlus } from "lucide-react";

interface CreateClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateClientDialog({ open, onOpenChange }: CreateClientDialogProps) {
  const { createClient } = useClients();
  const [formData, setFormData] = useState<CreateClientData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    plan: "basic",
    monthly_value: 0,
    primary_color: "#6366f1",
    secondary_color: "#8b5cf6",
    accent_color: "#06b6d4",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    await createClient.mutateAsync(formData);
    onOpenChange(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      plan: "basic",
      monthly_value: 0,
      primary_color: "#6366f1",
      secondary_color: "#8b5cf6",
      accent_color: "#06b6d4",
    });
  };

  const handleBrandingChange = (branding: Partial<CreateClientData>) => {
    setFormData((prev) => ({ ...prev, ...branding }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Novo Cliente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do cliente"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                value={formData.company || ""}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Nome da empresa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+351 912 345 678"
              />
            </div>
          </div>

          {/* Plan & Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan">Plano</Label>
              <Select
                value={formData.plan}
                onValueChange={(value) => setFormData({ ...formData, plan: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="pro">Profissional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly_value">Valor Mensal (MZN)</Label>
              <Input
                id="monthly_value"
                type="number"
                min="0"
                step="1"
                value={formData.monthly_value || ""}
                onChange={(e) =>
                  setFormData({ ...formData, monthly_value: parseFloat(e.target.value) || 0 })
                }
                placeholder="2500"
              />
            </div>
          </div>

          {/* Branding */}
          <ClientBrandingForm
            logoUrl={formData.logo_url}
            primaryColor={formData.primary_color}
            secondaryColor={formData.secondary_color}
            accentColor={formData.accent_color}
            onChange={handleBrandingChange}
          />

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createClient.isPending || !formData.name.trim()}>
              {createClient.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Cliente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
