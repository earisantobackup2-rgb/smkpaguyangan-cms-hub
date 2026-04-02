import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GripVertical, Eye, EyeOff, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const TEMPLATE_SECTIONS = [
  { key: "hero", label: "Hero Slideshow" },
  { key: "programs", label: "Konsentrasi Keahlian" },
  { key: "search", label: "Pencarian Berita & Prestasi" },
  { key: "partnerships", label: "Kerjasama Industri" },
  { key: "maps", label: "Lokasi Sekolah" },
  { key: "instagram", label: "Instagram Feed" },
];

type Section = {
  id: string;
  section_key: string;
  label: string;
  sort_order: number;
  is_visible: boolean;
  config: Record<string, unknown>;
};

export default function AdminSections() {
  const qc = useQueryClient();
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["homepage-sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_sections")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as Section[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (items: Section[]) => {
      for (let i = 0; i < items.length; i++) {
        const { error } = await supabase
          .from("homepage_sections")
          .update({ sort_order: i, is_visible: items[i].is_visible, label: items[i].label })
          .eq("id", items[i].id);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Urutan section disimpan"); qc.invalidateQueries({ queryKey: ["homepage-sections"] }); },
    onError: () => toast.error("Gagal menyimpan"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("homepage_sections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Section dihapus"); qc.invalidateQueries({ queryKey: ["homepage-sections"] }); },
  });

  const addMutation = useMutation({
    mutationFn: async (tmpl: { key: string; label: string }) => {
      const { error } = await supabase.from("homepage_sections").insert({
        section_key: tmpl.key,
        label: tmpl.label,
        sort_order: sections.length,
        is_visible: true,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Section ditambahkan"); qc.invalidateQueries({ queryKey: ["homepage-sections"] }); setShowAdd(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const [localSections, setLocalSections] = useState<Section[]>([]);
  const displayed = localSections.length ? localSections : sections;

  const handleDragStart = (i: number) => setDragIdx(i);

  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const items = [...displayed];
    const [moved] = items.splice(dragIdx, 1);
    items.splice(i, 0, moved);
    setLocalSections(items);
    setDragIdx(i);
  };

  const toggleVisibility = (i: number) => {
    const items = [...displayed];
    items[i] = { ...items[i], is_visible: !items[i].is_visible };
    setLocalSections(items);
  };

  const updateLabel = (i: number, label: string) => {
    const items = [...displayed];
    items[i] = { ...items[i], label };
    setLocalSections(items);
  };

  const existingKeys = sections.map((s) => s.section_key);
  const availableTemplates = TEMPLATE_SECTIONS.filter((t) => !existingKeys.includes(t.key));

  if (isLoading) return <p className="text-muted-foreground">Memuat...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Section Homepage</h1>
          <p className="text-sm text-muted-foreground">Drag & drop untuk mengatur urutan, toggle untuk tampilkan/sembunyikan</p>
        </div>
        <div className="flex gap-2">
          {availableTemplates.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setShowAdd(!showAdd)}>
              <Plus className="h-4 w-4 mr-1" /> Tambah Section
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => saveMutation.mutate(displayed)}
            disabled={saveMutation.isPending}
          >
            <Save className="h-4 w-4 mr-1" /> Simpan Urutan
          </Button>
        </div>
      </div>

      {showAdd && (
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium mb-3">Pilih template section:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableTemplates.map((t) => (
              <button
                key={t.key}
                onClick={() => addMutation.mutate(t)}
                className="rounded-lg border p-3 text-left hover:bg-muted transition-colors"
              >
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground">section: {t.key}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {displayed.map((section, i) => (
          <div
            key={section.id}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDragEnd={() => setDragIdx(null)}
            className={`flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors ${
              dragIdx === i ? "border-primary bg-primary/5" : ""
            } ${!section.is_visible ? "opacity-50" : ""}`}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab shrink-0" />

            <div className="flex-1 min-w-0">
              <Input
                value={section.label}
                onChange={(e) => updateLabel(i, e.target.value)}
                className="h-8 text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">key: {section.section_key}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleVisibility(i)}
                className="p-1 rounded hover:bg-muted"
                title={section.is_visible ? "Sembunyikan" : "Tampilkan"}
              >
                {section.is_visible ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
              </button>
              <button
                onClick={() => { if (confirm("Hapus section ini?")) deleteMutation.mutate(section.id); }}
                className="p-1 rounded hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
