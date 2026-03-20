import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "./hooks/useTheme";
import Index from "./pages/Index.tsx";
import BeritaPage from "./pages/BeritaPage.tsx";
import PrestasiPage from "./pages/PrestasiPage.tsx";
import ProfilPage from "./pages/ProfilPage.tsx";
import KontakPage from "./pages/KontakPage.tsx";
import BeritaDetailPage from "./pages/BeritaDetailPage.tsx";
import PrestasiDetailPage from "./pages/PrestasiDetailPage.tsx";
import JurusanPage from "./pages/JurusanPage.tsx";
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminBerita from "./pages/admin/AdminBerita.tsx";
import AdminPrestasi from "./pages/admin/AdminPrestasi.tsx";
import AdminKerjasama from "./pages/admin/AdminKerjasama.tsx";
import AdminHalaman from "./pages/admin/AdminHalaman.tsx";
import AdminSekolah from "./pages/admin/AdminSekolah.tsx";
import AdminJurusan from "./pages/admin/AdminJurusan.tsx";
import AdminGaleri from "./pages/admin/AdminGaleri.tsx";
import AdminPesan from "./pages/admin/AdminPesan.tsx";
import AdminMenu from "./pages/admin/AdminMenu.tsx";
import AdminSlides from "./pages/admin/AdminSlides.tsx";
import GaleriPage from "./pages/GaleriPage.tsx";
import PencarianPage from "./pages/PencarianPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function ThemeLoader() {
  useTheme();
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeLoader />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/jurusan" element={<JurusanPage />} />
          <Route path="/berita" element={<BeritaPage />} />
          <Route path="/berita/:id" element={<BeritaDetailPage />} />
          <Route path="/prestasi" element={<PrestasiPage />} />
          <Route path="/prestasi/:id" element={<PrestasiDetailPage />} />
          <Route path="/profil" element={<ProfilPage />} />
          <Route path="/kontak" element={<KontakPage />} />
          <Route path="/galeri" element={<GaleriPage />} />
          <Route path="/pencarian" element={<PencarianPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="jurusan" element={<AdminJurusan />} />
            <Route path="berita" element={<AdminBerita />} />
            <Route path="prestasi" element={<AdminPrestasi />} />
            <Route path="kerjasama" element={<AdminKerjasama />} />
            <Route path="halaman" element={<AdminHalaman />} />
            <Route path="sekolah" element={<AdminSekolah />} />
            <Route path="galeri" element={<AdminGaleri />} />
            <Route path="pesan" element={<AdminPesan />} />
            <Route path="menu" element={<AdminMenu />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
