import { SectionProps } from "./types";

export function AboutSection({ section, primaryColor, font, variant = 1 }: SectionProps) {
  const c = section.content;

  // Variant 1: Classic centered
  if (variant === 1) {
    return (
      <section id={`section-${section.id}`} className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: primaryColor, fontFamily: font }}>{c.title}</h2>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-6" style={{ fontFamily: font }}>{c.description}</p>
          {c.mission && <p className="text-center text-gray-500 italic" style={{ fontFamily: font }}>"{c.mission}"</p>}
        </div>
      </section>
    );
  }

  // Variant 2: Left-aligned with accent border
  if (variant === 2) {
    return (
      <section id={`section-${section.id}`} className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="w-16 h-1 rounded mb-6" style={{ backgroundColor: primaryColor }} />
            <h2 className="text-3xl font-bold mb-6" style={{ color: primaryColor, fontFamily: font }}>{c.title}</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-4" style={{ fontFamily: font }}>{c.description}</p>
            {c.mission && <p className="text-gray-500 italic border-l-4 pl-4 mt-6" style={{ borderColor: primaryColor, fontFamily: font }}>"{c.mission}"</p>}
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-sm aspect-square rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}10` }}>
              <div className="text-center p-8">
                <div className="text-5xl font-bold mb-2" style={{ color: primaryColor }}>10+</div>
                <p className="text-gray-500" style={{ fontFamily: font }}>Anos de Experiência</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variant 3: Card-based with background
  return (
    <section id={`section-${section.id}`} className="py-20 px-6" style={{ backgroundColor: `${primaryColor}08` }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-10 md:p-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-bl-[100px] opacity-10" style={{ backgroundColor: primaryColor }} />
          <h2 className="text-3xl font-bold mb-6" style={{ color: primaryColor, fontFamily: font }}>{c.title}</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6 max-w-2xl" style={{ fontFamily: font }}>{c.description}</p>
          {c.mission && (
            <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: `${primaryColor}08` }}>
              <span className="text-2xl">💡</span>
              <p className="text-gray-600 italic" style={{ fontFamily: font }}>{c.mission}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
