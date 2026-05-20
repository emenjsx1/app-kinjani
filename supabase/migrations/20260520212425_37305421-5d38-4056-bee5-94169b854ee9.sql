-- Add slug to websites
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS slug text;
CREATE UNIQUE INDEX IF NOT EXISTS websites_slug_unique ON public.websites(slug) WHERE slug IS NOT NULL;

-- Custom domains table
CREATE TABLE IF NOT EXISTS public.custom_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  website_id uuid REFERENCES public.websites(id) ON DELETE SET NULL,
  domain text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  verification_token text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS custom_domains_user_idx ON public.custom_domains(user_id);
CREATE INDEX IF NOT EXISTS custom_domains_website_idx ON public.custom_domains(website_id);
CREATE INDEX IF NOT EXISTS custom_domains_domain_idx ON public.custom_domains(domain);

ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own domains all" ON public.custom_domains
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Public can read verified domains (needed to resolve host -> site on public page)
CREATE POLICY "public read verified domains" ON public.custom_domains
  FOR SELECT USING (status = 'active');

CREATE TRIGGER custom_domains_updated_at
  BEFORE UPDATE ON public.custom_domains
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();