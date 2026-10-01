import React from "react";
import { useTranslation } from "react-i18next";
import SettingsSection from "../SettingsSection";
import SettingsField from "../SettingsField";
import SettingsToggle from "../SettingsToggle";
import Input from "../../../forms/Input";
import Textarea from "../../../forms/Textarea";
import MediaUploadField from "../MediaUploadField";
import settingsService from "../../../../services/settings/settings.service";

export function FooterSettingsEditor({
  data = {},
  onChange,
  onReset,
  resetLoading,
  errors = {},
}) {
  const { t } = useTranslation(["admin", "common"]);

  const handleChange = (field, val) => {
    onChange?.({
      ...data,
      [field]: val,
    });
  };

  const handleUploadFooterLogo = async (file) => {
    const res = await settingsService.uploadBrandingAsset(file, "footer_logo");
    const uploadedUrl = res?.data?.url || res?.url;
    if (uploadedUrl) {
      handleChange("footer_logo_url", uploadedUrl);
    }
    return res;
  };

  return (
    <SettingsSection
      title={t("settingsSections.footer", { defaultValue: "Footer & Rechtliches" })}
      subtitle={t("footerSubtitle", {
        defaultValue: "Gestalten Sie den Seitenabschluss, Copyright-Vermerke, Sektionstoggles und Unternehmensbeschreibung.",
      })}
      sectionKey="footer"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
        {/* Footer Logo Field */}
        <MediaUploadField
          label={t("footerLogo", { defaultValue: "Footer-Logo (Unten auf der Website)" })}
          value={data.footer_logo_url || ""}
          accept="image/png, image/jpeg, image/webp, image/svg+xml, .png, .jpg, .jpeg, .webp, .svg"
          maxSizeMB={5}
          onChange={(val) => handleChange("footer_logo_url", val)}
          onUpload={handleUploadFooterLogo}
          helper={t("footerLogoHelper", {
            defaultValue: "Optional. Ersetzt das Standard-Hauptlogo im Footer-Bereich. SVG, PNG oder JPEG empfohlen.",
          })}
          error={errors["footer.footer_logo_url"]}
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-md)" }}>
        <SettingsField label="Copyright-Hinweis (DE)" locale="de" error={errors["footer.copyright_de"]}>
          <Input
            value={data.copyright_de || ""}
            onChange={(e) => handleChange("copyright_de", e.target.value)}
            placeholder="© 2026 German Auto. Alle Rechte vorbehalten."
          />
        </SettingsField>

        <SettingsField label="Copyright-Hinweis (EN)" locale="en" error={errors["footer.copyright_en"]}>
          <Input
            value={data.copyright_en || ""}
            onChange={(e) => handleChange("copyright_en", e.target.value)}
            placeholder="© 2026 German Auto. All rights reserved."
          />
        </SettingsField>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-md)", marginTop: "var(--space-sm)" }}>
        <SettingsField label="Footer-Beschreibung (DE)" locale="de" error={errors["footer.description_de"]}>
          <Textarea
            value={data.description_de || ""}
            onChange={(e) => handleChange("description_de", e.target.value)}
            placeholder="Ihr vertrauensvoller Partner für Luxusautomobile..."
            rows={3}
          />
        </SettingsField>

        <SettingsField label="Footer-Beschreibung (EN)" locale="en" error={errors["footer.description_en"]}>
          <Textarea
            value={data.description_en || ""}
            onChange={(e) => handleChange("description_en", e.target.value)}
            placeholder="Your premier destination for fine German automobiles..."
            rows={3}
          />
        </SettingsField>
      </div>

      <div
        style={{
          marginTop: "var(--space-lg)",
          paddingTop: "var(--space-md)",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <h4
          style={{
            margin: "0 0 var(--space-md)",
            fontSize: "var(--font-size-sm)",
            fontWeight: 600,
            color: "var(--color-admin-text, #ffffff)",
          }}
        >
          {t("footerWidgets", { defaultValue: "Sichtbarkeit im Footer" })}
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
          <SettingsToggle
            label={t("showContactInFooter", { defaultValue: "Kontaktdaten im Footer einblenden" })}
            description={t("showContactInFooterDesc", { defaultValue: "Zeigt Telefonnummer, E-Mail und WhatsApp im Fußbereich an." })}
            checked={data.show_contact !== false}
            onChange={(checked) => handleChange("show_contact", checked)}
          />

          <SettingsToggle
            label={t("showSocialInFooter", { defaultValue: "Social-Media-Icons im Footer einblenden" })}
            description={t("showSocialInFooterDesc", { defaultValue: "Zeigt aktive Verknüpfungen zu Instagram, YouTube etc. an." })}
            checked={data.show_social !== false}
            onChange={(checked) => handleChange("show_social", checked)}
          />

          <SettingsToggle
            label={t("showLocationsInFooter", { defaultValue: "Standort-Schnellübersicht im Footer einblenden" })}
            description={t("showLocationsInFooterDesc", { defaultValue: "Führt die hinterlegten Showroom-Adressen auf." })}
            checked={data.show_locations !== false}
            onChange={(checked) => handleChange("show_locations", checked)}
          />
        </div>
      </div>
      </div>
    </SettingsSection>
  );
}

export default FooterSettingsEditor;
