import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Bot,
  Plus,
  Trash2,
  Edit,
  Globe,
  Loader2,
  Save,
  MessageSquare,
  Settings as SettingsIcon,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

type KB = {
  id: string;
  title: string;
  content: string;
  source_url: string | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
};

type Settings = {
  id: string;
  is_enabled: boolean;
  position: string;
  primary_color: string;
  bot_name: string;
  welcome_message: string;
  placeholder_text: string;
  offset_x: number;
  offset_y: number;
};

const emptyKB = { title: "", content: "", source_url: "", category: "general", is_active: true };

export default function AdminChatbot() {
  const qc = useQueryClient();

  /* ============ KNOWLEDGE BASE ============ */
  const { data: kbList = [] } = useQuery({
    queryKey: ["chatbot-kb"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbot_knowledge")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as KB[];
    },
  });

  const [kbDialogOpen, setKbDialogOpen] = useState(false);
  const [kbEditing, setKbEditing] = useState<KB | null>(null);
  const [kbForm, setKbForm] = useState<any>(emptyKB);

  const openKbDialog = (item?: KB) => {
    if (item) {
      setKbEditing(item);
      setKbForm({
        title: item.title,
        content: item.content,
        source_url: item.source_url || "",
        category: item.category || "general",
        is_active: item.is_active,
      });
    } else {
      setKbEditing(null);
      setKbForm(emptyKB);
    }
    setKbDialogOpen(true);
  };

  const saveKb = async () => {
    if (!kbForm.title.trim() || !kbForm.content.trim()) {
      toast.error("Judul dan konten wajib diisi");
      return;
    }
    const payload = {
      title: kbForm.title.trim(),
      content: kbForm.content.trim(),
      source_url: kbForm.source_url?.trim() || null,
      category: kbForm.category || "general",
      is_active: kbForm.is_active,
    };
    const { error } = kbEditing
      ? await supabase.from("chatbot_knowledge").update(payload).eq("id", kbEditing.id)
      : await supabase.from("chatbot_knowledge").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(kbEditing ? "Knowledge diperbarui" : "Knowledge ditambahkan");
    setKbDialogOpen(false);
    qc.invalidateQueries({ queryKey: ["chatbot-kb"] });
  };

  const deleteKb = async (id: string) => {
    if (!confirm("Hapus knowledge ini?")) return;
    const { error } = await supabase.from("chatbot_knowledge").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Dihapus");
    qc.invalidateQueries({ queryKey: ["chatbot-kb"] });
  };

  const toggleKb = async (item: KB) => {
    const { error } = await supabase
      .from("chatbot_knowledge")
      .update({ is_active: !item.is_active })
      .eq("id", item.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["chatbot-kb"] });
  };

  /* ============ CRAWL ============ */
  const [crawlUrl, setCrawlUrl] = useState(window.location.origin);
  const [crawlMax, setCrawlMax] = useState(8);
  const [crawlCategory, setCrawlCategory] = useState("crawled");
  const [crawling, setCrawling] = useState(false);

  const startCrawl = async () => {
    if (!crawlUrl.trim()) return;
    setCrawling(true);
    try {
      const { data, error } = await supabase.functions.invoke("chatbot-crawl", {
        body: { url: crawlUrl.trim(), maxPages: crawlMax, category: crawlCategory },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Berhasil crawl ${data.pagesCrawled} halaman, ${data.inserted} disimpan`);
      qc.invalidateQueries({ queryKey: ["chatbot-kb"] });
    } catch (e: any) {
      toast.error("Gagal crawl: " + (e.message || e));
    } finally {
      setCrawling(false);
    }
  };

  /* ============ SETTINGS ============ */
  const { data: settings } = useQuery({
    queryKey: ["chatbot-settings-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbot_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Settings | null;
    },
  });

  const [setForm, setSetForm] = useState<Settings | null>(null);
  useEffect(() => {
    if (settings) setSetForm(settings);
  }, [settings]);

  const saveSettings = async () => {
    if (!setForm) return;
    const { error } = await supabase
      .from("chatbot_settings")
      .update({
        is_enabled: setForm.is_enabled,
        position: setForm.position,
        primary_color: setForm.primary_color,
        bot_name: setForm.bot_name,
        welcome_message: setForm.welcome_message,
        placeholder_text: setForm.placeholder_text,
        offset_x: setForm.offset_x,
        offset_y: setForm.offset_y,
      })
      .eq("id", setForm.id);
    if (error) return toast.error(error.message);
    toast.success("Pengaturan disimpan");
    qc.invalidateQueries({ queryKey: ["chatbot-settings-admin"] });
    qc.invalidateQueries({ queryKey: ["chatbot-settings"] });
  };

  /* ============ CONVERSATIONS ============ */
  const { data: convs = [] } = useQuery({
    queryKey: ["chatbot-convs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbot_conversations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-heading">Chatbot AI</h1>
          <p className="text-sm text-muted-foreground">
            Kelola knowledge base, pengaturan widget, dan riwayat percakapan
          </p>
        </div>
      </div>

      <Tabs defaultValue="knowledge" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="knowledge" className="gap-2">
            <BookOpen className="h-4 w-4" /> <span className="hidden sm:inline">Knowledge</span>
          </TabsTrigger>
          <TabsTrigger value="crawl" className="gap-2">
            <Globe className="h-4 w-4" /> <span className="hidden sm:inline">Crawl</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <SettingsIcon className="h-4 w-4" /> <span className="hidden sm:inline">Pengaturan</span>
          </TabsTrigger>
          <TabsTrigger value="conversations" className="gap-2">
            <MessageSquare className="h-4 w-4" /> <span className="hidden sm:inline">Percakapan</span>
          </TabsTrigger>
        </TabsList>

        {/* KNOWLEDGE */}
        <TabsContent value="knowledge" className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{kbList.length} entri knowledge</p>
            <Button onClick={() => openKbDialog()} size="sm">
              <Plus className="mr-1 h-4 w-4" /> Tambah
            </Button>
          </div>
          <div className="space-y-2">
            {kbList.map((item) => (
              <Card key={item.id} className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase">
                        {item.category}
                      </span>
                      {!item.is_active && (
                        <span className="rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-[10px]">
                          Nonaktif
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {item.content}
                    </p>
                    {item.source_url && (
                      <p className="mt-1 text-[11px] text-primary truncate">
                        🔗 {item.source_url}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Switch checked={item.is_active} onCheckedChange={() => toggleKb(item)} />
                    <Button size="icon" variant="ghost" onClick={() => openKbDialog(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteKb(item.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {kbList.length === 0 && (
              <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                Belum ada knowledge. Tambahkan manual atau crawl website.
              </p>
            )}
          </div>
        </TabsContent>

        {/* CRAWL */}
        <TabsContent value="crawl">
          <Card className="p-4 space-y-4 max-w-2xl">
            <div className="space-y-1">
              <h3 className="font-semibold">Crawl Website</h3>
              <p className="text-xs text-muted-foreground">
                Bot akan mengunjungi halaman pada domain yang sama dan menyimpan konten teks ke knowledge base.
              </p>
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={crawlUrl}
                onChange={(e) => setCrawlUrl(e.target.value)}
                placeholder="https://contoh-sekolah.sch.id"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Maks halaman</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={crawlMax}
                  onChange={(e) => setCrawlMax(parseInt(e.target.value) || 5)}
                />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Input
                  value={crawlCategory}
                  onChange={(e) => setCrawlCategory(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={startCrawl} disabled={crawling} className="w-full">
              {crawling ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sedang crawling...</>
              ) : (
                <><Globe className="mr-2 h-4 w-4" /> Mulai Crawl</>
              )}
            </Button>
          </Card>
        </TabsContent>

        {/* SETTINGS */}
        <TabsContent value="settings">
          {setForm && (
            <Card className="p-4 space-y-4 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Aktifkan Chatbot</h3>
                  <p className="text-xs text-muted-foreground">
                    Tampilkan widget pada seluruh halaman publik
                  </p>
                </div>
                <Switch
                  checked={setForm.is_enabled}
                  onCheckedChange={(v) => setSetForm({ ...setForm, is_enabled: v })}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nama Bot</Label>
                  <Input
                    value={setForm.bot_name}
                    onChange={(e) => setSetForm({ ...setForm, bot_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Warna Utama</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={setForm.primary_color}
                      onChange={(e) => setSetForm({ ...setForm, primary_color: e.target.value })}
                      className="w-16 p-1 h-10"
                    />
                    <Input
                      value={setForm.primary_color}
                      onChange={(e) => setSetForm({ ...setForm, primary_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Posisi Widget</Label>
                <Select
                  value={setForm.position}
                  onValueChange={(v) => setSetForm({ ...setForm, position: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">Kanan Bawah</SelectItem>
                    <SelectItem value="bottom-left">Kiri Bawah</SelectItem>
                    <SelectItem value="top-right">Kanan Atas</SelectItem>
                    <SelectItem value="top-left">Kiri Atas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Offset Horizontal (px)</Label>
                  <Input
                    type="number"
                    value={setForm.offset_x}
                    onChange={(e) => setSetForm({ ...setForm, offset_x: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Offset Vertikal (px)</Label>
                  <Input
                    type="number"
                    value={setForm.offset_y}
                    onChange={(e) => setSetForm({ ...setForm, offset_y: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pesan Sambutan</Label>
                <Textarea
                  rows={3}
                  value={setForm.welcome_message}
                  onChange={(e) => setSetForm({ ...setForm, welcome_message: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Placeholder Input</Label>
                <Input
                  value={setForm.placeholder_text}
                  onChange={(e) => setSetForm({ ...setForm, placeholder_text: e.target.value })}
                />
              </div>

              <Button onClick={saveSettings} className="w-full">
                <Save className="mr-2 h-4 w-4" /> Simpan Pengaturan
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* CONVERSATIONS */}
        <TabsContent value="conversations" className="space-y-2">
          <p className="text-sm text-muted-foreground">{convs.length} percakapan terbaru</p>
          {convs.map((c: any) => (
            <Card key={c.id} className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  {new Date(c.created_at).toLocaleString("id-ID")}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {c.session_id.slice(0, 8)}
                </span>
              </div>
              <div className="rounded-lg bg-muted/50 p-2 text-xs">
                <span className="font-semibold">Pengguna:</span> {c.user_message}
              </div>
              <div className="rounded-lg bg-primary/5 p-2 text-xs">
                <span className="font-semibold">Bot:</span> {c.bot_response}
              </div>
            </Card>
          ))}
          {convs.length === 0 && (
            <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              Belum ada percakapan.
            </p>
          )}
        </TabsContent>
      </Tabs>

      {/* KB Dialog */}
      <Dialog open={kbDialogOpen} onOpenChange={setKbDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{kbEditing ? "Edit Knowledge" : "Tambah Knowledge"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input
                value={kbForm.title}
                onChange={(e) => setKbForm({ ...kbForm, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Input
                  value={kbForm.category}
                  onChange={(e) => setKbForm({ ...kbForm, category: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Source URL (opsional)</Label>
                <Input
                  value={kbForm.source_url}
                  onChange={(e) => setKbForm({ ...kbForm, source_url: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Konten</Label>
              <Textarea
                rows={8}
                value={kbForm.content}
                onChange={(e) => setKbForm({ ...kbForm, content: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border p-2">
              <Label>Aktif</Label>
              <Switch
                checked={kbForm.is_active}
                onCheckedChange={(v) => setKbForm({ ...kbForm, is_active: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKbDialogOpen(false)}>Batal</Button>
            <Button onClick={saveKb}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
