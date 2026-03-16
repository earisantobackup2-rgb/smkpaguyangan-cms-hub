import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Calendar } from "lucide-react";
import { getPublishedNews } from "@/lib/supabase-helpers";

export default function BeritaPage() {
  const { data: news = [], isLoading } = useQuery({
    queryKey: ["news-all"],
    queryFn: () => getPublishedNews(50),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Berita & Pengumuman</h1>
        {isLoading ? (
          <p className="text-muted-foreground">Memuat...</p>
        ) : news.length === 0 ? (
          <p className="text-muted-foreground">Belum ada berita.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <article key={item.id} className="group rounded-xl bg-card shadow-card overflow-hidden">
                {item.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">{item.category}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {item.published_at && new Date(item.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                  {item.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{item.excerpt}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
