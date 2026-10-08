import React from "react";
import { useTranslation } from "react-i18next";
import SettingsSection from "../SettingsSection";
import SettingsField from "../SettingsField";
import Input from "../../../forms/Input";

export function ContactSettingsEditor({
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

  return (
    <SettingsSection
      title={t("settingsSections.contact", { defaultValue: "Contact Information" })}
      subtitle={t("contactSubtitle", {
        defaultValue: "Central contact channels, phone numbers, email address, and WhatsApp support.",
      })}
      sectionKey="contact"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/contact"
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-md)" }}>
        <SettingsField
          label={t("phone", { defaultValue: "Phone Number" })}
          helper={t("phoneHelper", { defaultValue: "In international format (e.g. +49 89 12345678)." })}
          error={errors["contact.phone"]}
        >
          <Input
            value={data.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+49 ..."
          />
        </SettingsField>

        <SettingsField
          label={t("email", { defaultValue: "Email Address" })}
          helper={t("emailHelper", { defaultValue: "Publicly displayed email address for customer inquiries." })}
          error={errors["contact.email"]}
        >
          <Input
            type="email"
            value={data.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="contact@example.de"
          />
        </SettingsField>

        <SettingsField
          label={t("whatsapp", { defaultValue: "WhatsApp Number" })}
          helper={t("whatsappHelper", { defaultValue: "With country code without special characters (e.g. +491701234567)." })}
          error={errors["contact.whatsapp"]}
        >
          <Input
            value={data.whatsapp || ""}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
            placeholder="+49 170 ..."
          />
        </SettingsField>

        <SettingsField
          label={t("contactUrl", { defaultValue: "Custom Contact Link" })}
          helper={t("contactUrlHelper", { defaultValue: "Optional. Overrides the default contact form (e.g. external booking link)." })}
          error={errors["contact.contact_url"]}
        >
          <Input
            value={data.contact_url || ""}
            onChange={(e) => handleChange("contact_url", e.target.value)}
            placeholder="/contact or https://..."
          />
        </SettingsField>
      </div>
    </SettingsSection>
  );
}

export default ContactSettingsEditor;
