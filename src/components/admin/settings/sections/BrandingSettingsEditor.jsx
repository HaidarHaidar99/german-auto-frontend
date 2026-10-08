import React from "react";
import { useTranslation } from "react-i18next";
import settingsService from "../../../../services/settings/settings.service";
import SettingsSection from "../SettingsSection";
import MediaUploadField from "../MediaUploadField";

export function BrandingSettingsEditor({
  data = {},
  onChange,
  onReset,
  resetLoading,
  errors = {},
}) {
  const { t } = useTranslation(["admin", "common"]);

  const handleUploadAsset = async (file, type) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    const res = await settingsService.adminUploadBranding(formData);
    const newUrl = res?.data?.url;
    if (newUrl) {
      const keyMap = {
        logo: "logo_url",
        logo_dark: "logo_dark_url",
        logo_light: "logo_light_url",
        favicon: "favicon_url",
      };
      const fieldKey = keyMap[type] || "logo_url";
      onChange?.({
        ...data,
        [fieldKey]: newUrl,
        // Keep logo_dark_url synchronized if updating the default logo
        ...(type === "logo" && !data.logo_dark_url ? { logo_dark_url: newUrl } : {}),
      });
    }
    return res;
  };

  return (
    <SettingsSection
      title={t("settingsSections.branding", { defaultValue: "Branding & Logos" })}
      subtitle={t("brandingSubtitle", {
        defaultValue: "Manage your official logo, light and dark mode variants, and browser favicon.",
      })}
      sectionKey="branding"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
        {/* Responsive Two-Column Grid for Dark Mode and Light Mode Logos */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-lg)",
            alignItems: "start",
          }}
        >
          {/* Current Logo / Dark Mode Version */}
          <MediaUploadField
            label={t("darkModeLogo", { defaultValue: "Dark Mode Logo (Default)" })}
            value={data.logo_url || ""}
            accept="image/png, image/jpeg, image/webp, image/svg+xml, .png, .jpg, .jpeg, .webp, .svg"
            maxSizeMB={5}
            onChange={(val) => onChange?.({ ...data, logo_url: val, logo_dark_url: val })}
            onUpload={(file) => handleUploadAsset(file, "logo")}
            helper={t("darkModeLogoHelper", {
              defaultValue: "Used in the default dark theme. SVG, PNG or JPEG recommended.",
            })}
            error={errors["branding.logo_url"]}
          />

          {/* Light Mode Logo Upload Beside Current Logo */}
          <MediaUploadField
            label={t("lightModeLogo", { defaultValue: "Light Mode Logo" })}
            value={data.logo_light_url || ""}
            accept="image/png, image/jpeg, image/webp, image/svg+xml, .png, .jpg, .jpeg, .webp, .svg"
            maxSizeMB={5}
            onChange={(val) => onChange?.({ ...data, logo_light_url: val })}
            onUpload={(file) => handleUploadAsset(file, "logo_light")}
            helper={t("lightModeLogoHelper", {
              defaultValue: "Used in the light theme. Automatically falls back to dark mode logo if not uploaded.",
            })}
            error={errors["branding.logo_light_url"]}
          />
        </div>

        {/* Browser Favicon */}
        <MediaUploadField
          label={t("favicon", { defaultValue: "Browser Favicon" })}
          value={data.favicon_url || ""}
          accept="image/x-icon, image/png, image/jpeg, image/webp, image/svg+xml, .ico, .png, .jpg, .jpeg, .svg"
          maxSizeMB={2}
          onChange={(val) => onChange?.({ ...data, favicon_url: val })}
          onUpload={(file) => handleUploadAsset(file, "favicon")}
          helper={t("faviconHelper", {
            defaultValue: "Displayed in browser tab. Square format (32x32px or 64x64px, .ico / .png / .jpg / .jpeg / .svg).",
          })}
          error={errors["branding.favicon_url"]}
        />
      </div>
    </SettingsSection>
  );
}

export default BrandingSettingsEditor;
