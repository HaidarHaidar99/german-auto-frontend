import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function SignupPage() {
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
        <h1 style={{ fontSize: "1.75rem", marginBottom: "var(--space-lg)", textAlign: "center" }}>
          {t("signupTitle")}
        </h1>

        <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <div>
            <label style={{ display: "block", marginBottom: "var(--space-xs)", fontSize: "0.875rem" }}>
              {t("fullName")}
            </label>
            <input type="text" placeholder="Vor- und Nachname" disabled />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "var(--space-xs)", fontSize: "0.875rem" }}>
              {t("email")}
            </label>
            <input type="email" placeholder="ihre.email@example.de" disabled />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "var(--space-xs)", fontSize: "0.875rem" }}>
              {t("password")}
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
            {t("signupTitle")}
          </button>
        </form>

        <div style={{ marginTop: "var(--space-lg)", textAlign: "center", fontSize: "0.875rem" }}>
          Bereits registriert? <Link to="/login">{t("loginTitle")}</Link>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
