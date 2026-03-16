import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { uploadFile } from "@/lib/supabase-helpers";

export default function AdminPrestasi() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "", achievement_date: "", is_published: false });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-achievements"],
    queryFn: async () => {
      const { data } = await supabase.from("achievements").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      let image_url = "";
      if (imageFile) image_url = await uploadFile(imageFile, `achievements/${Date.now()}-${imageFile.name}`);
      const { error } = await supabase.from("achievements").insert({
        ...form,
        image_url: image_url || null,
        achievement_date: form.achievement_date || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-achievements"] });
      setShowForm(false);
      setForm({ title: "", description: "", category: "", achievement_date: "", is_published: false });
      setImageFile(null);
      toast.success("Prestasi ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("achievements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-achievements"] });
      toast.success("Prestasi dihapus");
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Prestasi</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> Tambah</Button>
      </div>

      {showForm && (
        <div className="rounded-xl bg-card shadow-card p-6 mb-6 space-y-4">
          <div>
            <Label>Judul</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Kategori</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Akademik, Olahraga, dll" />
            </div>
            <div>
              <Label>Tanggal</Label>
              <Input type="date" value={form.achievement_date} onChange={(e) => setForm({ ...form, achievement_date: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Deskripsi</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <Label>Gambar</Label>
            <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
            <Label>Publish</Label>
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.title}>
            {createMutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      )}

      {isLoading ? <p className="text-muted-foreground">Memuat...</p> : (
        <div className="rounded-xl bg-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Judul</th>
              <th className="text-left p-3 font-medium">Kategori</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Aksi</th>
            </tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="p-3">{item.title}</td>
                  <td className="p-3">{item.category || "-"}</td>
                  <td className="p-3">{item.is_published ? "✅ Published" : "Draft"}</td>
                  <td className="p-3 text-center">
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(item.id)}>
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
