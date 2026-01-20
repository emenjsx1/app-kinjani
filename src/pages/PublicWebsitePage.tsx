import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { WebsitePreview } from "@/components/websites/WebsitePreview";
import { WebsiteTemplate, getTemplateById } from "@/lib/website-templates";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface StoredWebsite {
  id: string;
  name: string;
  type: "landing" | "institutional";
  niche: string;
  template: string;
  customTemplate?: WebsiteTemplate;
  status: "draft" | "active";
  url?: string;
  createdAt: string;
  generationPrompt?: string;
  embedConfig?: {
    enabled: boolean;
    agentId?: string;
    position?: "right" | "left";
    primaryColor?: string;
    welcomeMessage?: string;
  };
}

const STORAGE_KEY = "kinja-websites";

const getStoredWebsites = (): StoredWebsite[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export default function PublicWebsitePage() {
  const { siteId } = useParams();
  const [website, setWebsite] = useState<StoredWebsite | null>(null);
  const [template, setTemplate] = useState<WebsiteTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (siteId) {
      const websites = getStoredWebsites();
      const site = websites.find((w) => w.id === siteId);

      if (site) {
        setWebsite(site);
        
        if (site.customTemplate) {
          setTemplate(site.customTemplate);
        } else {
          const baseTemplate = getTemplateById(site.template);
          if (baseTemplate) {
            setTemplate(baseTemplate);
          }
        }
      } else {
        setNotFound(true);
      }
      setIsLoading(false);
    }
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
        websiteName={website?.name}
        fullscreen={true}
        embedConfig={website?.embedConfig}
      />
    </div>
  );
}
