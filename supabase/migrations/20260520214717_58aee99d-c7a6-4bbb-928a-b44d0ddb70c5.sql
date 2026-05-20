
-- Payment orders
CREATE TABLE public.payment_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount_mzn numeric NOT NULL,
  credits_amount integer NOT NULL DEFAULT 0,
  method text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders all" ON public.payment_orders
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Client assets (websites & agents priced per client)
CREATE TABLE public.client_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_id uuid NOT NULL,
  asset_type text NOT NULL CHECK (asset_type IN ('website','agent')),
  asset_id uuid NOT NULL,
  monthly_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, asset_type, asset_id)
);
ALTER TABLE public.client_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own client_assets all" ON public.client_assets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Instance limit on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS instance_limit integer NOT NULL DEFAULT 1;
