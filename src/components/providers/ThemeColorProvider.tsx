"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  type ColorTheme,
  COLOR_THEME_STORAGE_KEY,
} from "@/lib/theme-colors";

interface ThemeColorContextValue {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ThemeColorContext = createContext<ThemeColorContextValue>({
  colorTheme: "default",
  setColorTheme: () => {},
});

export function useColorTheme() {
  return useContext(ThemeColorContext);
}

export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>("default");

  useEffect(() => {
    const saved = localStorage.getItem(COLOR_THEME_STORAGE_KEY) as ColorTheme | null;
    if (saved) {
      setColorThemeState(saved);
      applyTheme(saved);
    }
  }, []);

  const setColorTheme = useCallback((theme: ColorTheme) => {
    setColorThemeState(theme);
    applyTheme(theme);
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, theme);
  }, []);

  return (
    <ThemeColorContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ThemeColorContext.Provider>
  );
}

function applyTheme(theme: ColorTheme) {
  const html = document.documentElement;
  if (theme === "default") {
    html.removeAttribute("data-color-theme");
  } else {
    html.setAttribute("data-color-theme", theme);
  }
}
