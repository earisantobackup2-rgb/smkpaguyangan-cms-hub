
CREATE TABLE public.hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active slides" ON public.hero_slides FOR SELECT TO public USING (is_active = true OR (SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Auth insert slides" ON public.hero_slides FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update slides" ON public.hero_slides FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete slides" ON public.hero_slides FOR DELETE TO authenticated USING (true);
