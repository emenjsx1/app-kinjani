import { useEffect, useState, useRef } from "react";

interface CounterWidgetProps {
  content: Record<string, string>;
  primaryColor: string;
  font: string;
  spacing?: {
    paddingTop?: string;
    paddingBottom?: string;
  };
}

function AnimatedNumber({ value, suffix = "", duration = 2000 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [hasStarted, value, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export function CounterWidget({ content, primaryColor, font, spacing }: CounterWidgetProps) {
  const counters = [1, 2, 3, 4]
    .map(i => ({
      value: parseInt(content[`counter${i}Value`] || "0"),
      label: content[`counter${i}Label`],
      suffix: content[`counter${i}Suffix`] || "",
    }))
    .filter(c => c.value > 0 && c.label);

  return (
    <section 
      className="px-6 bg-gradient-to-r"
      style={{
        paddingTop: `${spacing?.paddingTop || 64}px`,
        paddingBottom: `${spacing?.paddingBottom || 64}px`,
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
      }}
    >
      <div className="max-w-5xl mx-auto">
        {content.title && (
          <h2 
            className="text-3xl font-bold text-center mb-12 text-white"
            style={{ fontFamily: font }}
          >
            {content.title}
          </h2>
        )}
        <div className={`grid grid-cols-2 md:grid-cols-${counters.length} gap-8`}>
          {counters.map((counter, idx) => (
            <div key={idx} className="text-center">
              <div 
                className="text-4xl md:text-5xl font-bold text-white mb-2"
                style={{ fontFamily: font }}
              >
                <AnimatedNumber value={counter.value} suffix={counter.suffix} />
              </div>
              <p className="text-white/80 text-sm md:text-base" style={{ fontFamily: font }}>
                {counter.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
