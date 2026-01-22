-- Add RLS policy to allow public access to published websites
CREATE POLICY "Public can view published websites"
ON public.websites
FOR SELECT
USING (status = 'active' AND published_url IS NOT NULL);