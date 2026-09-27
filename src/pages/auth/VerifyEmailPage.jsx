import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { t } = useTranslation(["auth", "common"]);

  return (
    <div className="container" style={{ padding: "var(--space-3xl) var(--space-md)", maxWidth: "500px" }}>
      <div
        style={{
          padding: "var(--space-2xl)",
          backgroundColor: "var(--color-card)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", marginBottom: "var(--space-md)" }}>
          {t("verifyEmailTitle")}
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--space-xl)" }}>
          {token ? `Verifizierungs-Token erkannt: ${token.substring(0, 8)}...` : t("verifyEmailText")}
        </p>
        <Link
          to="/login"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "var(--color-secondary)",
            color: "var(--color-primary)",
            borderRadius: "var(--radius-md)",
            fontWeight: 600,
          }}
        >
          Zum Login
        </Link>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
