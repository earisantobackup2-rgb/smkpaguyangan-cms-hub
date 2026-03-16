import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper, Trophy, Handshake } from "lucide-react";

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

  const stats = [
    { label: "Total Berita", value: newsCount, icon: Newspaper, color: "text-primary" },
    { label: "Total Prestasi", value: achievementsCount, icon: Trophy, color: "text-accent" },
    { label: "Mitra Industri", value: partnershipsCount, icon: Handshake, color: "text-primary" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl bg-card shadow-card p-6">
            <Icon className={`h-6 w-6 ${color} mb-2`} />
            <p className="text-3xl font-bold tabular-nums">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
