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

export default function PublicWebsitePage() {
  const { siteId } = useParams();
  const [websiteName, setWebsiteName] = useState<string>("");
  const [template, setTemplate] = useState<WebsiteTemplate | null>(null);
  const [embedConfig, setEmbedConfig] = useState<EmbedConfig | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
        
        // Use customTemplate if it exists, otherwise fall back to catalog template
        if (config?.customTemplate) {
          setTemplate(config.customTemplate);
        } else if (config?.templateId) {
          const baseTemplate = getTemplateById(config.templateId);
          if (baseTemplate) {
            setTemplate(baseTemplate);
          }
        }

        // Set embed config if available
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
