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
        maxWidth: "800px",
        margin: "0 auto var(--space-3xl)",
        paddingTop: "var(--space-xl)",
        ...style,
      }}
    >
      <div style={{ display: "inline-block", marginBottom: "var(--space-sm)" }}>
        <Badge variant="secondary" size="md">
          {t("contactBadge")}
        </Badge>
      </div>

      <h1
        style={{
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: "var(--font-weight-bold)",
          letterSpacing: "var(--tracking-tight)",
          lineHeight: 1.15,
          color: "var(--color-text)",
          margin: "0 0 var(--space-md) 0",
        }}
      >
        {title || t("contactHeroTitle")}
      </h1>

      <p
        style={{
          fontSize: "var(--font-size-base)",
          lineHeight: "var(--line-height-relaxed)",
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
