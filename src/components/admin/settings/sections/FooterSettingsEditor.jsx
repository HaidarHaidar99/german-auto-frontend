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
      title={t("settingsSections.footer", { defaultValue: "Footer & Legal" })}
      subtitle={t("footerSubtitle", {
        defaultValue: "Customize the page footer, copyright notices, section toggles, and company description.",
      })}
      sectionKey="footer"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
        {/* Footer Logo Field */}
        <MediaUploadField
          label={t("footerLogo", { defaultValue: "Footer Logo (Bottom of Website)" })}
          value={data.footer_logo_url || ""}
          accept="image/png, image/jpeg, image/webp, image/svg+xml, .png, .jpg, .jpeg, .webp, .svg"
          maxSizeMB={5}
          onChange={(val) => handleChange("footer_logo_url", val)}
          onUpload={handleUploadFooterLogo}
          helper={t("footerLogoHelper", {
            defaultValue: "Optional. Replaces the default main logo in the footer section. SVG, PNG or JPEG recommended.",
          })}
          error={errors["footer.footer_logo_url"]}
        />

        <SettingsField label={`${t("copyrightNotice", { defaultValue: "Copyright Notice" })} (DE)`} locale="de" error={errors["footer.copyright_de"]}>
          <Input
            value={data.copyright_de || ""}
            onChange={(e) => handleChange("copyright_de", e.target.value)}
            placeholder="© 2026 German Auto. Alle Rechte vorbehalten."
          />
        </SettingsField>

        <div style={{ marginTop: "var(--space-sm)" }}>
          <SettingsField label={`${t("footerDescription", { defaultValue: "Footer Description" })} (DE)`} locale="de" error={errors["footer.description_de"]}>
            <Textarea
              value={data.description_de || ""}
              onChange={(e) => handleChange("description_de", e.target.value)}
              placeholder="Ihr vertrauensvoller Partner für Luxusautomobile..."
              rows={3}
            />
          </SettingsField>
        </div>

      <div
        style={{
          marginTop: "var(--space-lg)",
          paddingTop: "var(--space-md)",
          borderTop: "1px solid var(--color-admin-border, rgba(0, 0, 0, 0.08))",
        }}
      >
        <h4
          style={{
            margin: "0 0 var(--space-md)",
            fontSize: "var(--font-size-sm)",
            fontWeight: 600,
            color: "var(--color-admin-text, #0f172a)",
          }}
        >
          {t("footerWidgets", { defaultValue: "Footer Visibility & Widgets" })}
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
          <SettingsToggle
            label={t("showContactInFooter", { defaultValue: "Show contact information in footer" })}
            description={t("showContactInFooterDesc", { defaultValue: "Displays phone number, email, and WhatsApp in the footer." })}
            checked={data.show_contact !== false}
            onChange={(checked) => handleChange("show_contact", checked)}
          />

          <SettingsToggle
            label={t("showSocialInFooter", { defaultValue: "Show social media icons in footer" })}
            description={t("showSocialInFooterDesc", { defaultValue: "Displays active links to Instagram, YouTube, etc." })}
            checked={data.show_social !== false}
            onChange={(checked) => handleChange("show_social", checked)}
          />

          <SettingsToggle
            label={t("showLocationsInFooter", { defaultValue: "Show locations overview in footer" })}
            description={t("showLocationsInFooterDesc", { defaultValue: "Lists showroom and dealership addresses." })}
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
