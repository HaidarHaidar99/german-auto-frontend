import React from "react";
import { useTranslation } from "react-i18next";

export function AboutPage() {
  const { t } = useTranslation(["navigation", "common"]);

  return (
    <div className="container" style={{ padding: "var(--space-2xl) var(--space-md)" }}>
      <h1 style={{ marginBottom: "var(--space-md)" }}>{t("about")}</h1>
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
        <p style={{ margin: 0 }}>
          Unternehmensprofil und Geschichte werden in der Designphase über die CMS-Einstellungen bereitgestellt.
        </p>
      </div>
    </div>
  );
}

export default AboutPage;
