-- 1. Tighten news/achievements policies
DROP POLICY IF EXISTS "Auth delete news" ON public.news;
DROP POLICY IF EXISTS "Auth insert news" ON public.news;
DROP POLICY IF EXISTS "Auth update news" ON public.news;

CREATE POLICY "Roles insert news" ON public.news FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'administrator') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Roles update news" ON public.news FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'administrator') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Roles delete news" ON public.news FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'administrator') OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Auth delete achievements" ON public.achievements;
DROP POLICY IF EXISTS "Auth insert achievements" ON public.achievements;
DROP POLICY IF EXISTS "Auth update achievements" ON public.achievements;

CREATE POLICY "Roles insert achievements" ON public.achievements FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'administrator') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Roles update achievements" ON public.achievements FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'administrator') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Roles delete achievements" ON public.achievements FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'administrator') OR public.has_role(auth.uid(), 'admin'));

-- 2. Storage bucket: restrict listing & uploads to roles. Keep public read for direct URLs via getPublicUrl (works without SELECT policy on public buckets).
DROP POLICY IF EXISTS "Auth delete files" ON storage.objects;
DROP POLICY IF EXISTS "Auth update files" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload files" ON storage.objects;
DROP POLICY IF EXISTS "Public read uploads" ON storage.objects;

CREATE POLICY "Roles upload uploads" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'uploads'
    AND (public.has_role(auth.uid(), 'administrator') OR public.has_role(auth.uid(), 'admin'))
  );
CREATE POLICY "Roles update uploads" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'uploads'
    AND (public.has_role(auth.uid(), 'administrator') OR public.has_role(auth.uid(), 'admin'))
  );
CREATE POLICY "Roles delete uploads" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'uploads'
    AND (public.has_role(auth.uid(), 'administrator') OR public.has_role(auth.uid(), 'admin'))
  );
CREATE POLICY "Roles list uploads" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'uploads'
    AND (public.has_role(auth.uid(), 'administrator') OR public.has_role(auth.uid(), 'admin'))
  );

-- 3. Bucket constraints: 500KB max, image-only mime types.
UPDATE storage.buckets
SET file_size_limit = 512000,
    allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
WHERE id = 'uploads';

-- 4. Lock down SECURITY DEFINER helper functions: only the DB itself (used by RLS) needs execute.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO postgres, service_role;