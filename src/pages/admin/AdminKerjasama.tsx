import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { uploadFile } from "@/lib/supabase-helpers";

export default function AdminKerjasama() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company_name: "", partnership_type: "mou" as string, description: "" });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-partnerships"],
    queryFn: async () => {
      const { data } = await supabase.from("partnerships").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      let logo_url = "";
      if (logoFile) logo_url = await uploadFile(logoFile, `partnerships/${Date.now()}-${logoFile.name}`);
      const { error } = await supabase.from("partnerships").insert({
        ...form,
        logo_url: logo_url || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partnerships"] });
      setShowForm(false);
      setForm({ company_name: "", partnership_type: "mou", description: "" });
      setLogoFile(null);
      toast.success("Mitra ditambahkan");
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
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> Tambah</Button>
      </div>

      {showForm && (
        <div className="rounded-xl bg-card shadow-card p-6 mb-6 space-y-4">
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
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <Label>Logo</Label>
            <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.company_name}>
            {createMutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      )}

      {isLoading ? <p className="text-muted-foreground">Memuat...</p> : (
        <div className="rounded-xl bg-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Perusahaan</th>
              <th className="text-left p-3 font-medium">Tipe</th>
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
