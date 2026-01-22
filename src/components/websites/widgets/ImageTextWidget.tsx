import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageTextWidgetProps {
  content: Record<string, string>;
  primaryColor: string;
  font: string;
  spacing?: {
    paddingTop?: string;
    paddingBottom?: string;
  };
  onCtaClick?: () => void;
}

export function ImageTextWidget({ content, primaryColor, font, spacing, onCtaClick }: ImageTextWidgetProps) {
  const imageOnLeft = content.imagePosition !== "right";

  return (
    <section 
      className="px-6 bg-white"
      style={{
        paddingTop: `${spacing?.paddingTop || 64}px`,
        paddingBottom: `${spacing?.paddingBottom || 64}px`,
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className={cn(
          "grid md:grid-cols-2 gap-8 md:gap-12 items-center",
          !imageOnLeft && "md:[&>*:first-child]:order-2"
        )}>
          {/* Image */}
          <div className="aspect-square md:aspect-auto md:h-[400px] rounded-2xl overflow-hidden shadow-lg">
            {content.image ? (
              <img 
                src={content.image} 
                alt={content.title || ""}
                className="w-full h-full object-cover"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <span className="text-gray-400">Adicionar Imagem</span>
              </div>
            )}
          </div>

          {/* Text */}
          <div className="space-y-4">
            {content.title && (
              <h2 
                className="text-3xl font-bold"
                style={{ color: primaryColor, fontFamily: font }}
              >
                {content.title}
              </h2>
            )}
            {content.description && (
              <p 
                className="text-gray-600 leading-relaxed"
                style={{ fontFamily: font }}
              >
                {content.description}
              </p>
            )}
            {content.ctaText && (
              <button
                onClick={onCtaClick}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 hover:gap-3"
                style={{ backgroundColor: primaryColor, fontFamily: font }}
              >
                {content.ctaText}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
