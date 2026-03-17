import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { applyTheme, DEFAULT_THEME_ID } from "@/lib/themes";

export function useTheme() {
  const { data: themeId } = useQuery({
    queryKey: ["site-theme"],
    queryFn: async () => {
      const { data } = await supabase
        .from("school_info")
        .select("value")
        .eq("key", "site_theme")
        .maybeSingle();
      return data?.value || DEFAULT_THEME_ID;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    applyTheme(themeId || DEFAULT_THEME_ID);
  }, [themeId]);

  return themeId || DEFAULT_THEME_ID;
}
