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
import AdminSections from "./pages/admin/AdminSections.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminChatbot from "./pages/admin/AdminChatbot.tsx";
import GaleriPage from "./pages/GaleriPage.tsx";
import PencarianPage from "./pages/PencarianPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import ChatbotWidget from "./components/public/ChatbotWidget.tsx";
import { useLocation } from "react-router-dom";

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
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

function AppRoutes() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  return (
    <>
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
            <Route path="slides" element={<AdminSlides />} />
            <Route path="sections" element={<AdminSections />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="chatbot" element={<AdminChatbot />} />
          </Route>
          <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdmin && <ChatbotWidget />}
    </>
  );
}

export default App;
