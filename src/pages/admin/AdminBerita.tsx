import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Plus, Pencil, X } from "lucide-react";
import { uploadFile } from "@/lib/supabase-helpers";

const emptyForm = { title: "", content: "", excerpt: "", category: "berita", is_published: false, image_url: "", published_at: "" };

export default function AdminBerita() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: news = [], isLoading } = useQuery({
    queryKey: ["admin-news"],
    queryFn: async () => {
      const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setShowForm(true);
  };

  const openEdit = (item: typeof news[0]) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      content: item.content || "",
      excerpt: item.excerpt || "",
      category: item.category,
      is_published: item.is_published,
      image_url: item.image_url || "",
      published_at: item.published_at ? item.published_at.slice(0, 16) : "",
    });
    setImageFile(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let image_url = form.image_url;
      if (imageFile) {
        image_url = await uploadFile(imageFile, `news/${Date.now()}-${imageFile.name}`);
      }
      if (editingId) {
        const { error } = await supabase.from("news").update({
          ...form,
          image_url,
          published_at: form.is_published ? new Date().toISOString() : null,
        }).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("news").insert({
          ...form,
          image_url,
          published_at: form.is_published ? new Date().toISOString() : null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      closeForm();
      toast.success(editingId ? "Berita diperbarui" : "Berita ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      toast.success("Berita dihapus");
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase.from("news").update({
        is_published,
        published_at: is_published ? new Date().toISOString() : null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-news"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Berita & Pengumuman</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Tambah</Button>
      </div>

      {showForm && (
        <div className="rounded-xl bg-card shadow-card p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editingId ? "Edit Berita" : "Tambah Berita"}</h2>
            <Button variant="ghost" size="icon" onClick={closeForm}><X className="h-4 w-4" /></Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Judul</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Kategori</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="berita">Berita</SelectItem>
                  <SelectItem value="pengumuman">Pengumuman</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Ringkasan</Label>
            <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </div>
          <div>
            <Label>Konten</Label>
            <Textarea rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          <div>
            <Label>Gambar {editingId && form.image_url && "(kosongkan jika tidak ingin mengganti)"}</Label>
            <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            {editingId && form.image_url && !imageFile && (
              <img src={form.image_url} alt="" className="h-16 mt-2 rounded object-cover" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
            <Label>Publish langsung</Label>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.title}>
              {saveMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
            <Button variant="outline" onClick={closeForm}>Batal</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Memuat...</p>
      ) : (
        <div className="rounded-xl bg-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Judul</th>
                <th className="text-left p-3 font-medium">Kategori</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {news.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="p-3">{item.title}</td>
                  <td className="p-3 capitalize">{item.category}</td>
                  <td className="p-3">
                    <Switch
                      checked={item.is_published}
                      onCheckedChange={(v) => togglePublish.mutate({ id: item.id, is_published: v })}
                    />
                  </td>
                  <td className="p-3 text-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      if (confirm("Hapus berita ini?")) deleteMutation.mutate(item.id);
                    }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
