import type { WebsiteTemplate, WebsiteSection } from "@/lib/website-templates";
import type { Intent } from "./types";
import { interpretIntent } from "./IntentInterpreter";

const DOMAIN_LABELS: Record<string, string> = {
  construction: "Construção Civil",
  dental: "Clínica Dentária",
  beauty: "Estética",
  finance: "Finanças",
  realestate: "Imobiliária",
  health: "Saúde",
  agency: "Agência",
  general: "Institucional",
};

function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function extractEmail(prompt: string): string | undefined {
  return prompt.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
}

function extractPhone(prompt: string): string | undefined {
  return prompt.match(/(?:\+?258[\s-]?)?(8[2-7]\d{7})/)?.[0];
}

function extractLocation(prompt: string, intent?: Intent): string | undefined {
  if (intent?.location) return intent.location;

  const explicit = prompt.match(
    /(?:local(?:iza(?:c[aã]o|ção)|iacao)|location|morada|endere[cç]o)\s*:?\s*([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+){0,2})/i,
  )?.[1];
  if (explicit) return titleCase(explicit.trim());

  const known = ["maputo", "moçambique", "mozambique", "angola", "lisboa", "porto", "africa"];
  const hit = known.find((place) => new RegExp(`\\b${place}\\b`, "i").test(prompt));
  return hit ? titleCase(hit) : undefined;
}

function normalizePhone(phone?: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("258")) return digits;
  if (digits.length === 9) return `258${digits}`;
  return digits;
}

function isWeakName(name: string): boolean {
  return /^(peco|peço|criar|create|landing|site|pagina|página)\b/i.test(name.trim());
}

export function inferWebsiteNameFromPrompt(prompt: string, intent = interpretIntent(prompt)): string {
  const email = extractEmail(prompt);
  const emailName = email?.split("@")[0]?.replace(/[._-]+/g, " ");

  if (emailName) {
    const base = titleCase(emailName);
    if (intent.domain === "construction" && !/engenharia|constru/i.test(base)) {
      return `${base} Engenharia`;
    }
    return base;
  }

  if (intent.domain === "construction") return "Empresa de Construção Civil";
  return titleCase(prompt.trim().split(/\s+/).slice(0, 4).join(" "));
}

function makeSection(
  id: string,
  type: WebsiteSection["type"],
  title: string,
  order: number,
  content: Record<string, string>,
): WebsiteSection {
  return { id, type, title, enabled: true, order, content };
}

function wantsStructuredTemplate(prompt: string, intent: Intent): boolean {
  const p = prompt.toLowerCase();
  return (
    intent.domain === "construction" ||
    /institucional|empresa|home|in[ií]cio|sobre n[oó]s|sobre nos|contacto|contato|portf[oó]lio|portofolio|portfolio/i.test(p)
  );
}

export function buildStructuredTemplateFromPrompt(
  prompt: string,
  websiteName: string,
  givenIntent?: Intent,
): WebsiteTemplate | null {
  const intent = givenIntent ?? interpretIntent(prompt);
  if (!wantsStructuredTemplate(prompt, intent)) return null;

  const email = extractEmail(prompt) ?? "construa@gmail.com";
  const phone = extractPhone(prompt) ?? "855253617";
  const location = extractLocation(prompt, intent) ?? "Maputo";
  const brand = !websiteName || isWeakName(websiteName) ? inferWebsiteNameFromPrompt(prompt, intent) : websiteName;
  const isConstruction = intent.domain === "construction";
  const type = /institucional|empresa|home|sobre|contacto|portfolio|portofolio/i.test(prompt)
    ? "institutional"
    : "landing";

  const sections: WebsiteSection[] = isConstruction
    ? [
        makeSection("hero", "hero", "Home", 0, {
          headline: `${brand} constrói com rigor, prazo e confiança.`,
          subheadline: `Empresa de construção civil em ${location}, focada em obras residenciais e comerciais com execução profissional do início ao fim.`,
          ctaText: "Pedir orçamento",
          ctaSecondaryText: "Ver portfólio",
        }),
        makeSection("about", "about", "Sobre Nós", 1, {
          title: `Sobre a ${brand}`,
          description: `Entregamos projetos de construção civil com planeamento sólido, acompanhamento técnico e acabamento de alta qualidade para clientes que procuram confiança e organização.`,
          mission: "Construir espaços duráveis, funcionais e bem executados, com comunicação clara e compromisso com cada detalhe.",
        }),
        makeSection("services", "services", "Serviços", 2, {
          title: "Serviços de Construção",
          subtitle: "Soluções completas para obras e reabilitação",
          service1Title: "Construção Civil",
          service1Description: "Execução de obras residenciais, comerciais e institucionais com controlo técnico e operacional.",
          service2Title: "Remodelação e Reabilitação",
          service2Description: "Renovação de interiores e exteriores para modernizar, valorizar e otimizar espaços existentes.",
          service3Title: "Gestão e Fiscalização de Obra",
          service3Description: "Planeamento, acompanhamento de equipas, controlo de prazos e supervisão de qualidade em cada fase.",
        }),
        makeSection("features", "features", "Vantagens", 3, {
          title: "Porquê Escolher-nos",
          feature1Title: "Planeamento sério",
          feature1Description: "Organização clara, cronogramas realistas e acompanhamento contínuo do projeto.",
          feature2Title: "Execução com qualidade",
          feature2Description: "Materiais adequados, equipas comprometidas e atenção real ao acabamento.",
          feature3Title: "Entrega com confiança",
          feature3Description: "Transparência, responsabilidade e foco em resultados que valorizam o investimento.",
        }),
        makeSection("gallery", "gallery", "Portfólio", 4, {
          title: "Portfólio",
          subtitle: "Projetos e obras desenvolvidos com padrão profissional",
          image1: "",
          image2: "",
          image3: "",
          image4: "",
          image5: "",
          image6: "",
        }),
        makeSection("contact", "contact", "Contacto", 5, {
          title: "Fale Connosco",
          subtitle: "Peça um orçamento e apresente a sua obra",
          email,
          phone,
          whatsappNumber: normalizePhone(phone),
          address: location,
        }),
        makeSection("cta", "cta", "CTA", 6, {
          title: "Vamos tirar a sua obra do papel",
          description: `Se procura uma empresa de construção civil em ${location} com presença profissional e execução séria, fale connosco hoje.`,
          buttonText: "Solicitar contacto",
        }),
      ]
    : [
        makeSection("hero", "hero", "Home", 0, {
          headline: `${brand} com presença profissional e estrutura clara.`,
          subheadline: `Website institucional criado para apresentar serviços, credibilidade e contacto direto em ${location}.`,
          ctaText: "Entrar em contacto",
          ctaSecondaryText: "Saber mais",
        }),
        makeSection("about", "about", "Sobre Nós", 1, {
          title: `Sobre a ${brand}`,
          description: `Uma presença institucional clara, moderna e focada em transmitir confiança desde a primeira visita.`,
          mission: "Apresentar serviços, portfólio e contactos de forma objetiva, elegante e profissional.",
        }),
        makeSection("gallery", "gallery", "Portfólio", 2, {
          title: "Portfólio",
          subtitle: "Projetos e trabalhos em destaque",
          image1: "",
          image2: "",
          image3: "",
          image4: "",
          image5: "",
          image6: "",
        }),
        makeSection("contact", "contact", "Contacto", 3, {
          title: "Contacto",
          subtitle: "Estamos disponíveis para ajudar",
          email,
          phone,
          whatsappNumber: normalizePhone(phone),
          address: location,
        }),
      ];

  return {
    id: "open-build-structured",
    name: brand,
    description: `${DOMAIN_LABELS[intent.domain] ?? DOMAIN_LABELS.general} gerado a partir do prompt`,
    category: "Gerado",
    categoryId: "generated",
    type,
    thumbnail: "/placeholder.svg",
    navItems: [
      { label: "Home", href: "#hero" },
      { label: "Sobre Nós", href: "#about" },
      { label: "Portfólio", href: "#gallery" },
      { label: "Contacto", href: "#contact" },
    ],
    colors: isConstruction
      ? {
          primary: "24 88% 54%",
          secondary: "210 24% 18%",
          accent: "45 95% 58%",
          background: "42 24% 97%",
          text: "218 24% 14%",
        }
      : {
          primary: "220 64% 46%",
          secondary: "176 46% 36%",
          accent: "32 86% 56%",
          background: "0 0% 100%",
          text: "220 28% 14%",
        },
    font: isConstruction ? "Plus Jakarta Sans" : "Inter",
    sections,
  };
}