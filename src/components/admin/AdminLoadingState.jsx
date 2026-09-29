import React from "react";
import { useTranslation } from "react-i18next";

export function AdminLoadingState({ message, minHeight = "300px", className = "", style = {} }) {
  const { t } = useTranslation(["admin", "common"]);

  return (
    <div
      className={`admin-loading-state ${className}`.trim()}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-md)",
        minHeight,
        padding: "var(--space-xl)",
        ...style,
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          border: "2px solid var(--color-admin-border)",
          borderTopColor: "var(--color-admin-accent)",
          animation: "btn-spin 0.7s linear infinite",
        }}
      />
      <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-admin-muted)" }}>
        {message || t("loadingData")}
      </span>
    </div>
  );
}

export default AdminLoadingState;
