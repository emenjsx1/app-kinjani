import { Star } from "lucide-react";
import { SectionProps } from "./types";

export function FeaturesSection({ section, primaryColor, font, variant = 1 }: SectionProps) {
  const c = section.content;

  const features = [1, 2, 3].map(i => ({
    title: c[`feature${i}Title`],
    description: c[`feature${i}Description`],
    image: c[`feature${i}Image`],
  })).filter(f => f.title);

  // Variant 1: Classic centered icons
  if (variant === 1) {
    return (
      <section id={`section-${section.id}`} className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10" style={{ color: primaryColor, fontFamily: font }}>{c.title}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden" style={{ backgroundColor: `${primaryColor}15` }}>
                  {f.image ? <img src={f.image} alt="" className="w-full h-full object-cover" /> : <Star className="w-7 h-7" style={{ color: primaryColor }} />}
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: font }}>{f.title}</h3>
                <p className="text-gray-600 text-sm" style={{ fontFamily: font }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Variant 2: Left-aligned with line connector
  if (variant === 2) {
    return (
      <section id={`section-${section.id}`} className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12" style={{ color: primaryColor, fontFamily: font }}>{c.title}</h2>
          <div className="space-y-8 relative">
            <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-gray-200" />
            {features.map((f, i) => (
              <div key={i} className="flex gap-6 items-start relative">
                <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center z-10 border-4 border-white" style={{ backgroundColor: `${primaryColor}15` }}>
                  {f.image ? <img src={f.image} alt="" className="w-full h-full object-cover rounded-full" /> : <Star className="w-5 h-5" style={{ color: primaryColor }} />}
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold text-lg mb-1" style={{ fontFamily: font }}>{f.title}</h3>
                  <p className="text-gray-600" style={{ fontFamily: font }}>{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Variant 3: Highlighted boxes on subtle bg
  return (
    <section id={`section-${section.id}`} className="py-20 px-6" style={{ backgroundColor: `${primaryColor}06` }}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: primaryColor, fontFamily: font }}>{c.title}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl mb-5 flex items-center justify-center overflow-hidden" style={{ backgroundColor: `${primaryColor}12` }}>
                {f.image ? <img src={f.image} alt="" className="w-full h-full object-cover" /> : <Star className="w-7 h-7" style={{ color: primaryColor }} />}
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ fontFamily: font }}>{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed" style={{ fontFamily: font }}>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
