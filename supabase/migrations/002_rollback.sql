
DROP POLICY IF EXISTS "Authenticated users can upload report images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view report images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own report images" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can view all reports" ON public.reports;
DROP POLICY IF EXISTS "Authenticated users can insert own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can update own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can delete own reports" ON public.reports;
DROP POLICY IF EXISTS "Anonymous users can view reports" ON public.reports;

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;

DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.get_user_reports_count(UUID);
DROP FUNCTION IF EXISTS public.get_user_responded_reports_count(UUID);

DROP INDEX IF EXISTS public.idx_reports_user_id;
DROP INDEX IF EXISTS public.idx_reports_created_at;
DROP INDEX IF EXISTS public.idx_reports_responded;
DROP INDEX IF EXISTS public.idx_reports_type;
DROP INDEX IF EXISTS public.idx_reports_user_created;

DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

