import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Images, Upload, ArrowLeft, X } from "lucide-react";
import { uploadFile } from "@/lib/supabase-helpers";

interface Album {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  sort_order: number;
}

interface Photo {
  id: string;
  album_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

export default function AdminGaleri() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", is_published: false });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: albums = [] } = useQuery({
    queryKey: ["admin-gallery-albums"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_albums").select("*").order("sort_order");
      if (error) throw error;
      return data as Album[];
    },
  });

  const { data: photos = [] } = useQuery({
    queryKey: ["admin-gallery-photos", selectedAlbum?.id],
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

  const saveAlbum = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await supabase.from("gallery_albums").update(form).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("gallery_albums").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-gallery-albums"] });
      setShowForm(false);
      setEditingId(null);
      setForm({ title: "", description: "", is_published: false });
      toast({ title: editingId ? "Album diperbarui" : "Album ditambahkan" });
    },
    onError: () => toast({ title: "Gagal menyimpan", variant: "destructive" }),
  });

  const deleteAlbum = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_albums").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-gallery-albums"] });
      toast({ title: "Album dihapus" });
    },
  });

  const deletePhoto = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_photos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-gallery-photos"] });
      toast({ title: "Foto dihapus" });
    },
  });

  const handleEdit = (album: Album) => {
    setForm({ title: album.title, description: album.description || "", is_published: album.is_published });
    setEditingId(album.id);
    setShowForm(true);
  };

  const handleMultiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedAlbum || !e.target.files?.length) return;
    setUploading(true);
    try {
      const files = Array.from(e.target.files);
      const currentMax = photos.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = `gallery/${selectedAlbum.id}/${Date.now()}-${file.name}`;
        const url = await uploadFile(file, path);
        await supabase.from("gallery_photos").insert({
          album_id: selectedAlbum.id,
          image_url: url,
          sort_order: currentMax + i,
        });

        // Set cover if album has none
        if (!selectedAlbum.cover_image_url && i === 0) {
          await supabase.from("gallery_albums").update({ cover_image_url: url }).eq("id", selectedAlbum.id);
          setSelectedAlbum({ ...selectedAlbum, cover_image_url: url });
          qc.invalidateQueries({ queryKey: ["admin-gallery-albums"] });
        }
      }

      qc.invalidateQueries({ queryKey: ["admin-gallery-photos"] });
      toast({ title: `${files.length} foto berhasil diupload` });
    } catch {
      toast({ title: "Gagal upload foto", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Album photo view
  if (selectedAlbum) {
    return (
      <div>
        <button
          onClick={() => setSelectedAlbum(null)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-heading">Foto: {selectedAlbum.title}</h2>
          <label className="cursor-pointer">
            <Button asChild disabled={uploading}>
              <span>
                <Upload className="h-4 w-4 mr-1" />
                {uploading ? "Mengupload..." : "Upload Foto"}
              </span>
            </Button>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleMultiUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {photos.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">Belum ada foto. Upload foto untuk memulai.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden border">
                <img src={photo.image_url} alt={photo.caption || ""} className="w-full h-full object-cover" />
                <button
                  onClick={() => deletePhoto.mutate(photo.id)}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Albums list view
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading">Galeri Foto</h1>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setForm({ title: "", description: "", is_published: false }); }}>
          <Plus className="h-4 w-4 mr-1" /> Tambah Album
        </Button>
      </div>

      {showForm && (
        <div className="border rounded-lg p-4 mb-6 bg-card space-y-4">
          <div>
            <Label>Judul Album</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nama album" />
          </div>
          <div>
            <Label>Deskripsi</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi singkat" />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
            <Label>Publikasikan</Label>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => saveAlbum.mutate()} disabled={!form.title || saveAlbum.isPending}>
              {saveAlbum.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Batal</Button>
          </div>
        </div>
      )}

      {albums.length === 0 && !showForm ? (
        <div className="text-center py-12 text-muted-foreground">
          <Images className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>Belum ada album. Buat album pertama Anda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {albums.map((album) => (
            <div key={album.id} className="flex items-center gap-4 border rounded-lg p-3 bg-card">
              <div className="h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0">
                {album.cover_image_url ? (
                  <img src={album.cover_image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Images className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{album.title}</p>
                <p className="text-xs text-muted-foreground">
                  {album.is_published ? "✅ Dipublikasikan" : "⏳ Draft"}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="outline" onClick={() => setSelectedAlbum(album)}>
                  <Images className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleEdit(album)}>Edit</Button>
                <Button size="sm" variant="outline" onClick={() => deleteAlbum.mutate(album.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
