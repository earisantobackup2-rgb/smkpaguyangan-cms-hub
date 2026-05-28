import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X, Search, ChevronDown } from "lucide-react";
import logoSmk from "@/assets/logo-smk.png";

const defaultLinks: any[] = [
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
  const [openSub, setOpenSub] = useState<string | null>(null);
  const location = useLocation();

  const { data: menuItems } = useQuery({
    queryKey: ["public-menu-items"],
    queryFn: async () => {
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });
      if (!data || data.length === 0) return null;
      const parents = data.filter((m: any) => !m.parent_id);
      return parents.map((p: any) => ({
        ...p,
        children: data.filter((c: any) => c.parent_id === p.id),
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const navLinks: any[] = menuItems || defaultLinks;

  const isExternal = (url: string) => url.startsWith("http");

  const renderLink = (link: any, mobile = false) => {
    const baseCls = mobile
      ? "px-3 py-2 text-sm font-medium rounded-md text-muted-foreground block"
      : `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          location.pathname === link.url
            ? "text-primary bg-primary/5"
            : "text-muted-foreground hover:text-foreground"
        }`;
    return isExternal(link.url) ? (
      <a href={link.url} target={link.open_in_new_tab ? "_blank" : undefined} rel={link.open_in_new_tab ? "noopener noreferrer" : undefined} className={baseCls} onClick={() => mobile && setOpen(false)}>
        {link.label}
      </a>
    ) : (
      <Link to={link.url} onClick={() => mobile && setOpen(false)} className={baseCls}>
        {link.label}
      </Link>
    );
  };

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
          {navLinks.map((link: any) => {
            const children = link.children || [];
            if (children.length === 0) return <span key={link.id || link.url}>{renderLink(link)}</span>;
            return (
              <div key={link.id || link.url} className="relative group">
                <button className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname.startsWith(link.url) && link.url !== "/" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  {link.label}
                  <ChevronDown className="h-3 w-3" />
                </button>
                <div className="absolute left-0 top-full pt-1 hidden group-hover:block min-w-[200px]">
                  <div className="rounded-md border bg-popover shadow-lg p-1">
                    {renderLink(link)}
                    <div className="h-px bg-border my-1" />
                    {children.map((c: any) => (
                      <span key={c.id} className="block">{renderLink(c)}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
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
            {navLinks.map((link: any) => {
              const children = link.children || [];
              const id = link.id || link.url;
              if (children.length === 0) return <span key={id}>{renderLink(link, true)}</span>;
              const isOpen = openSub === id;
              return (
                <div key={id}>
                  <button
                    onClick={() => setOpenSub(isOpen ? null : id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-muted-foreground"
                  >
                    {link.label}
                    <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="pl-4 border-l ml-3 space-y-1">
                      {renderLink(link, true)}
                      {children.map((c: any) => (
                        <span key={c.id}>{renderLink(c, true)}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
