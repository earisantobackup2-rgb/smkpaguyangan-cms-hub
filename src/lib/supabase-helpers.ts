import { supabase } from "@/integrations/supabase/client";

export async function getPublishedNews(limit = 10) {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getPublishedAchievements(limit = 10) {
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .eq("is_published", true)
    .order("achievement_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getActivePartnerships() {
  const { data, error } = await supabase
    .from("partnerships")
    .select("*")
    .eq("is_active", true);
  if (error) throw error;
  return data;
}

export async function getPage(slug: string) {
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getSchoolInfo() {
  const { data, error } = await supabase.from("school_info").select("*");
  if (error) throw error;
  const map: Record<string, string> = {};
  data?.forEach((item) => {
    map[item.key] = item.value || "";
  });
  return map;
}

export async function uploadFile(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from("uploads")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(data.path);
  return urlData.publicUrl;
}
