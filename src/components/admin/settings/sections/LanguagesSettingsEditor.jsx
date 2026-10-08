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
      title={t("settingsSections.languages", { defaultValue: "Languages & Localization" })}
      subtitle={t("languagesSubtitle", {
        defaultValue: "Manage the primary and supported languages of the website.",
      })}
      sectionKey="languages"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/"
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-md)" }}>
        <SettingsField
          label={t("defaultLanguage", { defaultValue: "Default Language" })}
          helper={t("defaultLangHelper", { defaultValue: "Loaded on first visit without language parameter (Default: German)." })}
          error={errors["languages.default"]}
        >
          <Select
            value={data.default || "de"}
            onChange={(e) => handleChange("default", e.target.value)}
            options={[
              { value: "de", label: t("langGermanDefault", { defaultValue: "German (de) — Default" }) },
              { value: "en", label: t("langEnglish", { defaultValue: "English (en)" }) },
            ]}
          />
        </SettingsField>

        <SettingsField
          label={t("fallbackLanguage", { defaultValue: "Fallback Language" })}
          helper={t("fallbackLangHelper", { defaultValue: "Used when a translation is missing." })}
          error={errors["languages.fallback"]}
        >
          <Select
            value={data.fallback || "de"}
            onChange={(e) => handleChange("fallback", e.target.value)}
            options={[
              { value: "de", label: t("langGerman", { defaultValue: "German (de)" }) },
              { value: "en", label: t("langEnglish", { defaultValue: "English (en)" }) },
            ]}
          />
        </SettingsField>
      </div>

      <div
        style={{
          marginTop: "var(--space-md)",
          paddingTop: "var(--space-md)",
          borderTop: "1px solid var(--color-admin-border, rgba(0, 0, 0, 0.08))",
        }}
      >
        <h4
          style={{
            margin: "0 0 var(--space-sm)",
            fontSize: "var(--font-size-sm)",
            fontWeight: 600,
            color: "var(--color-admin-text, #0f172a)",
          }}
        >
          {t("supportedLanguages", { defaultValue: "Activated Languages" })}
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
          <Checkbox
            label={t("germanSystemLang", { defaultValue: "German (de) — Primary System Language (Required)" })}
            checked={supported.includes("de")}
            disabled={true}
          />
          <Checkbox
            label={t("englishSystemLang", { defaultValue: "English (en) — Secondary System Language (Required)" })}
            checked={supported.includes("en")}
            disabled={true}
          />
        </div>
      </div>
    </SettingsSection>
  );
}

export default LanguagesSettingsEditor;
