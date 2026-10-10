import React from "react";
import { useTranslation } from "react-i18next";
import SettingsSection from "../SettingsSection";
import SettingsField from "../SettingsField";
import SettingsToggle from "../SettingsToggle";
import Input from "../../../forms/Input";

export function GoogleReviewsSettingsEditor({
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
      title={t("settingsSections.googleReviews", { defaultValue: "Google Bewertungen-Integration" })}
      subtitle={t("googleReviewsSubtitle", {
        defaultValue: "Verknüpfen Sie Ihr offizielles Google Unternehmensprofil zur Einbindung externer Kundenrezensionen.",
      })}
      sectionKey="google_reviews"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/"
    >
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <SettingsToggle
          label="Google Bewertungen-Widget aktivieren"
          description="Verlinkt im Footer und auf der Startseite direkt auf Ihr verifiziertes Google Profil."
          checked={Boolean(data.enabled)}
          onChange={(checked) => handleChange("enabled", checked)}
        />
      </div>

      <SettingsField
        label="Google Maps / Business Profil-URL"
        helper="Vollständige HTTP/HTTPS URL zu Ihrem Google Maps oder Business Eintrag."
        error={errors["google_reviews.profile_url"]}
      >
        <Input
          value={data.profile_url || ""}
          onChange={(e) => handleChange("profile_url", e.target.value)}
          placeholder="https://maps.google.com/?cid=..."
        />
      </SettingsField>

      <div style={{ marginTop: "var(--space-sm)" }}>
        <SettingsField label="Button-Beschriftung (DE)" locale="de" error={errors["google_reviews.display_label_de"]}>
          <Input
            value={data.display_label_de || ""}
            onChange={(e) => handleChange("display_label_de", e.target.value)}
            placeholder="Auf Google bewerten"
          />
        </SettingsField>
      </div>

      <div
        style={{
          marginTop: "var(--space-lg)",
          paddingTop: "var(--space-md)",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <h4
          style={{
            margin: "0 0 var(--space-md)",
            fontSize: "var(--font-size-sm)",
            fontWeight: 600,
            color: "var(--color-admin-text, #ffffff)",
          }}
        >
          {t("displayOptions", { defaultValue: "Darstellungsoptionen" })}
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
          <SettingsToggle
            label="Google Sterne-Bewertungsabzeichen anzeigen"
            description="Blendet das optische 5-Sterne-Symbol im Widget ein."
            checked={Boolean(data.show_rating)}
            onChange={(checked) => handleChange("show_rating", checked)}
          />

          <SettingsToggle
            label="Bewertungsanzahl anzeigen"
            description="Zeigt die Gesamtzahl abgegebener Bewertungen an, sofern vom Profil bereitgestellt."
            checked={Boolean(data.show_count)}
            onChange={(checked) => handleChange("show_count", checked)}
          />
        </div>
      </div>
    </SettingsSection>
  );
}

export default GoogleReviewsSettingsEditor;
