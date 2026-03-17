export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  preview: string[]; // 4 colors for preview swatches
  variables: Record<string, string>;
}

export const themes: ThemeDefinition[] = [
  {
    id: "green-white-gold",
    name: "Hijau Putih Emas",
    description: "Tema korporat elegan dengan hijau, putih, dan sentuhan kuning emas",
    preview: ["#0d7a4a", "#ffffff", "#d4a017", "#f8f9fa"],
    variables: {
      "--background": "0 0% 100%",
      "--foreground": "222 47% 11%",
      "--card": "0 0% 100%",
      "--card-foreground": "222 47% 11%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "222 47% 11%",
      "--primary": "162 82% 24%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "210 20% 98%",
      "--secondary-foreground": "222 47% 11%",
      "--muted": "210 20% 96%",
      "--muted-foreground": "215 16% 47%",
      "--accent": "45 92% 50%",
      "--accent-foreground": "222 47% 11%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "214 32% 91%",
      "--input": "214 32% 91%",
      "--ring": "162 82% 24%",
    },
  },
  {
    id: "green-brown-elegant",
    name: "Hijau Coklat Elegan",
    description: "Tema elegan korporat dengan gradasi hijau, coklat mewah, dan putih",
    preview: ["#1a6b3c", "#6b4226", "#f5f0e8", "#c8a96e"],
    variables: {
      "--background": "36 33% 97%",
      "--foreground": "24 30% 14%",
      "--card": "36 30% 99%",
      "--card-foreground": "24 30% 14%",
      "--popover": "36 30% 99%",
      "--popover-foreground": "24 30% 14%",
      "--primary": "150 60% 26%",
      "--primary-foreground": "36 33% 97%",
      "--secondary": "36 25% 93%",
      "--secondary-foreground": "24 30% 14%",
      "--muted": "30 18% 92%",
      "--muted-foreground": "24 12% 48%",
      "--accent": "36 52% 48%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "30 20% 88%",
      "--input": "30 20% 88%",
      "--ring": "150 60% 26%",
    },
  },
  {
    id: "blue-white-gold",
    name: "Biru Putih Kuning",
    description: "Tema korporat elegan dengan biru cerah, putih bersih, dan aksen kuning",
    preview: ["#1e6fbf", "#ffffff", "#e6a817", "#f0f4f8"],
    variables: {
      "--background": "0 0% 100%",
      "--foreground": "215 40% 12%",
      "--card": "0 0% 100%",
      "--card-foreground": "215 40% 12%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "215 40% 12%",
      "--primary": "210 72% 44%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "210 30% 97%",
      "--secondary-foreground": "215 40% 12%",
      "--muted": "210 25% 95%",
      "--muted-foreground": "215 16% 47%",
      "--accent": "42 85% 50%",
      "--accent-foreground": "215 40% 12%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "210 30% 90%",
      "--input": "210 30% 90%",
      "--ring": "210 72% 44%",
    },
  },
  {
    id: "navy-bright-blue",
    name: "Biru Navy Modern",
    description: "Tema korporat dengan biru navy, putih, kuning, dan biru cerah",
    preview: ["#1a2744", "#ffffff", "#e6a817", "#3b82f6"],
    variables: {
      "--background": "220 20% 98%",
      "--foreground": "220 40% 16%",
      "--card": "0 0% 100%",
      "--card-foreground": "220 40% 16%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "220 40% 16%",
      "--primary": "222 55% 18%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "214 30% 95%",
      "--secondary-foreground": "220 40% 16%",
      "--muted": "214 25% 93%",
      "--muted-foreground": "215 16% 47%",
      "--accent": "217 91% 60%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "214 30% 90%",
      "--input": "214 30% 90%",
      "--ring": "222 55% 18%",
    },
  },
];

export const DEFAULT_THEME_ID = "green-white-gold";

export function getThemeById(id: string): ThemeDefinition {
  return themes.find((t) => t.id === id) || themes[0];
}

export function applyTheme(themeId: string) {
  const theme = getThemeById(themeId);
  const root = document.documentElement;
  Object.entries(theme.variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
