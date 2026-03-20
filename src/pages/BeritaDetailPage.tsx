import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Calendar, ArrowLeft } from "lucide-react";
import SocialShareButtons from "@/components/public/SocialShareButtons";

export default function BeritaDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: item, isLoading } = useQuery({
    queryKey: ["news-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id!)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-3xl py-8">
        <Link to="/berita" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Berita
        </Link>

        {isLoading ? (
          <p className="text-muted-foreground">Memuat...</p>
        ) : !item ? (
          <div className="text-center py-20">
            <h2 className="text-xl font-bold text-foreground mb-2">Berita tidak ditemukan</h2>
            <p className="text-muted-foreground">Berita yang Anda cari mungkin sudah dihapus atau belum dipublikasikan.</p>
          </div>
        ) : (
          <article>
            {item.image_url && (
              <div className="aspect-video rounded-xl overflow-hidden mb-6">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary capitalize">
                {item.category}
              </span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {item.published_at &&
                  new Date(item.published_at).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
              {item.title}
            </h1>

            {item.excerpt && (
              <p className="text-lg text-muted-foreground mb-6 border-l-4 border-primary pl-4 italic">
                {item.excerpt}
              </p>
            )}

            <div className="prose prose-green max-w-none text-foreground leading-relaxed whitespace-pre-line">
              {item.content}
            </div>

            <div className="mt-8 pt-6 border-t space-y-4">
              <SocialShareButtons title={item.title} />
              <Link to="/berita" className="text-sm text-primary hover:underline">
                ← Berita lainnya
              </Link>
            </div>
          </article>
        )}
      </div>
      <Footer />
    </div>
  );
}
