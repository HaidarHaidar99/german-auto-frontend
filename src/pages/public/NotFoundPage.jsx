import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function NotFoundPage() {
  const { t } = useTranslation("common");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "var(--space-2xl) var(--space-md)",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "4rem", fontWeight: 800, color: "var(--color-secondary)", marginBottom: "var(--space-xs)" }}>
        404
      </h1>
      <h2 style={{ marginBottom: "var(--space-md)" }}>{t("notFound")}</h2>
      <p style={{ color: "var(--color-text-secondary)", maxWidth: "450px", marginBottom: "var(--space-xl)" }}>
        Die angeforderte Seite existiert nicht oder wurde verschoben.
      </p>
      <Link
        to="/"
        style={{
          padding: "10px 24px",
          backgroundColor: "var(--color-secondary)",
          color: "var(--color-primary)",
          borderRadius: "var(--radius-md)",
          fontWeight: 600,
        }}
      >
        Zur Startseite
      </Link>
    </div>
  );
}

export default NotFoundPage;
