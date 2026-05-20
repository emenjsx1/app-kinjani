import { forwardRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { WebsiteTemplate, WebsiteSection } from "@/lib/website-templates";
import { cn } from "@/lib/utils";
import {
  HeroSection,
  AboutSection,
  ServicesSection,
  FeaturesSection,
  TestimonialsSection,
  CtaSection,
  ContactSection,
  TeamSection,
  GallerySection,
  PricingSection,
  FaqSection,
  BookingSection,
} from "./sections";
import { 
  CounterWidget, 
  AccordionWidget, 
  TabsWidget, 
  SliderWidget, 
  PricingTableWidget,
  VideoWidget,
  ImageTextWidget,
  IconBoxWidget,
  DividerWidget,
  SpacerWidget
} from "./widgets";

interface EmbedConfig {
  enabled: boolean;
  agentId?: string;
  position?: "right" | "left";
  primaryColor?: string;
  welcomeMessage?: string;
}

export interface WebsitePreviewProps {
  template: WebsiteTemplate;
  websiteName?: string;
  showChatWidget?: boolean;
  fullscreen?: boolean;
  embedConfig?: EmbedConfig;
}

export const WebsitePreview = forwardRef<HTMLDivElement, WebsitePreviewProps>(function WebsitePreview({ 
  template, 
  websiteName, 
  showChatWidget = true,
  fullscreen = false,
  embedConfig,
}, ref) {
  const displayName = websiteName || template.name || "Meu Site";
  const enabledSections = template.sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  const primaryColor = `hsl(${template.colors.primary})`;
  const secondaryColor = `hsl(${template.colors.secondary})`;

  const contactSection = template.sections.find(s => s.type === "contact");
  const whatsappNumber = contactSection?.content.whatsappNumber || contactSection?.content.phone?.replace(/\D/g, "");

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCtaClick = (action?: string) => {
    if (action === "whatsapp" && whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber}`, "_blank");
    } else {
      scrollToSection("contact");
    }
  };

  // Nav items from enabled sections
  const navItems = [
    { label: "Início", id: "hero" },
    ...enabledSections
      .filter(s => ["about", "services", "features", "team", "gallery", "pricing", "faq"].includes(s.type))
      .map(s => ({
        label: s.type === "about" ? "Sobre" : s.type === "services" ? "Serviços" : s.type === "features" ? "Vantagens" :
               s.type === "team" ? "Equipa" : s.type === "gallery" ? "Galeria" : s.type === "pricing" ? "Preços" :
               s.type === "faq" ? "FAQ" : s.title,
        id: s.id
      })),
    ...(enabledSections.some(s => s.type === "contact") ? [{ label: "Contacto", id: "contact" }] : [])
  ];

  const sharedProps = (section: WebsiteSection) => ({
    section,
    primaryColor,
    secondaryColor,
    font: template.font,
    variant: section.variant || 1,
    bannerUrl: section.type === "hero" ? template.bannerUrl : undefined,
    onCtaClick: handleCtaClick,
    scrollToSection,
  });

  const renderSection = (section: WebsiteSection) => {
    const props = sharedProps(section);
    switch (section.type) {
      case "hero": return <HeroSection key={section.id} {...props} />;
      case "about": return <AboutSection key={section.id} {...props} />;
      case "services": return <ServicesSection key={section.id} {...props} />;
      case "features": return <FeaturesSection key={section.id} {...props} />;
      case "testimonials": return <TestimonialsSection key={section.id} {...props} />;
      case "cta": return <CtaSection key={section.id} {...props} />;
      case "contact": return <ContactSection key={section.id} {...props} />;
      case "team": return <TeamSection key={section.id} {...props} />;
      case "gallery": return <GallerySection key={section.id} {...props} />;
      case "pricing": return <PricingSection key={section.id} {...props} />;
      case "faq": return <FaqSection key={section.id} {...props} />;
      case "booking": return <BookingSection key={section.id} {...props} />;
      case "counter": return <CounterWidget key={section.id} content={section.content} primaryColor={primaryColor} font={template.font} />;
      case "accordion": return <AccordionWidget key={section.id} content={section.content} primaryColor={primaryColor} font={template.font} />;
      case "tabs": return <TabsWidget key={section.id} content={section.content} primaryColor={primaryColor} font={template.font} />;
      case "slider": return <SliderWidget key={section.id} content={section.content} primaryColor={primaryColor} font={template.font} />;
      case "pricing-table": return <PricingTableWidget key={section.id} content={section.content} primaryColor={primaryColor} font={template.font} onCtaClick={() => handleCtaClick()} />;
      case "video": return <VideoWidget key={section.id} content={section.content} primaryColor={primaryColor} font={template.font} />;
      case "image-text": return <ImageTextWidget key={section.id} content={section.content} primaryColor={primaryColor} font={template.font} onCtaClick={() => handleCtaClick()} />;
      case "icon-box": return <IconBoxWidget key={section.id} content={section.content} primaryColor={primaryColor} font={template.font} />;
      case "divider": return <DividerWidget key={section.id} content={section.content} primaryColor={primaryColor} />;
      case "spacer": return <SpacerWidget key={section.id} content={section.content} />;
      default: return null;
    }
  };

  const showWidget = embedConfig?.enabled ?? showChatWidget;
  const widgetPosition = embedConfig?.position || "right";
  const widgetColor = embedConfig?.primaryColor || primaryColor;

  return (
    <div ref={ref} className={cn("relative", fullscreen ? "min-h-screen" : "min-h-[600px]")} style={{ fontFamily: template.font }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection("hero")}>
          {template.logoUrl ? (
            <img src={template.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
          ) : (
            <span className="font-bold text-lg" style={{ color: primaryColor }}>{displayName}</span>
          )}
          {template.logoUrl && template.name && template.name !== displayName && (
            <span className="font-bold text-lg" style={{ color: primaryColor }}>{displayName}</span>
          )}
        </div>
        <div className="flex items-center gap-6">
          {navItems.slice(0, 4).map((item) => (
            <span key={item.id} onClick={() => scrollToSection(item.id)} className="text-sm text-gray-600 hidden md:block cursor-pointer hover:text-gray-900 transition-colors">
              {item.label}
            </span>
          ))}
          <button onClick={() => scrollToSection("contact")} className="px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: primaryColor }}>
            Contactar
          </button>
        </div>
      </nav>

      {/* Sections */}
      {enabledSections.map(renderSection)}

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            {template.logoUrl ? (
              <img src={template.logoUrl} alt="Logo" className="h-6 w-auto object-contain brightness-0 invert" />
            ) : (
              <span className="font-bold text-lg">{displayName}</span>
            )}
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} {displayName}. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* WhatsApp FAB */}
      {whatsappNumber && (
        <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
          className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors z-40 cursor-pointer">
          <MessageCircle className="w-6 h-6 text-white" />
        </a>
      )}
    </div>
  );
});
