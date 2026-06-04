import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, ArrowDown, ArrowUp, Trash2, Plus, Image as ImageIcon, Heading1, Type, Minus, Link2, Upload, Eye, Monitor, Tablet, Smartphone } from "lucide-react";
import PageBlocks from "@/components/public/PageBlocks";

type Block =
  | { id: string; type: "heading"; text: string; level: 1 | 2 | 3 }
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "image"; url: string; alt?: string; position: "left" | "right" | "center" | "full"; width?: number; caption?: string }
  | { id: string; type: "divider" }
  | { id: string; type: "button"; label: string; url: string };

const uid = () => Math.random().toString(36).slice(2, 10);
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function AdminPageBuilder() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [showInMenu, setShowInMenu] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [addToMenu, setAddToMenu] = useState(false);
  const [menuLabel, setMenuLabel] = useState("");
  const [menuParentId, setMenuParentId] = useState<string>("none");
  const [menuItemId, setMenuItemId] = useState<string | null>(null);
  const [menuOpenNewTab, setMenuOpenNewTab] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showPreview, setShowPreview] = useState(true);

  const { data: page } = useQuery({
    queryKey: ["admin-page", id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase.from("pages").select("*").eq("id", id as string).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  const { data: menuParents = [] } = useQuery({
    queryKey: ["menu-parents"],
    queryFn: async () => {
      const { data } = await supabase
        .from("menu_items")
        .select("id,label,parent_id")
        .is("parent_id", null)
        .order("sort_order");
      return (data || []).filter((m: any) => m.url !== `/halaman/${slug}`);
    },
  });

  useEffect(() => {
    if (page) {
      setTitle(page.title || "");
      setSlug(page.slug || "");
      setMetaDescription((page as any).meta_description || "");
      setIsPublished((page as any).is_published !== false);
      setShowInMenu(!!(page as any).show_in_menu);
      const b = Array.isArray((page as any).blocks) ? ((page as any).blocks as Block[]) : [];
      setBlocks(b);
    }
  }, [page]);

  useEffect(() => {
    (async () => {
      if (isNew || !page?.slug) return;
      const url = `/halaman/${page.slug}`;
      const { data } = await supabase.from("menu_items").select("*").eq("url", url).maybeSingle();
      if (data) {
        setMenuItemId(data.id);
        setAddToMenu(true);
        setMenuLabel(data.label);
        setMenuParentId(data.parent_id || "none");
        setMenuOpenNewTab(!!data.open_in_new_tab);
      } else if (page.title && !menuLabel) {
        setMenuLabel(page.title);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, isNew]);

  const addBlock = (type: Block["type"]) => {
    const base = { id: uid() };
    let nb: Block;
    switch (type) {
      case "heading": nb = { ...base, type, text: "Judul Baru", level: 2 }; break;
      case "paragraph": nb = { ...base, type, text: "Tulis paragraf di sini..." }; break;
      case "image": nb = { ...base, type, url: "", position: "center", width: 100 }; break;
      case "divider": nb = { ...base, type }; break;
      case "button": nb = { ...base, type, label: "Klik di sini", url: "#" }; break;
    }
    setBlocks((bs) => [...bs, nb!]);
  };

  const updateBlock = (bid: string, patch: Partial<Block>) => {
    setBlocks((bs) => bs.map((b) => (b.id === bid ? ({ ...b, ...patch } as Block) : b)));
  };
  const removeBlock = (bid: string) => setBlocks((bs) => bs.filter((b) => b.id !== bid));
  const moveBlock = (bid: string, dir: -1 | 1) => {
    setBlocks((bs) => {
      const idx = bs.findIndex((b) => b.id === bid);
      const nIdx = idx + dir;
      if (idx < 0 || nIdx < 0 || nIdx >= bs.length) return bs;
      const copy = [...bs];
      [copy[idx], copy[nIdx]] = [copy[nIdx], copy[idx]];
      return copy;
    });
  };

  const uploadImage = async (bid: string, file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("File harus berupa gambar"); return; }
    if (file.size > 1 * 1024 * 1024) {
      toast.error(`Ukuran gambar maksimal 1MB. File Anda ${(file.size / 1024 / 1024).toFixed(2)}MB. Silakan kompres terlebih dahulu.`);
      return;
    }
    setUploadingId(bid);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `pages/${Date.now()}-${uid()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("uploads").upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      updateBlock(bid, { url: data.publicUrl } as any);
      toast.success("Gambar diunggah");
    } catch (e: any) {
      toast.error(e.message || "Gagal upload");
    } finally {
      setUploadingId(null);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Judul wajib diisi");
      const finalSlug = slug.trim() || slugify(title);
      const payload: any = {
        title: title.trim(),
        slug: finalSlug,
        meta_description: metaDescription || null,
        is_published: isPublished,
        show_in_menu: showInMenu,
        blocks,
        content: blocks.filter((b: any) => b.type === "paragraph").map((b: any) => b.text).join("\n\n"),
      };
      let savedId: string;
      if (isNew) {
        const { data, error } = await supabase.from("pages").insert(payload).select("id").maybeSingle();
        if (error) throw error;
        savedId = data!.id as string;
      } else {
        const { error } = await supabase.from("pages").update(payload).eq("id", id as string);
        if (error) throw error;
        savedId = id as string;
      }
      const pageUrl = `/halaman/${finalSlug}`;
      if (addToMenu) {
        const menuPayload = {
          label: (menuLabel.trim() || title.trim()),
          url: pageUrl,
          parent_id: menuParentId === "none" ? null : menuParentId,
          open_in_new_tab: menuOpenNewTab,
          is_visible: true,
        };
        if (menuItemId) {
          const { error: mErr } = await supabase.from("menu_items").update(menuPayload).eq("id", menuItemId);
          if (mErr) throw mErr;
        } else {
          const { data: mi, error: mErr } = await supabase.from("menu_items").insert(menuPayload).select("id").maybeSingle();
          if (mErr) throw mErr;
          if (mi) setMenuItemId(mi.id);
        }
      } else if (menuItemId) {
        await supabase.from("menu_items").delete().eq("id", menuItemId);
        setMenuItemId(null);
      }
      return savedId;
    },
    onSuccess: (newId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      queryClient.invalidateQueries({ queryKey: ["admin-page", newId] });
      queryClient.invalidateQueries({ queryKey: ["public-page"] });
      queryClient.invalidateQueries({ queryKey: ["public-menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["menu-parents"] });
      toast.success("Halaman tersimpan");
      if (isNew) navigate(`/admin/halaman/${newId}/edit`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link to="/admin/halaman" className="p-2 rounded-md hover:bg-muted"><ArrowLeft className="h-4 w-4" /></Link>
          <h1 className="text-2xl font-bold">{isNew ? "Halaman Baru" : "Edit Halaman"}</h1>
        </div>
        <div className="flex gap-2">
          <div className="hidden md:inline-flex rounded-md border overflow-hidden">
            <button type="button" onClick={() => setShowPreview((s) => !s)} className={`px-3 py-2 text-sm hover:bg-muted ${showPreview ? "bg-muted" : ""}`} title="Tampilkan/Sembunyikan Preview">
              <Eye className="h-4 w-4" />
            </button>
          </div>
          {!isNew && slug && (
            <a href={`/halaman/${slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
              <Eye className="h-4 w-4" /> Buka Tab
            </a>
          )}
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      <div className={`grid gap-6 ${showPreview ? "xl:grid-cols-[1fr_minmax(360px,640px)]" : "lg:grid-cols-[1fr_320px]"}`}>
        <div className="space-y-4">
          <div className="rounded-xl bg-card shadow-card p-5 space-y-3">
            <div>
              <Label>Judul Halaman</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Visi & Misi" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Slug URL</Label>
                <Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="visi-misi" />
                {slug && <p className="text-xs text-muted-foreground mt-1">URL: <code>/halaman/{slug}</code></p>}
              </div>
              <div>
                <Label>Meta Description (SEO)</Label>
                <Input value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} maxLength={160} placeholder="Ringkasan singkat halaman..." />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-card shadow-card p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-semibold">Konten Blok</h2>
              <div className="flex flex-wrap gap-1">
                <Button size="sm" variant="outline" onClick={() => addBlock("heading")}><Heading1 className="h-4 w-4 mr-1" /> Judul</Button>
                <Button size="sm" variant="outline" onClick={() => addBlock("paragraph")}><Type className="h-4 w-4 mr-1" /> Teks</Button>
                <Button size="sm" variant="outline" onClick={() => addBlock("image")}><ImageIcon className="h-4 w-4 mr-1" /> Gambar</Button>
                <Button size="sm" variant="outline" onClick={() => addBlock("button")}><Link2 className="h-4 w-4 mr-1" /> Tombol</Button>
                <Button size="sm" variant="outline" onClick={() => addBlock("divider")}><Minus className="h-4 w-4 mr-1" /> Pemisah</Button>
              </div>
            </div>

            {blocks.length === 0 && (
              <div className="text-center py-10 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                Belum ada blok. Klik tombol di atas untuk menambah konten.
              </div>
            )}

            {blocks.map((b, i) => (
              <div key={b.id} className="border rounded-lg p-3 bg-background">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{b.type}</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" disabled={i === 0} onClick={() => moveBlock(b.id, -1)}><ArrowUp className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" disabled={i === blocks.length - 1} onClick={() => moveBlock(b.id, 1)}><ArrowDown className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => removeBlock(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                {b.type === "heading" && (
                  <div className="space-y-2">
                    <Input value={b.text} onChange={(e) => updateBlock(b.id, { text: e.target.value } as any)} />
                    <Select value={String(b.level)} onValueChange={(v) => updateBlock(b.id, { level: Number(v) as 1 | 2 | 3 } as any)}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">H1 (Besar)</SelectItem>
                        <SelectItem value="2">H2 (Sedang)</SelectItem>
                        <SelectItem value="3">H3 (Kecil)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {b.type === "paragraph" && (
                  <Textarea rows={4} value={b.text} onChange={(e) => updateBlock(b.id, { text: e.target.value } as any)} />
                )}
                {b.type === "image" && (
                  <div className="space-y-3">
                    {b.url ? (
                      <img src={b.url} alt="" className="max-h-48 rounded border" />
                    ) : (
                      <div className="h-32 border-2 border-dashed rounded flex items-center justify-center text-xs text-muted-foreground">Belum ada gambar</div>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <label className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm cursor-pointer hover:bg-muted">
                        <Upload className="h-4 w-4" />
                        {uploadingId === b.id ? "Mengunggah..." : "Unggah Gambar"}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const f = e.target.files?.[0]; if (f) uploadImage(b.id, f);
                        }} />
                      </label>
                      <Input placeholder="atau URL gambar" value={b.url} onChange={(e) => updateBlock(b.id, { url: e.target.value } as any)} className="flex-1 min-w-[180px]" />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Posisi</Label>
                        <Select value={b.position} onValueChange={(v) => updateBlock(b.id, { position: v as any } as any)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Kiri (wrap teks)</SelectItem>
                            <SelectItem value="right">Kanan (wrap teks)</SelectItem>
                            <SelectItem value="center">Tengah</SelectItem>
                            <SelectItem value="full">Lebar Penuh</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Lebar (%)</Label>
                        <Input type="number" min={10} max={100} value={b.width ?? 100} onChange={(e) => updateBlock(b.id, { width: Number(e.target.value) } as any)} />
                      </div>
                      <div>
                        <Label className="text-xs">Alt / Keterangan</Label>
                        <Input value={b.caption || ""} onChange={(e) => updateBlock(b.id, { caption: e.target.value, alt: e.target.value } as any)} />
                      </div>
                    </div>
                  </div>
                )}
                {b.type === "button" && (
                  <div className="grid sm:grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Label</Label>
                      <Input value={b.label} onChange={(e) => updateBlock(b.id, { label: e.target.value } as any)} />
                    </div>
                    <div>
                      <Label className="text-xs">URL</Label>
                      <Input value={b.url} onChange={(e) => updateBlock(b.id, { url: e.target.value } as any)} />
                    </div>
                  </div>
                )}
                {b.type === "divider" && <div className="border-t my-2" />}
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl bg-card shadow-card p-5 space-y-3">
            <h2 className="font-semibold text-sm">Pengaturan</h2>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Terbitkan</Label>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
          </div>

          <div className="rounded-xl bg-card shadow-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">Menu Navigasi</h2>
              <Switch checked={addToMenu} onCheckedChange={(v) => { setAddToMenu(v); setShowInMenu(v); }} />
            </div>
            <p className="text-xs text-muted-foreground">Tambahkan halaman ini ke menu header & footer.</p>
            {addToMenu && (
              <div className="space-y-3 pt-2">
                <div>
                  <Label className="text-xs">Label Menu</Label>
                  <Input value={menuLabel} onChange={(e) => setMenuLabel(e.target.value)} placeholder="Nama yang tampil di menu" />
                </div>
                <div>
                  <Label className="text-xs">Menu Induk (opsional)</Label>
                  <Select value={menuParentId} onValueChange={setMenuParentId}>
                    <SelectTrigger><SelectValue placeholder="Menu utama" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Menu utama —</SelectItem>
                      {menuParents.map((m: any) => (
                        <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Pilih untuk menjadi sub-menu.</p>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Buka di tab baru</Label>
                  <Switch checked={menuOpenNewTab} onCheckedChange={setMenuOpenNewTab} />
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-muted/40 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Tips</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Posisi <b>Kiri/Kanan</b> membuat teks membungkus gambar.</li>
              <li>Ukuran gambar maks 1MB, otomatis dikompres jika melebihi.</li>
              <li>URL halaman dapat ditambahkan ke navigasi di menu Website.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}