import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WebsiteTemplate } from '@/lib/website-templates';
import { EmbedConfig } from '@/components/websites/WebsiteEditor';
import { Json } from '@/integrations/supabase/types';

export interface Website {
  id: string;
  user_id: string;
  name: string;
  template: string | null;
  status: 'active' | 'draft' | 'inactive';
  published_url: string | null;
  config: {
    type?: 'landing' | 'institutional';
    niche?: string;
    nicheId?: string;
    templateId?: string;
    prompt?: string;
    customTemplate?: WebsiteTemplate;
    embedConfig?: EmbedConfig;
    compositionGraph?: any;
  } | null;
  created_at: string;
  updated_at: string;
}

// Helper to convert Json to our config type
const parseConfig = (config: Json | null): Website['config'] => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return null;
  }
  return config as Website['config'];
};

export function useWebsites() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWebsites = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setWebsites([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedWebsites: Website[] = (data || []).map(website => ({
        ...website,
        status: website.status as Website['status'],
        config: parseConfig(website.config),
      }));

      setWebsites(typedWebsites);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch websites');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createWebsite = useCallback(async (website: {
    name: string;
    template?: string;
    status?: 'active' | 'draft' | 'inactive';
    config?: Website['config'];
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('websites')
        .insert({
          name: website.name,
          template: website.template || null,
          status: website.status || 'draft',
          config: website.config as Json || {},
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const typedWebsite: Website = {
        ...data,
        status: data.status as Website['status'],
        config: parseConfig(data.config),
      };

      setWebsites(prev => [typedWebsite, ...prev]);
      return typedWebsite;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create website');
      return null;
    }
  }, []);

  const updateWebsite = useCallback(async (
    id: string,
    updates: Partial<Omit<Website, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      const updateData: Partial<{ name: string; template: string; config: Json; status: string; published_url: string }> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.template !== undefined) updateData.template = updates.template;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.published_url !== undefined) updateData.published_url = updates.published_url;
      if (updates.config !== undefined) updateData.config = updates.config as Json;

      const { data, error } = await supabase
        .from('websites')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const typedWebsite: Website = {
        ...data,
        status: data.status as Website['status'],
        config: parseConfig(data.config),
      };

      setWebsites(prev => prev.map(w => w.id === id ? typedWebsite : w));
      return typedWebsite;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update website');
      return null;
    }
  }, []);

  const deleteWebsite = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('websites')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWebsites(prev => prev.filter(w => w.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete website');
      return false;
    }
  }, []);

  const getWebsite = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        status: data.status as Website['status'],
        config: parseConfig(data.config),
      } as Website;
    } catch (err) {
      return null;
    }
  }, []);

  const duplicateWebsite = useCallback(async (website: Website) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('websites')
        .insert({
          name: `${website.name} (Cópia)`,
          template: website.template,
          status: 'draft',
          config: website.config as Json || {},
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const typedWebsite: Website = {
        ...data,
        status: data.status as Website['status'],
        config: parseConfig(data.config),
      };

      setWebsites(prev => [typedWebsite, ...prev]);
      return typedWebsite;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate website');
      return null;
    }
  }, []);

  useEffect(() => {
    fetchWebsites();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchWebsites();
    });

    return () => subscription.unsubscribe();
  }, [fetchWebsites]);

  return {
    websites,
    isLoading,
    error,
    createWebsite,
    updateWebsite,
    deleteWebsite,
    getWebsite,
    duplicateWebsite,
    refetch: fetchWebsites,
  };
}
