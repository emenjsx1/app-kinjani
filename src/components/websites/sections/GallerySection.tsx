import { useState } from "react";
import { ZoomIn, X } from "lucide-react";
import { SectionProps } from "./types";

export function GallerySection({ section, primaryColor, font, variant = 1 }: SectionProps) {
  const c = section.content;
  const [lightbox, setLightbox] = useState<string | null>(null);

  const images = [1, 2, 3, 4, 5, 6].map(i => c[`image${i}`]).filter(Boolean);

  const placeholders = images.length === 0 ? [1, 2, 3, 4, 5, 6].map(i => (
    <div key={i} className="aspect-square rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}10` }}>
      <span className="text-gray-400 text-sm">Imagem {i}</span>
    </div>
  )) : null;

  return (
    <section id={`section-${section.id}`} className="py-16 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-2" style={{ color: primaryColor, fontFamily: font }}>{c.title}</h2>
        {c.subtitle && <p className="text-gray-600 text-center mb-10" style={{ fontFamily: font }}>{c.subtitle}</p>}
        <div className={variant === 2 ? "grid grid-cols-2 md:grid-cols-4 gap-3" : "grid grid-cols-2 md:grid-cols-3 gap-4"}>
          {placeholders || images.map((img, idx) => (
            <div key={idx} className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative" onClick={() => setLightbox(img)}>
              <img src={img} alt={`Galeria ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300" onClick={() => setLightbox(null)}><X className="w-8 h-8" /></button>
          <img src={lightbox} alt="Galeria" className="max-w-full max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  );
}
