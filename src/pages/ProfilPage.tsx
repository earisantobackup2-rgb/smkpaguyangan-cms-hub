import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { getPage, getSchoolInfo } from "@/lib/supabase-helpers";

export default function ProfilPage() {
  const { data: schoolInfo = {} } = useQuery({ queryKey: ["schoolInfo"], queryFn: getSchoolInfo });
  const { data: visiMisi } = useQuery({ queryKey: ["page-visi-misi"], queryFn: () => getPage("visi-misi") });
  const { data: sejarah } = useQuery({ queryKey: ["page-sejarah"], queryFn: () => getPage("sejarah") });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Profil Sekolah</h1>

        <div className="grid gap-8 md:grid-cols-2 mb-12">
          <div className="rounded-xl bg-card shadow-card p-6">
            <h2 className="text-xl font-bold mb-4">Data Sekolah</h2>
            <dl className="space-y-3 text-sm">
              {[
                ["Nama", schoolInfo.school_name],
                ["Alamat", schoolInfo.address],
                ["Telepon", schoolInfo.phone],
                ["Email", schoolInfo.email],
                ["Akreditasi", schoolInfo.accreditation],
                ["Tahun Berdiri", schoolInfo.established_year],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium text-foreground">{value || "-"}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="space-y-6">
            {visiMisi && (
              <div className="rounded-xl bg-card shadow-card p-6">
                <h2 className="text-xl font-bold mb-3">{visiMisi.title}</h2>
                <div className="text-sm text-muted-foreground whitespace-pre-line max-w-prose text-pretty">
                  {visiMisi.content}
                </div>
              </div>
            )}
          </div>
        </div>

        {sejarah && (
          <div className="rounded-xl bg-card shadow-card p-6">
            <h2 className="text-xl font-bold mb-3">{sejarah.title}</h2>
            <div className="text-sm text-muted-foreground whitespace-pre-line max-w-prose text-pretty">
              {sejarah.content}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
