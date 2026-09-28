import React from "react";
import { useTranslation } from "react-i18next";
import SettingsSection from "../SettingsSection";
import SettingsField from "../SettingsField";
import SettingsToggle from "../SettingsToggle";
import Input from "../../../forms/Input";
import Textarea from "../../../forms/Textarea";

export function ContactFormSettingsEditor({
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
      title={t("settingsSections.contactForm", { defaultValue: "Kontaktformular-Konfiguration" })}
      subtitle={t("contactFormSubtitle", {
        defaultValue: "Verwalten Sie Empfänger-E-Mail, Begrüßungstexte und Erfolgsmeldungen für Kundenanfragen.",
      })}
      sectionKey="contact_form"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/contact"
    >
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <SettingsToggle
          label="Kontaktformular aktivieren"
          description="Erlaubt Kunden das Absenden von Nachrichten und Fahrzeuganfragen über die Kontaktseite."
          checked={data.enabled !== false}
          onChange={(checked) => handleChange("enabled", checked)}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-md)" }}>
        <SettingsField label="Formular-Überschrift (DE)" locale="de" error={errors["contact_form.title_de"]}>
          <Input
            value={data.title_de || ""}
            onChange={(e) => handleChange("title_de", e.target.value)}
            placeholder="Kontakt & Beratung"
          />
        </SettingsField>

        <SettingsField label="Formular-Überschrift (EN)" locale="en" error={errors["contact_form.title_en"]}>
          <Input
            value={data.title_en || ""}
            onChange={(e) => handleChange("title_en", e.target.value)}
            placeholder="Contact & Consultation"
          />
        </SettingsField>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-md)", marginTop: "var(--space-sm)" }}>
        <SettingsField label="Einleitungstext (DE)" locale="de" error={errors["contact_form.description_de"]}>
          <Textarea
            value={data.description_de || ""}
            onChange={(e) => handleChange("description_de", e.target.value)}
            placeholder="Wir stehen Ihnen für alle Fragen rund um unseren Fahrzeugbestand persönlich zur Verfügung..."
            rows={3}
          />
        </SettingsField>

        <SettingsField label="Einleitungstext (EN)" locale="en" error={errors["contact_form.description_en"]}>
          <Textarea
            value={data.description_en || ""}
            onChange={(e) => handleChange("description_en", e.target.value)}
            placeholder="We are at your disposal for any inquiries regarding our inventory and tailored requests..."
            rows={3}
          />
        </SettingsField>
      </div>

      <div style={{ marginTop: "var(--space-md)" }}>
        <SettingsField
          label="Interner E-Mail-Empfänger für Einsendungen"
          helper="Wird im öffentlichen Frontend nicht offengelegt. Neue Kundenanfragen werden an diese Adresse weitergeleitet."
          error={errors["contact_form.recipient_email"]}
        >
          <Input
            type="email"
            value={data.recipient_email || ""}
            onChange={(e) => handleChange("recipient_email", e.target.value)}
            placeholder="anfragen@german-auto.de"
          />
        </SettingsField>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-md)", marginTop: "var(--space-sm)" }}>
        <SettingsField label="Erfolgsmeldung nach Absenden (DE)" locale="de" error={errors["contact_form.success_message_de"]}>
          <Input
            value={data.success_message_de || ""}
            onChange={(e) => handleChange("success_message_de", e.target.value)}
            placeholder="Vielen Dank! Ihre Anfrage ist sicher bei uns eingegangen."
          />
        </SettingsField>

        <SettingsField label="Erfolgsmeldung nach Absenden (EN)" locale="en" error={errors["contact_form.success_message_en"]}>
          <Input
            value={data.success_message_en || ""}
            onChange={(e) => handleChange("success_message_en", e.target.value)}
            placeholder="Thank you! Your message has been received successfully."
          />
        </SettingsField>
      </div>
    </SettingsSection>
  );
}

export default ContactFormSettingsEditor;
