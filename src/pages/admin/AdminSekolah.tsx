import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import ThemeSelector from "@/components/admin/ThemeSelector";

const FIELDS = [
  { key: "school_name", label: "Nama Sekolah" },
  { key: "address", label: "Alamat" },
  { key: "phone", label: "Telepon" },
  { key: "email", label: "Email" },
  { key: "accreditation", label: "Akreditasi" },
  { key: "established_year", label: "Tahun Berdiri" },
  { key: "total_students", label: "Total Siswa" },
  { key: "total_partners", label: "Total Mitra" },
  { key: "total_alumni", label: "Total Alumni" },
  { key: "total_programs", label: "Jumlah Program Keahlian" },
  { key: "instagram_url", label: "URL Instagram" },
];

export default function AdminSekolah() {
  const queryClient = useQueryClient();
  const { data: infoList = [] } = useQuery({
    queryKey: ["admin-school-info"],
    queryFn: async () => {
      const { data } = await supabase.from("school_info").select("*");
      return data || [];
    },
  });

  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    const map: Record<string, string> = {};
    infoList.forEach((item) => { map[item.key] = item.value || ""; });
    setFormData(map);
  }, [infoList]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      for (const field of FIELDS) {
        const existing = infoList.find((i) => i.key === field.key);
        if (existing) {
          await supabase.from("school_info").update({ value: formData[field.key] || "" }).eq("id", existing.id);
        } else {
          await supabase.from("school_info").insert({ key: field.key, value: formData[field.key] || "" });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-school-info"] });
      toast.success("Data sekolah diperbarui");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Data Sekolah</h1>
      <div className="rounded-xl bg-card shadow-card p-6 space-y-4 max-w-2xl">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <Label>{field.label}</Label>
            <Input
              value={formData[field.key] || ""}
              onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
            />
          </div>
        ))}
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Menyimpan..." : "Simpan Semua"}
        </Button>
      </div>

      <div className="rounded-xl bg-card shadow-card p-6 max-w-2xl mt-6">
        <ThemeSelector />
      </div>
    </div>
  );
}
