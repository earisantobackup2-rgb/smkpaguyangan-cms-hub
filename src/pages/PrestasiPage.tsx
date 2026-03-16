import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Trophy } from "lucide-react";
import { getPublishedAchievements } from "@/lib/supabase-helpers";

export default function PrestasiPage() {
  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ["achievements-all"],
    queryFn: () => getPublishedAchievements(50),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">
          <Trophy className="inline h-7 w-7 mr-2 text-accent" />
          Prestasi Siswa
        </h1>
        {isLoading ? (
          <p className="text-muted-foreground">Memuat...</p>
        ) : achievements.length === 0 ? (
          <p className="text-muted-foreground">Belum ada prestasi.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((item) => (
              <div key={item.id} className="rounded-xl bg-card shadow-card p-1">
                {item.image_url && (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  {item.category && <span className="text-xs font-bold uppercase tracking-widest text-accent">{item.category}</span>}
                  <h3 className="mt-1 text-lg font-semibold text-foreground">{item.title}</h3>
                  {item.description && <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
