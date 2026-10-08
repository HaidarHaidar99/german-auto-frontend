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
      title={t("settingsSections.theme", { defaultValue: "Theme & Colors" })}
      subtitle={t("themeSubtitle", {
        defaultValue: "Customize primary accent colors, surfaces, and typography shades.",
      })}
      sectionKey="theme"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/"
    >
      <div style={{ maxWidth: "800px", padding: "var(--space-md)", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", marginBottom: "var(--space-xl)" }}>
        <h4 style={{ margin: "0 0 var(--space-xs) 0", color: "var(--color-text)", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-text)" }} />
          Premium Monochrome Design System Enforced
        </h4>
        <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)", lineHeight: "1.6" }}>
          The visual identity is strictly locked to the Premium Automotive Editorial standard (Black, White, and Grayscale). Custom brand colors, gradients, and accents have been disabled to ensure maximum visual luxury and consistency across all touchpoints.
        </p>
      </div>

      <div style={{ maxWidth: "340px" }}>
        <SettingsField
          label={t("themeMode", { defaultValue: "Theme Mode" })}
          helper={t("themeModeHelper", { defaultValue: "Default appearance of the website." })}
          error={errors["theme.mode"]}
        >
          <Select
            value={data.mode || "dark"}
            onChange={(e) => handleChange("mode", e.target.value)}
            options={[
              { value: "dark", label: t("themeOptions.dark", { defaultValue: "Dark Mode" }) },
              { value: "light", label: t("themeOptions.light", { defaultValue: "Light Mode" }) },
              { value: "auto", label: t("themeOptions.auto", { defaultValue: "Auto (System Preference)" }) },
            ]}
          />
        </SettingsField>
      </div>
    </SettingsSection>
  );
}

export default ThemeSettingsEditor;
