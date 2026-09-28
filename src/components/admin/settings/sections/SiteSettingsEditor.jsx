import React from "react";
import { useTranslation } from "react-i18next";
import SettingsSection from "../SettingsSection";
import SettingsField from "../SettingsField";
import SettingsToggle from "../SettingsToggle";
import Input from "../../../forms/Input";
import Textarea from "../../../forms/Textarea";

export function SiteSettingsEditor({
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

  const keywordsString = Array.isArray(data.seo_keywords)
    ? data.seo_keywords.join(", ")
    : typeof data.seo_keywords === "string"
    ? data.seo_keywords
    : "";

  const handleKeywordsChange = (e) => {
    const raw = e.target.value;
    const array = raw
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    handleChange("seo_keywords", array);
  };

  return (
    <SettingsSection
      title={t("settingsSections.general", { defaultValue: "Allgemeine Website" })}
      subtitle={t("siteSettingsSubtitle", {
        defaultValue: "Grundlegende Metadaten, Markenidentität und Suchmaschinenoptimierung (SEO).",
      })}
      sectionKey="site"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/"
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-md)" }}>
        <SettingsField
          label={t("siteName", { defaultValue: "Website Name" })}
          helper={t("siteNameHelper", { defaultValue: "Wird im Browser-Titel und Markenbereich verwendet." })}
          error={errors["site.name"]}
        >
          <Input
            value={data.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="z. B. German Auto"
          />
        </SettingsField>

        <SettingsField
          label={t("timezone", { defaultValue: "Zeitzone" })}
          helper={t("timezoneHelper", { defaultValue: "Referenz für Öffnungszeiten und Serverzeit." })}
          error={errors["site.timezone"]}
        >
          <Input
            value={data.timezone || ""}
            onChange={(e) => handleChange("timezone", e.target.value)}
            placeholder="Europe/Berlin"
          />
        </SettingsField>
      </div>

      <SettingsField
        label={t("siteDescription", { defaultValue: "Website Beschreibung" })}
        helper={t("siteDescHelper", { defaultValue: "Kurze Beschreibung des Autohauses für Suchmaschinen und Barrierefreiheit." })}
        error={errors["site.description"]}
      >
        <Textarea
          value={data.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder={t("siteDescPlaceholder", { defaultValue: "Ihr Spezialist für exklusive deutsche Automobile..." })}
          rows={3}
        />
      </SettingsField>

      <div
        style={{
          marginTop: "var(--space-lg)",
          paddingTop: "var(--space-md)",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <h3
          style={{
            fontSize: "var(--font-size-md)",
            fontWeight: 600,
            color: "var(--color-admin-text, #ffffff)",
            marginBottom: "var(--space-md)",
          }}
        >
          {t("seoSettings", { defaultValue: "Suchmaschinenoptimierung (SEO)" })}
        </h3>

        <SettingsField
          label={t("seoTitle", { defaultValue: "Standard SEO-Titel" })}
          helper={t("seoTitleHelper", { defaultValue: "Wird an Unterseiten angehängt oder als Standard-Title genutzt." })}
          error={errors["site.seo_title"]}
        >
          <Input
            value={data.seo_title || ""}
            onChange={(e) => handleChange("seo_title", e.target.value)}
            placeholder="German Auto | Premium Automobile"
          />
        </SettingsField>

        <SettingsField
          label={t("seoDescription", { defaultValue: "Meta-Description" })}
          helper={t("seoDescHelper", { defaultValue: "Optimale Länge: 140 bis 160 Zeichen." })}
          error={errors["site.seo_description"]}
        >
          <Textarea
            value={data.seo_description || ""}
            onChange={(e) => handleChange("seo_description", e.target.value)}
            placeholder="Exklusive deutsche Automobile und erstklassiger Service..."
            rows={2}
          />
        </SettingsField>

        <SettingsField
          label={t("seoKeywords", { defaultValue: "SEO Suchbegriffe (Keywords)" })}
          helper={t("seoKeywordsHelper", { defaultValue: "Mit Komma trennen (z. B. Porsche, BMW, Sportwagen, München)." })}
          error={errors["site.seo_keywords"]}
        >
          <Input
            value={keywordsString}
            onChange={handleKeywordsChange}
            placeholder="Automobile, Sportwagen, Luxusfahrzeuge"
          />
        </SettingsField>

        <SettingsToggle
          label={t("robotsIndexing", { defaultValue: "Suchmaschinen-Indexierung erlauben" })}
          description={t("robotsIndexingDesc", { defaultValue: "Erlaubt Google und Bing das Erfassen und Anzeigen der Website in Suchergebnissen." })}
          checked={data.robots_indexing !== false}
          onChange={(checked) => handleChange("robots_indexing", checked)}
        />
      </div>
    </SettingsSection>
  );
}

export default SiteSettingsEditor;
