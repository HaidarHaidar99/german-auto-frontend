import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function UnauthorizedState({ message = null }) {
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
      <h2 style={{ color: "var(--color-warning)", marginBottom: "var(--space-sm)" }}>
        {t("unauthorized")}
      </h2>
      <p style={{ color: "var(--color-text-secondary)", maxWidth: "450px", marginBottom: "var(--space-lg)" }}>
        {message || "Sie haben keine Berechtigung, auf diese Ressource zuzugreifen."}
      </p>
      <Link
        to="/"
        style={{
          padding: "var(--space-sm) var(--space-lg)",
          backgroundColor: "var(--color-secondary)",
          color: "var(--color-primary)",
          borderRadius: "var(--radius-md)",
          fontWeight: 600,
        }}
      >
        {t("back")}
      </Link>
    </div>
  );
}

export default UnauthorizedState;
