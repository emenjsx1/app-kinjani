import { ArrowRight, ChevronDown } from "lucide-react";
import { SectionProps } from "./types";

export function HeroSection({ section, primaryColor, secondaryColor, font, variant = 1, bannerUrl, onCtaClick, scrollToSection }: SectionProps) {
  const c = section.content;

  const bgStyle = bannerUrl
    ? { backgroundImage: `linear-gradient(135deg, ${primaryColor}cc 0%, ${secondaryColor}cc 100%), url(${bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` };

  // Variant 1: Classic centered gradient
  if (variant === 1) {
    return (
      <section id={`section-${section.id}`} className="relative py-20 px-6 text-center" style={bgStyle}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: font }}>{c.headline}</h1>
          <p className="text-lg text-white/90 mb-8" style={{ fontFamily: font }}>{c.subheadline}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => onCtaClick?.()} className="px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 cursor-pointer"
              style={{ backgroundColor: "white", color: primaryColor, fontFamily: font }}>
              {c.ctaText}<ArrowRight className="inline-block w-4 h-4 ml-2" />
            </button>
            {c.ctaSecondaryText && (
              <button onClick={() => scrollToSection?.("about")} className="px-6 py-3 rounded-lg font-medium border-2 border-white/30 text-white hover:bg-white/10 transition-all cursor-pointer" style={{ fontFamily: font }}>
                {c.ctaSecondaryText}
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Variant 2: Left-aligned with decorative shapes
  if (variant === 2) {
    const bg2Style = bannerUrl
      ? { backgroundImage: `linear-gradient(160deg, ${primaryColor}cc 0%, ${secondaryColor}cc 60%, ${primaryColor}cc 100%), url(${bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
      : { background: `linear-gradient(160deg, ${primaryColor} 0%, ${secondaryColor} 60%, ${primaryColor} 100%)` };

    return (
      <section id={`section-${section.id}`} className="relative py-24 px-6 overflow-hidden" style={bg2Style}>
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: "white" }} />
        <div className="absolute bottom-10 left-20 w-40 h-40 rounded-full opacity-10" style={{ backgroundColor: "white" }} />
        <div className="absolute top-1/2 right-1/3 w-20 h-20 rounded-full opacity-5" style={{ backgroundColor: "white" }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1 rounded-full text-sm font-medium mb-6 bg-white/20 text-white backdrop-blur-sm">
              ✨ Bem-vindo
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: font }}>{c.headline}</h1>
            <p className="text-xl text-white/80 mb-10 leading-relaxed" style={{ fontFamily: font }}>{c.subheadline}</p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => onCtaClick?.()} className="px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 cursor-pointer shadow-lg"
                style={{ backgroundColor: "white", color: primaryColor, fontFamily: font }}>
                {c.ctaText}<ArrowRight className="inline-block w-5 h-5 ml-2" />
              </button>
              {c.ctaSecondaryText && (
                <button onClick={() => scrollToSection?.("about")} className="px-8 py-4 rounded-xl font-semibold border-2 border-white/40 text-white hover:bg-white/10 transition-all cursor-pointer" style={{ fontFamily: font }}>
                  {c.ctaSecondaryText}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variant 3: Split layout with pattern
  const bg3Style = bannerUrl
    ? { backgroundImage: `linear-gradient(135deg, ${primaryColor}ee 0%, ${primaryColor}dd 100%), url(${bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { backgroundColor: primaryColor };

  return (
    <section id={`section-${section.id}`} className="relative min-h-[70vh] flex items-center overflow-hidden" style={bg3Style}>
      {/* Diagonal pattern bg */}
      {!bannerUrl && (
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, white 0px, white 2px, transparent 2px, transparent 40px)`,
        }} />
      )}
      <div className="max-w-6xl mx-auto px-6 py-20 relative z-10 grid md:grid-cols-2 gap-12 items-center w-full">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: font }}>{c.headline}</h1>
          <p className="text-lg text-white/80 mb-8" style={{ fontFamily: font }}>{c.subheadline}</p>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => onCtaClick?.()} className="px-7 py-3.5 rounded-lg font-semibold transition-all hover:scale-105 cursor-pointer"
              style={{ backgroundColor: "white", color: primaryColor, fontFamily: font }}>
              {c.ctaText}
            </button>
            {c.ctaSecondaryText && (
              <button onClick={() => scrollToSection?.("about")} className="px-7 py-3.5 rounded-lg font-semibold border-2 border-white/30 text-white hover:bg-white/10 transition-all cursor-pointer" style={{ fontFamily: font }}>
                {c.ctaSecondaryText}
              </button>
            )}
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center">
          <div className="w-72 h-72 rounded-3xl border-4 border-white/20 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${secondaryColor}, ${primaryColor})` }}>
            <div className="text-center text-white">
              <ChevronDown className="w-16 h-16 mx-auto mb-2 animate-bounce opacity-50" />
              <span className="text-white/60 text-sm">Scroll</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
