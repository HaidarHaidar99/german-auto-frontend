import React from "react";
import SettingsResetButton from "./SettingsResetButton";
import SettingsPreviewButton from "./SettingsPreviewButton";

/**
 * SettingsSectionHeader — Standardized header for each CMS section editor.
 */
export function SettingsSectionHeader({
  title,
  subtitle,
  badge = null,
  previewUrl = null,
  sectionKey = null,
  onReset = null,
  resetLoading = false,
  className = "",
  style = {},
  actions = null,
}) {
  return (
    <div
      className={`settings-section-header ${className}`.trim()}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-md)",
        paddingBottom: "var(--space-md)",
        marginBottom: "var(--space-lg)",
        borderBottom: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
        ...style,
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "var(--font-size-lg)",
              fontFamily: "var(--font-heading, inherit)",
              fontWeight: 600,
              color: "var(--color-admin-text, #ffffff)",
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h2>
          {badge}
        </div>
        {subtitle && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-admin-muted, var(--color-text-muted))",
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", flexWrap: "wrap" }}>
        {previewUrl && <SettingsPreviewButton url={previewUrl} />}
        {sectionKey && onReset && (
          <SettingsResetButton
            sectionName={title}
            onReset={onReset}
            loading={resetLoading}
          />
        )}
        {actions}
      </div>
    </div>
  );
}

export default SettingsSectionHeader;
