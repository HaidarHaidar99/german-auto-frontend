import React from "react";
import { useTranslation } from "react-i18next";
import SettingsSection from "../SettingsSection";
import SettingsField from "../SettingsField";
import Select from "../../../forms/Select";
import Checkbox from "../../../forms/Checkbox";

export function LanguagesSettingsEditor({
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

  const supported = Array.isArray(data.supported) ? data.supported : ["de", "en"];


  return (
    <SettingsSection
      title={t("settingsSections.languages", { defaultValue: "Sprachen & Lokalisierung" })}
      subtitle={t("languagesSubtitle", {
        defaultValue: "Verwalten Sie die Hauptsprache sowie unterstützte Sprachen der Website.",
      })}
      sectionKey="languages"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/"
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-md)" }}>
        <SettingsField
          label={t("defaultLanguage", { defaultValue: "Standardsprache" })}
          helper={t("defaultLangHelper", { defaultValue: "Wird beim Erstaufruf ohne Sprachparameter geladen (Vorgabe: Deutsch)." })}
          error={errors["languages.default"]}
        >
          <Select
            value={data.default || "de"}
            onChange={(e) => handleChange("default", e.target.value)}
            options={[
              { value: "de", label: "Deutsch (de) — Standard" },
              { value: "en", label: "English (en)" },
            ]}
          />
        </SettingsField>

        <SettingsField
          label={t("fallbackLanguage", { defaultValue: "Fallback-Sprache" })}
          helper={t("fallbackLangHelper", { defaultValue: "Wird herangezogen, wenn eine Übersetzung nicht gepflegt ist." })}
          error={errors["languages.fallback"]}
        >
          <Select
            value={data.fallback || "de"}
            onChange={(e) => handleChange("fallback", e.target.value)}
            options={[
              { value: "de", label: "Deutsch (de)" },
              { value: "en", label: "English (en)" },
            ]}
          />
        </SettingsField>
      </div>

      <div
        style={{
          marginTop: "var(--space-md)",
          paddingTop: "var(--space-md)",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <h4
          style={{
            margin: "0 0 var(--space-sm)",
            fontSize: "var(--font-size-sm)",
            fontWeight: 600,
            color: "var(--color-admin-text, #ffffff)",
          }}
        >
          {t("supportedLanguages", { defaultValue: "Aktivierte Sprachen" })}
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
          <Checkbox
            label="Deutsch (de) — Primäre Systemsprache (Erforderlich)"
            checked={supported.includes("de")}
            disabled={true}
          />
          <Checkbox
            label="English (en) — Sekundäre Systemsprache (Erforderlich)"
            checked={supported.includes("en")}
            disabled={true}
          />
        </div>
      </div>
    </SettingsSection>
  );
}

export default LanguagesSettingsEditor;
