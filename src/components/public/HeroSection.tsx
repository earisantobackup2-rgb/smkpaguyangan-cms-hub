import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-school.jpg";

interface HeroProps {
  schoolInfo: Record<string, string>;
}

export default function HeroSection({ schoolInfo }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-secondary">
      <div className="container py-12 md:py-20">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
              Akreditasi {schoolInfo.accreditation || "A"} • {schoolInfo.total_programs || "5"} Konsentrasi Keahlian
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-foreground mb-4">
              Keahlian Masa Depan,{" "}
              <span className="text-primary">Akhlak Mulia</span>
            </h1>
            <p className="text-muted-foreground text-pretty max-w-md mb-6">
              SMK Muhammadiyah 1 Paguyangan mencetak generasi unggul yang kompeten, berkarakter, dan siap bersaing di era global.
            </p>
            <div className="flex gap-3 mb-8">
              <Button asChild>
                <Link to="/profil">Eksplorasi Jurusan</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/profil">Tentang Kami</Link>
              </Button>
            </div>
            <div className="flex gap-8">
              {[
                { value: schoolInfo.total_programs || "5", label: "Konsentrasi Keahlian" },
                { value: schoolInfo.total_partners || "20+", label: "Mitra Industri" },
                { value: schoolInfo.total_alumni || "500+", label: "Alumni Sukses" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-primary tabular-nums">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-xl shadow-elevated">
              <img
                src={heroImage}
                alt="Gedung SMK Muhammadiyah 1 Paguyangan"
                className="w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute bottom-4 left-4 rounded-lg bg-foreground/80 backdrop-blur-sm px-4 py-2">
                <p className="text-sm font-bold text-background">Sejak {schoolInfo.established_year || "1998"}</p>
                <p className="text-xs text-background/70">Mencetak Calon Tenaga Kerja Handal</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
