import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, ChevronLeft, ChevronRight, Images } from "lucide-react";

interface Album {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
}

interface Photo {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

export default function GaleriPage() {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: albums = [] } = useQuery({
    queryKey: ["gallery-albums"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_albums")
        .select("*")
        .eq("is_published", true)
        .order("sort_order");
      if (error) throw error;
      return data as Album[];
    },
  });

  const { data: photos = [] } = useQuery({
    queryKey: ["gallery-photos", selectedAlbum?.id],
    queryFn: async () => {
      if (!selectedAlbum) return [];
      const { data, error } = await supabase
        .from("gallery_photos")
        .select("*")
        .eq("album_id", selectedAlbum.id)
        .order("sort_order");
      if (error) throw error;
      return data as Photo[];
    },
    enabled: !!selectedAlbum,
  });

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevPhoto = () => setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : photos.length - 1));
  const nextPhoto = () => setLightboxIndex((i) => (i !== null && i < photos.length - 1 ? i + 1 : 0));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-12">
        <div className="flex items-center gap-3 mb-8">
          <Camera className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold font-heading text-foreground">Galeri Foto</h1>
        </div>

        {selectedAlbum ? (
          <div>
            <button
              onClick={() => { setSelectedAlbum(null); setLightboxIndex(null); }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Kembali ke Album
            </button>
            <h2 className="text-2xl font-bold font-heading mb-2 text-foreground">{selectedAlbum.title}</h2>
            {selectedAlbum.description && (
              <p className="text-muted-foreground mb-6">{selectedAlbum.description}</p>
            )}

            {photos.length === 0 ? (
              <p className="text-muted-foreground py-12 text-center">Belum ada foto di album ini.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {photos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative"
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      src={photo.image_url}
                      alt={photo.caption || "Foto galeri"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {photo.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs truncate">{photo.caption}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {albums.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Images className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada album galeri.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums.map((album, index) => (
                  <motion.div
                    key={album.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedAlbum(album)}
                    className="group cursor-pointer rounded-xl overflow-hidden border bg-card shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-[4/3] bg-muted overflow-hidden">
                      {album.cover_image_url ? (
                        <img
                          src={album.cover_image_url}
                          alt={album.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Images className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold font-heading text-foreground group-hover:text-primary transition-colors">
                        {album.title}
                      </h3>
                      {album.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{album.description}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && photos[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/80 hover:text-white z-10">
              <X className="h-7 w-7" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white z-10"
            >
              <ChevronLeft className="h-10 w-10" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white z-10"
            >
              <ChevronRight className="h-10 w-10" />
            </button>

            <div className="max-w-5xl max-h-[85vh] px-12" onClick={(e) => e.stopPropagation()}>
              <img
                src={photos[lightboxIndex].image_url}
                alt={photos[lightboxIndex].caption || "Foto"}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              {photos[lightboxIndex].caption && (
                <p className="text-white/80 text-center mt-3 text-sm">{photos[lightboxIndex].caption}</p>
              )}
              <p className="text-white/40 text-center mt-1 text-xs">
                {lightboxIndex + 1} / {photos.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
