import React from "react";
import { useTranslation } from "react-i18next";
import { useSettings, DEFAULT_LOGO_URL, DEFAULT_BRAND_NAME } from "../../contexts/SettingsContext";
import { useTheme } from "../../contexts/ThemeContext";

export function LoadingState({ message = null, minHeight = "240px" }) {
  const { t } = useTranslation("common");

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

