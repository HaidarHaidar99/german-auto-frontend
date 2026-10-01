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
        favicon: "favicon_url",
      };
      const fieldKey = keyMap[type] || "logo_url";
      onChange?.({
        ...data,
        [fieldKey]: newUrl,
      });
    }
    return res;
  };

  return (
    <SettingsSection
      title={t("settingsSections.branding", { defaultValue: "Branding & Logos" })}
      subtitle={t("brandingSubtitle", {
        defaultValue: "Verwalten Sie Ihr offizielles Logo, Dark-Mode-Varianten und das Browser-Favicon.",
      })}
      sectionKey="branding"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
        <MediaUploadField
          label={t("primaryLogo", { defaultValue: "Hauptlogo (Hell / Standard)" })}
          value={data.logo_url || ""}
          accept="image/png, image/jpeg, image/webp, image/svg+xml, .png, .jpg, .jpeg, .webp, .svg"
          maxSizeMB={5}
          onChange={(val) => onChange?.({ ...data, logo_url: val })}
          onUpload={(file) => handleUploadAsset(file, "logo")}
          helper={t("primaryLogoHelper", {
            defaultValue: "Wird in der Navigation auf dunklen Hintergründen gerendert. SVG, PNG oder JPEG empfohlen.",
          })}
          error={errors["branding.logo_url"]}
        />

        <MediaUploadField
          label={t("logoDark", { defaultValue: "Alternatives Logo (Dunkel / Kontrast)" })}
          value={data.logo_dark_url || ""}
          accept="image/png, image/jpeg, image/webp, image/svg+xml, .png, .jpg, .jpeg, .webp, .svg"
          maxSizeMB={5}
          onChange={(val) => onChange?.({ ...data, logo_dark_url: val })}
          onUpload={(file) => handleUploadAsset(file, "logo_dark")}
          helper={t("logoDarkHelper", {
            defaultValue: "Optional. Wird für helle Hintergründe oder Druckansichten verwendet. SVG, PNG oder JPEG empfohlen.",
          })}
          error={errors["branding.logo_dark_url"]}
        />

        <MediaUploadField
          label={t("favicon", { defaultValue: "Browser-Favicon" })}
          value={data.favicon_url || ""}
          accept="image/x-icon, image/png, image/jpeg, image/webp, image/svg+xml, .ico, .png, .jpg, .jpeg, .svg"
          maxSizeMB={2}
          onChange={(val) => onChange?.({ ...data, favicon_url: val })}
          onUpload={(file) => handleUploadAsset(file, "favicon")}
          helper={t("faviconHelper", {
            defaultValue: "Wird im Browser-Tab angezeigt. Quadratisches Format (32x32px oder 64x64px, .ico / .png / .jpg / .jpeg / .svg).",
          })}
          error={errors["branding.favicon_url"]}
        />
      </div>
    </SettingsSection>
  );
}

export default BrandingSettingsEditor;
