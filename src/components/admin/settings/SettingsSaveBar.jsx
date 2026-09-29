import React from "react";
import { useTranslation } from "react-i18next";
import Button from "../../ui/Button";
import Icon from "../../common/Icon";

/**
 * SettingsSaveBar — Sticky bottom action bar for saving CMS changes.
 */
export function SettingsSaveBar({
  hasChanges = false,
  saving = false,
  onSave,
  onDiscard,
  saveSuccess = false,
  error = null,
  className = "",
  style = {},
}) {
  const { t } = useTranslation(["admin", "common"]);

  return (
    <div
      className={`settings-save-bar ${className}`.trim()}
      style={{
        position: "sticky",
        bottom: "var(--space-md)",
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "var(--space-md)",
        padding: "var(--space-md) var(--space-lg)",
        backgroundColor: "var(--color-admin-card)",
        border: "1px solid var(--color-admin-border)",
        borderRadius: "12px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
        marginTop: "var(--space-xl)",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", flex: 1, minWidth: "240px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "var(--font-size-sm)",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: hasChanges
                ? "var(--color-primary, var(--color-text))"
                : saveSuccess
                ? "#22c55e"
                : "rgba(255, 255, 255, 0.25)",
              boxShadow: hasChanges
                ? "0 0 8px rgba(255, 255, 255, 0.6)"
                : saveSuccess
                ? "0 0 8px rgba(34, 197, 94, 0.6)"
                : "none",
            }}
          />
          <span
            style={{
              color: hasChanges
                ? "var(--color-admin-text, #ffffff)"
                : saveSuccess
                ? "#22c55e"
                : "var(--color-admin-muted, var(--color-text-muted))",
              fontWeight: hasChanges ? 500 : 400,
            }}
          >
            {hasChanges
              ? t("unsavedChangesPresent", { defaultValue: "Ungespeicherte Änderungen vorhanden" })
              : saveSuccess
              ? t("changesSavedSuccessfully", { defaultValue: "Änderungen erfolgreich gespeichert" })
              : t("allChangesSaved", { defaultValue: "Alle Änderungen gespeichert" })}
          </span>
        </div>

        {error && (
          <p
            role="alert"
            style={{
              margin: 0,
              fontSize: "var(--font-size-xs)",
              color: "var(--color-error, #ef4444)",
              lineHeight: 1.4,
            }}
          >
            {error}
          </p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
        {hasChanges && (
          <Button
            variant="ghost"
            size="sm"
            disabled={saving}
            onClick={onDiscard}
            style={{
              color: "var(--color-admin-muted, var(--color-text-muted))",
            }}
          >
            {t("discardChanges", { defaultValue: "Verwerfen" })}
          </Button>
        )}

        <Button
          variant="primary"
          size="sm"
          loading={saving}
          disabled={!hasChanges || saving}
          onClick={onSave}
          style={{
            minWidth: "130px",
          }}
        >
          <Icon name="save" size={16} style={{ marginRight: "6px" }} />
          {saving
            ? t("saving", { defaultValue: "Speichern..." })
            : t("saveChanges", { defaultValue: "Speichern" })}
        </Button>
      </div>
    </div>
  );
}

export default SettingsSaveBar;
