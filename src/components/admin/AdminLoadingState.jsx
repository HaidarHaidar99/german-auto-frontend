import React from "react";
import { useTranslation } from "react-i18next";
import { useSettings, DEFAULT_LOGO_URL, DEFAULT_BRAND_NAME } from "../../contexts/SettingsContext";

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
        gap: "14px",
        minHeight,
        padding: "var(--space-xl)",
        ...style,
      }}
    >

      <div
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          border: "2.5px solid var(--color-admin-border, rgba(148, 163, 184, 0.25))",
          borderTopColor: "var(--color-admin-accent, #2563eb)",
          animation: "btn-spin 0.7s linear infinite",
        }}
      />
      <span style={{ fontSize: "var(--font-size-sm, 13px)", color: "var(--color-admin-muted, #94a3b8)", fontWeight: 500 }}>
        {message || t("loading", { defaultValue: "Loading..." })}
      </span>
    </div>
  );
}

export default AdminLoadingState;

