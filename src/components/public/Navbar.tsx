import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X, Search } from "lucide-react";
import logoSmk from "@/assets/logo-smk.png";

const defaultLinks = [
  { label: "Beranda", url: "/" },
  { label: "Jurusan", url: "/jurusan" },
  { label: "Berita", url: "/berita" },
  { label: "Prestasi", url: "/prestasi" },
  { label: "Galeri", url: "/galeri" },
  { label: "Profil", url: "/profil" },
  { label: "Kontak", url: "/kontak" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const { data: menuItems } = useQuery({
    queryKey: ["public-menu-items"],
    queryFn: async () => {
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_visible", true)
        .is("parent_id", null)
        .order("sort_order", { ascending: true });
      return data && data.length > 0 ? data : null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const navLinks = menuItems || defaultLinks;

  const isExternal = (url: string) => url.startsWith("http");

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoSmk} alt="Logo SMK Muhammadiyah 1 Paguyangan" className="h-9 w-9 object-contain" />
          <div className="hidden sm:block">
            <p className="text-sm font-bold font-heading leading-none">SMK Muhammadiyah 1</p>
            <p className="text-xs text-muted-foreground">Paguyangan</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link: any) =>
            isExternal(link.url) ? (
              <a
                key={link.url}
                href={link.url}
                target={link.open_in_new_tab ? "_blank" : undefined}
                rel={link.open_in_new_tab ? "noopener noreferrer" : undefined}
                className="px-3 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.url}
                to={link.url}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === link.url
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-1">
          <Link to="/pencarian" className="p-2 text-muted-foreground hover:text-foreground" aria-label="Pencarian">
            <Search className="h-5 w-5" />
          </Link>
          <button
            className="md:hidden p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col gap-1">
            {navLinks.map((link: any) =>
              isExternal(link.url) ? (
                <a
                  key={link.url}
                  href={link.url}
                  target={link.open_in_new_tab ? "_blank" : undefined}
                  rel={link.open_in_new_tab ? "noopener noreferrer" : undefined}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 text-sm font-medium rounded-md text-muted-foreground"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.url}
                  to={link.url}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    location.pathname === link.url
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
