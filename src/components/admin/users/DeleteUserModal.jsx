import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Icon from "../../common/Icon";
import adminUsersService from "../../../services/adminUsers/adminUsers.service";

export function DeleteUserModal({
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

  const handleDelete = async () => {
    if (isSelf) return;
    setServerError(null);

    try {
      setLoading(true);
      await adminUsersService.deleteUser(user.id);
      onSuccess(user.id);
      onClose();
    } catch (err) {
      setServerError(
        err?.message ||
        t("errorDeleteUserFailed", { defaultValue: "Fehler beim Löschen des Benutzerkontos." })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("deleteUserTitle", { defaultValue: "Benutzerkonto dauerhaft löschen?" })}
      size="sm"
      className={className}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        {/* Warning Banner */}
        <div
          style={{
            padding: "12px 14px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            color: "var(--color-error)",
            fontSize: "var(--font-size-xs)",
            lineHeight: 1.45,
          }}
        >
          <Icon name="trash" size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong>Unwiderrufliche Aktion:</strong> Das Konto wird vollständig und permanent aus der Datenbank entfernt. Es handelt sich nicht um eine Deaktivierung.
          </div>
        </div>

        {/* User Card */}
        <div
          style={{
            padding: "12px 14px",
            backgroundColor: "var(--color-admin-border-subtle)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-admin-border)",
            fontSize: "var(--font-size-xs)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <div style={{ fontWeight: 600, color: "var(--color-admin-text)", fontSize: "var(--font-size-sm)" }}>
            {user.full_name || "—"}
          </div>
          <div style={{ color: "var(--color-admin-muted)", wordBreak: "break-all" }}>{user.email}</div>
          <div style={{ color: "var(--color-admin-muted)", marginTop: "2px" }}>
            Rolle: <strong style={{ color: "var(--color-admin-text)" }}>{user.role}</strong>
          </div>
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

        {isSelf ? (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "var(--radius-md)",
              fontSize: "12px",
              color: "#fbbf24",
            }}
          >
            Sie können Ihr eigenes Konto nicht über die administrative Benutzerverwaltung löschen.
          </div>
        ) : (
          <p
            style={{
              margin: 0,
              fontSize: "var(--font-size-xs)",
              color: "var(--color-admin-muted)",
              lineHeight: 1.5,
            }}
          >
            Möchten Sie das Konto von <strong>{user.full_name || user.email}</strong> wirklich unwiderruflich löschen?
          </p>
        )}

        {/* Buttons */}
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

          <Button
            variant="primary"
            onClick={handleDelete}
            disabled={loading || isSelf}
            style={{
              backgroundColor: "var(--color-error)",
              borderColor: "var(--color-error)",
              color: "#ffffff",
            }}
          >
            {loading
              ? t("deleting", { defaultValue: "Wird gelöscht..." })
              : t("confirmDeleteUser", { defaultValue: "Konto endgültig löschen" })}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteUserModal;
