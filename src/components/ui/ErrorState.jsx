import React from "react";
import { useTranslation } from "react-i18next";

export function ErrorState({
  title = null,
  message = null,
  onRetry = null,
  minHeight = "240px",
}) {
  const { t } = useTranslation("common");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight,
        padding: "var(--space-2xl) var(--space-md)",
        textAlign: "center",
        backgroundColor: "var(--color-card)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-error)",
        margin: "var(--space-md) 0",
      }}
      role="alert"
    >
      <h3 style={{ color: "var(--color-error)", marginBottom: "var(--space-xs)", fontSize: "1.125rem" }}>
        {title || t("error")}
      </h3>
      <p style={{ color: "var(--color-text-secondary)", maxWidth: "450px", marginBottom: onRetry ? "var(--space-md)" : 0 }}>
        {message || "Es ist ein unerwarteter Fehler aufgetreten."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: "var(--space-sm) var(--space-lg)",
            backgroundColor: "var(--color-secondary)",
            color: "var(--color-primary)",
            borderRadius: "var(--radius-md)",
            fontWeight: 600,
            transition: "opacity var(--transition-fast)",
          }}
        >
          {t("retry")}
        </button>
      )}
    </div>
  );
}

export default ErrorState;
