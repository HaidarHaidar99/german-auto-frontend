import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Drawer from "../../ui/Drawer";
import Button from "../../ui/Button";
import Icon from "../../common/Icon";

function formatDateTime(isoString, lang = "en") {
  if (!isoString) return "—";
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat(lang === "de" ? "de-DE" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  } catch {
    return isoString;
  }
}

export function UserDetailDrawer({
  isOpen,
  onClose,
  user,
  currentUserId,
  onChangeRole,
  onRevokeSessions,
  onDeleteUser,
  className = "",
}) {
  const { t, i18n } = useTranslation(["admin", "common"]);
  const currentLang = i18n.language || "en";
  const [copiedId, setCopiedId] = useState(false);

  if (!user) return null;

  const isSelf = user.id === currentUserId;

  const handleCopyId = () => {
    if (!user.id) return;
    navigator.clipboard?.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={t("userDetails", { defaultValue: "User Details" })}
      className={className}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-xl)",
        }}
      >
        {/* User Identity Header Card */}
        <div
          style={{
            padding: "var(--space-md)",
            backgroundColor: "var(--color-admin-border-subtle)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-admin-border)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-md)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "var(--color-admin-card, #ffffff)",
              border: "1.5px solid var(--color-admin-border)",
              color: "var(--color-admin-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "1.25rem",
              flexShrink: 0,
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.08)",
            }}
          >
            {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h4
              style={{
                margin: "0 0 4px 0",
                fontSize: "var(--font-size-base)",
                fontWeight: 700,
                color: "var(--color-admin-text, #0f172a)",
                wordBreak: "break-word",
              }}
            >
              {user.full_name || "—"}
            </h4>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-admin-muted)",
                wordBreak: "break-all",
              }}
            >
              {user.email}
            </div>
            {isSelf && (
              <span
                style={{
                  display: "inline-block",
                  marginTop: "4px",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "var(--color-admin-accent)",
                  textTransform: "uppercase",
                }}
              >
                {t("currentlyLoggedInSuperAdmin", { defaultValue: "(Currently logged-in Super Admin)" })}
              </span>
            )}
          </div>
        </div>

        {/* Detailed Fields List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          {/* User ID */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              paddingBottom: "var(--space-sm)",
              borderBottom: "1px solid var(--color-admin-border)",
            }}
          >
            <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--color-admin-muted)", fontWeight: 600 }}>
              {t("userId", { defaultValue: "User ID (UUID)" })}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <code
                style={{
                  fontSize: "12px",
                  color: "var(--color-admin-text, #0f172a)",
                  backgroundColor: "var(--color-admin-border-subtle)",
                  padding: "4px 8px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-admin-border)",
                  wordBreak: "break-all",
                  flex: 1,
                }}
              >
                {user.id}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyId}
                style={{ padding: "4px 8px", fontSize: "11px" }}
              >
                <Icon name={copiedId ? "check" : "share-2"} size={12} />
                <span style={{ marginLeft: "4px" }}>{copiedId ? t("copied", { defaultValue: "Copied" }) : t("copy", { defaultValue: "Copy" })}</span>
              </Button>
            </div>
          </div>

          {/* Role */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "var(--space-sm)",
              borderBottom: "1px solid var(--color-admin-border)",
            }}
          >
            <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--color-admin-muted)", fontWeight: 600 }}>
              {t("role", { defaultValue: "Role" })}
            </span>
            <span
              style={{
                fontWeight: 700,
                fontSize: "12px",
                padding: "3px 10px",
                borderRadius: "var(--radius-sm)",
                backgroundColor:
                  user.role === "SUPER_ADMIN"
                    ? "rgba(245, 158, 11, 0.12)"
                    : user.role === "ADMIN"
                    ? "rgba(2, 132, 199, 0.1)"
                    : "var(--color-admin-border-subtle)",
                color:
                  user.role === "SUPER_ADMIN"
                    ? "#d97706"
                    : user.role === "ADMIN"
                    ? "#0284c7"
                    : "var(--color-admin-muted)",
                border:
                  user.role === "SUPER_ADMIN"
                    ? "1px solid rgba(245, 158, 11, 0.35)"
                    : user.role === "ADMIN"
                    ? "1px solid rgba(2, 132, 199, 0.2)"
                    : "1px solid var(--color-admin-border)",
              }}
            >
              {user.role}
            </span>
          </div>

          {/* Verification Status */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "var(--space-sm)",
              borderBottom: "1px solid var(--color-admin-border)",
            }}
          >
            <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--color-admin-muted)", fontWeight: 600 }}>
              {t("verificationStatus", { defaultValue: "Verification Status" })}
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: user.is_verified ? "#4ade80" : "#fbbf24",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Icon name={user.is_verified ? "check" : "alert-circle"} size={14} />
              {user.is_verified
                ? t("verified", { defaultValue: "Email Verified" })
                : t("unverified", { defaultValue: "Not Verified" })}
            </span>
          </div>

          {/* Created At */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "var(--space-sm)",
              borderBottom: "1px solid var(--color-admin-border)",
            }}
          >
            <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--color-admin-muted)", fontWeight: 600 }}>
              {t("createdAt", { defaultValue: "Registration Date" })}
            </span>
            <span style={{ fontSize: "12px", color: "var(--color-admin-text, #0f172a)" }}>
              {formatDateTime(user.created_at, currentLang)}
            </span>
          </div>

          {/* Updated At */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "var(--space-sm)",
              borderBottom: "1px solid var(--color-admin-border)",
            }}
          >
            <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--color-admin-muted)", fontWeight: 600 }}>
              {t("updatedAt", { defaultValue: "Last Modified" })}
            </span>
            <span style={{ fontSize: "12px", color: "var(--color-admin-text, #0f172a)" }}>
              {formatDateTime(user.updated_at, currentLang)}
            </span>
          </div>
        </div>

        {/* Security Controls Notice */}
        <div
          style={{
            padding: "var(--space-sm) var(--space-md)",
            backgroundColor: "rgba(59, 130, 246, 0.06)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            borderRadius: "var(--radius-md)",
            fontSize: "12px",
            color: "var(--color-admin-muted)",
            lineHeight: 1.5,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#60a5fa", fontWeight: 600, marginBottom: "2px" }}>
            <Icon name="info" size={14} />
            <span>{t("securityManagement", { defaultValue: "Security Management" })}</span>
          </div>
          {t("securityNoticeDesc", { defaultValue: "Role updates and session revocation immediately invalidate all active authentication tokens for this user." })}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", marginTop: "auto" }}>
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              onChangeRole(user);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Icon name="shield" size={16} />
            <span>{t("changeRole", { defaultValue: "Update User Role" })}</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              onClose();
              onRevokeSessions(user);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Icon name="refresh-cw" size={16} />
            <span>{t("revokeUserSessions", { defaultValue: "Revoke Active Sessions" })}</span>
          </Button>

          <Button
            variant="outline"
            disabled={isSelf}
            onClick={() => {
              if (!isSelf) {
                onClose();
                onDeleteUser(user);
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: isSelf ? "var(--color-admin-muted)" : "var(--color-error, #ef4444)",
              borderColor: isSelf ? "var(--color-admin-border)" : "rgba(239, 68, 68, 0.35)",
              backgroundColor: isSelf ? "transparent" : "rgba(239, 68, 68, 0.06)",
              opacity: isSelf ? 0.35 : 1,
              cursor: isSelf ? "not-allowed" : "pointer",
            }}
          >
            <Icon name="trash" size={16} />
            <span>
              {isSelf
                ? t("cannotDeleteOwnAccount", { defaultValue: "Cannot delete own account" })
                : t("deleteUserAccount", { defaultValue: "Permanently Delete User Account" })}
            </span>
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

export default UserDetailDrawer;
