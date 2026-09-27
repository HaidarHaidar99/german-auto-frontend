import React from "react";
import { useTranslation } from "react-i18next";

export function SellYourCarPage() {
  const { t } = useTranslation(["forms", "navigation", "common"]);

  return (
    <div className="container" style={{ padding: "var(--space-2xl) var(--space-md)" }}>
      <h1 style={{ marginBottom: "var(--space-md)" }}>{t("sellCarTitle")}</h1>
      <div
        style={{
          padding: "var(--space-xl)",
          backgroundColor: "var(--color-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-secondary)",
          maxWidth: "700px",
        }}
      >
        <p>
          Das mehrstufige Fahrzeug-Bewertungs- und Ankauf-Formular mit Foto-Upload wird in der nächsten Phase ausgebaut.
        </p>
      </div>
    </div>
  );
}

export default SellYourCarPage;
