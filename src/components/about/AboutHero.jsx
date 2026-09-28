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
        padding: hasMedia ? "var(--space-4xl) var(--space-md) var(--space-3xl)" : "var(--space-3xl) var(--space-md) var(--space-2xl)",
        borderRadius: "var(--radius-2xl)",
        overflow: "hidden",
        marginBottom: "var(--space-3xl)",
        border: "1px solid var(--color-border-subtle)",
        backgroundColor: "var(--color-card)",
        minHeight: hasMedia ? "420px" : "auto",
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
      <div style={{ position: "relative", zIndex: 2, maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ display: "inline-block", marginBottom: "var(--space-sm)" }}>
          <Badge variant="secondary" size="md">
            {t("heroBadge")}
          </Badge>
        </div>

        <h1
          style={{
            fontSize: "clamp(2.25rem, 4.5vw, 3.75rem)",
            fontWeight: "var(--font-weight-bold)",
            letterSpacing: "var(--tracking-tight)",
            lineHeight: 1.15,
            color: "var(--color-text)",
            margin: "0 0 var(--space-md) 0",
          }}
        >
          {title || t("heroTitle")}
        </h1>

        <p
          style={{
            fontSize: "var(--font-size-lg)",
            lineHeight: "var(--line-height-relaxed)",
            color: "var(--color-text-secondary)",
            margin: 0,
            maxWidth: "680px",
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
