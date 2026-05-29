import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "administrator" | "admin" | null;

export function useUserRole() {
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchRole = async (userId: string | undefined) => {
      if (!userId) {
        if (mounted) { setRole(null); setLoading(false); }
        return;
      }
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      if (mounted) {
        if (error) console.error("useUserRole fetch error:", error);
        const roles = (data ?? []).map((r: any) => r.role as AppRole);
        const resolved: AppRole = roles.includes("administrator")
          ? "administrator"
          : roles.includes("admin")
            ? "admin"
            : null;
        setRole(resolved);
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      fetchRole(data.session?.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      fetchRole(session?.user.id);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  return { role, loading, isAdministrator: role === "administrator", isAdmin: role === "admin" };
}