import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Program = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  curriculum: string | null;
  career_prospects: string | null;
  is_published: boolean;
  sort_order: number;
};

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  image_url: "",
  curriculum: "",
  career_prospects: "",
  is_published: false,
  sort_order: 0,
};

export default function AdminJurusan() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Program | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ["admin-programs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("programs").select("*").order("sort_order");
      if (error) throw error;
      return data as Program[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
        description: form.description || null,
        image_url: form.image_url || null,
        curriculum: form.curriculum || null,
        career_prospects: form.career_prospects || null,
        is_published: form.is_published,
        sort_order: form.sort_order,
      };
      if (editing) {
        const { error } = await supabase.from("programs").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("programs").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Jurusan diperbarui" : "Jurusan ditambahkan");
      qc.invalidateQueries({ queryKey: ["admin-programs"] });
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("programs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Jurusan dihapus");
      qc.invalidateQueries({ queryKey: ["admin-programs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (p: Program) => {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description || "",
      image_url: p.image_url || "",
      curriculum: p.curriculum || "",
      career_prospects: p.career_prospects || "",
      is_published: p.is_published,
      sort_order: p.sort_order,
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `programs/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file);
    if (error) {
      toast.error("Gagal upload gambar");
      setUploading(false);
      return;
    }
    const { data: pub } = supabase.storage.from("uploads").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: pub.publicUrl }));
    setUploading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Jurusan & Keahlian</h1>
        {!showForm && (
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Tambah
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-8 rounded-xl bg-card shadow-card p-6 space-y-4">
          <h2 className="font-semibold">{editing ? "Edit Jurusan" : "Tambah Jurusan"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Nama Jurusan</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
            </div>
          </div>
          <div>
            <Label>Deskripsi</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <Label>Kurikulum</Label>
            <Textarea rows={4} value={form.curriculum} onChange={(e) => setForm({ ...form, curriculum: e.target.value })} placeholder="Daftar mata pelajaran / kompetensi" />
          </div>
          <div>
            <Label>Prospek Karir</Label>
            <Textarea rows={3} value={form.career_prospects} onChange={(e) => setForm({ ...form, career_prospects: e.target.value })} placeholder="Peluang kerja dan karir lulusan" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Gambar</Label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              {form.image_url && <img src={form.image_url} alt="" className="mt-2 h-24 rounded object-cover" />}
            </div>
            <div>
              <Label>Urutan</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
            <Label>Publikasikan</Label>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => save.mutate()} disabled={!form.name || save.isPending}>
              {save.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
            <Button variant="outline" onClick={resetForm}>Batal</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Memuat...</p>
      ) : programs.length === 0 ? (
        <p className="text-muted-foreground">Belum ada data jurusan.</p>
      ) : (
        <div className="space-y-3">
          {programs.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-lg bg-card shadow-card p-4">
              {p.image_url ? (
                <img src={p.image_url} alt="" className="h-16 w-24 rounded object-cover shrink-0" />
              ) : (
                <div className="h-16 w-24 rounded bg-muted shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground truncate">{p.description}</p>
                <span className={`text-xs ${p.is_published ? "text-primary" : "text-muted-foreground"}`}>
                  {p.is_published ? "Dipublikasikan" : "Draft"}
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => startEdit(p)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => remove.mutate(p.id)}>
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
