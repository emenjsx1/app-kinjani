import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionProps } from "./types";

export function PricingSection({ section, primaryColor, font, variant = 1, onCtaClick }: SectionProps) {
  const c = section.content;

  const plans = [1, 2, 3].map(i => ({
    name: c[`plan${i}Name`],
    price: c[`plan${i}Price`],
    features: c[`plan${i}Features`]?.split(",") || [],
  })).filter(p => p.name);

  return (
    <section id={`section-${section.id}`} className="py-16 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10" style={{ color: primaryColor, fontFamily: font }}>{c.title}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((p, i) => (
            <div key={i} className={cn("bg-white p-6 rounded-xl shadow-sm", i === 1 && "ring-2 scale-105")} style={i === 1 ? { borderColor: primaryColor } : {}}>
              <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: font }}>{p.name}</h3>
              <p className="text-3xl font-bold mb-4" style={{ color: primaryColor }}>{p.price}</p>
              <ul className="space-y-2 mb-6">
                {p.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4" style={{ color: primaryColor }} />{f.trim()}
                  </li>
                ))}
              </ul>
              <button onClick={() => onCtaClick?.()} className="w-full py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor }}>Escolher</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
