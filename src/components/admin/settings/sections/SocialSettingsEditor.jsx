import React from "react";
import { useTranslation } from "react-i18next";
import SettingsSection from "../SettingsSection";
import SettingsToggle from "../SettingsToggle";
import Input from "../../../forms/Input";

const PLATFORMS = [
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/..." },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@..." },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/..." },
  { key: "x", label: "X (Twitter)", placeholder: "https://x.com/..." },
];

export function SocialSettingsEditor({
  data = {},
  onChange,
  onReset,
  resetLoading,
  errors = {},
}) {
  const { t } = useTranslation(["admin", "common"]);

  const handlePlatformChange = (platformKey, patch) => {
    const current = data[platformKey] || { enabled: false, url: null };
    onChange?.({
      ...data,
      [platformKey]: {
        ...current,
        ...patch,
      },
    });
  };

  return (
    <SettingsSection
      title={t("settingsSections.social", { defaultValue: "Social Media Verknüpfungen" })}
      subtitle={t("socialSubtitle", {
        defaultValue: "Aktivieren Sie Ihre offiziellen Social-Media-Kanäle für Footer und Kontaktauftritt.",
      })}
      sectionKey="social"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        {PLATFORMS.map(({ key, label, placeholder }) => {
          const item = data[key] || { enabled: false, url: "" };
          const err = errors[`social.${key}.url`] || errors[`social.${key}`];

          return (
            <div
              key={key}
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr",
                alignItems: "center",
                gap: "var(--space-md)",
                padding: "var(--space-sm) var(--space-md)",
                backgroundColor: item.enabled
                  ? "rgba(255, 255, 255, 0.03)"
                  : "rgba(255, 255, 255, 0.01)",
                border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
                borderRadius: "var(--radius-sm, 6px)",
              }}
            >
              <div>
                <SettingsToggle
                  label={label}
                  checked={Boolean(item.enabled)}
                  onChange={(checked) => handlePlatformChange(key, { enabled: checked })}
                  style={{ padding: 0 }}
                />
              </div>

              <div>
                <Input
                  value={item.url || ""}
                  disabled={!item.enabled}
                  onChange={(e) => handlePlatformChange(key, { url: e.target.value })}
                  placeholder={placeholder}
                  error={err}
                />
              </div>
            </div>
          );
        })}
      </div>
    </SettingsSection>
  );
}

export default SocialSettingsEditor;
