import { ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { SectionProps } from "./types";

export function CtaSection({ section, primaryColor, secondaryColor, font, variant = 1, onCtaClick }: SectionProps) {
  const c = section.content;

  // Variant 1: Classic gradient centered
  if (variant === 1) {
    return (
      <section id={`section-${section.id}`} className="py-16 px-6"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: font }}>{c.title}</h2>
          <p className="text-white/90 mb-6" style={{ fontFamily: font }}>{c.description}</p>
          <button onClick={() => onCtaClick?.()} className="px-8 py-3 rounded-lg font-medium bg-white hover:scale-105 transition-transform cursor-pointer" style={{ color: primaryColor, fontFamily: font }}>
            {c.buttonText}<ChevronRight className="inline-block w-4 h-4 ml-1" />
          </button>
        </div>
      </section>
    );
  }

  // Variant 2: Card-on-background style
  if (variant === 2) {
    return (
      <section id={`section-${section.id}`} className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl p-10 md:p-14 text-center text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 -translate-y-1/2 translate-x-1/4" style={{ backgroundColor: "white" }} />
            <Sparkles className="w-10 h-10 mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: font }}>{c.title}</h2>
            <p className="text-white/85 mb-8 max-w-lg mx-auto" style={{ fontFamily: font }}>{c.description}</p>
            <button onClick={() => onCtaClick?.()} className="px-8 py-4 rounded-xl font-semibold bg-white hover:scale-105 transition-transform cursor-pointer shadow-lg" style={{ color: primaryColor, fontFamily: font }}>
              {c.buttonText}<ArrowRight className="inline-block w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Variant 3: Split with colored bg
  return (
    <section id={`section-${section.id}`} className="py-16 px-6" style={{ backgroundColor: primaryColor }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-white max-w-lg">
          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: font }}>{c.title}</h2>
          <p className="text-white/80" style={{ fontFamily: font }}>{c.description}</p>
        </div>
        <button onClick={() => onCtaClick?.()} className="px-8 py-4 rounded-xl font-semibold bg-white hover:scale-105 transition-transform cursor-pointer whitespace-nowrap" style={{ color: primaryColor, fontFamily: font }}>
          {c.buttonText}<ArrowRight className="inline-block w-5 h-5 ml-2" />
        </button>
      </div>
    </section>
  );
}
