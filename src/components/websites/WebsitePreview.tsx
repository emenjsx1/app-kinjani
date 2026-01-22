import { forwardRef, useState } from "react";
import { MessageCircle, Phone, Mail, MapPin, Star, Check, ChevronRight, Send, User, ArrowRight, X, ZoomIn } from "lucide-react";
import { WebsiteTemplate, WebsiteSection } from "@/lib/website-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EmbedConfig {
  enabled: boolean;
  agentId?: string;
  position?: "right" | "left";
  primaryColor?: string;
  welcomeMessage?: string;
}

interface ContactConfig {
  whatsappNumber?: string;
  redirectUrl?: string;
  formEnabled?: boolean;
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
  // Form state
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState<string | null>(null);

  // Use website name from template if not provided
  const displayName = websiteName || template.name || "Meu Site";
  const enabledSections = template.sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  const primaryColor = `hsl(${template.colors.primary})`;
  const secondaryColor = `hsl(${template.colors.secondary})`;

  // Get contact section for WhatsApp
  const contactSection = template.sections.find(s => s.type === "contact");
  const whatsappNumber = contactSection?.content.whatsappNumber || contactSection?.content.phone?.replace(/\D/g, "");

  // Scroll to section smoothly
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Handle CTA clicks - scroll to contact or open WhatsApp
  const handleCtaClick = (action?: string) => {
    if (action === "whatsapp" && whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber}`, "_blank");
    } else {
      scrollToSection("contact");
    }
  };

  // Handle contact form submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    // Build WhatsApp message
    const message = encodeURIComponent(
      `*Novo Contacto via Website*\n\n` +
      `*Nome:* ${formData.name}\n` +
      `*Email:* ${formData.email}\n` +
      `*Telefone:* ${formData.phone}\n` +
      `*Mensagem:* ${formData.message}`
    );

    if (whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
      toast.success("Redirecionado para WhatsApp!");
    } else {
      toast.success("Mensagem enviada com sucesso!");
    }

    setFormData({ name: "", email: "", phone: "", message: "" });
    setFormSubmitting(false);
  };

  // Get nav items from enabled sections
  const navItems = [
    { label: "Início", id: "hero" },
    ...enabledSections
      .filter(s => ["about", "services", "features", "team", "gallery", "pricing", "faq"].includes(s.type))
      .map(s => ({
        label: s.type === "about" ? "Sobre" : 
               s.type === "services" ? "Serviços" : 
               s.type === "features" ? "Vantagens" :
               s.type === "team" ? "Equipa" :
               s.type === "gallery" ? "Galeria" :
               s.type === "pricing" ? "Preços" :
               s.type === "faq" ? "FAQ" : s.title,
        id: s.id
      })),
    ...(enabledSections.some(s => s.type === "contact") ? [{ label: "Contacto", id: "contact" }] : [])
  ];

  const renderSection = (section: WebsiteSection) => {
    switch (section.type) {
      case "hero":
        return (
          <section
            key={section.id}
            id={`section-${section.id}`}
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
                  onClick={() => handleCtaClick()}
                  className="px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 cursor-pointer"
                  style={{
                    backgroundColor: "white",
                    color: primaryColor,
                    fontFamily: template.font,
                  }}
                >
                  {section.content.ctaText}
                  <ArrowRight className="inline-block w-4 h-4 ml-2" />
                </button>
                {section.content.ctaSecondaryText && (
                  <button
                    onClick={() => scrollToSection("about")}
                    className="px-6 py-3 rounded-lg font-medium border-2 border-white/30 text-white hover:bg-white/10 transition-all cursor-pointer"
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
          <section key={section.id} id={`section-${section.id}`} className="py-16 px-6 bg-white">
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
          <section key={section.id} id={`section-${section.id}`} className="py-16 px-6 bg-gray-50">
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
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleCtaClick()}
                  >
                    <div
                      className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      {section.content[`service${i}Image`] ? (
                        <img 
                          src={section.content[`service${i}Image`]} 
                          alt="" 
                          className="w-8 h-8 object-cover rounded"
                        />
                      ) : (
                        <Check className="w-6 h-6" style={{ color: primaryColor }} />
                      )}
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
          <section key={section.id} id={`section-${section.id}`} className="py-16 px-6 bg-white">
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
                      className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: `${primaryColor}15` }}
                    >
                      {section.content[`feature${i}Image`] ? (
                        <img 
                          src={section.content[`feature${i}Image`]} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Star className="w-7 h-7" style={{ color: primaryColor }} />
                      )}
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
          <section key={section.id} id={`section-${section.id}`} className="py-16 px-6 bg-white">
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
                    <div className="flex items-center gap-3">
                      {section.content[`testimonial${i}Image`] ? (
                        <img 
                          src={section.content[`testimonial${i}Image`]} 
                          alt="" 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${primaryColor}20` }}
                        >
                          <User className="w-5 h-5" style={{ color: primaryColor }} />
                        </div>
                      )}
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
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "team":
        return (
          <section key={section.id} id={`section-${section.id}`} className="py-16 px-6 bg-gray-50">
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4].map((i) => {
                  const name = section.content[`member${i}Name`];
                  if (!name) return null;
                  return (
                    <div
                      key={i}
                      className="bg-white p-6 rounded-xl text-center shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div
                        className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}20` }}
                      >
                        {section.content[`member${i}Image`] ? (
                          <img 
                            src={section.content[`member${i}Image`]} 
                            alt={name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12" style={{ color: primaryColor }} />
                        )}
                      </div>
                      <h3
                        className="font-semibold text-lg"
                        style={{ fontFamily: template.font }}
                      >
                        {name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {section.content[`member${i}Role`]}
                      </p>
                      {section.content[`member${i}Bio`] && (
                        <p className="text-sm text-gray-600">
                          {section.content[`member${i}Bio`]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );

      case "gallery":
        const galleryImages = [1, 2, 3, 4, 5, 6]
          .map(i => section.content[`image${i}`])
          .filter(Boolean);
        
        return (
          <section key={section.id} id={`section-${section.id}`} className="py-16 px-6 bg-white">
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.length > 0 ? (
                  galleryImages.map((img, idx) => (
                    <div 
                      key={idx} 
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative"
                      onClick={() => setGalleryOpen(img)}
                    >
                      <img 
                        src={img} 
                        alt={`Galeria ${idx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))
                ) : (
                  // Placeholder grid
                  [1, 2, 3, 4, 5, 6].map((i) => (
                    <div 
                      key={i} 
                      className="aspect-square rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}10` }}
                    >
                      <span className="text-gray-400 text-sm">Imagem {i}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Gallery lightbox */}
            {galleryOpen && (
              <div 
                className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                onClick={() => setGalleryOpen(null)}
              >
                <button 
                  className="absolute top-4 right-4 text-white hover:text-gray-300"
                  onClick={() => setGalleryOpen(null)}
                >
                  <X className="w-8 h-8" />
                </button>
                <img 
                  src={galleryOpen} 
                  alt="Galeria" 
                  className="max-w-full max-h-[90vh] object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </section>
        );

      case "pricing":
        return (
          <section key={section.id} id={`section-${section.id}`} className="py-16 px-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <h2
                className="text-3xl font-bold text-center mb-10"
                style={{ color: primaryColor, fontFamily: template.font }}
              >
                {section.content.title}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => {
                  const planName = section.content[`plan${i}Name`];
                  if (!planName) return null;
                  const features = section.content[`plan${i}Features`]?.split(",") || [];
                  return (
                    <div
                      key={i}
                      className={cn(
                        "bg-white p-6 rounded-xl shadow-sm",
                        i === 2 && "ring-2 scale-105"
                      )}
                      style={i === 2 ? { borderColor: primaryColor } : {}}
                    >
                      <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: template.font }}>
                        {planName}
                      </h3>
                      <p className="text-3xl font-bold mb-4" style={{ color: primaryColor }}>
                        {section.content[`plan${i}Price`]}
                      </p>
                      <ul className="space-y-2 mb-6">
                        {features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <Check className="w-4 h-4" style={{ color: primaryColor }} />
                            {feature.trim()}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => handleCtaClick()}
                        className="w-full py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Escolher
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );

      case "cta":
        return (
          <section
            key={section.id}
            id={`section-${section.id}`}
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
                onClick={() => handleCtaClick()}
                className="px-8 py-3 rounded-lg font-medium bg-white hover:scale-105 transition-transform cursor-pointer"
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
          <section key={section.id} id={`section-${section.id}`} className="py-16 px-6 bg-gray-50">
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
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Contact Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="font-semibold mb-4" style={{ fontFamily: template.font }}>
                    Envie-nos uma mensagem
                  </h3>
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                      <Input
                        placeholder="O seu nome"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Input
                        type="email"
                        placeholder="O seu email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Input
                        type="tel"
                        placeholder="O seu telefone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Textarea
                        placeholder="A sua mensagem..."
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        required
                        rows={4}
                        className="bg-gray-50"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="w-full py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {formSubmitting ? "A enviar..." : (
                        <>
                          <Send className="w-4 h-4" />
                          {whatsappNumber ? "Enviar via WhatsApp" : "Enviar Mensagem"}
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <Mail className="w-8 h-8 mb-3" style={{ color: primaryColor }} />
                    <p className="font-medium" style={{ fontFamily: template.font }}>
                      Email
                    </p>
                    <a 
                      href={`mailto:${section.content.email}`}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      {section.content.email}
                    </a>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <Phone className="w-8 h-8 mb-3" style={{ color: primaryColor }} />
                    <p className="font-medium" style={{ fontFamily: template.font }}>
                      Telefone
                    </p>
                    <a 
                      href={`tel:${section.content.phone}`}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      {section.content.phone}
                    </a>
                    {whatsappNumber && (
                      <button
                        onClick={() => window.open(`https://wa.me/${whatsappNumber}`, "_blank")}
                        className="mt-2 text-sm text-green-600 hover:underline flex items-center gap-1"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Abrir WhatsApp
                      </button>
                    )}
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <MapPin className="w-8 h-8 mb-3" style={{ color: primaryColor }} />
                    <p className="font-medium" style={{ fontFamily: template.font }}>
                      Morada
                    </p>
                    <p className="text-sm text-gray-600">{section.content.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case "faq":
        return (
          <section key={section.id} id={`section-${section.id}`} className="py-16 px-6 bg-white">
            <div className="max-w-3xl mx-auto">
              <h2
                className="text-3xl font-bold text-center mb-10"
                style={{ color: primaryColor, fontFamily: template.font }}
              >
                {section.content.title}
              </h2>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => {
                  const question = section.content[`faq${i}Question`];
                  if (!question) return null;
                  return (
                    <div key={i} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <h3
                        className="font-medium mb-2"
                        style={{ fontFamily: template.font }}
                      >
                        {question}
                      </h3>
                      <p
                        className="text-gray-600 text-sm"
                        style={{ fontFamily: template.font }}
                      >
                        {section.content[`faq${i}Answer`]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  // Determine chat widget settings
  const showWidget = embedConfig?.enabled ?? showChatWidget;
  const widgetPosition = embedConfig?.position || "right";
  const widgetColor = embedConfig?.primaryColor || primaryColor;

  return (
    <div 
      ref={ref}
      className={cn("relative", fullscreen ? "min-h-screen" : "min-h-[600px]")} 
      style={{ fontFamily: template.font }}
    >
      {/* Navbar */}
      <nav
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b"
      >
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => scrollToSection("hero")}
        >
          {template.logoUrl ? (
            <img 
              src={template.logoUrl} 
              alt="Logo" 
              className="h-8 w-auto object-contain"
            />
          ) : (
            <span className="font-bold text-lg" style={{ color: primaryColor }}>
              {displayName}
            </span>
          )}
          {/* Only show name if no logo OR if name is different from displayName */}
          {template.logoUrl && template.name && template.name !== displayName && (
            <span className="font-bold text-lg" style={{ color: primaryColor }}>
              {displayName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-6">
          {navItems.slice(0, 4).map((item) => (
            <span 
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-sm text-gray-600 hidden md:block cursor-pointer hover:text-gray-900 transition-colors"
            >
              {item.label}
            </span>
          ))}
          <button
            onClick={() => scrollToSection("contact")}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer hover:opacity-90 transition-opacity"
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
          <div className="flex justify-center mb-4">
            {template.logoUrl && (
              <img 
                src={template.logoUrl} 
                alt="Logo" 
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            )}
          </div>
          <p className="font-bold text-lg mb-2">{displayName}</p>
          <p className="text-gray-400 text-sm mb-4">
            © {new Date().getFullYear()} {displayName}. Todos os direitos reservados.
          </p>
          <p className="text-gray-500 text-xs">
            Criado com KINJA AI
          </p>
        </div>
      </footer>

      {/* Chat Widget */}
      {showWidget && (
        <div 
          className={cn(
            "fixed bottom-4 z-20",
            widgetPosition === "left" ? "left-4" : "right-4"
          )}
        >
          <button
            className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            style={{ backgroundColor: widgetColor }}
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
    </div>
  );
});
