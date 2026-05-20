// Frontend credit cost table mirroring supabase/functions/_shared/credits.ts
// Keep these values in sync.

export type CreditAction =
  | "chat_text_short"
  | "chat_text_long"
  | "chat_image"
  | "chat_audio"
  | "chat_pdf"
  | "site_create"
  | "site_edit_micro"
  | "site_edit_small"
  | "site_edit_medium"
  | "site_edit_large"
  | "site_edit_massive"
  | "agent_create_ai"
  | "lead_scraper"
  | "email_blast"
  | "whatsapp_blast"
  | "whatsapp_instance_monthly";

export const CREDIT_COSTS: Record<CreditAction, number> = {
  chat_text_short: 1,
  chat_text_long: 2,
  chat_image: 3,
  chat_audio: 3,
  chat_pdf: 5,
  site_create: 50,
  site_edit_micro: 2,
  site_edit_small: 5,
  site_edit_medium: 15,
  site_edit_large: 30,
  site_edit_massive: 50,
  agent_create_ai: 5,
  lead_scraper: 15,
  email_blast: 1,
  whatsapp_blast: 1,
  whatsapp_instance_monthly: 50,
};

export const CREDIT_LABELS: Record<CreditAction, string> = {
  chat_text_short: "Mensagem (texto curto)",
  chat_text_long: "Mensagem (texto longo)",
  chat_image: "Mensagem com imagem",
  chat_audio: "Mensagem com áudio",
  chat_pdf: "Mensagem com PDF",
  site_create: "Criação de site",
  site_edit_micro: "Edição micro de site",
  site_edit_small: "Edição pequena de site",
  site_edit_medium: "Edição média de site",
  site_edit_large: "Edição grande de site",
  site_edit_massive: "Edição massiva de site",
  agent_create_ai: "Criação de agente com IA",
  lead_scraper: "Lead scraper",
  email_blast: "Email blast (por destinatário)",
  whatsapp_blast: "WhatsApp blast (por destinatário)",
  whatsapp_instance_monthly: "Instância WhatsApp / mês",
};

export const LOW_CREDIT_THRESHOLD = 100;
export const CONFIRM_COST_THRESHOLD = 10;
