CREATE TABLE public.homepage_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key text NOT NULL UNIQUE,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read visible sections" ON public.homepage_sections FOR SELECT TO public USING (true);
CREATE POLICY "Auth insert sections" ON public.homepage_sections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update sections" ON public.homepage_sections FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete sections" ON public.homepage_sections FOR DELETE TO authenticated USING (true);

-- Seed default sections
INSERT INTO public.homepage_sections (section_key, label, sort_order, is_visible) VALUES
  ('hero', 'Hero Slideshow', 0, true),
  ('programs', 'Konsentrasi Keahlian', 1, true),
  ('search', 'Pencarian Berita & Prestasi', 2, true),
  ('partnerships', 'Kerjasama Industri', 3, true),
  ('maps', 'Lokasi Sekolah', 4, true),
  ('instagram', 'Instagram Feed', 5, true);