import React from "react";
import { useTranslation } from "react-i18next";
import SettingsSection from "../SettingsSection";
import SettingsToggle from "../SettingsToggle";

const PLATFORMS = [
  { key: "facebook", label: "Facebook", prefix: "https://facebook.com/", placeholder: "username or page" },
  { key: "instagram", label: "Instagram", prefix: "https://instagram.com/", placeholder: "username" },
  { key: "whatsapp", label: "WhatsApp", prefix: "https://wa.me/", placeholder: "e.g. 491512345678" },
  { key: "tiktok", label: "TikTok", prefix: "https://tiktok.com/@", placeholder: "username" },
  { key: "youtube", label: "YouTube", prefix: "https://youtube.com/@", placeholder: "channel" },
  { key: "linkedin", label: "LinkedIn", prefix: "https://linkedin.com/company/", placeholder: "company-name" },
  { key: "x", label: "X (Twitter)", prefix: "https://x.com/", placeholder: "handle" },
];

function extractAccount(fullUrl, prefix) {
  if (!fullUrl) return "";
  const trimmed = String(fullUrl).trim();
  if (trimmed.startsWith(prefix)) {
    return trimmed.slice(prefix.length);
  }
  const normalizedPrefix = prefix.replace(/\/+$/, "");
  if (trimmed.startsWith(normalizedPrefix + "/")) {
    return trimmed.slice(normalizedPrefix.length + 1);
  }
  return trimmed;
}

function composeUrl(account, prefix) {
  const trimmed = String(account).trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const cleanAccount = trimmed.replace(/^@/, "").replace(/^\/+/, "");
  return `${prefix}${cleanAccount}`;
}

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
      title={t("settingsSections.social", { defaultValue: "Social Media Links" })}
      subtitle={t("socialSubtitle", {
        defaultValue: "Activate your official social media channels. You only need to enter your username or number.",
      })}
      sectionKey="social"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {PLATFORMS.map(({ key, label, prefix, placeholder }) => {
          const item = data[key] || { enabled: false, url: "" };
          const err = errors[`social.${key}.url`] || errors[`social.${key}`];
          const accountVal = extractAccount(item.url || "", prefix);

          return (
            <div
              key={key}
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr",
                alignItems: "center",
                gap: "16px",
                padding: "12px 18px",
                backgroundColor: item.enabled
                  ? "var(--color-admin-card)"
                  : "var(--color-admin-border-subtle, rgba(0,0,0,0.02))",
                border: "1px solid var(--color-admin-border)",
                borderRadius: "12px",
                transition: "all 0.15s ease",
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "var(--color-admin-pill-bg)",
                    border: `1px solid ${err ? "#ef4444" : "var(--color-admin-border)"}`,
                    borderRadius: "8px",
                    overflow: "hidden",
                    opacity: item.enabled ? 1 : 0.55,
                    transition: "border-color 0.15s ease",
                  }}
                >
                  <span
                    style={{
                      padding: "8px 12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      backgroundColor: "var(--color-admin-border-subtle)",
                      color: "var(--color-admin-muted)",
                      borderRight: "1px solid var(--color-admin-border)",
                      userSelect: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {prefix}
                  </span>
                  <input
                    type="text"
                    disabled={!item.enabled}
                    value={accountVal}
                    onChange={(e) => {
                      const typed = e.target.value;
                      const finalUrl = typed ? composeUrl(typed, prefix) : "";
                      handlePlatformChange(key, { url: finalUrl });
                    }}
                    placeholder={placeholder}
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      padding: "8px 12px",
                      fontSize: "13px",
                      backgroundColor: "transparent",
                      color: "var(--color-admin-text)",
                    }}
                  />
                </div>
                {err && (
                  <span style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px", display: "block" }}>
                    {err}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SettingsSection>
  );
}

export default SocialSettingsEditor;
