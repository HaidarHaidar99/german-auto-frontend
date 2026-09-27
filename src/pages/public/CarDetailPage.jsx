import React from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function CarDetailPage() {
  const { identifier } = useParams();
  const { t } = useTranslation(["cars", "common"]);

  return (
    <div className="container" style={{ padding: "var(--space-2xl) var(--space-md)" }}>
      <Link to="/cars" style={{ display: "inline-block", marginBottom: "var(--space-md)", color: "var(--color-secondary)" }}>
        ← {t("title")}
      </Link>
      <h1 style={{ marginBottom: "var(--space-sm)" }}>{t("details")}</h1>
      <p style={{ color: "var(--color-muted)" }}>
        Fahrzeug-Identifikator: <code style={{ color: "var(--color-accent)" }}>{identifier}</code>
      </p>
      <div
        style={{
          marginTop: "var(--space-xl)",
          padding: "var(--space-2xl)",
          backgroundColor: "var(--color-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)",
          textAlign: "center",
          color: "var(--color-text-secondary)",
        }}
      >
        Detaillierte Fahrzeugdaten, 360°-Ansichten und Bildergalerie werden geladen, sobald die Fahrzeug-API angebunden ist.
      </div>
    </div>
  );
}

export default CarDetailPage;
