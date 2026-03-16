import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Achievement = Database["public"]["Tables"]["achievements"]["Row"];

interface Props {
  achievements: Achievement[];
}

export default function AchievementsSection({ achievements }: Props) {
  if (!achievements.length) return null;

  return (
    <section className="py-16 bg-secondary">
      <div className="container">
        <div className="text-center mb-10">
          <span className="inline-block rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent-foreground mb-3">
            <Trophy className="inline h-3 w-3 mr-1" />
            Prestasi
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Prestasi Siswa</h2>
          <p className="text-muted-foreground mt-2">Pencapaian membanggakan dari siswa-siswi kami</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.slice(0, 6).map((item, i) => (
            <Link to={`/prestasi/${item.id}`} key={item.id}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                className="group relative overflow-hidden rounded-xl bg-card p-1 shadow-card"
              >
                {item.image_url && (
                  <div className="aspect-video rounded-lg overflow-hidden mb-3">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="rounded-lg p-4">
                  {item.category && (
                    <span className="text-xs font-bold uppercase tracking-widest text-accent">
                      {item.category}
                    </span>
                  )}
                  <h3 className="mt-1 text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  )}
                  {item.achievement_date && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      {new Date(item.achievement_date).toLocaleDateString("id-ID", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
