import React from "react";
import { useTranslation } from "react-i18next";
import Badge from "../ui/Badge";
import Icon from "../common/Icon";

export function AccountProfileCard({ user, className = "", style = {} }) {
  const { t } = useTranslation(["account", "common"]);

  if (!user) return null;

  return (
    <div
      className={`account-profile-card surface-card ${className}`.trim()}
      style={{
        backgroundColor: "var(--color-card)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--color-border)",
        padding: "clamp(var(--space-lg), 4vw, var(--space-xl))",
        boxShadow: "var(--shadow-elevation-1)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
        ...style,
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", marginBottom: "4px" }}>
          <Icon name="user" size={18} color="var(--color-secondary)" />
          <h2
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-bold)",
              letterSpacing: "var(--tracking-tight)",
              margin: 0,
              color: "var(--color-text)",
            }}
          >
            {t("profileSectionTitle")}
          </h2>
        </div>
        <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>
          {t("profileSectionSubtitle")}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--space-md)",
        }}
      >
        {/* Full Name */}
        <div
          style={{
            padding: "var(--space-md)",
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <div
            style={{
              fontSize: "var(--font-size-2xs)",
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-wide)",
              color: "var(--color-text-subtle)",
              marginBottom: "4px",
            }}
          >
            {t("fullName", { ns: "auth" })}
          </div>
          <div style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--color-text)" }}>
            {user.full_name || "—"}
          </div>
        </div>

        {/* Email Address */}
        <div
          style={{
            padding: "var(--space-md)",
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <div
            style={{
              fontSize: "var(--font-size-2xs)",
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-wide)",
              color: "var(--color-text-subtle)",
              marginBottom: "4px",
            }}
          >
            {t("email", { ns: "auth" })}
          </div>
          <div
            style={{
              fontSize: "var(--font-size-base)",
              fontWeight: 600,
              color: "var(--color-text)",
              wordBreak: "break-all",
            }}
          >
            {user.email || "—"}
          </div>
        </div>

        {/* Status */}
        <div
          style={{
            padding: "var(--space-md)",
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <div
            style={{
              fontSize: "var(--font-size-2xs)",
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-wide)",
              color: "var(--color-text-subtle)",
              marginBottom: "4px",
            }}
          >
            Status
          </div>
          <div>
            {user.is_verified ? (
              <Badge variant="success" size="sm">
                {t("verifiedBadge")}
              </Badge>
            ) : (
              <Badge variant="warning" size="sm">
                {t("unverifiedBadge")}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Audit/Provenance Notice */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-xs)",
          padding: "var(--space-sm) var(--space-md)",
          backgroundColor: "rgba(255, 255, 255, 0.02)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border-subtle)",
          fontSize: "var(--font-size-xs)",
          color: "var(--color-text-muted)",
        }}
      >
        <Icon name="info" size={14} color="var(--color-text-subtle)" style={{ flexShrink: 0 }} />
        <span>{t("profileReadOnlyNotice")}</span>
      </div>
    </div>
  );
}

export default AccountProfileCard;
