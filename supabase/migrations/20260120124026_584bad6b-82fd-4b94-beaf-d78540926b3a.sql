-- Add instance_id column to agents table to link agents to WhatsApp instances
ALTER TABLE public.agents 
ADD COLUMN instance_id UUID REFERENCES public.whatsapp_instances(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_agents_instance_id ON public.agents(instance_id);