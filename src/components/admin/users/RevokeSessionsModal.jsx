import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Icon from "../../common/Icon";
import adminUsersService from "../../../services/adminUsers/adminUsers.service";

export function RevokeSessionsModal({
  isOpen,
  onClose,
  user,
  currentUserId,
  onSuccess,
  className = "",
}) {
  const { t } = useTranslation(["admin", "common"]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  if (!user) return null;

  const isSelf = user.id === currentUserId;

  const handleRevoke = async () => {
    setServerError(null);
    try {
      setLoading(true);
      await adminUsersService.revokeSessions(user.id);
      onSuccess(user);
      onClose();
    } catch (err) {
      setServerError(
        err?.message ||
        t("errorRevokeSessionsFailed", { defaultValue: "Fehler beim Beenden der Sitzungen." })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("revokeSessionsTitle", { defaultValue: "Sitzungen beenden?" })}
      size="sm"
      className={className}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        {/* User Card */}
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-admin-border)",
            fontSize: "var(--font-size-xs)",
          }}
        >
          <div style={{ fontWeight: 600, color: "var(--color-admin-text)" }}>{user.full_name || "—"}</div>
          <div style={{ color: "var(--color-admin-muted)", wordBreak: "break-all" }}>{user.email}</div>
        </div>

        {serverError && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-error)",
              fontSize: "var(--font-size-xs)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Icon name="alert-circle" size={16} />
            <span>{serverError}</span>
          </div>
        )}

        <p
          style={{
            margin: 0,
            fontSize: "var(--font-size-sm)",
            color: "var(--color-admin-muted)",
            lineHeight: 1.5,
          }}
        >
          {t("revokeSessionsExplanation", {
            defaultValue:
              "Dies invalidiert alle aktiven Sitzungen für diesen Benutzer. Alle bestehenden JWT-Anmeldetoken verlieren sofort ihre Gültigkeit und der Benutzer muss sich erneut anmelden.",
          })}
        </p>

        {isSelf && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "var(--radius-md)",
              fontSize: "12px",
              color: "#fbbf24",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <Icon name="alert-circle" size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>
              <strong>Hinweis:</strong> Sie beenden die Sitzungen Ihres eigenen Kontos. Nach Abschluss müssen Sie sich bei Ihrer nächsten Aktion erneut authentifizieren.
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "var(--space-sm)",
            borderTop: "1px solid var(--color-admin-border)",
            paddingTop: "var(--space-md)",
          }}
        >
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {t("cancel", { defaultValue: "Abbrechen" })}
          </Button>

          <Button variant="primary" onClick={handleRevoke} disabled={loading}>
            {loading
              ? t("revoking", { defaultValue: "Wird beendet..." })
              : t("confirmRevokeSessions", { defaultValue: "Sitzungen beenden" })}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default RevokeSessionsModal;
