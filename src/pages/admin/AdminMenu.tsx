import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Plus, Pencil, X, GripVertical } from "lucide-react";

const emptyForm = { label: "", url: "", sort_order: 0, is_visible: true, open_in_new_tab: false };

export default function AdminMenu() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-menu-items"],
    queryFn: async () => {
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .is("parent_id", null)
        .order("sort_order", { ascending: true });
      return data || [];
    },
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, sort_order: items.length });
    setShowForm(true);
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setForm({
      label: item.label,
      url: item.url,
      sort_order: item.sort_order,
      is_visible: item.is_visible,
      open_in_new_tab: item.open_in_new_tab,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        label: form.label,
        url: form.url,
        sort_order: form.sort_order,
        is_visible: form.is_visible,
        open_in_new_tab: form.open_in_new_tab,
      };
      if (editingId) {
        const { error } = await supabase.from("menu_items").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("menu_items").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] });
      closeForm();
      toast.success(editingId ? "Menu diperbarui" : "Menu ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] });
      toast.success("Menu dihapus");
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Menu Website</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Tambah Menu</Button>
      </div>

      {showForm && (
        <div className="rounded-xl bg-card shadow-card p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editingId ? "Edit Menu" : "Tambah Menu"}</h2>
            <Button variant="ghost" size="icon" onClick={closeForm}><X className="h-4 w-4" /></Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Label</Label>
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Beranda" />
            </div>
            <div>
              <Label>URL / Path</Label>
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="/ atau /jurusan atau https://..." />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Urutan</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_visible} onCheckedChange={(v) => setForm({ ...form, is_visible: v })} />
              <Label>Tampilkan</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.open_in_new_tab} onCheckedChange={(v) => setForm({ ...form, open_in_new_tab: v })} />
              <Label>Buka di tab baru</Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.label || !form.url}>
              {saveMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
            <Button variant="outline" onClick={closeForm}>Batal</Button>
          </div>
        </div>
      )}

      {isLoading ? <p className="text-muted-foreground">Memuat...</p> : (
        <div className="rounded-xl bg-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Urutan</th>
              <th className="text-left p-3 font-medium">Label</th>
              <th className="text-left p-3 font-medium">URL</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Aksi</th>
            </tr></thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="p-3">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <GripVertical className="h-4 w-4" /> {item.sort_order}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{item.label}</td>
                  <td className="p-3 text-muted-foreground">{item.url}</td>
                  <td className="p-3">{item.is_visible ? "✅ Tampil" : "Tersembunyi"}</td>
                  <td className="p-3 text-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      if (confirm("Hapus menu ini?")) deleteMutation.mutate(item.id);
                    }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Belum ada menu. Klik "Tambah Menu" untuk memulai.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
