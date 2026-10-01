import React from "react";
import { useTranslation } from "react-i18next";
import { useSettings, DEFAULT_LOGO_URL, DEFAULT_BRAND_NAME } from "../../contexts/SettingsContext";

export function AdminLoadingState({ message, minHeight = "300px", className = "", style = {}, showBrand = true }) {
  const { t } = useTranslation(["admin", "common"]);
  const { settings } = useSettings?.() || {};

  const brandName = settings?.site?.name || DEFAULT_BRAND_NAME;
  const logoUrl = settings?.branding?.logo_url || DEFAULT_LOGO_URL;

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
      {showBrand && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span
            style={{
              fontSize: "17px",
              fontWeight: 800,
              letterSpacing: "-0.2px",
              color: "var(--color-admin-text, #ffffff)",
              textAlign: "center",
            }}
          >
            {brandName}
          </span>
          {logoUrl && (
            <img
              src={logoUrl}
              alt={brandName}
              style={{
                width: "90px",
                maxHeight: "50px",
                objectFit: "contain",
                filter: "drop-shadow(0 2px 10px rgba(0, 0, 0, 0.4))",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
        </div>
      )}

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
        {message || t("loadingData", { defaultValue: "Lade Daten..." })}
      </span>
    </div>
  );
}

export default AdminLoadingState;

