import React from "react";
import { useTranslation } from "react-i18next";
import SettingsSection from "../SettingsSection";
import SortableList from "../SortableList";
import SettingsToggle from "../SettingsToggle";

const SECTION_LABELS = {
  hero: "Hero Bühne / Carousel",
  featured_cars: "Ausgewählte Fahrzeuge (Featured Cars)",
  offers: "Aktuelle Angebote & Aktionen",
  sell_car: "Fahrzeugankauf Teaser (Sell Your Car)",
  testimonials: "Kundenstimmen & Vertrauen",
  google_reviews: "Google Bewertungen Integration",
  locations: "Standorte & Showrooms",
  contact: "Kontaktformular Schnellzugriff",
};

export function HomepageSettingsEditor({
  data = {},
  onChange,
  onReset,
  resetLoading,
  _errors = {},
}) {
  const { t } = useTranslation(["admin", "common"]);

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
      title={t("settingsSections.homepage", { defaultValue: "Startseiten-Module" })}
      subtitle={t("homepageSubtitle", {
        defaultValue: "Steuern Sie die Anordnung und Sichtbarkeit aller Sektionen auf der Haupt-Homepage.",
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
        Nutzen Sie die Pfeiltasten, um die vertikale Reihenfolge der Startseiten-Abschnitte anzupassen.
      </p>

      <SortableList
        items={sectionsOrder}
        onReorder={handleReorder}
        renderItem={(secKey) => {
          const isEnabled = sectionsEnabled[secKey] !== false;
          const label = SECTION_LABELS[secKey] || secKey;

          return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-md)", width: "100%" }}>
              <div>
                <span
                  style={{
                    fontSize: "var(--font-size-sm)",
                    fontWeight: 500,
                    color: isEnabled ? "var(--color-admin-text, #ffffff)" : "var(--color-admin-muted)",
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    color: "var(--color-primary, #C5A059)",
                  }}
                >
                  Modul: {secKey}
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
