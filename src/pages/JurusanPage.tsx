import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { motion } from "framer-motion";
import { GraduationCap, Briefcase, BookOpen } from "lucide-react";

export default function JurusanPage() {
  const { data: programs = [], isLoading } = useQuery({
    queryKey: ["programs-published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("is_published", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary/5 py-16">
        <div className="container text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
            Program Keahlian
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Jurusan & Kompetensi Keahlian
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Temukan program keahlian yang sesuai dengan minat dan bakat kamu di SMK Muhammadiyah 1 Paguyangan
          </p>
        </div>
      </section>

      <section className="container py-12">
        {isLoading ? (
          <p className="text-center text-muted-foreground">Memuat...</p>
        ) : programs.length === 0 ? (
          <p className="text-center text-muted-foreground">Belum ada data jurusan.</p>
        ) : (
          <div className="space-y-12">
            {programs.map((program, i) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col ${i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} gap-6 items-start bg-card rounded-2xl shadow-card overflow-hidden`}
              >
                {program.image_url ? (
                  <div className="w-full md:w-2/5 aspect-video md:aspect-auto md:min-h-[300px] overflow-hidden shrink-0">
                    <img
                      src={program.image_url}
                      alt={program.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full md:w-2/5 aspect-video md:aspect-auto md:min-h-[300px] bg-primary/5 flex items-center justify-center shrink-0">
                    <GraduationCap className="h-16 w-16 text-primary/30" />
                  </div>
                )}

                <div className="flex-1 p-6 md:p-8">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                    {program.name}
                  </h2>

                  {program.description && (
                    <p className="text-muted-foreground leading-relaxed mb-5">
                      {program.description}
                    </p>
                  )}

                  {program.curriculum && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-foreground text-sm">Kurikulum</h3>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-line pl-6">
                        {program.curriculum}
                      </p>
                    </div>
                  )}

                  {program.career_prospects && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-foreground text-sm">Prospek Karir</h3>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-line pl-6">
                        {program.career_prospects}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
