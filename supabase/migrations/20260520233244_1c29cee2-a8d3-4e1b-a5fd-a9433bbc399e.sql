ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS wa_text_unbilled integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.bill_wa_message(_user_id uuid, _kind text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cost integer := 0;
  action_name text := 'wa_message_' || _kind;
  current_unbilled integer;
  current_balance integer;
  new_balance integer;
BEGIN
  IF _kind = 'text' THEN
    -- Aggregate: 1 credit per 20 text messages
    UPDATE public.profiles
       SET wa_text_unbilled = wa_text_unbilled + 1,
           updated_at = now()
     WHERE user_id = _user_id
    RETURNING wa_text_unbilled, credits_balance INTO current_unbilled, current_balance;

    IF current_unbilled IS NULL THEN
      RETURN jsonb_build_object('success', false, 'reason', 'profile_not_found');
    END IF;

    IF current_unbilled < 20 THEN
      RETURN jsonb_build_object('success', true, 'charged', 0, 'unbilled', current_unbilled, 'balance', current_balance);
    END IF;

    cost := 1;
  ELSIF _kind = 'image' OR _kind = 'audio' THEN
    cost := 3;
  ELSIF _kind = 'document' OR _kind = 'pdf' THEN
    cost := 5;
  ELSE
    cost := 1;
  END IF;

  SELECT credits_balance INTO current_balance
    FROM public.profiles WHERE user_id = _user_id FOR UPDATE;

  IF current_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'profile_not_found');
  END IF;

  IF current_balance < cost THEN
    RETURN jsonb_build_object('success', false, 'reason', 'insufficient', 'balance', current_balance, 'required', cost);
  END IF;

  new_balance := current_balance - cost;

  UPDATE public.profiles
     SET credits_balance = new_balance,
         wa_text_unbilled = CASE WHEN _kind = 'text' THEN GREATEST(wa_text_unbilled - 20, 0) ELSE wa_text_unbilled END,
         updated_at = now()
   WHERE user_id = _user_id;

  INSERT INTO public.credit_transactions (user_id, amount, action, description)
  VALUES (_user_id, -cost, action_name,
          CASE WHEN _kind = 'text' THEN 'Lote 20 mensagens WhatsApp (texto)'
               ELSE 'Mensagem WhatsApp (' || _kind || ')' END);

  RETURN jsonb_build_object('success', true, 'charged', cost, 'balance', new_balance);
END;
$$;

REVOKE ALL ON FUNCTION public.bill_wa_message(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bill_wa_message(uuid, text) TO service_role;