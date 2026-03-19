import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper, Trophy, Handshake, FileText, School, LogOut, LayoutDashboard, GraduationCap, Camera, MessageSquare } from "lucide-react";

const sidebarLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Jurusan & Keahlian", href: "/admin/jurusan", icon: GraduationCap },
  { label: "Berita & Pengumuman", href: "/admin/berita", icon: Newspaper },
  { label: "Prestasi", href: "/admin/prestasi", icon: Trophy },
  { label: "Kerjasama Industri", href: "/admin/kerjasama", icon: Handshake },
  { label: "Halaman (Visi/Misi)", href: "/admin/halaman", icon: FileText },
  { label: "Galeri Foto", href: "/admin/galeri", icon: Camera },
  { label: "Data Sekolah", href: "/admin/sekolah", icon: School },
];

export default function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate("/admin/login");
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/admin/login");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Memuat...</div>;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-secondary border-r flex flex-col shrink-0">
        <div className="p-4 border-b">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-heading text-sm font-bold text-primary-foreground">M</div>
            <div>
              <p className="text-sm font-bold font-heading">CMS Admin</p>
              <p className="text-xs text-muted-foreground">Paguyangan</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarLinks.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                location.pathname === href
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t">
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive rounded-md w-full transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-background p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
