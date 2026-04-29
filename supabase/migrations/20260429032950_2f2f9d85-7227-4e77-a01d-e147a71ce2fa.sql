-- Helper: keep admin/administrator able to CUD news & achievements (already authenticated => true)
-- For other tables, restrict CUD to administrator only.

-- =========================================================
-- PROGRAMS
DROP POLICY IF EXISTS "Auth insert programs" ON public.programs;
DROP POLICY IF EXISTS "Auth update programs" ON public.programs;
DROP POLICY IF EXISTS "Auth delete programs" ON public.programs;
CREATE POLICY "Administrator insert programs" ON public.programs FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "Administrator update programs" ON public.programs FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "Administrator delete programs" ON public.programs FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));

-- PARTNERSHIPS
DROP POLICY IF EXISTS "Auth insert partnerships" ON public.partnerships;
DROP POLICY IF EXISTS "Auth update partnerships" ON public.partnerships;
DROP POLICY IF EXISTS "Auth delete partnerships" ON public.partnerships;
CREATE POLICY "Administrator insert partnerships" ON public.partnerships FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "Administrator update partnerships" ON public.partnerships FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "Administrator delete partnerships" ON public.partnerships FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));

-- PAGES
DROP POLICY IF EXISTS "Auth insert pages" ON public.pages;
DROP POLICY IF EXISTS "Auth update pages" ON public.pages;
DROP POLICY IF EXISTS "Auth delete pages" ON public.pages;
CREATE POLICY "Administrator insert pages" ON public.pages FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "Administrator update pages" ON public.pages FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "Administrator delete pages" ON public.pages FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));

-- SCHOOL_INFO
DROP POLICY IF EXISTS "Auth insert school_info" ON public.school_info;
DROP POLICY IF EXISTS "Auth update school_info" ON public.school_info;
DROP POLICY IF EXISTS "Auth delete school_info" ON public.school_info;
CREATE POLICY "Administrator insert school_info" ON public.school_info FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "Administrator update school_info" ON public.school_info FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "Administrator delete school_info" ON public.school_info FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));

-- MENU_ITEMS
DROP POLICY IF EXISTS "Auth insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Auth update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Auth delete menu items" ON public.menu_items;
CREATE POLICY "Administrator insert menu items" ON public.menu_items FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "Administrator update menu items" ON public.menu_items FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "Administrator delete menu items" ON public.menu_items FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));

-- HERO_SLIDES
DROP POLICY IF EXISTS "Auth insert slides" ON public.hero_slides;
DROP POLICY IF EXISTS "Auth update slides" ON public.hero_slides;
DROP POLICY IF EXISTS "Auth delete slides" ON public.hero_slides;
CREATE POLICY "Administrator insert slides" ON public.hero_slides FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "Administrator update slides" ON public.hero_slides FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "Administrator delete slides" ON public.hero_slides FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));

-- HOMEPAGE_SECTIONS
DROP POLICY IF EXISTS "Auth insert sections" ON public.homepage_sections;
DROP POLICY IF EXISTS "Auth update sections" ON public.homepage_sections;
DROP POLICY IF EXISTS "Auth delete sections" ON public.homepage_sections;
CREATE POLICY "Administrator insert sections" ON public.homepage_sections FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "Administrator update sections" ON public.homepage_sections FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "Administrator delete sections" ON public.homepage_sections FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));

-- CUSTOM_SECTIONS
DROP POLICY IF EXISTS "Auth insert custom sections" ON public.custom_sections;
DROP POLICY IF EXISTS "Auth update custom sections" ON public.custom_sections;
DROP POLICY IF EXISTS "Auth delete custom sections" ON public.custom_sections;
CREATE POLICY "Administrator insert custom sections" ON public.custom_sections FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "Administrator update custom sections" ON public.custom_sections FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "Administrator delete custom sections" ON public.custom_sections FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));

-- GALLERY_ALBUMS
DROP POLICY IF EXISTS "Auth insert albums" ON public.gallery_albums;
DROP POLICY IF EXISTS "Auth update albums" ON public.gallery_albums;
DROP POLICY IF EXISTS "Auth delete albums" ON public.gallery_albums;
CREATE POLICY "Administrator insert albums" ON public.gallery_albums FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "Administrator update albums" ON public.gallery_albums FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "Administrator delete albums" ON public.gallery_albums FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));

-- GALLERY_PHOTOS
DROP POLICY IF EXISTS "Auth insert photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Auth update photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Auth delete photos" ON public.gallery_photos;
CREATE POLICY "Administrator insert photos" ON public.gallery_photos FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "Administrator update photos" ON public.gallery_photos FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "Administrator delete photos" ON public.gallery_photos FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));

-- CONTACT_MESSAGES (only administrator can read/update/delete; insert tetap publik)
DROP POLICY IF EXISTS "Auth read contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Auth update contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Auth delete contact messages" ON public.contact_messages;
CREATE POLICY "Administrator read contact messages" ON public.contact_messages FOR SELECT TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "Administrator update contact messages" ON public.contact_messages FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "Administrator delete contact messages" ON public.contact_messages FOR DELETE TO authenticated USING (has_role(auth.uid(), 'administrator'::app_role));

-- NEWS & ACHIEVEMENTS: keep authenticated CUD (both administrator and admin) — sudah benar, tidak diubah.
