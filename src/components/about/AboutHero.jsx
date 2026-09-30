import React from "react";
import { useTranslation } from "react-i18next";
import Badge from "../ui/Badge";

/**
 * German Auto — AboutHero Component
 * Full-width cinematic hero with optional CMS background media or premium typography stage.
 */
export function AboutHero({ title, subtitle, mediaUrl, className = "", style = {} }) {
  const { t } = useTranslation(["about", "common"]);

  const hasMedia = Boolean(mediaUrl && typeof mediaUrl === "string" && mediaUrl.trim().length > 0);

  return (
    <header
      className={`about-hero ${className}`.trim()}
      style={{
        position: "relative",
        padding: "var(--space-xl) var(--space-md)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        marginBottom: "var(--space-xl)",
        border: "1px solid var(--color-border-subtle)",
        backgroundColor: "var(--color-card)",
        minHeight: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        boxShadow: "var(--shadow-elevation-2)",
        ...style,
      }}
    >
      {/* Background CMS Media Image with Atmospheric Radial Mask */}
      {hasMedia && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${mediaUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.28,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, var(--color-card) 0%, rgba(9, 10, 12, 0.6) 50%, rgba(9, 10, 12, 0.85) 100%)",
            }}
          />
        </>
      )}

      {/* Typography Stage */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: "680px", margin: "0 auto" }}>
        <div style={{ display: "inline-block", marginBottom: "var(--space-2xs)" }}>
          <Badge variant="secondary" size="sm">
            {t("heroBadge")}
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
          {title || t("heroTitle")}
        </h1>

        <p
          style={{
            fontSize: "14px",
            lineHeight: 1.5,
            color: "var(--color-text-secondary)",
            margin: 0,
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {subtitle || t("heroSubtitle")}
        </p>
      </div>
    </header>
  );
}

export default AboutHero;
