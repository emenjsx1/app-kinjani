import { 
  Shield, Zap, Heart, Award, Star, Check, Clock, Users, 
  Target, Lightbulb, ThumbsUp, Gift, Headphones, Lock,
  Rocket, Globe, Gem, Crown
} from "lucide-react";

interface IconBoxWidgetProps {
  content: Record<string, string>;
  primaryColor: string;
  font: string;
  spacing?: {
    paddingTop?: string;
    paddingBottom?: string;
  };
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  shield: Shield,
  zap: Zap,
  heart: Heart,
  award: Award,
  star: Star,
  check: Check,
  clock: Clock,
  users: Users,
  target: Target,
  lightbulb: Lightbulb,
  thumbsup: ThumbsUp,
  gift: Gift,
  headphones: Headphones,
  lock: Lock,
  rocket: Rocket,
  globe: Globe,
  gem: Gem,
  crown: Crown,
};

export function IconBoxWidget({ content, primaryColor, font, spacing }: IconBoxWidgetProps) {
  const boxes = [1, 2, 3, 4, 5, 6]
    .map(i => ({
      icon: content[`box${i}Icon`] || "star",
      title: content[`box${i}Title`],
      description: content[`box${i}Description`],
    }))
    .filter(box => box.title);

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
            className="text-3xl font-bold text-center mb-10"
            style={{ color: primaryColor, fontFamily: font }}
          >
            {content.title}
          </h2>
        )}

        <div className={`grid sm:grid-cols-2 md:grid-cols-${Math.min(boxes.length, 4)} gap-6`}>
          {boxes.map((box, idx) => {
            const IconComponent = ICON_MAP[box.icon.toLowerCase()] || Star;
            
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-center group"
              >
                <div 
                  className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <IconComponent 
                    className="w-7 h-7" 
                    style={{ color: primaryColor }}
                  />
                </div>
                <h3 
                  className="font-semibold text-lg mb-2"
                  style={{ fontFamily: font }}
                >
                  {box.title}
                </h3>
                {box.description && (
                  <p 
                    className="text-gray-600 text-sm"
                    style={{ fontFamily: font }}
                  >
                    {box.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
