import React from "react";
import { useTranslation } from "react-i18next";

export function EmptyState({
  title = null,
  message = null,
  action = null,
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
        border: "1px dashed var(--color-border)",
        margin: "var(--space-md) 0",
      }}
    >
      <h3 style={{ marginBottom: "var(--space-xs)", fontSize: "1.125rem", color: "var(--color-text)" }}>
        {title || t("empty")}
      </h3>
      {message && (
        <p style={{ color: "var(--color-muted)", maxWidth: "400px", marginBottom: action ? "var(--space-md)" : 0 }}>
          {message}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export default EmptyState;
