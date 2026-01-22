import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingTableWidgetProps {
  content: Record<string, string>;
  primaryColor: string;
  font: string;
  spacing?: {
    paddingTop?: string;
    paddingBottom?: string;
  };
  onCtaClick?: () => void;
}

export function PricingTableWidget({ content, primaryColor, font, spacing, onCtaClick }: PricingTableWidgetProps) {
  const plans = [1, 2, 3]
    .map(i => ({
      name: content[`plan${i}Name`],
      price: content[`plan${i}Price`],
      period: content[`plan${i}Period`] || "/mês",
      features: [1, 2, 3, 4, 5]
        .map(f => content[`plan${i}Feature${f}`])
        .filter(Boolean),
      highlight: content[`plan${i}Highlight`] === "true",
    }))
    .filter(plan => plan.name && plan.price);

  return (
    <section 
      className="px-6 bg-gray-50"
      style={{
        paddingTop: `${spacing?.paddingTop || 64}px`,
        paddingBottom: `${spacing?.paddingBottom || 64}px`,
      }}
    >
      <div className="max-w-5xl mx-auto">
        {content.title && (
          <h2 
            className="text-3xl font-bold text-center mb-2"
            style={{ color: primaryColor, fontFamily: font }}
          >
            {content.title}
          </h2>
        )}
        {content.subtitle && (
          <p 
            className="text-gray-600 text-center mb-10"
            style={{ fontFamily: font }}
          >
            {content.subtitle}
          </p>
        )}

        <div className={`grid md:grid-cols-${plans.length} gap-6`}>
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={cn(
                "bg-white rounded-2xl p-6 transition-all hover:shadow-xl",
                plan.highlight 
                  ? "shadow-lg scale-105 relative" 
                  : "shadow-sm"
              )}
              style={{ 
                border: plan.highlight ? `2px solid ${primaryColor}` : undefined,
              }}
            >
              {plan.highlight && (
                <div 
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Mais Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ fontFamily: font }}
                >
                  {plan.name}
                </h3>
                <div className="flex items-end justify-center gap-1">
                  <span 
                    className="text-4xl font-bold"
                    style={{ color: plan.highlight ? primaryColor : undefined, fontFamily: font }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-gray-500 mb-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2">
                    <Check 
                      className="w-5 h-5 mt-0.5 flex-shrink-0" 
                      style={{ color: primaryColor }}
                    />
                    <span 
                      className="text-gray-600 text-sm"
                      style={{ fontFamily: font }}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onCtaClick}
                className={cn(
                  "w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2",
                  plan.highlight 
                    ? "text-white hover:opacity-90" 
                    : "border-2 hover:bg-gray-50"
                )}
                style={{
                  backgroundColor: plan.highlight ? primaryColor : undefined,
                  borderColor: !plan.highlight ? primaryColor : undefined,
                  color: !plan.highlight ? primaryColor : undefined,
                  fontFamily: font,
                }}
              >
                Escolher Plano
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
