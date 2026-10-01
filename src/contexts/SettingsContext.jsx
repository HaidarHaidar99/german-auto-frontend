import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import settingsService from "../services/settings/settings.service";

export const DEFAULT_LOGO_URL = "https://ylmahjqspbudmtewjhcg.supabase.co/storage/v1/object/public/german-auto-media/site/branding/1790760237272-so6ety.jpg";
export const DEFAULT_BRAND_NAME = "König Automobile Rheinberg";
const SETTINGS_STORAGE_KEY = "german_auto_cached_settings";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (!parsed.site?.name || parsed.site?.name === "German Auto") {
          parsed.site = { ...(parsed.site || {}), name: DEFAULT_BRAND_NAME };
        }
        return parsed;
      }
    } catch {
      // Ignore parse error
    }
    return {
      branding: {
        logo_url: DEFAULT_LOGO_URL,
      },
      site: {
        name: DEFAULT_BRAND_NAME,
        seo_title: DEFAULT_BRAND_NAME,
      },
    };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const applyThemeVariables = useCallback((theme) => {
    if (!theme || typeof theme !== "object") return;
    const root = document.documentElement;
    // Forcing pure black monochrome theme, ignoring CMS color overrides
    root.style.setProperty("--color-background", "#000000");
    root.style.setProperty("--color-card", "#000000");
    root.style.setProperty("--color-surface", "#000000");
    root.style.setProperty("--color-text", "#ffffff");
    if (theme.secondary_color) root.style.setProperty("--color-secondary", theme.secondary_color); // Keep gold
    if (theme.accent_color) root.style.setProperty("--color-accent", theme.accent_color);
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await settingsService.getSettings();
      const data = res?.data?.settings || {};
      if (!data.site?.name || data.site.name === "German Auto") {
        data.site = { ...(data.site || {}), name: DEFAULT_BRAND_NAME };
      }
      setSettings(data);
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data));
      } catch {
        // Ignore storage error
      }
      if (data.theme) {
        applyThemeVariables(data.theme);
      }
      document.title = data.site?.seo_title || data.site?.name || DEFAULT_BRAND_NAME;
      if (data.branding?.favicon_url) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = data.branding.favicon_url;
        const cleanUrl = (data.branding.favicon_url || "").split("?")[0].toLowerCase();
        if (cleanUrl.endsWith(".jpg") || cleanUrl.endsWith(".jpeg")) {
          link.type = "image/jpeg";
        } else if (cleanUrl.endsWith(".png")) {
          link.type = "image/png";
        } else if (cleanUrl.endsWith(".svg")) {
          link.type = "image/svg+xml";
        } else if (cleanUrl.endsWith(".ico")) {
          link.type = "image/x-icon";
        } else if (cleanUrl.endsWith(".webp")) {
          link.type = "image/webp";
        }
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
