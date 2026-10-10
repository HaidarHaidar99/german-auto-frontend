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
      title={t("settingsSections.contactForm", { defaultValue: "Contact Form Configuration" })}
      subtitle={t("contactFormSubtitle", {
        defaultValue: "Manage recipient email, introductory texts, and success messages for customer inquiries.",
      })}
      sectionKey="contact_form"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/contact"
    >
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <SettingsToggle
          label={t("enableContactForm", { defaultValue: "Enable Contact Form" })}
          description={t("enableContactFormDesc", { defaultValue: "Allows customers to submit messages and vehicle inquiries via the contact page." })}
          checked={data.enabled !== false}
          onChange={(checked) => handleChange("enabled", checked)}
        />
      </div>

      <SettingsField label={`${t("formTitle", { defaultValue: "Form Title" })} (DE)`} locale="de" error={errors["contact_form.title_de"]}>
        <Input
          value={data.title_de || ""}
          onChange={(e) => handleChange("title_de", e.target.value)}
          placeholder="Kontakt & Beratung"
        />
      </SettingsField>

      <div style={{ marginTop: "var(--space-sm)" }}>
        <SettingsField label={`${t("introText", { defaultValue: "Introductory Text" })} (DE)`} locale="de" error={errors["contact_form.description_de"]}>
          <Textarea
            value={data.description_de || ""}
            onChange={(e) => handleChange("description_de", e.target.value)}
            placeholder="Wir stehen Ihnen für alle Fragen rund um unseren Fahrzeugbestand persönlich zur Verfügung..."
            rows={3}
          />
        </SettingsField>
      </div>

      <div style={{ marginTop: "var(--space-md)" }}>
        <SettingsField
          label={t("recipientEmail", { defaultValue: "Internal Recipient Email for Submissions" })}
          helper={t("recipientEmailHelper", { defaultValue: "Not displayed in public frontend. New customer inquiries are forwarded to this address." })}
          error={errors["contact_form.recipient_email"]}
        >
          <Input
            type="email"
            value={data.recipient_email || ""}
            onChange={(e) => handleChange("recipient_email", e.target.value)}
            placeholder="inquiries@german-auto.de"
          />
        </SettingsField>
      </div>

      <div style={{ marginTop: "var(--space-sm)" }}>
        <SettingsField label={`${t("successMessage", { defaultValue: "Success Message After Submission" })} (DE)`} locale="de" error={errors["contact_form.success_message_de"]}>
          <Input
            value={data.success_message_de || ""}
            onChange={(e) => handleChange("success_message_de", e.target.value)}
            placeholder="Vielen Dank! Ihre Anfrage ist sicher bei uns eingegangen."
          />
        </SettingsField>
      </div>
    </SettingsSection>
  );
}

export default ContactFormSettingsEditor;
