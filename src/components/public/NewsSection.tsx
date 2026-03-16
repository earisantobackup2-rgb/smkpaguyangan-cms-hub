import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type News = Database["public"]["Tables"]["news"]["Row"];

interface Props {
  news: News[];
}

export default function NewsSection({ news }: Props) {
  if (!news.length) return null;

  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-10">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
            Terbaru
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Berita & Pengumuman</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto text-pretty">
            Informasi terkini seputar kegiatan dan prestasi SMK Muhammadiyah 1 Paguyangan
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.slice(0, 6).map((item, i) => (
            <Link to={`/berita/${item.id}`} key={item.id}>
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-xl bg-card shadow-card overflow-hidden"
            >
              {item.image_url && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                    {item.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {item.published_at
                      ? new Date(item.published_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : ""}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h3>
                {item.excerpt && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
                )}
              </div>
            </motion.article>
          ))}
        </div>

        {news.length > 6 && (
          <div className="mt-8 text-center">
            <Link to="/berita" className="text-sm font-medium text-primary hover:underline">
              Lihat semua berita →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
