import { supabase } from "@/integrations/supabase/client";
import type { WebsiteTemplate, WebsiteSection } from "@/lib/website-templates";

export interface AIPlanSection {
  type: WebsiteSection["type"];
  title: string;
  content: Record<string, string>;
}

export interface AIWebsitePlan {
  brand: string;
  tagline: string;
  type: "landing" | "institutional";
  domainLabel: string;
  contact: { email: string; phone: string; address: string };
  palette: { primary: string; secondary: string; accent: string; background: string; text: string };
  font: string;
  sections: AIPlanSection[];
}

const ALLOWED: WebsiteSection["type"][] = [
  "hero","about","services","features","gallery","team",
  "testimonials","pricing","faq","contact","cta","booking",
];

export async function planWebsiteWithAI(prompt: string, websiteName?: string): Promise<AIWebsitePlan | null> {
  try {
    const { data, error } = await supabase.functions.invoke("plan-website", {
      body: { prompt, websiteName },
    });
    if (error) {
      console.warn("[planWebsiteWithAI] invoke error", error);
      return null;
    }
    if (!data?.success || !data?.plan) return null;
    return data.plan as AIWebsitePlan;
  } catch (e) {
    console.warn("[planWebsiteWithAI] threw", e);
    return null;
  }
}

export function templateFromAIPlan(plan: AIWebsitePlan, fallbackName: string): WebsiteTemplate {
  const sections: WebsiteSection[] = plan.sections
    .filter((s) => ALLOWED.includes(s.type))
    .map((s, idx) => ({
      id: `${s.type}-${idx}`,
      type: s.type,
      title: s.title || s.type,
      enabled: true,
      order: idx,
      content: {
        ...s.content,
        // ensure contact-ish sections have the extracted info available
        ...(s.type === "contact" || s.type === "booking"
          ? {
              email: s.content.email || plan.contact.email,
              phone: s.content.phone || plan.contact.phone,
              whatsappNumber: (s.content.whatsappNumber || plan.contact.phone || "").replace(/\D/g, ""),
              address: s.content.address || plan.contact.address,
            }
          : {}),
      },
    }));

  const navItems = sections
    .filter((s) => ["hero", "about", "services", "gallery", "pricing", "booking", "contact"].includes(s.type))
    .map((s) => ({
      label:
        s.type === "hero" ? "Home" :
        s.type === "about" ? "Sobre" :
        s.type === "services" ? "Serviços" :
        s.type === "gallery" ? "Portfólio" :
        s.type === "pricing" ? "Preços" :
        s.type === "booking" ? "Marcar" :
        s.type === "contact" ? "Contacto" :
        s.title,
      href: `#${s.id}`,
    }));

  return {
    id: "ai-planned",
    name: plan.brand || fallbackName,
    description: plan.domainLabel || "Gerado por IA",
    category: "Gerado",
    categoryId: "ai-planned",
    type: plan.type,
    thumbnail: "/placeholder.svg",
    navItems,
    colors: {
      primary: plan.palette.primary,
      secondary: plan.palette.secondary,
      accent: plan.palette.accent,
      background: plan.palette.background,
      text: plan.palette.text,
    },
    font: plan.font || "Inter",
    sections,
  };
}
