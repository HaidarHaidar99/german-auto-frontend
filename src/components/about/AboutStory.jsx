import React from "react";
import { useTranslation } from "react-i18next";
import Badge from "../ui/Badge";

/**
 * German Auto — AboutStory Component
 * Editorial introduction presenting the authentic site/dealership description from CMS.
 * If no description exists in CMS, the section is cleanly omitted.
 */
export function AboutStory({ description, siteName, className = "", style = {} }) {
  const { t } = useTranslation(["about", "common"]);

  const cleanDescription = description ? String(description).trim() : "";

  if (!cleanDescription) {
    return null;
  }

  return (
    <section
      className={`about-story-section ${className}`.trim()}
      aria-labelledby="story-heading"
      style={{
        marginBottom: "var(--space-4xl)",
        ...style,
      }}
    >
      <div
        style={{
          backgroundColor: "var(--color-card)",
          borderRadius: "var(--radius-2xl)",
          border: "1px solid var(--color-border)",
          padding: "clamp(var(--space-xl), 5vw, var(--space-3xl))",
          boxShadow: "var(--shadow-elevation-1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle Decorative Accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "var(--space-2xl)",
            width: "60px",
            height: "3px",
            backgroundColor: "var(--color-secondary)",
            borderRadius: "var(--radius-full)",
          }}
        />

        <div style={{ maxWidth: "800px" }}>
          <div style={{ display: "inline-block", marginBottom: "var(--space-sm)" }}>
            <Badge variant="outline" size="sm">
              {t("storyBadge")}
            </Badge>
          </div>

          <h2
            id="story-heading"
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: "var(--font-weight-bold)",
              letterSpacing: "var(--tracking-tight)",
              lineHeight: 1.2,
              color: "var(--color-text)",
              margin: "0 0 var(--space-lg) 0",
            }}
          >
            {siteName ? `${siteName} — ${t("storyHeading")}` : t("storyHeading")}
          </h2>

          <div
            style={{
              fontSize: "clamp(1.05rem, 1.8vw, 1.25rem)",
              lineHeight: "var(--line-height-relaxed)",
              color: "var(--color-text-secondary)",
              whiteSpace: "pre-line",
            }}
          >
            {cleanDescription}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutStory;
