REVOKE EXECUTE ON FUNCTION public.deduct_credits(uuid, text, integer, text) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.add_credits(uuid, integer, text, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_credits(uuid, text, integer, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.add_credits(uuid, integer, text, text) TO service_role;