import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Calendar, Trophy, Newspaper, Megaphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getPublishedNews, getPublishedAchievements } from "@/lib/supabase-helpers";
import type { Database } from "@/integrations/supabase/types";

type News = Database["public"]["Tables"]["news"]["Row"];
type Achievement = Database["public"]["Tables"]["achievements"]["Row"];

const PER_PAGE = 10;

function usePagination<T>(items: T[], perPage: number) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const paginated = items.slice((page - 1) * perPage, page * perPage);
  return { page, setPage, totalPages, paginated };
}

function PaginationControls({
  page,
  totalPages,
  setPage,
}: {
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => setPage(Math.max(1, page - 1))}
            className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
        {pages.map((p) => (
          <PaginationItem key={p}>
            <PaginationLink isActive={p === page} onClick={() => setPage(p)} className="cursor-pointer">
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function NewsCard({ item, i }: { item: News; i: number }) {
  return (
    <Link to={`/berita/${item.id}`}>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.05 }}
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
          {item.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>}
        </div>
      </motion.article>
    </Link>
  );
}

function AchievementCard({ item }: { item: Achievement }) {
  return (
    <Link to={`/prestasi/${item.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group relative overflow-hidden rounded-xl bg-card p-1 shadow-card"
      >
        {item.image_url && (
          <div className="aspect-video rounded-lg overflow-hidden mb-3">
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="rounded-lg p-4">
          {item.category && (
            <span className="text-xs font-bold uppercase tracking-widest text-accent">{item.category}</span>
          )}
          <h3 className="mt-1 text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          {item.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.description}</p>}
          {item.achievement_date && (
            <p className="mt-3 text-xs text-muted-foreground">
              {new Date(item.achievement_date).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

export default function HomeSearchSection() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("berita");

  const { data: allNews = [] } = useQuery({
    queryKey: ["news-home-all"],
    queryFn: () => getPublishedNews(100),
  });

  const { data: allAchievements = [] } = useQuery({
    queryKey: ["achievements-home-all"],
    queryFn: () => getPublishedAchievements(100),
  });

  const q = search.toLowerCase().trim();

  const berita = useMemo(
    () => allNews.filter((n) => n.category === "berita" && (!q || n.title.toLowerCase().includes(q) || n.excerpt?.toLowerCase().includes(q))),
    [allNews, q]
  );
  const pengumuman = useMemo(
    () => allNews.filter((n) => n.category === "pengumuman" && (!q || n.title.toLowerCase().includes(q) || n.excerpt?.toLowerCase().includes(q))),
    [allNews, q]
  );
  const prestasi = useMemo(
    () => allAchievements.filter((a) => !q || a.title.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q)),
    [allAchievements, q]
  );

  const beritaPag = usePagination(berita, PER_PAGE);
  const pengumumanPag = usePagination(pengumuman, PER_PAGE);
  const prestasiPag = usePagination(prestasi, PER_PAGE);

  // Reset pages when search changes
  const handleSearch = (val: string) => {
    setSearch(val);
    beritaPag.setPage(1);
    pengumumanPag.setPage(1);
    prestasiPag.setPage(1);
  };

  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
            🔍 Cari Informasi
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Berita, Pengumuman & Prestasi</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Temukan informasi terkini seputar kegiatan dan prestasi sekolah
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari berita, pengumuman, atau prestasi..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="berita" className="gap-1.5">
              <Newspaper className="h-4 w-4" />
              <span className="hidden sm:inline">Berita</span>
              <span className="text-xs text-muted-foreground">({berita.length})</span>
            </TabsTrigger>
            <TabsTrigger value="pengumuman" className="gap-1.5">
              <Megaphone className="h-4 w-4" />
              <span className="hidden sm:inline">Pengumuman</span>
              <span className="text-xs text-muted-foreground">({pengumuman.length})</span>
            </TabsTrigger>
            <TabsTrigger value="prestasi" className="gap-1.5">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Prestasi</span>
              <span className="text-xs text-muted-foreground">({prestasi.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Berita Tab */}
          <TabsContent value="berita">
            {beritaPag.paginated.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Tidak ada berita ditemukan.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {beritaPag.paginated.map((item, i) => (
                  <NewsCard key={item.id} item={item} i={i} />
                ))}
              </div>
            )}
            <PaginationControls page={beritaPag.page} totalPages={beritaPag.totalPages} setPage={beritaPag.setPage} />
          </TabsContent>

          {/* Pengumuman Tab */}
          <TabsContent value="pengumuman">
            {pengumumanPag.paginated.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Tidak ada pengumuman ditemukan.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pengumumanPag.paginated.map((item, i) => (
                  <NewsCard key={item.id} item={item} i={i} />
                ))}
              </div>
            )}
            <PaginationControls page={pengumumanPag.page} totalPages={pengumumanPag.totalPages} setPage={pengumumanPag.setPage} />
          </TabsContent>

          {/* Prestasi Tab */}
          <TabsContent value="prestasi">
            {prestasiPag.paginated.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Tidak ada prestasi ditemukan.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {prestasiPag.paginated.map((item) => (
                  <AchievementCard key={item.id} item={item} />
                ))}
              </div>
            )}
            <PaginationControls page={prestasiPag.page} totalPages={prestasiPag.totalPages} setPage={prestasiPag.setPage} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
