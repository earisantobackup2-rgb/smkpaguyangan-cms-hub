-- Clear previous crawled entries to avoid duplicates
DELETE FROM public.chatbot_knowledge WHERE category IN ('crawled','sekolah','jurusan','berita','prestasi','kerjasama','kontak');

-- School info
INSERT INTO public.chatbot_knowledge (title, content, category, source_url, is_active)
SELECT 'Profil Sekolah - ' || COALESCE((SELECT value FROM school_info WHERE key='school_name'),'SMK Muhammadiyah 1 Paguyangan'),
       'Nama Sekolah: ' || COALESCE((SELECT value FROM school_info WHERE key='school_name'),'-') || E'\n' ||
       'Alamat: ' || COALESCE((SELECT value FROM school_info WHERE key='address'),'-') || E'\n' ||
       'Telepon: ' || COALESCE((SELECT value FROM school_info WHERE key='phone'),'-') || E'\n' ||
       'Email: ' || COALESCE((SELECT value FROM school_info WHERE key='email'),'-') || E'\n' ||
       'Akreditasi: ' || COALESCE((SELECT value FROM school_info WHERE key='accreditation'),'-') || E'\n' ||
       'Tahun Berdiri: ' || COALESCE((SELECT value FROM school_info WHERE key='established_year'),'-') || E'\n' ||
       'Jumlah Siswa: ' || COALESCE((SELECT value FROM school_info WHERE key='total_students'),'-') || E'\n' ||
       'Jumlah Alumni: ' || COALESCE((SELECT value FROM school_info WHERE key='total_alumni'),'-') || E'\n' ||
       'Jumlah Program Keahlian: ' || COALESCE((SELECT value FROM school_info WHERE key='total_programs'),'-') || E'\n' ||
       'Mitra Kerjasama: ' || COALESCE((SELECT value FROM school_info WHERE key='total_partners'),'-') || E'\n' ||
       'Instagram: ' || COALESCE((SELECT value FROM school_info WHERE key='instagram_url'),'-'),
       'sekolah', '/profil', true;

-- Programs / Jurusan
INSERT INTO public.chatbot_knowledge (title, content, category, source_url, is_active)
SELECT 'Jurusan: ' || name,
       'Nama Jurusan: ' || name || E'\n\nDeskripsi: ' || COALESCE(description,'-') ||
       E'\n\nKurikulum: ' || COALESCE(curriculum,'-') ||
       E'\n\nProspek Karir: ' || COALESCE(career_prospects,'-'),
       'jurusan', '/jurusan/' || slug, true
FROM public.programs WHERE is_published = true;

-- News
INSERT INTO public.chatbot_knowledge (title, content, category, source_url, is_active)
SELECT 'Berita: ' || title,
       COALESCE(excerpt,'') || E'\n\n' || COALESCE(LEFT(content, 4000),''),
       'berita', '/berita', true
FROM public.news WHERE is_published = true ORDER BY published_at DESC NULLS LAST LIMIT 20;

-- Achievements
INSERT INTO public.chatbot_knowledge (title, content, category, source_url, is_active)
SELECT 'Prestasi: ' || title,
       'Kategori: ' || COALESCE(category,'-') ||
       E'\nTanggal: ' || COALESCE(achievement_date::text,'-') ||
       E'\n\n' || COALESCE(description,'-'),
       'prestasi', '/prestasi', true
FROM public.achievements WHERE is_published = true ORDER BY achievement_date DESC NULLS LAST LIMIT 30;

-- Partnerships
INSERT INTO public.chatbot_knowledge (title, content, category, source_url, is_active)
SELECT 'Kerjasama: ' || company_name,
       'Mitra: ' || company_name ||
       E'\nJenis Kerjasama: ' || COALESCE(partnership_type,'-') ||
       E'\n\n' || COALESCE(description,'-'),
       'kerjasama', '/profil', true
FROM public.partnerships WHERE is_active = true;

-- Pages
INSERT INTO public.chatbot_knowledge (title, content, category, source_url, is_active)
SELECT 'Halaman: ' || title,
       LEFT(COALESCE(content,'-'), 5000),
       'halaman', '/' || slug, true
FROM public.pages;