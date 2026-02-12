import { Star, User, Quote } from "lucide-react";
import { SectionProps } from "./types";

export function TestimonialsSection({ section, primaryColor, font, variant = 1 }: SectionProps) {
  const c = section.content;

  const testimonials = [1, 2].map(i => ({
    text: c[`testimonial${i}Text`],
    author: c[`testimonial${i}Author`],
    role: c[`testimonial${i}Role`],
    image: c[`testimonial${i}Image`],
  })).filter(t => t.text);

  const renderStars = () => [1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);

  const renderAvatar = (t: typeof testimonials[0]) => (
    t.image ? (
      <img src={t.image} alt="" className="w-10 h-10 rounded-full object-cover" />
    ) : (
      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
        <User className="w-5 h-5" style={{ color: primaryColor }} />
      </div>
    )
  );

  // Variant 1: Classic 2-col cards
  if (variant === 1) {
    return (
      <section id={`section-${section.id}`} className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10" style={{ color: primaryColor, fontFamily: font }}>{c.title}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 rounded-xl border bg-gray-50">
                <div className="flex gap-1 mb-3">{renderStars()}</div>
                <p className="text-gray-600 mb-4 italic" style={{ fontFamily: font }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  {renderAvatar(t)}
                  <div>
                    <p className="font-medium" style={{ fontFamily: font }}>{t.author}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Variant 2: Large quote style with accent
  if (variant === 2) {
    return (
      <section id={`section-${section.id}`} className="py-20 px-6" style={{ backgroundColor: `${primaryColor}06` }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-14" style={{ color: primaryColor, fontFamily: font }}>{c.title}</h2>
          <div className="space-y-10">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm relative overflow-hidden">
                <Quote className="absolute top-4 right-4 w-12 h-12 opacity-10" style={{ color: primaryColor }} />
                <div className="flex gap-1 mb-4">{renderStars()}</div>
                <p className="text-xl text-gray-700 mb-6 leading-relaxed italic" style={{ fontFamily: font }}>"{t.text}"</p>
                <div className="flex items-center gap-4 pt-4 border-t">
                  {renderAvatar(t)}
                  <div>
                    <p className="font-semibold" style={{ fontFamily: font }}>{t.author}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Variant 3: Colored bg card style
  return (
    <section id={`section-${section.id}`} className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: primaryColor, fontFamily: font }}>{c.title}</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="rounded-2xl p-8 text-white relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}>
              <Quote className="absolute top-4 right-4 w-10 h-10 opacity-20 text-white" />
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-white/80 text-white/80" />)}
              </div>
              <p className="text-lg mb-6 leading-relaxed opacity-95" style={{ fontFamily: font }}>"{t.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/20">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  {t.image ? <img src={t.image} alt="" className="w-full h-full rounded-full object-cover" /> : <User className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <p className="font-semibold" style={{ fontFamily: font }}>{t.author}</p>
                  <p className="text-sm opacity-80">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
