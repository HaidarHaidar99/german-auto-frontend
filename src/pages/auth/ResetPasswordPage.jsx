import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
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
          {t("resetPassword")}
        </h1>
        {token && (
          <p style={{ color: "var(--color-muted)", fontSize: "0.75rem", textAlign: "center", marginBottom: "var(--space-md)" }}>
            Token: {token.substring(0, 10)}...
          </p>
        )}

        <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <div>
            <label style={{ display: "block", marginBottom: "var(--space-xs)", fontSize: "0.875rem" }}>
              Neues Passwort
            </label>
            <input type="password" placeholder="••••••••" disabled />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "var(--space-xs)", fontSize: "0.875rem" }}>
              {t("confirmPassword")}
            </label>
            <input type="password" placeholder="••••••••" disabled />
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
            {t("resetPassword")}
          </button>
        </form>

        <div style={{ marginTop: "var(--space-lg)", textAlign: "center", fontSize: "0.875rem" }}>
          <Link to="/login">← Zurück zum Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
