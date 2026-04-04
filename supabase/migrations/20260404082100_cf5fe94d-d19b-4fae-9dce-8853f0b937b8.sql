
CREATE TABLE public.custom_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES public.homepage_sections(id) ON DELETE CASCADE,
  heading TEXT NOT NULL DEFAULT '',
  subheading TEXT,
  content TEXT,
  image_url TEXT,
  button_text TEXT,
  button_url TEXT,
  bg_color TEXT,
  layout TEXT NOT NULL DEFAULT 'center',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read custom sections" ON public.custom_sections FOR SELECT USING (true);
CREATE POLICY "Auth insert custom sections" ON public.custom_sections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update custom sections" ON public.custom_sections FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete custom sections" ON public.custom_sections FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_custom_sections_updated_at
  BEFORE UPDATE ON public.custom_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
