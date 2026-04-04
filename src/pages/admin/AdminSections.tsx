import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GripVertical, Eye, EyeOff, Plus, Save, Trash2, Pencil, Copy, LayoutTemplate, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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

type CustomData = {
  id?: string;
  section_id?: string;
  heading: string;
  subheading: string;
  content: string;
  image_url: string;
  button_text: string;
  button_url: string;
  bg_color: string;
  layout: string;
};

const emptyCustom: CustomData = {
  heading: "",
  subheading: "",
  content: "",
  image_url: "",
  button_text: "",
  button_url: "",
  bg_color: "",
  layout: "center",
};

export default function AdminSections() {
  const qc = useQueryClient();
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [editingCustom, setEditingCustom] = useState<CustomData>(emptyCustom);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `custom-sections/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("uploads").upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(fileName);
      setEditingCustom((prev) => ({ ...prev, image_url: urlData.publicUrl }));
      toast.success("Gambar berhasil diupload");
    } catch (e: any) {
      toast.error(e.message || "Gagal upload gambar");
    } finally {
      setUploading(false);
    }
  };

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["homepage-sections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("homepage_sections").select("*").order("sort_order");
      if (error) throw error;
      return data as Section[];
    },
  });

  const { data: customSections = [] } = useQuery({
    queryKey: ["custom-sections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("custom_sections").select("*");
      if (error) throw error;
      return data as any[];
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
    onSuccess: () => { toast.success("Section dihapus"); qc.invalidateQueries({ queryKey: ["homepage-sections"] }); qc.invalidateQueries({ queryKey: ["custom-sections"] }); },
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

  const saveCustomMutation = useMutation({
    mutationFn: async (data: CustomData) => {
      if (editingSectionId) {
        // Update existing
        const { error } = await supabase.from("custom_sections").update({
          heading: data.heading,
          subheading: data.subheading || null,
          content: data.content || null,
          image_url: data.image_url || null,
          button_text: data.button_text || null,
          button_url: data.button_url || null,
          bg_color: data.bg_color || null,
          layout: data.layout,
        }).eq("section_id", editingSectionId);
        if (error) throw error;
        // Update label
        await supabase.from("homepage_sections").update({ label: data.heading || "Custom Section" }).eq("id", editingSectionId);
      } else {
        // Insert homepage_sections first
        const { data: sec, error: e1 } = await supabase.from("homepage_sections").insert({
          section_key: "custom",
          label: data.heading || "Custom Section",
          sort_order: sections.length,
          is_visible: true,
        }).select().single();
        if (e1) throw e1;
        // Insert custom_sections
        const { error: e2 } = await supabase.from("custom_sections").insert({
          section_id: sec.id,
          heading: data.heading,
          subheading: data.subheading || null,
          content: data.content || null,
          image_url: data.image_url || null,
          button_text: data.button_text || null,
          button_url: data.button_url || null,
          bg_color: data.bg_color || null,
          layout: data.layout,
        });
        if (e2) throw e2;
      }
    },
    onSuccess: () => {
      toast.success(editingSectionId ? "Section kustom diperbarui" : "Section kustom dibuat");
      qc.invalidateQueries({ queryKey: ["homepage-sections"] });
      qc.invalidateQueries({ queryKey: ["custom-sections"] });
      setCustomOpen(false);
      setEditingSectionId(null);
      setEditingCustom(emptyCustom);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleEditCustom = (sectionId: string) => {
    const cs = customSections.find((c: any) => c.section_id === sectionId);
    if (cs) {
      setEditingCustom({
        heading: cs.heading || "",
        subheading: cs.subheading || "",
        content: cs.content || "",
        image_url: cs.image_url || "",
        button_text: cs.button_text || "",
        button_url: cs.button_url || "",
        bg_color: cs.bg_color || "",
        layout: cs.layout || "center",
      });
      setEditingSectionId(sectionId);
      setCustomOpen(true);
    }
  };

  const handleDuplicate = (sectionId: string) => {
    const cs = customSections.find((c: any) => c.section_id === sectionId);
    if (cs) {
      setEditingCustom({
        heading: cs.heading + " (Copy)",
        subheading: cs.subheading || "",
        content: cs.content || "",
        image_url: cs.image_url || "",
        button_text: cs.button_text || "",
        button_url: cs.button_url || "",
        bg_color: cs.bg_color || "",
        layout: cs.layout || "center",
      });
      setEditingSectionId(null);
      setCustomOpen(true);
    }
  };

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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Section Homepage</h1>
          <p className="text-sm text-muted-foreground">Drag & drop untuk mengatur urutan, toggle untuk tampilkan/sembunyikan</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => { setEditingCustom(emptyCustom); setEditingSectionId(null); setCustomOpen(true); }}>
            <LayoutTemplate className="h-4 w-4 mr-1" /> Buat Section Kustom
          </Button>
          {availableTemplates.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setShowAdd(!showAdd)}>
              <Plus className="h-4 w-4 mr-1" /> Tambah Section
            </Button>
          )}
          <Button size="sm" onClick={() => saveMutation.mutate(displayed)} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-1" /> Simpan Urutan
          </Button>
        </div>
      </div>

      {showAdd && (
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium mb-3">Pilih template section:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableTemplates.map((t) => (
              <button key={t.key} onClick={() => addMutation.mutate(t)} className="rounded-lg border p-3 text-left hover:bg-muted transition-colors">
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
            className={`flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors ${dragIdx === i ? "border-primary bg-primary/5" : ""} ${!section.is_visible ? "opacity-50" : ""}`}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab shrink-0" />
            <div className="flex-1 min-w-0">
              <Input value={section.label} onChange={(e) => updateLabel(i, e.target.value)} className="h-8 text-sm" />
              <p className="text-xs text-muted-foreground mt-1">key: {section.section_key}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {section.section_key === "custom" && (
                <>
                  <button onClick={() => handleEditCustom(section.id)} className="p-1 rounded hover:bg-muted" title="Edit">
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDuplicate(section.id)} className="p-1 rounded hover:bg-muted" title="Duplikasi">
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </button>
                </>
              )}
              <button onClick={() => toggleVisibility(i)} className="p-1 rounded hover:bg-muted" title={section.is_visible ? "Sembunyikan" : "Tampilkan"}>
                {section.is_visible ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
              </button>
              <button onClick={() => { if (confirm("Hapus section ini?")) deleteMutation.mutate(section.id); }} className="p-1 rounded hover:bg-destructive/10">
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Section Dialog */}
      <Dialog open={customOpen} onOpenChange={(o) => { if (!o) { setCustomOpen(false); setEditingSectionId(null); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSectionId ? "Edit Section Kustom" : "Buat Section Kustom"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Judul *</Label>
              <Input value={editingCustom.heading} onChange={(e) => setEditingCustom({ ...editingCustom, heading: e.target.value })} placeholder="Judul section" />
            </div>
            <div>
              <Label>Sub-judul</Label>
              <Input value={editingCustom.subheading} onChange={(e) => setEditingCustom({ ...editingCustom, subheading: e.target.value })} placeholder="Sub-judul opsional" />
            </div>
            <div>
              <Label>Konten</Label>
              <Textarea value={editingCustom.content} onChange={(e) => setEditingCustom({ ...editingCustom, content: e.target.value })} placeholder="Isi konten section (bisa HTML)" rows={4} />
            </div>
            <div>
              <Label>URL Gambar</Label>
              <Input value={editingCustom.image_url} onChange={(e) => setEditingCustom({ ...editingCustom, image_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Teks Tombol</Label>
                <Input value={editingCustom.button_text} onChange={(e) => setEditingCustom({ ...editingCustom, button_text: e.target.value })} placeholder="Selengkapnya" />
              </div>
              <div>
                <Label>URL Tombol</Label>
                <Input value={editingCustom.button_url} onChange={(e) => setEditingCustom({ ...editingCustom, button_url: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Layout</Label>
                <Select value={editingCustom.layout} onValueChange={(v) => setEditingCustom({ ...editingCustom, layout: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Tengah</SelectItem>
                    <SelectItem value="left-image">Gambar Kiri</SelectItem>
                    <SelectItem value="right-image">Gambar Kanan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Warna Latar</Label>
                <Input type="color" value={editingCustom.bg_color || "#ffffff"} onChange={(e) => setEditingCustom({ ...editingCustom, bg_color: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomOpen(false)}>Batal</Button>
            <Button onClick={() => saveCustomMutation.mutate(editingCustom)} disabled={!editingCustom.heading || saveCustomMutation.isPending}>
              {saveCustomMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
