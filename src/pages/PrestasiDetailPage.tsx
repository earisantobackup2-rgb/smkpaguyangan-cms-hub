import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Calendar, ArrowLeft, Trophy } from "lucide-react";
import SocialShareButtons from "@/components/public/SocialShareButtons";

export default function PrestasiDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: item, isLoading } = useQuery({
    queryKey: ["achievement-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
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
        <Link to="/prestasi" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Prestasi
        </Link>

        {isLoading ? (
          <p className="text-muted-foreground">Memuat...</p>
        ) : !item ? (
          <div className="text-center py-20">
            <h2 className="text-xl font-bold text-foreground mb-2">Prestasi tidak ditemukan</h2>
            <p className="text-muted-foreground">Prestasi yang Anda cari mungkin sudah dihapus atau belum dipublikasikan.</p>
          </div>
        ) : (
          <article>
            {item.image_url && (
              <div className="aspect-video rounded-xl overflow-hidden mb-6">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {item.category && (
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent capitalize">
                  <Trophy className="inline h-3 w-3 mr-1" />
                  {item.category}
                </span>
              )}
              {item.achievement_date && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(item.achievement_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6 leading-tight">
              {item.title}
            </h1>

            {item.description && (
              <div className="prose prose-green max-w-none text-foreground leading-relaxed whitespace-pre-line">
                {item.description}
              </div>
            )}

            <div className="mt-8 pt-6 border-t space-y-4">
              <SocialShareButtons title={item.title} />
              <Link to="/prestasi" className="text-sm text-primary hover:underline">
                ← Prestasi lainnya
              </Link>
            </div>
          </article>
        )}
      </div>
      <Footer />
    </div>
  );
}
