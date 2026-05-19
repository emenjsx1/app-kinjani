/**
 * Template Marketplace foundation.
 *
 * Curated catalog of premium kits — landing pages, funnels, and African
 * business templates — used to seed the project creation flow and the
 * future marketplace surface. Pure data layer, UI-agnostic.
 */

export type TemplateCategory =
  | "landing"
  | "funnel"
  | "restaurant"
  | "salon"
  | "market"
  | "services"
  | "events"
  | "education"
  | "agency";

export type TemplateTier = "free" | "premium";

export interface TemplateKit {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  tier: TemplateTier;
  /** Tags shown as chips in the marketplace. */
  tags: string[];
  /** Hex / HSL accent shown in the card hero. */
  accent: string;
  /** Optional thumbnail URL (data: or http). */
  thumbnailUrl?: string;
  /** WhatsApp-first lead capture by default. */
  whatsappLeadCapture?: boolean;
  /** Includes M-Pesa / e-Mola payment instruction block. */
  mzPayments?: boolean;
  /** Conversion-first layout markers. */
  conversionFirst?: boolean;
}

export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string }[] = [
  { id: "landing", label: "Landing pages" },
  { id: "funnel", label: "Funis" },
  { id: "restaurant", label: "Restaurantes" },
  { id: "salon", label: "Salões e estética" },
  { id: "market", label: "Mercados e lojas" },
  { id: "services", label: "Serviços" },
  { id: "events", label: "Eventos" },
  { id: "education", label: "Educação" },
  { id: "agency", label: "Agências" },
];

export const TEMPLATE_REGISTRY: TemplateKit[] = [
  {
    id: "kit-landing-startup",
    name: "Startup MVP",
    description: "Landing minimalista para validar uma ideia em 24h.",
    category: "landing",
    tier: "free",
    tags: ["minimal", "saas"],
    accent: "hsl(220, 90%, 56%)",
    conversionFirst: true,
  },
  {
    id: "kit-funnel-leadmagnet",
    name: "Funil Lead Magnet",
    description: "Captura de leads com e-book gratuito e sequência WhatsApp.",
    category: "funnel",
    tier: "premium",
    tags: ["leads", "whatsapp"],
    accent: "hsl(152, 100%, 44%)",
    whatsappLeadCapture: true,
    conversionFirst: true,
  },
  {
    id: "kit-restaurant-maputo",
    name: "Restaurante Maputo",
    description: "Menu visual, reservas via WhatsApp, M-Pesa e e-Mola integrados.",
    category: "restaurant",
    tier: "premium",
    tags: ["menu", "whatsapp", "mpesa", "emola"],
    accent: "hsl(20, 92%, 55%)",
    whatsappLeadCapture: true,
    mzPayments: true,
    conversionFirst: true,
  },
  {
    id: "kit-salon-beauty",
    name: "Salão Beleza",
    description: "Catálogo de serviços, marcação online e galeria antes/depois.",
    category: "salon",
    tier: "premium",
    tags: ["agendamento", "galeria"],
    accent: "hsl(330, 85%, 58%)",
    whatsappLeadCapture: true,
    mzPayments: true,
  },
  {
    id: "kit-market-loja",
    name: "Loja de Bairro",
    description: "Catálogo simples com encomenda direta via WhatsApp.",
    category: "market",
    tier: "free",
    tags: ["catálogo", "whatsapp"],
    accent: "hsl(38, 92%, 50%)",
    whatsappLeadCapture: true,
    mzPayments: true,
  },
  {
    id: "kit-services-consultor",
    name: "Consultor Profissional",
    description: "Apresentação de serviços, casos de sucesso e CTA WhatsApp.",
    category: "services",
    tier: "free",
    tags: ["b2b", "portfolio"],
    accent: "hsl(168, 65%, 35%)",
    whatsappLeadCapture: true,
  },
  {
    id: "kit-events-festa",
    name: "Evento ao Vivo",
    description: "Página de evento com countdown, line-up e bilhetes M-Pesa.",
    category: "events",
    tier: "premium",
    tags: ["countdown", "mpesa"],
    accent: "hsl(280, 70%, 55%)",
    mzPayments: true,
    conversionFirst: true,
  },
  {
    id: "kit-education-curso",
    name: "Curso Online",
    description: "Página de venda de curso com módulos, depoimentos e checkout.",
    category: "education",
    tier: "premium",
    tags: ["curso", "checkout"],
    accent: "hsl(199, 89%, 48%)",
    mzPayments: true,
    conversionFirst: true,
  },
  {
    id: "kit-agency-whitelabel",
    name: "Agência White-Label",
    description: "Site institucional para agências revenderem o Kinjani.",
    category: "agency",
    tier: "premium",
    tags: ["b2b", "agência"],
    accent: "hsl(252, 70%, 60%)",
  },
];

export function filterTemplates(
  kits: TemplateKit[],
  q: { category?: TemplateCategory | "all"; tier?: TemplateTier | "all"; search?: string },
): TemplateKit[] {
  const search = (q.search ?? "").toLowerCase();
  return kits.filter(
    (k) =>
      (!q.category || q.category === "all" || k.category === q.category) &&
      (!q.tier || q.tier === "all" || k.tier === q.tier) &&
      (search === "" ||
        k.name.toLowerCase().includes(search) ||
        k.description.toLowerCase().includes(search) ||
        k.tags.some((t) => t.includes(search))),
  );
}
