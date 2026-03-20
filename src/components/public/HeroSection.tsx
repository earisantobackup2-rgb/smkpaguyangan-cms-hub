import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Fallback static slides
import slideGedung from "@/assets/slide-gedung.jpg";
import slideOtotronik from "@/assets/slide-ototronik.jpg";
import slideTsm from "@/assets/slide-tsm.jpg";
import slideRpl from "@/assets/slide-rpl.jpg";
import slideFilm from "@/assets/slide-film.jpg";

const fallbackSlides = [
  { src: slideGedung, alt: "Gedung SMK Muhammadiyah 1 Paguyangan", caption: "Kampus Modern & Nyaman" },
  { src: slideOtotronik, alt: "Praktik Teknik Ototronik", caption: "Teknik Ototronik" },
  { src: slideTsm, alt: "Praktik Teknik Sepeda Motor", caption: "Teknik Sepeda Motor" },
  { src: slideRpl, alt: "Praktik Rekayasa Perangkat Lunak", caption: "Rekayasa Perangkat Lunak" },
  { src: slideFilm, alt: "Praktik Produksi Film", caption: "Produksi Film" },
];

interface HeroProps {
  schoolInfo: Record<string, string>;
}

export default function HeroSection({ schoolInfo }: HeroProps) {
  const [current, setCurrent] = useState(0);

  const { data: dbSlides = [] } = useQuery({
    queryKey: ["hero-slides-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: slideInterval = 4000 } = useQuery({
    queryKey: ["slide-interval-public"],
    queryFn: async () => {
      const { data } = await supabase.from("school_info").select("value").eq("key", "slide_interval").maybeSingle();
      return data?.value ? Number(data.value) : 4000;
    },
  });

  const slides = dbSlides.length > 0
    ? dbSlides.map((s: any) => ({ src: s.image_url, alt: s.alt_text || s.caption || "", caption: s.caption || "" }))
    : fallbackSlides;

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, slideInterval);
    return () => clearInterval(timer);
  }, [next, slideInterval, slides.length]);

  // Reset current if slides change
  useEffect(() => {
    setCurrent(0);
  }, [dbSlides.length]);

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
                <Link to="/jurusan">Eksplorasi Jurusan</Link>
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

          {/* Slideshow */}
          <div className="relative">
            <div className="overflow-hidden rounded-xl shadow-elevated aspect-[4/3]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={current}
                  src={slides[current].src}
                  alt={slides[current].alt}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover absolute inset-0"
                />
              </AnimatePresence>

              {slides[current].caption && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-foreground/70 to-transparent p-4">
                  <p className="text-sm font-bold text-background">{slides[current].caption}</p>
                </div>
              )}

              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/60 backdrop-blur-sm p-1.5 hover:bg-background/80 transition-colors"
                aria-label="Slide sebelumnya"
              >
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/60 backdrop-blur-sm p-1.5 hover:bg-background/80 transition-colors"
                aria-label="Slide berikutnya"
              >
                <ChevronRight className="h-4 w-4 text-foreground" />
              </button>
            </div>

            {slides.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === current ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
