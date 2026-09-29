import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Icon from "../../common/Icon";
import adminUsersService from "../../../services/adminUsers/adminUsers.service";

export function ChangeRoleModal({
  isOpen,
  onClose,
  user,
  currentUserId,
  onSuccess,
  className = "",
}) {
  const { t } = useTranslation(["admin", "common"]);

  const [selectedRole, setSelectedRole] = useState(user?.role || "CUSTOMER");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role || "CUSTOMER");
      setServerError(null);
      setLoading(false);
    }
  }, [user]);

  if (!user) return null;

  const isSelf = user.id === currentUserId;
  const isDemotingSelf = isSelf && user.role === "SUPER_ADMIN" && selectedRole !== "SUPER_ADMIN";
  const isUnchanged = selectedRole === user.role;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (isUnchanged) {
      onClose();
      return;
    }

    try {
      setLoading(true);
      const res = await adminUsersService.updateRole(user.id, selectedRole);
      const updatedUser = res?.data?.user;
      onSuccess(updatedUser || { ...user, role: selectedRole });
      onClose();
    } catch (err) {
      setServerError(
        err?.message ||
        t("errorChangeRoleFailed", { defaultValue: "Fehler beim Aktualisieren der Benutzerrolle." })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("changeRoleTitle", { defaultValue: "Benutzerrolle anpassen" })}
      size="md"
      className={className}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        {/* User Summary Box */}
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "var(--color-admin-border-subtle)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-admin-border)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: "var(--color-admin-text)" }}>
            {user.full_name || "—"}
          </div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-admin-muted)", wordBreak: "break-all" }}>
            {user.email}
          </div>
          <div style={{ fontSize: "11px", color: "var(--color-admin-muted)", marginTop: "4px" }}>
            Aktuelle Rolle:{" "}
            <strong style={{ color: "var(--color-admin-text)" }}>{user.role}</strong>
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

        {/* Role Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-admin-text)" }}>
            {t("selectNewRole", { defaultValue: "Neue Rolle auswählen" })}:
          </label>

          {/* CUSTOMER */}
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "12px",
              borderRadius: "var(--radius-md)",
              border: `1px solid ${selectedRole === "CUSTOMER" ? "var(--color-admin-accent)" : "var(--color-admin-border)"}`,
              backgroundColor: selectedRole === "CUSTOMER" ? "var(--color-admin-accent-subtle)" : "var(--color-admin-card)",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="targetRole"
              value="CUSTOMER"
              checked={selectedRole === "CUSTOMER"}
              onChange={() => setSelectedRole("CUSTOMER")}
              style={{ marginTop: "3px" }}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: "var(--color-admin-text)" }}>
                CUSTOMER (Standard-Kunde)
              </div>
              <div style={{ fontSize: "11px", color: "var(--color-admin-muted)", marginTop: "2px" }}>
                Zugriff auf öffentliches Portal, Fahrzeugsuche, Merkliste und eigene Kontoeinstellungen. Kein Admin-Zugang.
              </div>
            </div>
          </label>

          {/* ADMIN */}
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "12px",
              borderRadius: "var(--radius-md)",
              border: `1px solid ${selectedRole === "ADMIN" ? "var(--color-admin-accent)" : "var(--color-admin-border)"}`,
              backgroundColor: selectedRole === "ADMIN" ? "var(--color-admin-accent-subtle)" : "var(--color-admin-card)",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="targetRole"
              value="ADMIN"
              checked={selectedRole === "ADMIN"}
              onChange={() => setSelectedRole("ADMIN")}
              style={{ marginTop: "3px" }}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: "#0284c7" }}>
                ADMIN (Administrator)
              </div>
              <div style={{ fontSize: "11px", color: "var(--color-admin-muted)", marginTop: "2px" }}>
                Verwaltung von Fahrzeugbestand, Formulareingängen, Kundenbewertungen und Benachrichtigungen.
              </div>
            </div>
          </label>

          {/* SUPER_ADMIN */}
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "12px",
              borderRadius: "var(--radius-md)",
              border: `1px solid ${selectedRole === "SUPER_ADMIN" ? "#f59e0b" : "var(--color-admin-border)"}`,
              backgroundColor: selectedRole === "SUPER_ADMIN" ? "rgba(245, 158, 11, 0.08)" : "var(--color-admin-card)",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="targetRole"
              value="SUPER_ADMIN"
              checked={selectedRole === "SUPER_ADMIN"}
              onChange={() => setSelectedRole("SUPER_ADMIN")}
              style={{ marginTop: "3px" }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: "var(--font-size-sm)", color: "#d97706" }}>
                SUPER_ADMIN (Hauptadministrator)
              </div>
              <div style={{ fontSize: "11px", color: "var(--color-admin-muted)", marginTop: "2px" }}>
                Vollzugriff auf alle administrativen Bereiche, Benutzerverwaltung und CMS-Systemeinstellungen.
              </div>
            </div>
          </label>
        </div>

        {/* Warning Callout: Session Invalidation */}
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            borderRadius: "var(--radius-md)",
            fontSize: "12px",
            color: "#b45309",
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            lineHeight: 1.45,
          }}
        >
          <Icon name="alert-circle" size={16} style={{ flexShrink: 0, marginTop: "2px", color: "#d97706" }} />
          <div>
            <strong>Sitzungsinvalidierung:</strong> Durch die Rollenänderung wird die Versionsnummer der Tokens (token_version) im Backend erhöht. Alle aktiven Sitzungen dieses Benutzers werden sofort ungültig.
          </div>
        </div>

        {/* Self-Demotion Alert */}
        {isDemotingSelf && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "var(--radius-md)",
              fontSize: "12px",
              color: "var(--color-error)",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <Icon name="alert-circle" size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong>Achtung:</strong> Sie stufen Ihr eigenes Super-Admin-Konto herab. Nach dieser Änderung verlieren Sie sofort den Zugriff auf diese Benutzerverwaltung.
            </div>
          </div>
        )}

        {/* Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "var(--space-sm)",
            marginTop: "var(--space-sm)",
            borderTop: "1px solid var(--color-admin-border)",
            paddingTop: "var(--space-md)",
          }}
        >
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            {t("cancel", { defaultValue: "Abbrechen" })}
          </Button>

          <Button type="submit" variant="primary" disabled={loading || isUnchanged}>
            {loading
              ? t("updating", { defaultValue: "Wird gespeichert..." })
              : t("saveRoleChange", { defaultValue: "Rolle übernehmen" })}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ChangeRoleModal;
