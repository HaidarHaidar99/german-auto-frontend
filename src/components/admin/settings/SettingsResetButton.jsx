import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import Icon from "../../common/Icon";

/**
 * SettingsResetButton — Confirmation modal trigger to reset a section to defaults.
 */
export function SettingsResetButton({
  sectionName,
  onReset,
  loading = false,
  disabled = false,
  className = "",
}) {
  const { t } = useTranslation(["admin", "common"]);
  const [modalOpen, setModalOpen] = useState(false);

  const handleConfirm = async () => {
    try {
      await onReset?.();
      setModalOpen(false);
    } catch {
      // Error handled by parent toast/error state
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled || loading}
        onClick={() => setModalOpen(true)}
        className={className}
        style={{
          color: "var(--color-admin-muted, var(--color-text-muted))",
          fontSize: "var(--font-size-xs)",
        }}
      >
        <Icon name="refresh-cw" size={14} style={{ marginRight: "6px" }} />
        {t("resetSection", { defaultValue: "Bereich zurücksetzen" })}
      </Button>

      <Modal
        isOpen={modalOpen}
        onClose={() => !loading && setModalOpen(false)}
        title={t("resetSectionTitle", { defaultValue: "Bereich auf Standard zurücksetzen?" })}
        size="sm"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <p
            style={{
              margin: 0,
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-muted)",
              lineHeight: 1.6,
            }}
          >
            {t("resetSectionExplanation", {
              defaultValue:
                "Möchten Sie diesen Bereich wirklich zurücksetzen? Alle benutzerdefinierten Angaben dieses Bereichs werden auf den vom System vorgegebenen Standardzustand zurückgestellt.",
            })}
          </p>

          <div
            style={{
              padding: "var(--space-sm) var(--space-md)",
              backgroundColor: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "var(--radius-sm, 6px)",
              fontSize: "var(--font-size-xs)",
              color: "var(--color-error, #ef4444)",
            }}
          >
            <strong>{t("warning", { defaultValue: "Hinweis" })}:</strong>{" "}
            {sectionName
              ? `Betroffener Bereich: ${sectionName}`
              : "Diese Aktion kann nicht rückgängig gemacht werden."}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "var(--space-sm)",
              marginTop: "var(--space-sm)",
            }}
          >
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => setModalOpen(false)}
            >
              {t("cancel", { defaultValue: "Abbrechen" })}
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={loading}
              onClick={handleConfirm}
              style={{
                backgroundColor: "var(--color-error, #ef4444)",
                borderColor: "var(--color-error, #ef4444)",
                color: "#ffffff",
              }}
            >
              {t("confirmReset", { defaultValue: "Jetzt zurücksetzen" })}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default SettingsResetButton;
