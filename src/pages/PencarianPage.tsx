import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Search, Calendar, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export default function PencarianPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [searchTerm, setSearchTerm] = useState(initialQuery);

  const { data: news = [], isLoading: loadingNews } = useQuery({
    queryKey: ["search-news", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("is_published", true)
        .or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`)
        .order("published_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: searchTerm.trim().length > 0,
  });

  const { data: achievements = [], isLoading: loadingAchievements } = useQuery({
    queryKey: ["search-achievements", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .eq("is_published", true)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order("achievement_date", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: searchTerm.trim().length > 0,
  });

  const isLoading = loadingNews || loadingAchievements;
  const totalResults = news.length + achievements.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
    setSearchParams(query ? { q: query } : {});
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Pencarian</h1>

        <form onSubmit={handleSubmit} className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari berita atau prestasi..."
            className="pl-10 h-12 text-base"
            autoFocus
          />
        </form>

        {isLoading && <p className="text-muted-foreground">Mencari...</p>}

        {!isLoading && searchTerm && (
          <p className="text-sm text-muted-foreground mb-6">
            Ditemukan {totalResults} hasil untuk "<span className="font-medium text-foreground">{searchTerm}</span>"
          </p>
        )}

        {!isLoading && news.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Berita
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {news.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/berita/${item.id}`} className="group flex gap-3 rounded-lg bg-card p-3 shadow-card hover:shadow-elevated transition-shadow">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.title} className="w-20 h-20 rounded-md object-cover shrink-0" />
                    )}
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-primary capitalize">{item.category}</span>
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">{item.title}</h3>
                      {item.excerpt && <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{item.excerpt}</p>}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {!isLoading && achievements.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" /> Prestasi
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {achievements.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/prestasi/${item.id}`} className="group flex gap-3 rounded-lg bg-card p-3 shadow-card hover:shadow-elevated transition-shadow">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.title} className="w-20 h-20 rounded-md object-cover shrink-0" />
                    )}
                    <div className="min-w-0">
                      {item.category && <span className="text-xs font-bold uppercase tracking-widest text-accent">{item.category}</span>}
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">{item.title}</h3>
                      {item.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{item.description}</p>}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {!isLoading && searchTerm && totalResults === 0 && (
          <div className="text-center py-16">
            <Search className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-1">Tidak ada hasil</h2>
            <p className="text-muted-foreground text-sm">Coba gunakan kata kunci yang berbeda.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
