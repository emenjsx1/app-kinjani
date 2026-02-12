import { WebsiteSection } from "@/lib/website-templates";

export interface SectionProps {
  section: WebsiteSection;
  primaryColor: string;
  secondaryColor: string;
  font: string;
  variant?: number;
  onCtaClick?: (action?: string) => void;
  scrollToSection?: (id: string) => void;
}
