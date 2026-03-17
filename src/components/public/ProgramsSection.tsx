import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, Cpu, Wrench, Code, Film, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const programs = [
  { name: "Teknik Kendaraan Ringan", icon: Car, desc: "Kompetensi perawatan & perbaikan kendaraan ringan" },
  { name: "Teknik Ototronik", icon: Cpu, desc: "Keahlian sistem elektronik otomotif modern" },
  { name: "Teknik Sepeda Motor", icon: Wrench, desc: "Spesialisasi servis & perbaikan sepeda motor" },
  { name: "Rekayasa Perangkat Lunak", icon: Code, desc: "Pengembangan aplikasi & pemrograman profesional" },
  { name: "Produksi Film", icon: Film, desc: "Produksi konten kreatif & sinematografi" },
];

export default function ProgramsSection() {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-10">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
            Program Keahlian
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Konsentrasi Keahlian
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            5 konsentrasi keahlian yang siap mencetak lulusan kompeten dan siap kerja
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {programs.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to="/jurusan"
                className="group block rounded-xl bg-card shadow-card p-5 text-center hover:shadow-elevated transition-shadow"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <p.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
                  {p.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {p.desc}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link to="/jurusan">
              Lihat Detail Jurusan <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
