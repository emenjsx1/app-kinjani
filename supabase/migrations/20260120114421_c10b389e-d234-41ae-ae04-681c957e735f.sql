-- Create user_api_keys table for storing personal API keys
CREATE TABLE public.user_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL, -- 'openai', 'gemini'
  api_key_encrypted TEXT NOT NULL,
  is_valid BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own API keys" 
ON public.user_api_keys 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys" 
ON public.user_api_keys 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" 
ON public.user_api_keys 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" 
ON public.user_api_keys 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage bucket for website assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('website-assets', 'website-assets', true);

-- Storage policies
CREATE POLICY "Anyone can view website assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'website-assets');

CREATE POLICY "Authenticated users can upload website assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'website-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own website assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'website-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own website assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'website-assets' AND auth.uid()::text = (storage.foldername(name))[1]);