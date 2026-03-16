import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function AdminHalaman() {
  const queryClient = useQueryClient();

  const { data: pages = [] } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const { data } = await supabase.from("pages").select("*").order("slug");
      return data || [];
    },
  });

  const [editing, setEditing] = useState<string | null>(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (editing) {
      const page = pages.find((p) => p.id === editing);
      if (page) setContent(page.content || "");
    }
  }, [editing, pages]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("pages").update({ content }).eq("id", editing!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      setEditing(null);
      toast.success("Halaman diperbarui");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Halaman (Visi/Misi & Sejarah)</h1>
      <div className="space-y-4">
        {pages.map((page) => (
          <div key={page.id} className="rounded-xl bg-card shadow-card p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">{page.title}</h2>
              <Button variant="outline" size="sm" onClick={() => setEditing(editing === page.id ? null : page.id)}>
                {editing === page.id ? "Batal" : "Edit"}
              </Button>
            </div>
            {editing === page.id ? (
              <div className="space-y-3">
                <div>
                  <Label>Konten</Label>
                  <Textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} />
                </div>
                <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-line">{page.content}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
