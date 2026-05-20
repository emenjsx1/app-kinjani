-- Memória curta de conversa WhatsApp por contacto + instância
CREATE TABLE IF NOT EXISTS public.wa_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  agent_id uuid,
  instance_key text NOT NULL,
  jid text NOT NULL,
  phone text,
  history jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (instance_key, jid)
);

ALTER TABLE public.wa_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own wa conversations select"
  ON public.wa_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "own wa conversations insert"
  ON public.wa_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own wa conversations update"
  ON public.wa_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "own wa conversations delete"
  ON public.wa_conversations FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_wa_conversations_lookup
  ON public.wa_conversations (instance_key, jid);

CREATE INDEX IF NOT EXISTS idx_wa_conversations_user
  ON public.wa_conversations (user_id, last_message_at DESC);

CREATE TRIGGER set_wa_conversations_updated_at
  BEFORE UPDATE ON public.wa_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();