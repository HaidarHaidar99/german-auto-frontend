import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function ForgotPasswordPage() {
  const { t } = useTranslation(["auth", "common"]);

  return (
    <div className="container" style={{ padding: "var(--space-3xl) var(--space-md)", maxWidth: "450px" }}>
      <div
        style={{
          padding: "var(--space-2xl)",
          backgroundColor: "var(--color-card)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", marginBottom: "var(--space-md)", textAlign: "center" }}>
          {t("forgotPassword")}
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginBottom: "var(--space-lg)", textAlign: "center" }}>
          Geben Sie Ihre E-Mail-Adresse ein, um einen Link zum Zurücksetzen Ihres Passworts zu erhalten.
        </p>

        <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <div>
            <label style={{ display: "block", marginBottom: "var(--space-xs)", fontSize: "0.875rem" }}>
              {t("email")}
            </label>
            <input type="email" placeholder="ihre.email@example.de" disabled />
          </div>

          <button
            type="submit"
            style={{
              padding: "12px",
              backgroundColor: "var(--color-secondary)",
              color: "var(--color-primary)",
              borderRadius: "var(--radius-md)",
              fontWeight: 700,
              marginTop: "var(--space-sm)",
            }}
          >
            {t("sendResetLink")}
          </button>
        </form>

        <div style={{ marginTop: "var(--space-lg)", textAlign: "center", fontSize: "0.875rem" }}>
          <Link to="/login">← Zurück zum Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
