import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SectionProps } from "./types";

export function ContactSection({ section, primaryColor, font, variant = 1 }: SectionProps) {
  const c = section.content;
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const whatsappNumber = c.whatsappNumber || c.phone?.replace(/\D/g, "");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    const message = encodeURIComponent(
      `*Novo Contacto via Website*\n\n*Nome:* ${formData.name}\n*Email:* ${formData.email}\n*Telefone:* ${formData.phone}\n*Mensagem:* ${formData.message}`
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

  const contactInfo = (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <Mail className="w-8 h-8 mb-3" style={{ color: primaryColor }} />
        <p className="font-medium" style={{ fontFamily: font }}>Email</p>
        <a href={`mailto:${c.email}`} className="text-sm text-gray-600 hover:underline">{c.email}</a>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <Phone className="w-8 h-8 mb-3" style={{ color: primaryColor }} />
        <p className="font-medium" style={{ fontFamily: font }}>Telefone</p>
        <a href={`tel:${c.phone}`} className="text-sm text-gray-600 hover:underline">{c.phone}</a>
        {whatsappNumber && (
          <button onClick={() => window.open(`https://wa.me/${whatsappNumber}`, "_blank")} className="mt-2 text-sm text-green-600 hover:underline flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />Abrir WhatsApp
          </button>
        )}
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <MapPin className="w-8 h-8 mb-3" style={{ color: primaryColor }} />
        <p className="font-medium" style={{ fontFamily: font }}>Morada</p>
        <p className="text-sm text-gray-600">{c.address}</p>
      </div>
    </div>
  );

  const form = (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="font-semibold mb-4" style={{ fontFamily: font }}>Envie-nos uma mensagem</h3>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <Input placeholder="O seu nome" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} required className="bg-gray-50" />
        <Input type="email" placeholder="O seu email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} required className="bg-gray-50" />
        <Input type="tel" placeholder="O seu telefone" value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} className="bg-gray-50" />
        <Textarea placeholder="A sua mensagem..." value={formData.message} onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))} required rows={4} className="bg-gray-50" />
        <button type="submit" disabled={formSubmitting} className="w-full py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50" style={{ backgroundColor: primaryColor }}>
          {formSubmitting ? "A enviar..." : <><Send className="w-4 h-4" />{whatsappNumber ? "Enviar via WhatsApp" : "Enviar Mensagem"}</>}
        </button>
      </form>
    </div>
  );

  // Variant 1: Classic 2-col
  if (variant === 1) {
    return (
      <section id={`section-${section.id}`} className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2" style={{ color: primaryColor, fontFamily: font }}>{c.title}</h2>
          {c.subtitle && <p className="text-gray-600 text-center mb-10" style={{ fontFamily: font }}>{c.subtitle}</p>}
          <div className="grid md:grid-cols-2 gap-8">{form}{contactInfo}</div>
        </div>
      </section>
    );
  }

  // Variant 2: Form on colored bg
  if (variant === 2) {
    return (
      <section id={`section-${section.id}`} className="py-20 px-6" style={{ backgroundColor: `${primaryColor}08` }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>Contacto</span>
            <h2 className="text-3xl font-bold" style={{ color: primaryColor, fontFamily: font }}>{c.title}</h2>
            {c.subtitle && <p className="text-gray-600 mt-2" style={{ fontFamily: font }}>{c.subtitle}</p>}
          </div>
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-3">{form}</div>
            <div className="md:col-span-2">{contactInfo}</div>
          </div>
        </div>
      </section>
    );
  }

  // Variant 3: Inline compact
  return (
    <section id={`section-${section.id}`} className="py-16 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-2" style={{ color: primaryColor, fontFamily: font }}>{c.title}</h2>
        {c.subtitle && <p className="text-gray-600 text-center mb-8" style={{ fontFamily: font }}>{c.subtitle}</p>}
        <div className="flex flex-wrap justify-center gap-8 mb-10">
          <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900"><Mail className="w-5 h-5" style={{ color: primaryColor }} />{c.email}</a>
          <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900"><Phone className="w-5 h-5" style={{ color: primaryColor }} />{c.phone}</a>
          <span className="flex items-center gap-2 text-gray-600"><MapPin className="w-5 h-5" style={{ color: primaryColor }} />{c.address}</span>
        </div>
        <div className="max-w-xl mx-auto">{form}</div>
      </div>
    </section>
  );
}
