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
      title={t("settingsSections.contact", { defaultValue: "Kontaktdaten" })}
      subtitle={t("contactSubtitle", {
        defaultValue: "Zentrale Kontaktkanäle, Telefonnummern, E-Mail-Adresse und WhatsApp-Support.",
      })}
      sectionKey="contact"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/contact"
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-md)" }}>
        <SettingsField
          label={t("phone", { defaultValue: "Telefonnummer" })}
          helper={t("phoneHelper", { defaultValue: "Im internationalen Format (z. B. +49 89 12345678)." })}
          error={errors["contact.phone"]}
        >
          <Input
            value={data.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+49 ..."
          />
        </SettingsField>

        <SettingsField
          label={t("email", { defaultValue: "E-Mail-Adresse" })}
          helper={t("emailHelper", { defaultValue: "Öffentlich angezeigte E-Mail-Adresse für Kundenanfragen." })}
          error={errors["contact.email"]}
        >
          <Input
            type="email"
            value={data.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="kontakt@example.de"
          />
        </SettingsField>

        <SettingsField
          label={t("whatsapp", { defaultValue: "WhatsApp-Nummer" })}
          helper={t("whatsappHelper", { defaultValue: "Mit Ländervorwahl ohne Sonderzeichen (z. B. +491701234567)." })}
          error={errors["contact.whatsapp"]}
        >
          <Input
            value={data.whatsapp || ""}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
            placeholder="+49 170 ..."
          />
        </SettingsField>

        <SettingsField
          label={t("contactUrl", { defaultValue: "Benutzerdefinierter Kontakt-Link" })}
          helper={t("contactUrlHelper", { defaultValue: "Optional. Überschreibt das Standard-Kontaktformular (z. B. externer Buchungslink)." })}
          error={errors["contact.contact_url"]}
        >
          <Input
            value={data.contact_url || ""}
            onChange={(e) => handleChange("contact_url", e.target.value)}
            placeholder="/contact oder https://..."
          />
        </SettingsField>
      </div>
    </SettingsSection>
  );
}

export default ContactSettingsEditor;
