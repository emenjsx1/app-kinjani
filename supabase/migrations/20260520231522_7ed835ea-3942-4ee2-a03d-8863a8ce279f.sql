-- Atomic credit deduction with insufficient-balance check
CREATE OR REPLACE FUNCTION public.deduct_credits(
  _user_id uuid,
  _action text,
  _amount integer,
  _description text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance integer;
  new_balance integer;
BEGIN
  IF _amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'reason', 'invalid_amount');
  END IF;

  SELECT credits_balance INTO current_balance
  FROM public.profiles
  WHERE user_id = _user_id
  FOR UPDATE;

  IF current_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'profile_not_found');
  END IF;

  IF current_balance < _amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'insufficient',
      'balance', current_balance,
      'required', _amount
    );
  END IF;

  new_balance := current_balance - _amount;

  UPDATE public.profiles
  SET credits_balance = new_balance, updated_at = now()
  WHERE user_id = _user_id;

  INSERT INTO public.credit_transactions (user_id, amount, action, description)
  VALUES (_user_id, -_amount, _action, _description);

  RETURN jsonb_build_object('success', true, 'balance', new_balance, 'charged', _amount);
END;
$$;

-- Add credits (top-ups, refunds, monthly grants)
CREATE OR REPLACE FUNCTION public.add_credits(
  _user_id uuid,
  _amount integer,
  _action text,
  _description text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance integer;
BEGIN
  IF _amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'reason', 'invalid_amount');
  END IF;

  UPDATE public.profiles
  SET credits_balance = credits_balance + _amount, updated_at = now()
  WHERE user_id = _user_id
  RETURNING credits_balance INTO new_balance;

  IF new_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'profile_not_found');
  END IF;

  INSERT INTO public.credit_transactions (user_id, amount, action, description)
  VALUES (_user_id, _amount, _action, _description);

  RETURN jsonb_build_object('success', true, 'balance', new_balance, 'added', _amount);
END;
$$;

-- Allow authenticated users to call the RPCs
GRANT EXECUTE ON FUNCTION public.deduct_credits(uuid, text, integer, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.add_credits(uuid, integer, text, text) TO authenticated, service_role;

-- Speed up the credit history listing
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_created
  ON public.credit_transactions(user_id, created_at DESC);