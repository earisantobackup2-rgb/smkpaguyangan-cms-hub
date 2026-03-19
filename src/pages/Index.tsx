import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/public/Navbar";
import HeroSection from "@/components/public/HeroSection";
import ProgramsSection from "@/components/public/ProgramsSection";
import HomeSearchSection from "@/components/public/HomeSearchSection";
import PartnershipsSection from "@/components/public/PartnershipsSection";
import InstagramSection from "@/components/public/InstagramSection";
import Footer from "@/components/public/Footer";
import { getActivePartnerships, getSchoolInfo } from "@/lib/supabase-helpers";

const Index = () => {
  const { data: schoolInfo = {} } = useQuery({
    queryKey: ["schoolInfo"],
    queryFn: getSchoolInfo,
  });
  const { data: partnerships = [] } = useQuery({
    queryKey: ["partnerships"],
    queryFn: getActivePartnerships,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection schoolInfo={schoolInfo} />
      <ProgramsSection />
      <HomeSearchSection />
      <PartnershipsSection partnerships={partnerships} />
      <InstagramSection instagramUrl={schoolInfo.instagram_url} />

      {/* Google Maps */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-10">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
              📍 Lokasi
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Lokasi Sekolah</h2>
            <p className="text-muted-foreground mt-2">Kunjungi kami di alamat berikut</p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-card">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.0!2d109.15!3d-7.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMTInMDAuMCJTIDEwOcKwMDknMDAuMCJF!5e0!3m2!1sid!2sid!4v1"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi SMK Muhammadiyah 1 Paguyangan"
            />
          </div>
          <div className="text-center mt-4">
            <a
              href="https://maps.app.goo.gl/JdKsLyC3esb3vQD4A"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Buka di Google Maps
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
