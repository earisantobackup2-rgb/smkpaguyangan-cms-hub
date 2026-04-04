

## Custom Section Builder untuk Homepage

### Ringkasan
Menambahkan fitur **Custom Section Builder** di admin panel yang memungkinkan admin membuat section homepage kustom (bukan hanya dari template yang sudah ada). Admin bisa membuat section dengan konten bebas (judul, teks, gambar, tombol CTA) dan menyimpannya ke database, lalu section tersebut tampil di homepage sesuai urutan drag-and-drop.

### Perubahan Database

**Tabel baru: `custom_sections`**
- `id` (uuid, PK)
- `section_id` (uuid, FK ke homepage_sections.id) — menghubungkan ke section di homepage
- `heading` (text) — judul section
- `subheading` (text, nullable) — sub-judul
- `content` (text, nullable) — konten teks/HTML
- `image_url` (text, nullable) — gambar utama
- `button_text` (text, nullable) — teks tombol CTA
- `button_url` (text, nullable) — link tombol CTA
- `bg_color` (text, nullable) — warna latar kustom
- `layout` (text, default 'center') — layout: center, left-image, right-image
- `created_at`, `updated_at` (timestamps)

RLS: public read, authenticated CRUD.

### Perubahan pada `homepage_sections`

Menambahkan section_key `"custom"` sebagai tipe baru. Saat admin menambah section kustom, otomatis membuat row di `homepage_sections` dengan `section_key = 'custom'` dan row terkait di `custom_sections`.

### File yang Diubah/Dibuat

1. **Migration SQL** — Buat tabel `custom_sections` dengan RLS policies
2. **`src/pages/admin/AdminSections.tsx`** — Tambah tombol "Buat Section Kustom" di samping "Tambah Section". Klik membuka dialog/form untuk mengisi heading, subheading, content, upload gambar, button CTA, pilih layout. Saat simpan, insert ke `homepage_sections` + `custom_sections`. Tambah tombol edit pada section kustom untuk membuka form editor.
3. **`src/components/public/CustomSection.tsx`** (baru) — Komponen render section kustom dengan 3 layout variant: center (teks tengah), left-image (gambar kiri teks kanan), right-image (gambar kanan teks kiri)
4. **`src/pages/Index.tsx`** — Tambah case `"custom"` di `renderSection` yang fetch data dari `custom_sections` dan render `CustomSection`

### Detail Admin UI

- Form pembuatan section kustom dalam Dialog:
  - Input: Judul, Sub-judul, Konten (textarea), Upload Gambar, Teks Tombol, URL Tombol
  - Select: Layout (Tengah / Gambar Kiri / Gambar Kanan)
  - Warna latar opsional
- Section kustom tampil di daftar drag-and-drop sama seperti section lainnya
- Ikon edit muncul khusus untuk section bertipe `custom`
- Bisa duplikasi section kustom yang sudah ada sebagai template

### Render di Homepage

Section kustom di-render secara dinamis berdasarkan layout yang dipilih, dengan styling yang konsisten dengan section lainnya (padding, container width, typography).

### Langkah Implementasi

1. Jalankan migration untuk tabel `custom_sections`
2. Buat komponen `CustomSection.tsx`
3. Update `AdminSections.tsx` dengan form builder kustom + edit + duplikasi
4. Update `Index.tsx` untuk render section kustom
5. Update types setelah migration

