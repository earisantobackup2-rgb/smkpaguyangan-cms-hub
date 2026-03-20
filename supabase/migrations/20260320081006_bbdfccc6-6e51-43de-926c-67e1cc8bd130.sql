CREATE TABLE public.menu_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label text NOT NULL,
  url text NOT NULL,
  parent_id uuid REFERENCES public.menu_items(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  open_in_new_tab boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read visible menu items" ON public.menu_items FOR SELECT TO public USING (is_visible = true OR (SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Auth insert menu items" ON public.menu_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update menu items" ON public.menu_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete menu items" ON public.menu_items FOR DELETE TO authenticated USING (true);