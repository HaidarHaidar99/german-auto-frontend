import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import settingsService from "../services/settings/settings.service";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const applyThemeVariables = useCallback((theme) => {
    if (!theme || typeof theme !== "object") return;
    const root = document.documentElement;

    if (theme.primary_color) root.style.setProperty("--color-primary", theme.primary_color);
    if (theme.secondary_color) root.style.setProperty("--color-secondary", theme.secondary_color);
    if (theme.background_color) root.style.setProperty("--color-background", theme.background_color);
    if (theme.text_color) root.style.setProperty("--color-text", theme.text_color);
    if (theme.card_color) root.style.setProperty("--color-card", theme.card_color);
    if (theme.accent_color) root.style.setProperty("--color-accent", theme.accent_color);

    if (theme.mode && ["light", "dark"].includes(theme.mode)) {
      root.setAttribute("data-theme", theme.mode);
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await settingsService.getSettings();
      const data = res?.data?.settings || {};
      setSettings(data);
      if (data.theme) {
        applyThemeVariables(data.theme);
      }
      if (data.site?.name) {
        document.title = data.site.seo_title || data.site.name;
      }
      if (data.branding?.favicon_url) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = data.branding.favicon_url;
      }
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load site settings.");
    } finally {
      setLoading(false);
    }
  }, [applyThemeVariables]);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const value = {
    settings: settings || {},
    loading,
    error,
    refreshSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

export default SettingsContext;
