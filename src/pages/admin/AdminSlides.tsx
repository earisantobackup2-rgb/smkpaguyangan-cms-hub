import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, Image } from "lucide-react";

interface SlideForm {
  id?: string;
  image_url: string;
  caption: string;
  alt_text: string;
  sort_order: number;
  is_active: boolean;
  duration_ms: number;
}

const empty: SlideForm = { image_url: "", caption: "", alt_text: "", sort_order: 0, is_active: true, duration_ms: 6000 };

export default function AdminSlides() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<SlideForm | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: slides = [], isLoading } = useQuery({
    queryKey: ["admin-slides"],
    queryFn: async () => {
      const { data, error } = await supabase.from("hero_slides").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (form: SlideForm) => {
      if (form.id) {
        const { error } = await supabase.from("hero_slides").update({
          image_url: form.image_url,
          caption: form.caption,
          alt_text: form.alt_text,
          sort_order: form.sort_order,
          is_active: form.is_active,
          duration_ms: Math.max(6000, Math.min(12000, form.duration_ms)),
        }).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("hero_slides").insert({
          image_url: form.image_url,
          caption: form.caption,
          alt_text: form.alt_text,
          sort_order: form.sort_order,
          is_active: form.is_active,
          duration_ms: Math.max(6000, Math.min(12000, form.duration_ms)),
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-slides"] });
      setEditing(null);
      toast.success("Slide berhasil disimpan!");
    },
    onError: () => toast.error("Gagal menyimpan slide"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hero_slides").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-slides"] });
      toast.success("Slide dihapus!");
    },
  });


  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `slides/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file);
    if (error) {
      toast.error("Gagal upload gambar");
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(path);
    setEditing({ ...editing, image_url: urlData.publicUrl });
    setUploading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Slide Hero</h1>
        <Button onClick={() => setEditing({ ...empty, sort_order: slides.length })} className="gap-2">
          <Plus className="h-4 w-4" /> Tambah Slide
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-6">Durasi setiap slide diatur secara individual (6–12 detik).</p>

      {/* Form */}
      {editing && (
        <div className="bg-card rounded-lg border p-6 mb-6 space-y-4">
          <h2 className="font-semibold">{editing.id ? "Edit Slide" : "Tambah Slide"}</h2>

          <div>
            <Label>Gambar</Label>
            {editing.image_url && (
              <img src={editing.image_url} alt="Preview" className="w-full max-w-sm aspect-video object-cover rounded-lg mb-2" />
            )}
            <Input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
            {uploading && <p className="text-sm text-muted-foreground mt-1">Mengupload...</p>}
            <Input
              className="mt-2"
              placeholder="Atau masukkan URL gambar"
              value={editing.image_url}
              onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Caption</Label>
              <Input value={editing.caption} onChange={(e) => setEditing({ ...editing, caption: e.target.value })} />
            </div>
            <div>
              <Label>Alt Text</Label>
              <Input value={editing.alt_text} onChange={(e) => setEditing({ ...editing, alt_text: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Urutan</Label>
              <Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Durasi (ms)</Label>
              <Input type="number" min={6000} max={12000} step={500} value={editing.duration_ms} onChange={(e) => setEditing({ ...editing, duration_ms: Number(e.target.value) })} />
              <p className="text-xs text-muted-foreground mt-1">{(editing.duration_ms / 1000).toFixed(1)} detik (6-12s)</p>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch checked={editing.is_active} onCheckedChange={(c) => setEditing({ ...editing, is_active: c })} />
              <Label>Aktif</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => saveMutation.mutate(editing)} disabled={!editing.image_url || saveMutation.isPending}>
              Simpan
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Batal</Button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <p className="text-muted-foreground">Memuat...</p>
      ) : slides.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Image className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Belum ada slide. Klik "Tambah Slide" untuk memulai.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide: any) => (
            <div key={slide.id} className="flex items-center gap-4 bg-card rounded-lg border p-3">
              <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
              <img src={slide.image_url} alt={slide.alt_text || ""} className="h-16 w-28 object-cover rounded shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{slide.caption || "(Tanpa caption)"}</p>
                <p className="text-xs text-muted-foreground">Urutan: {slide.sort_order} • {(slide.duration_ms / 1000).toFixed(1)}s • {slide.is_active ? "Aktif" : "Nonaktif"}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => setEditing({
                  id: slide.id,
                  image_url: slide.image_url,
                  caption: slide.caption || "",
                  alt_text: slide.alt_text || "",
                  sort_order: slide.sort_order,
                  is_active: slide.is_active,
                  duration_ms: slide.duration_ms || 6000,
                })}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => {
                  if (confirm("Hapus slide ini?")) deleteMutation.mutate(slide.id);
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
