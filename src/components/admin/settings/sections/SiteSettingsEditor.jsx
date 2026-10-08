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
      title={t("settingsSections.general", { defaultValue: "General Website" })}
      subtitle={t("siteSettingsSubtitle", {
        defaultValue: "Basic metadata, brand identity, and search engine optimization (SEO).",
      })}
      sectionKey="site"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/"
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-md)" }}>
        <SettingsField
          label={t("siteName", { defaultValue: "Website Name" })}
          helper={t("siteNameHelper", { defaultValue: "Used in browser title and branding areas." })}
          error={errors["site.name"]}
        >
          <Input
            value={data.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g. German Auto"
          />
        </SettingsField>

        <SettingsField
          label={t("timezone", { defaultValue: "Timezone" })}
          helper={t("timezoneHelper", { defaultValue: "Reference for opening hours and server time." })}
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
        label={t("siteDescription", { defaultValue: "Website Description" })}
        helper={t("siteDescHelper", { defaultValue: "Short description of the dealership for search engines and accessibility." })}
        error={errors["site.description"]}
      >
        <Textarea
          value={data.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder={t("siteDescPlaceholder", { defaultValue: "Your specialist for exclusive German automobiles..." })}
          rows={3}
        />
      </SettingsField>

      <div
        style={{
          marginTop: "var(--space-lg)",
          paddingTop: "var(--space-md)",
          borderTop: "1px solid var(--color-admin-border, rgba(0, 0, 0, 0.08))",
        }}
      >
        <h3
          style={{
            fontSize: "var(--font-size-md)",
            fontWeight: 600,
            color: "var(--color-admin-text, #0f172a)",
            marginBottom: "var(--space-md)",
          }}
        >
          {t("seoSettings", { defaultValue: "Search Engine Optimization (SEO)" })}
        </h3>

        <SettingsField
          label={t("seoTitle", { defaultValue: "Default SEO Title" })}
          helper={t("seoTitleHelper", { defaultValue: "Appended to subpages or used as default title." })}
          error={errors["site.seo_title"]}
        >
          <Input
            value={data.seo_title || ""}
            onChange={(e) => handleChange("seo_title", e.target.value)}
            placeholder="German Auto | Premium Automobile"
          />
        </SettingsField>

        <SettingsField
          label={t("seoDescription", { defaultValue: "Meta Description" })}
          helper={t("seoDescHelper", { defaultValue: "Optimal length: 140 to 160 characters." })}
          error={errors["site.seo_description"]}
        >
          <Textarea
            value={data.seo_description || ""}
            onChange={(e) => handleChange("seo_description", e.target.value)}
            placeholder="Exclusive German automobiles and first-class service..."
            rows={2}
          />
        </SettingsField>

        <SettingsField
          label={t("seoKeywords", { defaultValue: "SEO Keywords" })}
          helper={t("seoKeywordsHelper", { defaultValue: "Separate with commas (e.g. Porsche, BMW, sports cars, Munich)." })}
          error={errors["site.seo_keywords"]}
        >
          <Input
            value={keywordsString}
            onChange={handleKeywordsChange}
            placeholder="Automobiles, Sports Cars, Luxury Vehicles"
          />
        </SettingsField>

        <SettingsToggle
          label={t("robotsIndexing", { defaultValue: "Allow Search Engine Indexing" })}
          description={t("robotsIndexingDesc", { defaultValue: "Allows Google and Bing to crawl and display the website in search results." })}
          checked={data.robots_indexing !== false}
          onChange={(checked) => handleChange("robots_indexing", checked)}
        />
      </div>
    </SettingsSection>
  );
}

export default SiteSettingsEditor;
