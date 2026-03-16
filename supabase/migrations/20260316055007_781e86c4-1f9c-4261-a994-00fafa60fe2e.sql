
-- Create gallery_albums table
CREATE TABLE public.gallery_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  cover_image_url text,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create gallery_photos table
CREATE TABLE public.gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid REFERENCES public.gallery_albums(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  caption text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for gallery_albums
CREATE POLICY "Public read published albums" ON public.gallery_albums FOR SELECT TO public
  USING (is_published = true OR (SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Auth insert albums" ON public.gallery_albums FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "Auth update albums" ON public.gallery_albums FOR UPDATE TO authenticated
  USING (true);
CREATE POLICY "Auth delete albums" ON public.gallery_albums FOR DELETE TO authenticated
  USING (true);

-- RLS policies for gallery_photos
CREATE POLICY "Public read photos of published albums" ON public.gallery_photos FOR SELECT TO public
  USING (EXISTS (SELECT 1 FROM public.gallery_albums WHERE id = album_id AND (is_published = true OR (SELECT auth.uid()) IS NOT NULL)));
CREATE POLICY "Auth insert photos" ON public.gallery_photos FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "Auth update photos" ON public.gallery_photos FOR UPDATE TO authenticated
  USING (true);
CREATE POLICY "Auth delete photos" ON public.gallery_photos FOR DELETE TO authenticated
  USING (true);

-- Add updated_at trigger for gallery_albums
CREATE TRIGGER update_gallery_albums_updated_at
  BEFORE UPDATE ON public.gallery_albums
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
