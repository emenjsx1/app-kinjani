
-- 1) Lock down internal helper functions: revoke from public (anon + authenticated)
-- These should only run via triggers or service role.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_categories() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_default_categories_for_user(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_chat_messages() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.expire_trials() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_trial_usage(uuid, text) FROM PUBLIC, anon, authenticated;

-- 2) RLS-helper functions: revoke from anon (only signed-in users need them inside RLS policies)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_trial_expired(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.check_trial_limit(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_trial_expired(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_trial_limit(uuid, text) TO authenticated;

-- 3) Storage: prevent listing while keeping public file URLs working via CDN.
-- The CDN serves files independently of these RLS policies; removing them only
-- blocks the storage API .list() endpoint.
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view website assets" ON storage.objects;
DROP POLICY IF EXISTS "Payment images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Recibos are publicly accessible" ON storage.objects;
