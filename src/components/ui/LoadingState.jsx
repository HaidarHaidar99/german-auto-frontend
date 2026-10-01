import React from "react";
import { useTranslation } from "react-i18next";
import { useSettings, DEFAULT_LOGO_URL, DEFAULT_BRAND_NAME } from "../../contexts/SettingsContext";

export function LoadingState({ message = null, minHeight = "240px", showBrand = false }) {
  const { t } = useTranslation("common");
  const { settings } = useSettings?.() || {};

  const brandName = settings?.site?.name || DEFAULT_BRAND_NAME;
  const logoUrl = settings?.branding?.logo_url || DEFAULT_LOGO_URL;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight,
        padding: "var(--space-xl)",
        gap: "14px",
      }}
      role="status"
      aria-live="polite"
    >
      {showBrand && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <span
            style={{
              fontSize: "17px",
              fontWeight: 800,
              letterSpacing: "-0.2px",
              color: "var(--color-text, #ffffff)",
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
                filter: "drop-shadow(0 2px 10px rgba(0, 0, 0, 0.5))",
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
          width: "32px",
          height: "32px",
          border: "2.5px solid rgba(212, 175, 55, 0.2)",
          borderTopColor: "#D4AF37",
          borderRadius: "50%",
          animation: "loadingStateSpin 0.8s linear infinite",
        }}
      />

      <span style={{ color: "var(--color-text-secondary, #94a3b8)", fontSize: "0.875rem", fontWeight: 500 }}>
        {message || t("loading", { defaultValue: "Laden..." })}
      </span>

      <style>{`
        @keyframes loadingStateSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default LoadingState;

