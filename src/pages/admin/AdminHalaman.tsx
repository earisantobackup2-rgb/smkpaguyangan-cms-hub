import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, ExternalLink, Eye, EyeOff } from "lucide-react";

export default function AdminHalaman() {
  const queryClient = useQueryClient();

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const { data } = await supabase.from("pages").select("*").order("title");
      return data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      toast.success("Halaman dihapus");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Halaman</h1>
        <Button asChild>
          <Link to="/admin/halaman/new/edit"><Plus className="h-4 w-4 mr-1" /> Halaman Baru</Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Memuat...</p>
      ) : pages.length === 0 ? (
        <div className="rounded-xl bg-card shadow-card p-10 text-center text-muted-foreground">
          Belum ada halaman. Klik "Halaman Baru" untuk membuat.
        </div>
      ) : (
        <div className="rounded-xl bg-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Judul</th>
                <th className="text-left p-3 font-medium">Slug</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p: any) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{p.title}</td>
                  <td className="p-3 text-muted-foreground"><code className="text-xs">/halaman/{p.slug}</code></td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 text-xs ${p.is_published === false ? "text-muted-foreground" : "text-primary"}`}>
                      {p.is_published === false ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      {p.is_published === false ? "Draft" : "Terbit"}
                    </span>
                  </td>
                  <td className="p-3 text-center space-x-1 whitespace-nowrap">
                    <Button asChild variant="ghost" size="sm">
                      <a href={`/halaman/${p.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/admin/halaman/${p.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      if (confirm(`Hapus halaman "${p.title}"?`)) deleteMutation.mutate(p.id);
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
