
ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_in_menu boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS meta_description text;

CREATE INDEX IF NOT EXISTS idx_menu_items_parent ON public.menu_items(parent_id);
