import React from "react";
import { useTranslation } from "react-i18next";
import SettingsSection from "../SettingsSection";
import SettingsColorField from "../SettingsColorField";
import SettingsField from "../SettingsField";
import Select from "../../../forms/Select";

export function ThemeSettingsEditor({
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

  const primary = data.primary_color || "#000000";
  const secondary = data.secondary_color || "var(--color-text)";
  const bg = data.background_color || "#090A0C";
  const text = data.text_color || "#FFFFFF";
  const card = data.card_color || "#121418";
  const accent = data.accent_color || "var(--color-text)";

  return (
    <SettingsSection
      title={t("settingsSections.theme", { defaultValue: "Design & Farbschema" })}
      subtitle={t("themeSubtitle", {
        defaultValue: "Passen Sie die primären Akzentfarben, Oberflächen und Typografietöne an.",
      })}
      sectionKey="theme"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/"
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-md)" }}>
        <SettingsColorField
          label={t("primaryColor", { defaultValue: "Primärfarbe (Primary)" })}
          name="primary_color"
          value={data.primary_color || ""}
          onChange={(val) => handleChange("primary_color", val)}
          helper={t("primaryColorHelper", { defaultValue: "Markenidentität & Hauptbuttons." })}
          error={errors["theme.primary_color"]}
        />

        <SettingsColorField
          label={t("secondaryColor", { defaultValue: "Sekundärfarbe (Automotive Gold/Champagne)" })}
          name="secondary_color"
          value={data.secondary_color || ""}
          onChange={(val) => handleChange("secondary_color", val)}
          helper={t("secondaryColorHelper", { defaultValue: "Highlights, Badges und Eyebrows." })}
          error={errors["theme.secondary_color"]}
        />

        <SettingsColorField
          label={t("accentColor", { defaultValue: "Akzentfarbe (Accent)" })}
          name="accent_color"
          value={data.accent_color || ""}
          onChange={(val) => handleChange("accent_color", val)}
          helper={t("accentColorHelper", { defaultValue: "Besondere Call-to-Actions & Hover-Glows." })}
          error={errors["theme.accent_color"]}
        />

        <SettingsColorField
          label={t("backgroundColor", { defaultValue: "Hintergrundfarbe (Background)" })}
          name="background_color"
          value={data.background_color || ""}
          onChange={(val) => handleChange("background_color", val)}
          helper={t("backgroundColorHelper", { defaultValue: "Grundfarbe des Website-Bodys." })}
          error={errors["theme.background_color"]}
        />

        <SettingsColorField
          label={t("cardColor", { defaultValue: "Kartenfarbe (Card Surface)" })}
          name="card_color"
          value={data.card_color || ""}
          onChange={(val) => handleChange("card_color", val)}
          helper={t("cardColorHelper", { defaultValue: "Oberfläche für Fahrzeugkarten und Sektionen." })}
          error={errors["theme.card_color"]}
        />

        <SettingsColorField
          label={t("textColor", { defaultValue: "Textfarbe (Text Primary)" })}
          name="text_color"
          value={data.text_color || ""}
          onChange={(val) => handleChange("text_color", val)}
          helper={t("textColorHelper", { defaultValue: "Hauptlesefarbe für Überschriften und Fließtext." })}
          error={errors["theme.text_color"]}
        />
      </div>

      <div style={{ maxWidth: "340px", marginTop: "var(--space-md)" }}>
        <SettingsField
          label={t("themeMode", { defaultValue: "Farbmodus" })}
          helper={t("themeModeHelper", { defaultValue: "Standard-Erscheinungsbild der Website." })}
          error={errors["theme.mode"]}
        >
          <Select
            value={data.mode || "light"}
            onChange={(e) => handleChange("mode", e.target.value)}
            options={[
              { value: "light", label: "Light Mode (Hell)" },
              { value: "dark", label: "Dark Mode (Dunkel)" },
              { value: "auto", label: "Auto (System-Präferenz)" },
            ]}
          />
        </SettingsField>
      </div>

      {/* Live Color Preview Miniature Card */}
      <div
        style={{
          marginTop: "var(--space-lg)",
          padding: "var(--space-md)",
          borderRadius: "var(--radius-md, 8px)",
          backgroundColor: bg,
          border: "1px solid rgba(255, 255, 255, 0.12)",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: accent,
            display: "block",
            marginBottom: "8px",
            fontWeight: 600,
          }}
        >
          Vorschau Farbpalette
        </span>
        <div
          style={{
            backgroundColor: card,
            padding: "var(--space-md)",
            borderRadius: "var(--radius-sm, 6px)",
            border: `1px solid ${secondary}33`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "var(--space-md)",
          }}
        >
          <div>
            <h4 style={{ margin: 0, color: text, fontSize: "var(--font-size-md)", fontWeight: 600 }}>
              Porsche 911 GT3 RS
            </h4>
            <p style={{ margin: "4px 0 0", color: `${text}99`, fontSize: "var(--font-size-xs)" }}>
              Vorschau der konfigurierten Farben im Fahrzeugkarten-Kontext
            </p>
          </div>
          <button
            type="button"
            style={{
              backgroundColor: primary,
              color: text,
              border: `1px solid ${accent}`,
              borderRadius: "4px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "default",
            }}
          >
            Fahrzeug anfragen
          </button>
        </div>
      </div>
    </SettingsSection>
  );
}

export default ThemeSettingsEditor;
