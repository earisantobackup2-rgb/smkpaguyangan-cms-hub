CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  curriculum text,
  career_prospects text,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published programs" ON public.programs
  FOR SELECT TO public USING ((is_published = true) OR (( SELECT auth.uid() AS uid) IS NOT NULL));

CREATE POLICY "Auth insert programs" ON public.programs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth update programs" ON public.programs
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth delete programs" ON public.programs
  FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();