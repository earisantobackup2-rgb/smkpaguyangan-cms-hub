
-- Create update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- School info table
CREATE TABLE public.school_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.school_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read school_info" ON public.school_info FOR SELECT USING (true);
CREATE POLICY "Auth insert school_info" ON public.school_info FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update school_info" ON public.school_info FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete school_info" ON public.school_info FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_school_info_updated_at BEFORE UPDATE ON public.school_info FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- News/Berita table
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'berita' CHECK (category IN ('berita', 'pengumuman')),
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published news" ON public.news FOR SELECT USING (is_published = true OR (SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Auth insert news" ON public.news FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update news" ON public.news FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete news" ON public.news FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Achievements/Prestasi table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  achievement_date DATE,
  category TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published achievements" ON public.achievements FOR SELECT USING (is_published = true OR (SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Auth insert achievements" ON public.achievements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update achievements" ON public.achievements FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete achievements" ON public.achievements FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON public.achievements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Industry partnerships table
CREATE TABLE public.partnerships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  partnership_type TEXT CHECK (partnership_type IN ('mou', 'magang', 'kerjasama')),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active partnerships" ON public.partnerships FOR SELECT USING (is_active = true OR (SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Auth insert partnerships" ON public.partnerships FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update partnerships" ON public.partnerships FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete partnerships" ON public.partnerships FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_partnerships_updated_at BEFORE UPDATE ON public.partnerships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Visi Misi & Sejarah pages
CREATE TABLE public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read pages" ON public.pages FOR SELECT USING (true);
CREATE POLICY "Auth insert pages" ON public.pages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update pages" ON public.pages FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete pages" ON public.pages FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);
CREATE POLICY "Public read uploads" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY "Auth upload files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uploads');
CREATE POLICY "Auth update files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'uploads');
CREATE POLICY "Auth delete files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'uploads');
