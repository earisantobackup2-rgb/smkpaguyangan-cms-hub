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

const emptyForm = { company_name: "", partnership_type: "mou", description: "", is_active: true, logo_url: "" };

export default function AdminKerjasama() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-partnerships"],
    queryFn: async () => {
      const { data } = await supabase.from("partnerships").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setLogoFile(null);
    setShowForm(true);
  };

  const openEdit = (item: typeof items[0]) => {
    setEditingId(item.id);
    setForm({
      company_name: item.company_name,
      partnership_type: item.partnership_type || "mou",
      description: item.description || "",
      is_active: item.is_active,
      logo_url: item.logo_url || "",
    });
    setLogoFile(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setLogoFile(null);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let logo_url = form.logo_url;
      if (logoFile) logo_url = await uploadFile(logoFile, `partnerships/${Date.now()}-${logoFile.name}`);
      const payload = {
        company_name: form.company_name,
        partnership_type: form.partnership_type || null,
        description: form.description || null,
        is_active: form.is_active,
        logo_url: logo_url || null,
      };
      if (editingId) {
        const { error } = await supabase.from("partnerships").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("partnerships").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partnerships"] });
      closeForm();
      toast.success(editingId ? "Mitra diperbarui" : "Mitra ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("partnerships").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partnerships"] });
      toast.success("Mitra dihapus");
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kerjasama Industri</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Tambah</Button>
      </div>

      {showForm && (
        <div className="rounded-xl bg-card shadow-card p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editingId ? "Edit Mitra" : "Tambah Mitra"}</h2>
            <Button variant="ghost" size="icon" onClick={closeForm}><X className="h-4 w-4" /></Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Nama Perusahaan</Label>
              <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
            </div>
            <div>
              <Label>Tipe Kerjasama</Label>
              <Select value={form.partnership_type} onValueChange={(v) => setForm({ ...form, partnership_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mou">MOU</SelectItem>
                  <SelectItem value="magang">Magang</SelectItem>
                  <SelectItem value="kerjasama">Kerjasama</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Deskripsi</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <Label>Logo {editingId && form.logo_url && "(kosongkan jika tidak ingin mengganti)"}</Label>
            <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
            {editingId && form.logo_url && !logoFile && (
              <img src={form.logo_url} alt="" className="h-12 mt-2 rounded object-contain" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            <Label>Aktif</Label>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.company_name}>
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
              <th className="text-left p-3 font-medium">Perusahaan</th>
              <th className="text-left p-3 font-medium">Tipe</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Aksi</th>
            </tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="p-3 flex items-center gap-2">
                    {item.logo_url && <img src={item.logo_url} className="h-6 w-6 rounded object-contain" alt="" />}
                    {item.company_name}
                  </td>
                  <td className="p-3 capitalize">{item.partnership_type || "-"}</td>
                  <td className="p-3">{item.is_active ? "✅ Aktif" : "Nonaktif"}</td>
                  <td className="p-3 text-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      if (confirm("Hapus mitra ini?")) deleteMutation.mutate(item.id);
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
