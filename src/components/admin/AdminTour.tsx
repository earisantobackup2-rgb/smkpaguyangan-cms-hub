import { Joyride, STATUS, type EventData, type Step } from "react-joyride";

const STORAGE_KEY = "admin_tour_completed_v1";

const steps: Step[] = [
  {
    target: '[data-tour="sidebar"]',
    title: "Selamat datang di CMS Admin 👋",
    content: "Tour singkat ini akan memandu Anda mengenal setiap menu admin. Tekan Lanjut untuk mulai.",
    placement: "right",
    skipBeacon: true,
  },
  { target: '[data-tour="nav-/admin"]', title: "Dashboard", content: "Ringkasan statistik website: berita, pesan masuk, kunjungan, dll.", placement: "right" },
  { target: '[data-tour="nav-/admin/slides"]', title: "Slide Hero", content: "Kelola slideshow utama di halaman beranda website.", placement: "right" },
  { target: '[data-tour="nav-/admin/jurusan"]', title: "Jurusan & Keahlian", content: "Tambah / ubah jurusan kompetensi keahlian sekolah.", placement: "right" },
  { target: '[data-tour="nav-/admin/berita"]', title: "Berita & Pengumuman", content: "Publikasikan berita, artikel, dan pengumuman sekolah.", placement: "right" },
  { target: '[data-tour="nav-/admin/prestasi"]', title: "Prestasi", content: "Catat prestasi siswa dan sekolah lengkap dengan foto & detail.", placement: "right" },
  { target: '[data-tour="nav-/admin/kerjasama"]', title: "Kerjasama Industri", content: "Daftar mitra MOU, PKL, dan kerjasama industri.", placement: "right" },
  { target: '[data-tour="nav-/admin/halaman"]', title: "Halaman Statis", content: "Edit halaman seperti Visi, Misi, Sejarah, Struktur Organisasi.", placement: "right" },
  { target: '[data-tour="nav-/admin/galeri"]', title: "Galeri Foto", content: "Kelola album foto kegiatan sekolah dengan multi-upload.", placement: "right" },
  { target: '[data-tour="nav-/admin/sekolah"]', title: "Data Sekolah", content: "Identitas sekolah: NPSN, alamat, kontak, sosial media, jam operasional.", placement: "right" },
  { target: '[data-tour="nav-/admin/menu"]', title: "Menu Website", content: "Atur navigasi utama (navbar) website publik.", placement: "right" },
  { target: '[data-tour="nav-/admin/sections"]', title: "Section Homepage", content: "Susun urutan & aktifkan/nonaktifkan section di beranda.", placement: "right" },
  { target: '[data-tour="nav-/admin/pesan"]', title: "Pesan Masuk", content: "Pesan dari form kontak. Badge merah = pesan belum dibaca.", placement: "right" },
  { target: '[data-tour="nav-/admin/chatbot"]', title: "Chatbot AI – Arina", content: "Atur tampilan, knowledge base, kategori, sumber URL & crawl untuk Arina.", placement: "right" },
  { target: '[data-tour="nav-/admin/users"]', title: "Kelola Pengguna", content: "Tambah / nonaktifkan akun admin lain.", placement: "right" },
  {
    target: '[data-tour="tour-button"]',
    title: "Selesai 🎉",
    content: "Tour bisa dibuka kembali kapan saja lewat tombol Bantuan di sidebar. Selamat berkarya!",
    placement: "right",
  },
];

export default function AdminTour({ run, onClose }: { run: boolean; onClose: () => void }) {
  const handleEvent = (data: EventData) => {
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
      onEvent={handleEvent}
      locale={{
        back: "Kembali",
        close: "Tutup",
        last: "Selesai",
        next: "Lanjut",
        skip: "Lewati tour",
        open: "Buka tour",
      }}
      options={{
        primaryColor: "hsl(220 90% 56%)",
        textColor: "hsl(222 47% 11%)",
        backgroundColor: "#ffffff",
        arrowColor: "#ffffff",
        overlayColor: "rgba(0,0,0,0.55)",
        zIndex: 10000,
        showProgress: true,
        skipBeacon: true,
        buttons: ["back", "skip", "primary"],
        closeButtonAction: "skip",
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
