import { MessageCircle, Phone, Mail, MapPin, Star, Check, ChevronRight } from "lucide-react";
import { WebsiteTemplate, WebsiteSection } from "@/lib/website-templates";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WebsitePreviewProps {
  template: WebsiteTemplate;
  websiteName: string;
  showChatWidget?: boolean;
}

export function WebsitePreview({ template, websiteName, showChatWidget = true }: WebsitePreviewProps) {
  const enabledSections = template.sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  const primaryColor = `hsl(${template.colors.primary})`;
  const secondaryColor = `hsl(${template.colors.secondary})`;
  const accentColor = `hsl(${template.colors.accent})`;

  const renderSection = (section: WebsiteSection) => {
    switch (section.type) {
      case "hero":
        return (
          <section
            key={section.id}
            className="relative py-20 px-6 text-center"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <div className="max-w-3xl mx-auto">
              <h1
                className="text-4xl md:text-5xl font-bold text-white mb-4"
                style={{ fontFamily: template.font }}
              >
                {section.content.headline}
              </h1>
              <p className="text-lg text-white/90 mb-8" style={{ fontFamily: template.font }}>
                {section.content.subheadline}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  className="px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: "white",
                    color: primaryColor,
                    fontFamily: template.font,
                  }}
                >
                  {section.content.ctaText}
                </button>
                {section.content.ctaSecondaryText && (
                  <button
                    className="px-6 py-3 rounded-lg font-medium border-2 border-white/30 text-white hover:bg-white/10 transition-all"
                    style={{ fontFamily: template.font }}
                  >
                    {section.content.ctaSecondaryText}
                  </button>
                )}
              </div>
            </div>
          </section>
        );

      case "about":
        return (
          <section key={section.id} className="py-16 px-6 bg-white">
            <div className="max-w-4xl mx-auto">
              <h2
                className="text-3xl font-bold text-center mb-4"
                style={{ color: primaryColor, fontFamily: template.font }}
              >
                {section.content.title}
              </h2>
              <p
                className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-6"
                style={{ fontFamily: template.font }}
              >
                {section.content.description}
              </p>
              {section.content.mission && (
                <p
                  className="text-center text-gray-500 italic"
                  style={{ fontFamily: template.font }}
                >
                  "{section.content.mission}"
                </p>
              )}
            </div>
          </section>
        );

      case "services":
        return (
          <section key={section.id} className="py-16 px-6 bg-gray-50">
            <div className="max-w-5xl mx-auto">
              <h2
                className="text-3xl font-bold text-center mb-2"
                style={{ color: primaryColor, fontFamily: template.font }}
              >
                {section.content.title}
              </h2>
              {section.content.subtitle && (
                <p
                  className="text-gray-600 text-center mb-10"
                  style={{ fontFamily: template.font }}
                >
                  {section.content.subtitle}
                </p>
              )}
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div
                      className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <Check className="w-6 h-6" style={{ color: primaryColor }} />
                    </div>
                    <h3
                      className="font-semibold text-lg mb-2"
                      style={{ fontFamily: template.font }}
                    >
                      {section.content[`service${i}Title`]}
                    </h3>
                    <p
                      className="text-gray-600 text-sm"
                      style={{ fontFamily: template.font }}
                    >
                      {section.content[`service${i}Description`]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "features":
        return (
          <section key={section.id} className="py-16 px-6 bg-white">
            <div className="max-w-5xl mx-auto">
              <h2
                className="text-3xl font-bold text-center mb-10"
                style={{ color: primaryColor, fontFamily: template.font }}
              >
                {section.content.title}
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <div
                      className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}15` }}
                    >
                      <Star className="w-7 h-7" style={{ color: primaryColor }} />
                    </div>
                    <h3
                      className="font-semibold text-lg mb-2"
                      style={{ fontFamily: template.font }}
                    >
                      {section.content[`feature${i}Title`]}
                    </h3>
                    <p
                      className="text-gray-600 text-sm"
                      style={{ fontFamily: template.font }}
                    >
                      {section.content[`feature${i}Description`]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "testimonials":
        return (
          <section key={section.id} className="py-16 px-6 bg-white">
            <div className="max-w-4xl mx-auto">
              <h2
                className="text-3xl font-bold text-center mb-10"
                style={{ color: primaryColor, fontFamily: template.font }}
              >
                {section.content.title}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="p-6 rounded-xl border bg-gray-50"
                  >
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p
                      className="text-gray-600 mb-4 italic"
                      style={{ fontFamily: template.font }}
                    >
                      "{section.content[`testimonial${i}Text`]}"
                    </p>
                    <div>
                      <p
                        className="font-medium"
                        style={{ fontFamily: template.font }}
                      >
                        {section.content[`testimonial${i}Author`]}
                      </p>
                      <p className="text-sm text-gray-500">
                        {section.content[`testimonial${i}Role`]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "team":
        return (
          <section key={section.id} className="py-16 px-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <h2
                className="text-3xl font-bold text-center mb-2"
                style={{ color: primaryColor, fontFamily: template.font }}
              >
                {section.content.title}
              </h2>
              {section.content.subtitle && (
                <p
                  className="text-gray-600 text-center mb-10"
                  style={{ fontFamily: template.font }}
                >
                  {section.content.subtitle}
                </p>
              )}
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-white p-6 rounded-xl text-center shadow-sm"
                  >
                    <div
                      className="w-20 h-20 rounded-full mx-auto mb-4"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    />
                    <h3
                      className="font-semibold"
                      style={{ fontFamily: template.font }}
                    >
                      {section.content[`member${i}Name`]}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {section.content[`member${i}Role`]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "cta":
        return (
          <section
            key={section.id}
            className="py-16 px-6"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <div className="max-w-2xl mx-auto text-center">
              <h2
                className="text-3xl font-bold text-white mb-4"
                style={{ fontFamily: template.font }}
              >
                {section.content.title}
              </h2>
              <p
                className="text-white/90 mb-6"
                style={{ fontFamily: template.font }}
              >
                {section.content.description}
              </p>
              <button
                className="px-8 py-3 rounded-lg font-medium bg-white hover:scale-105 transition-transform"
                style={{ color: primaryColor, fontFamily: template.font }}
              >
                {section.content.buttonText}
                <ChevronRight className="inline-block w-4 h-4 ml-1" />
              </button>
            </div>
          </section>
        );

      case "contact":
        return (
          <section key={section.id} className="py-16 px-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <h2
                className="text-3xl font-bold text-center mb-2"
                style={{ color: primaryColor, fontFamily: template.font }}
              >
                {section.content.title}
              </h2>
              {section.content.subtitle && (
                <p
                  className="text-gray-600 text-center mb-10"
                  style={{ fontFamily: template.font }}
                >
                  {section.content.subtitle}
                </p>
              )}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl text-center shadow-sm">
                  <Mail className="w-8 h-8 mx-auto mb-3" style={{ color: primaryColor }} />
                  <p className="font-medium" style={{ fontFamily: template.font }}>
                    Email
                  </p>
                  <p className="text-sm text-gray-600">{section.content.email}</p>
                </div>
                <div className="bg-white p-6 rounded-xl text-center shadow-sm">
                  <Phone className="w-8 h-8 mx-auto mb-3" style={{ color: primaryColor }} />
                  <p className="font-medium" style={{ fontFamily: template.font }}>
                    Telefone
                  </p>
                  <p className="text-sm text-gray-600">{section.content.phone}</p>
                </div>
                <div className="bg-white p-6 rounded-xl text-center shadow-sm">
                  <MapPin className="w-8 h-8 mx-auto mb-3" style={{ color: primaryColor }} />
                  <p className="font-medium" style={{ fontFamily: template.font }}>
                    Morada
                  </p>
                  <p className="text-sm text-gray-600">{section.content.address}</p>
                </div>
              </div>
            </div>
          </section>
        );

      case "faq":
        return (
          <section key={section.id} className="py-16 px-6 bg-white">
            <div className="max-w-3xl mx-auto">
              <h2
                className="text-3xl font-bold text-center mb-10"
                style={{ color: primaryColor, fontFamily: template.font }}
              >
                {section.content.title}
              </h2>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <h3
                      className="font-medium mb-2"
                      style={{ fontFamily: template.font }}
                    >
                      {section.content[`faq${i}Question`]}
                    </h3>
                    <p
                      className="text-gray-600 text-sm"
                      style={{ fontFamily: template.font }}
                    >
                      {section.content[`faq${i}Answer`]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-[600px]" style={{ fontFamily: template.font }}>
      {/* Navbar */}
      <nav
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b"
      >
        <span className="font-bold text-lg" style={{ color: primaryColor }}>
          {websiteName}
        </span>
        <div className="flex items-center gap-6">
          <span className="text-sm text-gray-600 hidden md:block">Início</span>
          <span className="text-sm text-gray-600 hidden md:block">Sobre</span>
          <span className="text-sm text-gray-600 hidden md:block">Serviços</span>
          <span className="text-sm text-gray-600 hidden md:block">Contacto</span>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Contactar
          </button>
        </div>
      </nav>

      {/* Sections */}
      {enabledSections.map(renderSection)}

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-bold text-lg mb-2">{websiteName}</p>
          <p className="text-gray-400 text-sm mb-4">
            © 2024 {websiteName}. Todos os direitos reservados.
          </p>
          <p className="text-gray-500 text-xs">
            Criado com KINJA AI
          </p>
        </div>
      </footer>

      {/* Chat Widget (Mock) */}
      {showChatWidget && (
        <div className="fixed bottom-4 right-4 z-20">
          <button
            className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            style={{ backgroundColor: primaryColor }}
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
