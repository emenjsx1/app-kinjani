import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { WebsitePreview } from "@/components/websites/WebsitePreview";
import { WebsiteTemplate, getTemplateById } from "@/lib/website-templates";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmbedConfig } from "@/components/websites/WebsiteEditor";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface WebsiteConfig {
  type?: "landing" | "institutional";
  niche?: string;
  nicheId?: string;
  templateId?: string;
  prompt?: string;
  customTemplate?: WebsiteTemplate;
  embedConfig?: EmbedConfig;
}

// Helper to parse config from JSON
const parseConfig = (config: Json | null): WebsiteConfig | null => {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return null;
  }
  return config as WebsiteConfig;
};

// Update document head with dynamic meta tags
function useDocumentHead(template: WebsiteTemplate | null, websiteName: string) {
  useEffect(() => {
    if (!template) return;

    // Title
    document.title = websiteName || template.name || "Site";

    // Favicon
    if (template.faviconUrl) {
      let link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = template.faviconUrl;
      link.type = "image/png";
    }

    // OG Image
    if (template.ogImageUrl) {
      const setMeta = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property='${property}']`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute("property", property);
          document.head.appendChild(meta);
        }
        meta.content = content;
      };
      setMeta("og:image", template.ogImageUrl);
      setMeta("og:title", websiteName || template.name || "");
      setMeta("og:type", "website");

      // Twitter
      let twitterMeta = document.querySelector("meta[name='twitter:image']") as HTMLMetaElement;
      if (!twitterMeta) {
        twitterMeta = document.createElement("meta");
        twitterMeta.name = "twitter:image";
        document.head.appendChild(twitterMeta);
      }
      twitterMeta.content = template.ogImageUrl;
    }

    return () => {
      // Restore defaults on unmount
      document.title = "Kinjani AI";
      const defaultFavicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (defaultFavicon) defaultFavicon.href = "/favicon.png";
    };
  }, [template, websiteName]);
}

export default function PublicWebsitePage() {
  const { siteId } = useParams();
  const [websiteName, setWebsiteName] = useState<string>("");
  const [template, setTemplate] = useState<WebsiteTemplate | null>(null);
  const [embedConfig, setEmbedConfig] = useState<EmbedConfig | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useDocumentHead(template, websiteName);

  useEffect(() => {
    const loadWebsite = async () => {
      if (!siteId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("websites")
          .select("*")
          .eq("id", siteId)
          .maybeSingle();

        if (error || !data) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        setWebsiteName(data.name);
        
        const config = parseConfig(data.config);
        
        if (config?.customTemplate) {
          setTemplate(config.customTemplate);
        } else if (config?.templateId) {
          const baseTemplate = getTemplateById(config.templateId);
          if (baseTemplate) {
            setTemplate(baseTemplate);
          }
        }

        if (config?.embedConfig) {
          setEmbedConfig(config.embedConfig);
        }
      } catch (err) {
        console.error("Error loading website:", err);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadWebsite();
  }, [siteId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (notFound || !template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Site não encontrado</h1>
          <p className="text-muted-foreground">O site que procura não existe ou foi removido.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <WebsitePreview 
        template={template} 
        websiteName={websiteName}
        fullscreen={true}
        embedConfig={embedConfig}
      />
    </div>
  );
}
