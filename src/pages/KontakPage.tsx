import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { MapPin, Phone, Mail } from "lucide-react";
import { getSchoolInfo } from "@/lib/supabase-helpers";

export default function KontakPage() {
  const { data: info = {} } = useQuery({ queryKey: ["schoolInfo"], queryFn: getSchoolInfo });

  const items = [
    { icon: MapPin, label: "Alamat", value: info.address || "-" },
    { icon: Phone, label: "Telepon", value: info.phone || "-" },
    { icon: Mail, label: "Email", value: info.email || "-" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Kontak</h1>
        <div className="grid gap-6 sm:grid-cols-3 max-w-3xl">
          {items.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl bg-card shadow-card p-6 text-center">
              <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-sm mb-1">{label}</h3>
              <p className="text-sm text-muted-foreground">{value}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
