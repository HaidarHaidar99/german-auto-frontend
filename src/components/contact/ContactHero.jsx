import React from "react";
import { useTranslation } from "react-i18next";
import Badge from "../ui/Badge";

/**
 * German Auto — ContactHero Component
 * Atmospheric editorial hero introducing the dealership contact & consultation services.
 */
export function ContactHero({ title, subtitle, className = "", style = {} }) {
  const { t } = useTranslation(["forms", "common"]);

  return (
    <header
      className={`contact-hero ${className}`.trim()}
      style={{
        textAlign: "center",
        maxWidth: "680px",
        margin: "0 auto var(--space-xl)",
        paddingTop: "var(--space-md)",
        ...style,
      }}
    >
      <div style={{ display: "inline-block", marginBottom: "var(--space-2xs)" }}>
        <Badge variant="secondary" size="sm">
          {t("contactBadge")}
        </Badge>
      </div>

      <h1
        style={{
          fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
          fontWeight: "var(--font-weight-bold)",
          letterSpacing: "var(--tracking-tight)",
          lineHeight: 1.2,
          color: "var(--color-text)",
          margin: "0 0 var(--space-xs) 0",
        }}
      >
        {title || t("contactHeroTitle")}
      </h1>

      <p
        style={{
          fontSize: "14px",
          lineHeight: 1.5,
          color: "var(--color-text-secondary)",
          margin: 0,
        }}
      >
        {subtitle || t("contactHeroSubtitle")}
      </p>
    </header>
  );
}

export default ContactHero;
