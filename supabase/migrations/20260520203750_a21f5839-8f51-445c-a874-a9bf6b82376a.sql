ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS generated_html text;
ALTER TABLE public.websites ADD COLUMN IF NOT EXISTS chat_history jsonb NOT NULL DEFAULT '[]'::jsonb;