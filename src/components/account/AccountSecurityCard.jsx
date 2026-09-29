import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button";
import Icon from "../common/Icon";

export function AccountSecurityCard({ className = "", style = {} }) {
  const { t } = useTranslation(["account", "common"]);

  return (
    <div
      className={`account-security-card surface-card ${className}`.trim()}
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-sm)" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", marginBottom: "4px" }}>
            <Icon name="shield" size={18} color="var(--color-secondary)" />
            <h2
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-bold)",
                letterSpacing: "var(--tracking-tight)",
                margin: 0,
                color: "var(--color-text)",
              }}
            >
              {t("securityOverviewTitle")}
            </h2>
          </div>
          <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>
            {t("securityOverviewSubtitle")}
          </p>
        </div>

        <Button as={Link} to="/account/security" variant="outline" size="sm" iconRight="arrow-right">
          {t("changePasswordLink")}
        </Button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "var(--space-md)",
        }}
      >
        <div
          style={{
            padding: "var(--space-md)",
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-md)",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "rgba(16, 185, 129, 0.12)",
              color: "var(--color-success)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="check" size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: "var(--color-text)" }}>
              HttpOnly Session Security
            </div>
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "2px" }}>
              Aktive Sitzung mit geschützter Cookie-Authentifizierung
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "var(--space-md)",
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-md)",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              color: "var(--color-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="lock" size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: "var(--color-text)" }}>
              Passwortschutz
            </div>
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "2px" }}>
              Individuelles Kennwort mit Argon2/Bcrypt Hash-Verschlüsselung
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountSecurityCard;
