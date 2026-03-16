import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/public/Navbar";
import HeroSection from "@/components/public/HeroSection";
import NewsSection from "@/components/public/NewsSection";
import AchievementsSection from "@/components/public/AchievementsSection";
import PartnershipsSection from "@/components/public/PartnershipsSection";
import InstagramSection from "@/components/public/InstagramSection";
import Footer from "@/components/public/Footer";
import { getPublishedNews, getPublishedAchievements, getActivePartnerships, getSchoolInfo } from "@/lib/supabase-helpers";

const Index = () => {
  const { data: schoolInfo = {} } = useQuery({
    queryKey: ["schoolInfo"],
    queryFn: getSchoolInfo,
  });
  const { data: news = [] } = useQuery({
    queryKey: ["news"],
    queryFn: () => getPublishedNews(6),
  });
  const { data: achievements = [] } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => getPublishedAchievements(6),
  });
  const { data: partnerships = [] } = useQuery({
    queryKey: ["partnerships"],
    queryFn: getActivePartnerships,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection schoolInfo={schoolInfo} />
      <NewsSection news={news} />
      <AchievementsSection achievements={achievements} />
      <PartnershipsSection partnerships={partnerships} />
      <InstagramSection instagramUrl={schoolInfo.instagram_url} />
      <Footer />
    </div>
  );
};

export default Index;
