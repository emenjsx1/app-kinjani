interface VideoWidgetProps {
  content: Record<string, string>;
  primaryColor: string;
  font: string;
  spacing?: {
    paddingTop?: string;
    paddingBottom?: string;
  };
}

export function VideoWidget({ content, primaryColor, font, spacing }: VideoWidgetProps) {
  // Convert YouTube watch URL to embed URL if needed
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    
    // YouTube watch URL
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    
    // Vimeo URL
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    return url;
  };

  const embedUrl = getEmbedUrl(content.videoUrl || "");

  return (
    <section 
      className="px-6 bg-white"
      style={{
        paddingTop: `${spacing?.paddingTop || 64}px`,
        paddingBottom: `${spacing?.paddingBottom || 64}px`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {content.title && (
          <h2 
            className="text-3xl font-bold text-center mb-2"
            style={{ color: primaryColor, fontFamily: font }}
          >
            {content.title}
          </h2>
        )}
        {content.description && (
          <p 
            className="text-gray-600 text-center mb-8"
            style={{ fontFamily: font }}
          >
            {content.description}
          </p>
        )}
        
        <div className="aspect-video rounded-xl overflow-hidden shadow-xl">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <span className="text-gray-400">Adicione um URL de vídeo</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
