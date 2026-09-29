import React from "react";
import { useTranslation } from "react-i18next";
import Badge from "../ui/Badge";
import Icon from "../common/Icon";

export function AccountHeader({ user, className = "", style = {} }) {
  const { t, i18n } = useTranslation(["account", "common"]);

  if (!user) return null;

  const currentLang = i18n.language || "de";
  const formattedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString(currentLang === "de" ? "de-DE" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const roleLabel =
    user.role === "SUPER_ADMIN"
      ? t("roleSuperAdmin")
      : user.role === "ADMIN"
      ? t("roleAdmin")
      : t("roleCustomer");

  return (
    <header
      className={`account-header ${className}`.trim()}
      style={{
        backgroundColor: "var(--color-card)",
        borderRadius: "var(--radius-2xl)",
        border: "1px solid var(--color-border)",
        padding: "clamp(var(--space-lg), 4vw, var(--space-2xl))",
        boxShadow: "var(--shadow-elevation-1)",
        position: "relative",
        overflow: "hidden",
        marginBottom: "var(--space-xl)",
        ...style,
      }}
    >
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-md)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
          {/* Monogram Avatar */}
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              color: "var(--color-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "var(--font-size-lg)",
              fontWeight: 700,
              letterSpacing: "0.5px",
              flexShrink: 0,
            }}
          >
            {user.full_name
              ? user.full_name
                  .split(" ")
                  .map((p) => p[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : "GA"}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "var(--font-size-xs)",
                  textTransform: "uppercase",
                  letterSpacing: "var(--tracking-wider)",
                  color: "var(--color-secondary)",
                  fontWeight: 600,
                }}
              >
                {t("welcomeBack")}
              </span>
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

            <h1
              style={{
                fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)",
                fontWeight: "var(--font-weight-bold)",
                letterSpacing: "var(--tracking-tight)",
                margin: "2px 0 0 0",
                color: "var(--color-text)",
              }}
            >
              {user.full_name || user.email}
            </h1>
          </div>
        </div>

        {/* User Badges / Metadata */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-md)",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border-subtle)",
              fontSize: "var(--font-size-xs)",
              color: "var(--color-text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Icon name="shield" size={14} color="var(--color-secondary)" />
            <span>{roleLabel}</span>
          </div>

          {formattedDate && (
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-muted)",
              }}
            >
              {t("memberSince")} {formattedDate}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AccountHeader;
