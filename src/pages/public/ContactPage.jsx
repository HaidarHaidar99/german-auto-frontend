import React from "react";
import { useTranslation } from "react-i18next";

export function ContactPage() {
  const { t } = useTranslation(["forms", "navigation", "common"]);

  return (
    <div className="container" style={{ padding: "var(--space-2xl) var(--space-md)" }}>
      <h1 style={{ marginBottom: "var(--space-md)" }}>{t("contactTitle")}</h1>
      <div
        style={{
          padding: "var(--space-xl)",
          backgroundColor: "var(--color-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-secondary)",
          maxWidth: "600px",
        }}
      >
        <p>Kontaktformular und Standortanzeigen werden in der UI-Design-Phase integriert.</p>
      </div>
    </div>
  );
}

export default ContactPage;
