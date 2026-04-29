import { Joyride, STATUS, type EventData, type Step } from "react-joyride";

const STORAGE_KEY = "admin_tour_completed_v1";

const steps: Step[] = [
  {
    target: '[data-tour="sidebar"]',
    title: "Selamat datang di CMS Admin 👋",
    content: "Ini panel admin SMK Muhammadiyah 1 Paguyangan. Tour singkat ini akan memandu Anda mengenal setiap menu. Tekan Next untuk mulai.",
    placement: "right",
  },
  { target: '[data-tour="nav-/admin"]', title: "Dashboard", content: "Ringkasan statistik website: jumlah berita, pesan masuk, kunjungan, dll.", placement: "right" },
  { target: '[data-tour="nav-/admin/slides"]', title: "Slide Hero", content: "Kelola slideshow utama di halaman beranda website.", placement: "right" },
  { target: '[data-tour="nav-/admin/jurusan"]', title: "Jurusan & Keahlian", content: "Tambah / ubah jurusan kompetensi keahlian sekolah.", placement: "right" },
  { target: '[data-tour="nav-/admin/berita"]', title: "Berita & Pengumuman", content: "Publikasikan berita, artikel, dan pengumuman sekolah.", placement: "right" },
  { target: '[data-tour="nav-/admin/prestasi"]', title: "Prestasi", content: "Catat prestasi siswa dan sekolah lengkap dengan foto & detail.", placement: "right" },
  { target: '[data-tour="nav-/admin/kerjasama"]', title: "Kerjasama Industri", content: "Daftar mitra MOU, PKL, dan kerjasama industri.", placement: "right" },
  { target: '[data-tour="nav-/admin/halaman"]', title: "Halaman Statis", content: "Edit konten halaman seperti Visi, Misi, Sejarah, Struktur Organisasi.", placement: "right" },
  { target: '[data-tour="nav-/admin/galeri"]', title: "Galeri Foto", content: "Kelola album foto kegiatan sekolah dengan multi-upload.", placement: "right" },
  { target: '[data-tour="nav-/admin/sekolah"]', title: "Data Sekolah", content: "Identitas sekolah: NPSN, alamat, kontak, sosial media, jam operasional.", placement: "right" },
  { target: '[data-tour="nav-/admin/menu"]', title: "Menu Website", content: "Atur navigasi utama (navbar) website publik.", placement: "right" },
  { target: '[data-tour="nav-/admin/sections"]', title: "Section Homepage", content: "Susun urutan & aktif/nonaktif section di halaman beranda.", placement: "right" },
  { target: '[data-tour="nav-/admin/pesan"]', title: "Pesan Masuk", content: "Pesan dari form kontak. Badge merah menunjukkan pesan belum dibaca.", placement: "right" },
  { target: '[data-tour="nav-/admin/chatbot"]', title: "Chatbot AI – Arina", content: "Atur tampilan, knowledge base, kategori, sumber URL, dan crawl konten untuk Arina.", placement: "right" },
  { target: '[data-tour="nav-/admin/users"]', title: "Kelola Pengguna", content: "Tambah / nonaktifkan akun admin lain.", placement: "right" },
  {
    target: '[data-tour="tour-button"]',
    title: "Selesai 🎉",
    content: "Tour bisa dibuka kembali kapan saja lewat tombol Bantuan di sidebar. Selamat berkarya!",
    placement: "right",
  },
];

export default function AdminTour({ run, onClose }: { run: boolean; onClose: () => void }) {
  const handleCallback = (data: EventData) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem(STORAGE_KEY, "1");
      onClose();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      callback={handleCallback}
      locale={{ back: "Kembali", close: "Tutup", last: "Selesai", next: "Lanjut", skip: "Lewati", open: "Buka tour" }}
      styles={{
        options: {
          primaryColor: "hsl(var(--primary))",
          textColor: "hsl(var(--foreground))",
          backgroundColor: "hsl(var(--background))",
          arrowColor: "hsl(var(--background))",
          overlayColor: "rgba(0,0,0,0.55)",
          zIndex: 10000,
        },
        tooltip: { borderRadius: 12, fontFamily: "Inter, sans-serif" },
        tooltipTitle: { fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 16, fontWeight: 700 },
        buttonNext: { borderRadius: 8, fontWeight: 600 },
        buttonBack: { color: "hsl(var(--muted-foreground))" },
      }}
    />
  );
}

export function shouldAutoStartTour() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== "1";
}

export function resetTour() {
  localStorage.removeItem(STORAGE_KEY);
}