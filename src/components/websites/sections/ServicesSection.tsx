import { Check, ArrowRight } from "lucide-react";
import { SectionProps } from "./types";

export function ServicesSection({ section, primaryColor, font, variant = 1, onCtaClick }: SectionProps) {
  const c = section.content;

  const services = [1, 2, 3].map(i => ({
    title: c[`service${i}Title`],
    description: c[`service${i}Description`],
    image: c[`service${i}Image`],
  })).filter(s => s.title);

  // Variant 1: Classic 3-col grid
  if (variant === 1) {
    return (
      <section id={`section-${section.id}`} className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2" style={{ color: primaryColor, fontFamily: font }}>{c.title}</h2>
          {c.subtitle && <p className="text-gray-600 text-center mb-10" style={{ fontFamily: font }}>{c.subtitle}</p>}
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onCtaClick?.()}>
                <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                  {s.image ? <img src={s.image} alt="" className="w-8 h-8 object-cover rounded" /> : <Check className="w-6 h-6" style={{ color: primaryColor }} />}
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: font }}>{s.title}</h3>
                <p className="text-gray-600 text-sm" style={{ fontFamily: font }}>{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Variant 2: Horizontal cards with numbered steps
  if (variant === 2) {
    return (
      <section id={`section-${section.id}`} className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2" style={{ color: primaryColor, fontFamily: font }}>{c.title}</h2>
          {c.subtitle && <p className="text-gray-600 text-center mb-12" style={{ fontFamily: font }}>{c.subtitle}</p>}
          <div className="space-y-6">
            {services.map((s, i) => (
              <div key={i} className="flex gap-6 items-start p-6 rounded-2xl border hover:shadow-md transition-shadow bg-white cursor-pointer" onClick={() => onCtaClick?.()}>
                <div className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: primaryColor }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-xl mb-2" style={{ fontFamily: font }}>{s.title}</h3>
                  <p className="text-gray-600" style={{ fontFamily: font }}>{s.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Variant 3: Cards with colored top border
  return (
    <section id={`section-${section.id}`} className="py-20 px-6" style={{ backgroundColor: `${primaryColor}05` }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
            Serviços
          </span>
          <h2 className="text-3xl font-bold" style={{ color: primaryColor, fontFamily: font }}>{c.title}</h2>
          {c.subtitle && <p className="text-gray-600 mt-2" style={{ fontFamily: font }}>{c.subtitle}</p>}
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onCtaClick?.()}>
              <div className="h-1.5" style={{ backgroundColor: primaryColor }} />
              <div className="p-6">
                {s.image ? <img src={s.image} alt="" className="w-12 h-12 object-cover rounded-lg mb-4" /> : (
                  <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                    <Check className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                )}
                <h3 className="font-bold text-lg mb-3 group-hover:text-opacity-90" style={{ fontFamily: font }}>{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed" style={{ fontFamily: font }}>{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
