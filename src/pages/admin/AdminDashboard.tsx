import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper, Trophy, Handshake, MessageSquare, Camera, Eye, Users, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--chart-3, 150 60% 40%))", "hsl(var(--chart-4, 40 80% 55%))", "hsl(var(--chart-5, 200 70% 50%))"];

export default function AdminDashboard() {
  const { data: newsCount = 0 } = useQuery({
    queryKey: ["admin-news-count"],
    queryFn: async () => {
      const { count } = await supabase.from("news").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: achievementsCount = 0 } = useQuery({
    queryKey: ["admin-achievements-count"],
    queryFn: async () => {
      const { count } = await supabase.from("achievements").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: partnershipsCount = 0 } = useQuery({
    queryKey: ["admin-partnerships-count"],
    queryFn: async () => {
      const { count } = await supabase.from("partnerships").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: messagesCount = 0 } = useQuery({
    queryKey: ["admin-messages-count"],
    queryFn: async () => {
      const { count } = await supabase.from("contact_messages").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["admin-unread-count"],
    queryFn: async () => {
      const { count } = await supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("is_read", false);
      return count || 0;
    },
  });

  const { data: albumsCount = 0 } = useQuery({
    queryKey: ["admin-albums-count"],
    queryFn: async () => {
      const { count } = await supabase.from("gallery_albums").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: photosCount = 0 } = useQuery({
    queryKey: ["admin-photos-count"],
    queryFn: async () => {
      const { count } = await supabase.from("gallery_photos").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: programsCount = 0 } = useQuery({
    queryKey: ["admin-programs-count"],
    queryFn: async () => {
      const { count } = await supabase.from("programs").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: slidesCount = 0 } = useQuery({
    queryKey: ["admin-slides-count"],
    queryFn: async () => {
      const { count } = await supabase.from("hero_slides").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  // News by category
  const { data: newsByCategory = [] } = useQuery({
    queryKey: ["admin-news-by-category"],
    queryFn: async () => {
      const { data } = await supabase.from("news").select("category");
      if (!data) return [];
      const counts: Record<string, number> = {};
      data.forEach((n) => {
        const cat = n.category || "Lainnya";
        counts[cat] = (counts[cat] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name: name === "berita" ? "Berita" : name === "pengumuman" ? "Pengumuman" : name, value }));
    },
  });

  // Messages per month (last 6 months)
  const { data: messagesPerMonth = [] } = useQuery({
    queryKey: ["admin-messages-per-month"],
    queryFn: async () => {
      const { data } = await supabase.from("contact_messages").select("created_at").order("created_at", { ascending: true });
      if (!data || data.length === 0) return [];
      const months: Record<string, number> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        months[key] = 0;
      }
      data.forEach((m) => {
        const d = new Date(m.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (key in months) months[key]++;
      });
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
      return Object.entries(months).map(([key, count]) => ({
        name: monthNames[parseInt(key.split("-")[1]) - 1],
        pesan: count,
      }));
    },
  });

  // Content published per month
  const { data: contentPerMonth = [] } = useQuery({
    queryKey: ["admin-content-per-month"],
    queryFn: async () => {
      const [newsRes, achievRes] = await Promise.all([
        supabase.from("news").select("published_at").eq("is_published", true),
        supabase.from("achievements").select("achievement_date").eq("is_published", true),
      ]);
      const months: Record<string, { berita: number; prestasi: number }> = {};
      const now = new Date();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        months[key] = { berita: 0, prestasi: 0 };
      }
      newsRes.data?.forEach((n) => {
        if (!n.published_at) return;
        const d = new Date(n.published_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (key in months) months[key].berita++;
      });
      achievRes.data?.forEach((a) => {
        if (!a.achievement_date) return;
        const d = new Date(a.achievement_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (key in months) months[key].prestasi++;
      });
      return Object.entries(months).map(([key, val]) => ({
        name: monthNames[parseInt(key.split("-")[1]) - 1],
        ...val,
      }));
    },
  });

  const stats = [
    { label: "Berita & Pengumuman", value: newsCount, icon: Newspaper, color: "text-primary" },
    { label: "Prestasi", value: achievementsCount, icon: Trophy, color: "text-accent" },
    { label: "Mitra Industri", value: partnershipsCount, icon: Handshake, color: "text-primary" },
    { label: "Pesan Masuk", value: messagesCount, icon: MessageSquare, color: "text-destructive", sub: unreadCount > 0 ? `${unreadCount} belum dibaca` : undefined },
    { label: "Album / Foto", value: `${albumsCount} / ${photosCount}`, icon: Camera, color: "text-primary" },
    { label: "Jurusan", value: programsCount, icon: Users, color: "text-accent" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="rounded-xl bg-card border p-4 sm:p-6">
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${color} mb-2`} />
            <p className="text-2xl sm:text-3xl font-bold tabular-nums">{value}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
            {sub && <p className="text-xs text-destructive mt-1">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Content per Month */}
        <Card>
          <CardHeader className="pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
            <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Konten per Bulan
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-4 pb-4">
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contentPerMonth} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="berita" name="Berita" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="prestasi" name="Prestasi" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Messages per Month */}
        <Card>
          <CardHeader className="pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
            <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Pesan Masuk per Bulan
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-4 pb-4">
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={messagesPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="pesan" name="Pesan" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* News by Category Pie */}
        <Card>
          <CardHeader className="pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
            <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-primary" />
              Berita per Kategori
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-4 pb-4">
            <div className="h-48 sm:h-64 flex items-center justify-center">
              {newsByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={newsByCategory} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                      {newsByCategory.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Summary */}
        <Card>
          <CardHeader className="pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
            <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Ringkasan
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 space-y-3">
            {[
              { label: "Total Slide Hero", value: slidesCount },
              { label: "Album Galeri", value: albumsCount },
              { label: "Total Foto", value: photosCount },
              { label: "Jurusan Aktif", value: programsCount },
              { label: "Pesan Belum Dibaca", value: unreadCount, highlight: unreadCount > 0 },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between border-b pb-2 last:border-0">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className={`text-sm font-semibold tabular-nums ${item.highlight ? "text-destructive" : ""}`}>{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
