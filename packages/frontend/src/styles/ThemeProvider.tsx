import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeContext } from "./ThemeContext";
import { defaultTheme, isTheme, type Theme } from "./theme";

const storageKey = "cctv-theme";

type ThemeProviderProps = {
  children: ReactNode;
};

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return defaultTheme;
  }

  const storedTheme = window.localStorage.getItem(storageKey);

  return storedTheme && isTheme(storedTheme) ? storedTheme : defaultTheme;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(storageKey, theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
