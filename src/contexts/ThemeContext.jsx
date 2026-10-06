import React, { createContext, useContext, useState, useLayoutEffect, useCallback } from "react";

const THEME_STORAGE_KEY = "site_theme";
const DEFAULT_THEME = "dark";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "light" || saved === "dark") {
        return saved;
      }
    } catch {
      // Ignore localStorage errors
    }
    return DEFAULT_THEME;
  });

  const applyTheme = useCallback((targetTheme) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", targetTheme);
    root.classList.remove("theme-dark", "theme-light");
    root.classList.add(targetTheme === "light" ? "theme-light" : "theme-dark");

    // Clean up any stale inline color overrides on root.style that would block CSS tokens
    root.style.removeProperty("--color-background");
    root.style.removeProperty("--color-card");
    root.style.removeProperty("--color-surface");
    root.style.removeProperty("--color-text");
  }, []);

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Ignore localStorage error
      }
      applyTheme(next);
      return next;
    });
  }, [applyTheme]);

  const setExplicitTheme = useCallback((newTheme) => {
    if (newTheme !== "light" && newTheme !== "dark") return;
    setTheme(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignore
    }
    applyTheme(newTheme);
  }, [applyTheme]);

  const value = {
    theme,
    isDark: theme === "dark",
    isLight: theme === "light",
    toggleTheme,
    setTheme: setExplicitTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export default ThemeContext;
