import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { themes, DEFAULT_THEME_ID } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import { Check, Palette } from "lucide-react";
import { toast } from "sonner";

export default function ThemeSelector() {
  const queryClient = useQueryClient();

  const { data: currentTheme = DEFAULT_THEME_ID } = useQuery({
    queryKey: ["site-theme"],
    queryFn: async () => {
      const { data } = await supabase
        .from("school_info")
        .select("value")
        .eq("key", "site_theme")
        .maybeSingle();
      return data?.value || DEFAULT_THEME_ID;
    },
  });

  const [selected, setSelected] = useState<string | null>(null);
  const activeTheme = selected ?? currentTheme;

  const saveMutation = useMutation({
    mutationFn: async (themeId: string) => {
      const { data: existing } = await supabase
        .from("school_info")
        .select("id")
        .eq("key", "site_theme")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("school_info")
          .update({ value: themeId })
          .eq("key", "site_theme");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("school_info")
          .insert({ key: "site_theme", value: themeId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-theme"] });
      toast.success("Tema berhasil diubah");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Palette className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Tema Warna Website</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {themes.map((theme) => {
          const isActive = activeTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => setSelected(theme.id)}
              className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                isActive
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              {isActive && (
                <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
              )}
              <div className="flex gap-1.5 mb-3">
                {theme.preview.map((color, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border border-black/10"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="font-semibold text-sm">{theme.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{theme.description}</p>
            </button>
          );
        })}
      </div>
      {selected && selected !== currentTheme && (
        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => saveMutation.mutate(selected)}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "Menyimpan..." : "Terapkan Tema"}
          </Button>
          <Button variant="outline" onClick={() => setSelected(null)}>
            Batal
          </Button>
        </div>
      )}
    </div>
  );
}
