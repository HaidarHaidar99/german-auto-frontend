import React from "react";
import { useTranslation } from "react-i18next";

export function LoadingState({ message = null, minHeight = "200px" }) {
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
        gap: "var(--space-md)",
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          border: "3px solid rgba(212, 175, 55, 0.2)",
          borderTopColor: "#D4AF37",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <span style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem" }}>
        {message || t("loading")}
      </span>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default LoadingState;
