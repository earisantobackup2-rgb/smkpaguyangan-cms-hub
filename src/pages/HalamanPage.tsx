import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import AccessibilityToolbar from "@/components/public/AccessibilityToolbar";
import PageBlocks, { type PageBlock } from "@/components/public/PageBlocks";
import { useEffect } from "react";

export default function HalamanPage() {
  const { slug } = useParams();
  const { data: page, isLoading } = useQuery({
    queryKey: ["public-page", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug as string)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (page?.title) document.title = `${page.title} — SMK Muhammadiyah 1 Paguyangan`;
  }, [page]);

  const blocks: PageBlock[] = Array.isArray(page?.blocks) ? (page!.blocks as any) : [];
  const isPublished = page ? (page as any).is_published !== false : false;

  return (
    <div className="min-h-screen bg-background">
      <AccessibilityToolbar />
      <Navbar />
      <main id="main-content" className="container py-10">
        {isLoading ? (
          <p className="text-muted-foreground">Memuat...</p>
        ) : !page || !isPublished ? (
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-2">Halaman tidak ditemukan</h1>
            <p className="text-muted-foreground">Halaman yang Anda cari tidak tersedia.</p>
          </div>
        ) : (
          <article className="max-w-4xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">{page.title}</h1>
              {(page as any).meta_description && (
                <p className="mt-3 text-muted-foreground text-pretty">{(page as any).meta_description}</p>
              )}
            </header>
            {blocks.length > 0 ? (
              <PageBlocks blocks={blocks} />
            ) : page.content ? (
              <p className="whitespace-pre-line text-foreground/90 leading-relaxed">{page.content}</p>
            ) : (
              <p className="text-muted-foreground italic">Konten belum tersedia.</p>
            )}
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}