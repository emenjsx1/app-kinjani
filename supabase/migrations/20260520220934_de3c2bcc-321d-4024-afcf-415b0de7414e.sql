CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE IF NOT EXISTS public.user_integration_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  whatsapp_daily_limit int NOT NULL DEFAULT 200,
  whatsapp_delay_min_seconds int NOT NULL DEFAULT 3,
  whatsapp_delay_max_seconds int NOT NULL DEFAULT 5,
  whatsapp_default_instance_key text,
  email_daily_limit int NOT NULL DEFAULT 500,
  email_default_sender_name text,
  email_default_sender_address text,
  email_default_recipients text,
  email_provider text NOT NULL DEFAULT 'lovable',
  email_smtp_host text,
  email_smtp_port int,
  email_smtp_user text,
  email_smtp_password text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_integration_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own integration settings"
  ON public.user_integration_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own integration settings"
  ON public.user_integration_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own integration settings"
  ON public.user_integration_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_integration_settings_updated_at
  BEFORE UPDATE ON public.user_integration_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
