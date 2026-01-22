import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SliderWidgetProps {
  content: Record<string, string>;
  primaryColor: string;
  font: string;
  spacing?: {
    paddingTop?: string;
    paddingBottom?: string;
  };
}

export function SliderWidget({ content, primaryColor, font, spacing }: SliderWidgetProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [1, 2, 3, 4, 5]
    .map(i => ({
      image: content[`slide${i}Image`],
      title: content[`slide${i}Title`],
      description: content[`slide${i}Description`],
    }))
    .filter(slide => slide.image || slide.title);

  const autoplay = content.autoplay === "true";
  const interval = parseInt(content.interval || "5000");

  useEffect(() => {
    if (!autoplay || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoplay, interval, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  if (slides.length === 0) return null;

  return (
    <section 
      className="px-6 bg-white"
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
        
        <div className="relative group">
          {/* Slides */}
          <div className="overflow-hidden rounded-xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, idx) => (
                <div 
                  key={idx}
                  className="w-full flex-shrink-0"
                >
                  <div className="aspect-video relative bg-gray-100 rounded-xl overflow-hidden">
                    {slide.image ? (
                      <img 
                        src={slide.image} 
                        alt={slide.title || `Slide ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}20` }}
                      >
                        <span className="text-gray-400">Imagem do Slide</span>
                      </div>
                    )}
                    
                    {/* Overlay with text */}
                    {(slide.title || slide.description) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                        {slide.title && (
                          <h3 
                            className="text-white text-xl font-bold mb-2"
                            style={{ fontFamily: font }}
                          >
                            {slide.title}
                          </h3>
                        )}
                        {slide.description && (
                          <p 
                            className="text-white/90 text-sm"
                            style={{ fontFamily: font }}
                          >
                            {slide.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-6 h-6" style={{ color: primaryColor }} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-6 h-6" style={{ color: primaryColor }} />
              </button>
            </>
          )}

          {/* Dots */}
          {slides.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    currentSlide === idx ? "w-6" : "bg-gray-300 hover:bg-gray-400"
                  )}
                  style={{ 
                    backgroundColor: currentSlide === idx ? primaryColor : undefined 
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
