import React from "react";
import { useTranslation } from "react-i18next";
import Badge from "../ui/Badge";

/**
 * German Auto — AboutStory Component
 * Editorial introduction presenting the authentic site/dealership description from CMS.
 * If no description exists in CMS, the section is cleanly omitted.
 */
export function AboutStory({ title, subtitle, description, siteName, className = "", style = {} }) {
  const { t } = useTranslation(["about", "common"]);

  const cleanDescription = description ? String(description).trim() : "";

  if (!cleanDescription && !title) {
    return null;
  }

  const headingText = title || (siteName ? `${siteName} — ${t("storyHeading")}` : t("storyHeading"));

  return (
    <section
      className={`about-story-section ${className}`.trim()}
      aria-labelledby="story-heading"
      style={{
        marginTop: 0,
        marginBottom: "clamp(2rem, 4vw, 3.5rem)",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div
        style={{
          backgroundColor: "var(--color-card)",
          borderRadius: "var(--radius-2xl)",
          border: "1px solid var(--color-border)",
          padding: "clamp(20px, 5vw, 48px)",
          boxShadow: "var(--shadow-elevation-1)",
          position: "relative",
          overflow: "hidden",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
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

        <div style={{ maxWidth: "860px" }}>
          <div style={{ display: "inline-block", marginBottom: "var(--space-xs)" }}>
            <Badge variant="outline" size="sm">
              {t("heroBadge", { defaultValue: t("storyBadge") })}
            </Badge>
          </div>

          <h1
            id="story-heading"
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
              fontWeight: "var(--font-weight-bold)",
              letterSpacing: "var(--tracking-tight)",
              lineHeight: 1.2,
              color: "var(--color-text)",
              margin: "0 0 var(--space-sm) 0",
            }}
          >
            {headingText}
          </h1>

          {subtitle && (
            <p
              style={{
                fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
                color: "var(--color-secondary)",
                fontWeight: 500,
                lineHeight: 1.5,
                margin: "0 0 var(--space-md) 0",
              }}
            >
              {subtitle}
            </p>
          )}

          {cleanDescription && (
            <div
              style={{
                fontSize: "clamp(1rem, 1.6vw, 1.15rem)",
                lineHeight: "var(--line-height-relaxed)",
                color: "var(--color-text-secondary)",
                whiteSpace: "pre-line",
              }}
            >
              {cleanDescription}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AboutStory;
