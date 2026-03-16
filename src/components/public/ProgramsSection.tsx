import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProgramsSection() {
  const { data: programs = [] } = useQuery({
    queryKey: ["programs-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("id, name, slug, description, image_url")
        .eq("is_published", true)
        .order("sort_order")
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  if (programs.length === 0) return null;

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-10">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
            Program Keahlian
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Jurusan Unggulan
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            Pilihan konsentrasi keahlian yang siap mencetak lulusan kompeten dan siap kerja
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {programs.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to="/jurusan"
                className="group block rounded-xl bg-card shadow-card overflow-hidden hover:shadow-elevated transition-shadow"
              >
                {p.image_url ? (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-primary/5 flex items-center justify-center">
                    <GraduationCap className="h-10 w-10 text-primary/30" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
                    {p.name}
                  </h3>
                  {p.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {p.description}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link to="/jurusan">
              Lihat Semua Jurusan <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
