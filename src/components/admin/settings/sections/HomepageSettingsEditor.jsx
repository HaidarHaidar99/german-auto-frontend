import React from "react";
import { useTranslation } from "react-i18next";
import SettingsSection from "../SettingsSection";
import SortableList from "../SortableList";
import SettingsToggle from "../SettingsToggle";

const SECTION_LABELS = {
  hero: { en: "Hero Stage / Carousel", de: "Hero Bühne / Carousel" },
  featured_cars: { en: "Featured Vehicles (Featured Cars)", de: "Ausgewählte Fahrzeuge (Featured Cars)" },
  offers: { en: "Current Offers & Promotions", de: "Aktuelle Angebote & Aktionen" },
  sell_car: { en: "Sell Your Car Teaser", de: "Fahrzeugankauf Teaser (Sell Your Car)" },
  testimonials: { en: "Customer Testimonials & Trust", de: "Kundenstimmen & Vertrauen" },
  google_reviews: { en: "Google Reviews Integration", de: "Google Bewertungen Integration" },
  locations: { en: "Locations & Showrooms", de: "Standorte & Showrooms" },
  contact: { en: "Contact Form Quick Access", de: "Kontaktformular Schnellzugriff" },
};

export function HomepageSettingsEditor({
  data = {},
  onChange,
  onReset,
  resetLoading,
  _errors = {},
}) {
  const { t, i18n } = useTranslation(["admin", "common"]);
  const currentLang = i18n.language?.startsWith("de") ? "de" : "en";

  const sectionsOrder = Array.isArray(data.sections_order)
    ? data.sections_order
    : Object.keys(SECTION_LABELS);

  const sectionsEnabled = data.sections_enabled || {};

  const handleToggle = (secKey, enabled) => {
    onChange?.({
      ...data,
      sections_enabled: {
        ...sectionsEnabled,
        [secKey]: enabled,
      },
    });
  };

  const handleReorder = (newOrderKeys) => {
    onChange?.({
      ...data,
      sections_order: newOrderKeys,
    });
  };

  return (
    <SettingsSection
      title={t("settingsSections.homepage", { defaultValue: "Homepage Modules" })}
      subtitle={t("homepageSubtitle", {
        defaultValue: "Control the layout order and visibility of all sections on the main homepage.",
      })}
      sectionKey="homepage"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/"
    >
      <p
        style={{
          margin: "0 0 var(--space-md)",
          fontSize: "var(--font-size-xs)",
          color: "var(--color-admin-muted)",
        }}
      >
        {t("reorderInstructions", { defaultValue: "Use the arrow buttons to customize the vertical order of homepage sections." })}
      </p>

      <SortableList
        items={sectionsOrder}
        onReorder={handleReorder}
        renderItem={(secKey) => {
          const isEnabled = sectionsEnabled[secKey] !== false;
          const labelObj = SECTION_LABELS[secKey];
          const label = labelObj ? (labelObj[currentLang] || labelObj.en) : secKey;

          return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-md)", width: "100%" }}>
              <div>
                <span
                  style={{
                    fontSize: "var(--font-size-sm)",
                    fontWeight: 500,
                    color: isEnabled ? "var(--color-admin-text, #0f172a)" : "var(--color-admin-muted, #64748b)",
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    color: "var(--color-primary, var(--color-text))",
                  }}
                >
                  {t("module", { defaultValue: "Module" })}: {secKey}
                </span>
              </div>

              <SettingsToggle
                label=""
                checked={isEnabled}
                onChange={(checked) => handleToggle(secKey, checked)}
                style={{ padding: 0 }}
              />
            </div>
          );
        }}
      />
    </SettingsSection>
  );
}

export default HomepageSettingsEditor;
