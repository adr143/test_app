
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


COMMENT ON TABLE public.user_profiles IS 'User profile information with phone-based login';


DROP TABLE IF EXISTS public.reports CASCADE;

CREATE TABLE public.reports (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL DEFAULT 'general',
  description TEXT NOT NULL,
  location VARCHAR(255),
  image TEXT,
  responded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.reports IS 'User-submitted reports with images and status tracking';
COMMENT ON COLUMN public.reports.user_id IS 'Reference to user_profiles.id';
COMMENT ON COLUMN public.reports.type IS 'Category of report: general, maintenance, incident, accident';
COMMENT ON COLUMN public.reports.description IS 'Detailed description of the report';
COMMENT ON COLUMN public.reports.location IS 'Location where the incident occurred';
COMMENT ON COLUMN public.reports.image IS 'URL to the uploaded image in Supabase Storage';
COMMENT ON COLUMN public.reports.responded IS 'Whether the report has been responded to';

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);

CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reports_responded ON public.reports(responded);

CREATE INDEX IF NOT EXISTS idx_reports_type ON public.reports(type);


CREATE INDEX IF NOT EXISTS idx_reports_user_created ON public.reports(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user profiles"
  ON public.user_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert user profiles"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update user profiles"
  ON public.user_profiles
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can view reports"
  ON public.reports
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert reports"
  ON public.reports
  FOR INSERT
  WITH CHECK (true);


CREATE POLICY "Anyone can update reports"
  ON public.reports
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete reports"
  ON public.reports
  FOR DELETE
  USING (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload report images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Public can view report images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'reports');

CREATE POLICY "Anyone can delete report images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'reports');

CREATE OR REPLACE FUNCTION public.get_user_reports_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.reports
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION public.get_user_responded_reports_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.reports
    WHERE user_id = user_uuid AND responded = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT SELECT ON public.reports TO anon;

GRANT USAGE, SELECT ON SEQUENCE public.reports_id_seq TO authenticated;

