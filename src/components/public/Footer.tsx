import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSchoolInfo } from "@/lib/supabase-helpers";

export default function Footer() {
  const { data: info = {} } = useQuery({ queryKey: ["schoolInfo"], queryFn: getSchoolInfo });

  return (
    <footer className="border-t bg-card py-10">
      <div className="container">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-heading text-sm font-bold text-primary-foreground">
                M
              </div>
              <div>
                <p className="text-sm font-bold font-heading">{info.school_name || "SMK Muhammadiyah 1"}</p>
                <p className="text-xs text-muted-foreground">Paguyangan</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-pretty">
              Mencetak generasi unggul yang kompeten, berkarakter, dan siap bersaing di era global.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Navigasi</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Beranda</Link></li>
              <li><Link to="/berita" className="hover:text-primary transition-colors">Berita</Link></li>
              <li><Link to="/prestasi" className="hover:text-primary transition-colors">Prestasi</Link></li>
              <li><Link to="/profil" className="hover:text-primary transition-colors">Profil</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Kontak</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{info.address || "Jl. Raya Paguyangan, Brebes"}</li>
              {info.phone && <li>{info.phone}</li>}
              {info.email && <li>{info.email}</li>}
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {info.school_name || "SMK Muhammadiyah 1 Paguyangan"}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
