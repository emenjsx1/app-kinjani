-- Create clients table for agency multi-client management with white-label branding
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  -- White-label branding fields
  logo_url TEXT,
  primary_color TEXT DEFAULT '#6366f1',
  secondary_color TEXT DEFAULT '#8b5cf6',
  accent_color TEXT DEFAULT '#06b6d4',
  -- Subscription/status
  status TEXT NOT NULL DEFAULT 'active',
  plan TEXT DEFAULT 'basic',
  monthly_value DECIMAL(10,2) DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view own clients" 
ON public.clients 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own clients" 
ON public.clients 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" 
ON public.clients 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" 
ON public.clients 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add client_id to agents table for linking agents to clients
ALTER TABLE public.agents ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- Add client_id to websites table for linking websites to clients
ALTER TABLE public.websites ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();