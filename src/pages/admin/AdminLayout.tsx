import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper, Trophy, Handshake, FileText, School, LogOut, LayoutDashboard, GraduationCap, Camera, MessageSquare, MenuIcon, ImageIcon, LayoutGrid, X, Bot, Users, HelpCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import AdminTour, { shouldAutoStartTour, resetTour } from "@/components/admin/AdminTour";

const sidebarLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Slide Hero", href: "/admin/slides", icon: ImageIcon },
  { label: "Jurusan & Keahlian", href: "/admin/jurusan", icon: GraduationCap },
  { label: "Berita & Pengumuman", href: "/admin/berita", icon: Newspaper },
  { label: "Prestasi", href: "/admin/prestasi", icon: Trophy },
  { label: "Kerjasama Industri", href: "/admin/kerjasama", icon: Handshake },
  { label: "Halaman (Visi/Misi)", href: "/admin/halaman", icon: FileText },
  { label: "Galeri Foto", href: "/admin/galeri", icon: Camera },
  { label: "Data Sekolah", href: "/admin/sekolah", icon: School },
  { label: "Menu Website", href: "/admin/menu", icon: MenuIcon },
  { label: "Section Homepage", href: "/admin/sections", icon: LayoutGrid },
  { label: "Pesan Masuk", href: "/admin/pesan", icon: MessageSquare, badge: true },
  { label: "Chatbot AI", href: "/admin/chatbot", icon: Bot },
  { label: "Kelola Pengguna", href: "/admin/users", icon: Users },
];

function SidebarContent({ location, unreadCount, onNavigate, onStartTour }: { location: ReturnType<typeof useLocation>; unreadCount: number; onNavigate?: () => void; onStartTour: () => void }) {
  return (
    <div data-tour="sidebar" className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Link to="/admin" className="flex items-center gap-2" onClick={onNavigate}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-heading text-sm font-bold text-primary-foreground">M</div>
          <div>
            <p className="text-sm font-bold font-heading">CMS Admin</p>
            <p className="text-xs text-muted-foreground">Paguyangan</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sidebarLinks.map(({ label, href, icon: Icon, badge }) => (
          <Link
            key={href}
            to={href}
            data-tour={`nav-${href}`}
            onClick={onNavigate}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
              location.pathname === href
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="flex-1">{label}</span>
            {badge && unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground px-1">
                {unreadCount}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t space-y-1">
        <button
          data-tour="tour-button"
          onClick={() => { onStartTour(); onNavigate?.(); }}
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-primary rounded-md w-full transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          Bantuan / Tour
        </button>
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive rounded-md w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tourRun, setTourRun] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-messages-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate("/admin/login");
      setLoading(false);
      if (data.session && shouldAutoStartTour() && !isMobile) {
        setTimeout(() => setTourRun(true), 800);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/admin/login");
    });
    return () => subscription.unsubscribe();
  }, [navigate, isMobile]);

  const startTour = () => {
    resetTour();
    setTourRun(false);
    setTimeout(() => setTourRun(true), 100);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Memuat...</div>;

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 bg-secondary border-r flex flex-col shrink-0 sticky top-0 h-screen">
          <SidebarContent location={location} unreadCount={unreadCount} onStartTour={startTour} />
        </aside>
      )}

      {/* Mobile Sidebar Sheet */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-72 flex flex-col">
            <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
            <SidebarContent location={location} unreadCount={unreadCount} onNavigate={() => setSidebarOpen(false)} onStartTour={startTour} />
          </SheetContent>
        </Sheet>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        {isMobile && (
          <header className="sticky top-0 z-40 bg-background border-b px-4 py-3 flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-md hover:bg-muted">
              <MenuIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary font-heading text-xs font-bold text-primary-foreground">M</div>
              <span className="text-sm font-bold font-heading">CMS Admin</span>
            </div>
            {unreadCount > 0 && (
              <Link to="/admin/pesan" className="ml-auto relative">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground px-0.5">
                  {unreadCount}
                </span>
              </Link>
            )}
          </header>
        )}

        <main className="flex-1 bg-background p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
      <AdminTour run={tourRun} onClose={() => setTourRun(false)} />
    </div>
  );
}
