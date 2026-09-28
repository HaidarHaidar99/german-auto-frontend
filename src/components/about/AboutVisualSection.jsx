import React from "react";
import { useTranslation } from "react-i18next";
import CinematicImage from "../media/CinematicImage";
import VideoMedia from "../media/VideoMedia";

/**
 * German Auto — AboutVisualSection Component
 * Displays authentic visual storytelling assets strictly from CMS configuration.
 * If no real CMS media exists, the section is completely omitted.
 */
export function AboutVisualSection({ mediaItems = [], className = "", style = {} }) {
  const { t } = useTranslation(["about", "common"]);

  // Extract clean media items with non-empty URL
  const validMedia = (Array.isArray(mediaItems) ? mediaItems : [])
    .filter((item) => item && (item.media_url || item.url || typeof item === "string"))
    .map((item) => (typeof item === "string" ? { media_url: item } : item));

  if (validMedia.length === 0) {
    return null;
  }

  const primaryItem = validMedia[0];
  const mediaUrl = primaryItem.media_url || primaryItem.url;
  const isVideo =
    typeof mediaUrl === "string" &&
    (mediaUrl.endsWith(".mp4") || mediaUrl.endsWith(".webm") || mediaUrl.includes("video"));

  return (
    <section
      className={`about-visual-section ${className}`.trim()}
      aria-labelledby="visual-heading"
      style={{
        marginBottom: "var(--space-4xl)",
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "21 / 9",
          minHeight: "300px",
          borderRadius: "var(--radius-2xl)",
          overflow: "hidden",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-elevation-2)",
          backgroundColor: "#07080a",
        }}
      >
        {isVideo ? (
          <VideoMedia
            src={mediaUrl}
            aspectRatio="21-9"
            autoPlay={true}
            loop={true}
            muted={true}
          />
        ) : (
          <CinematicImage
            src={mediaUrl}
            alt={primaryItem.title || t("visualHeading")}
            zoomOnHover={true}
            loading="lazy"
          />
        )}

        {/* Ambient Overlay Mask */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(9, 10, 12, 0.75) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        {(primaryItem.title || primaryItem.subtitle) && (
          <div
            style={{
              position: "absolute",
              bottom: "var(--space-xl)",
              left: "var(--space-xl)",
              right: "var(--space-xl)",
              zIndex: 3,
            }}
          >
            {primaryItem.title && (
              <h3
                id="visual-heading"
                style={{
                  fontSize: "var(--font-size-xl)",
                  fontWeight: "var(--font-weight-bold)",
                  letterSpacing: "var(--tracking-tight)",
                  color: "#FFFFFF",
                  margin: "0 0 var(--space-3xs) 0",
                }}
              >
                {primaryItem.title}
              </h3>
            )}
            {primaryItem.subtitle && (
              <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "rgba(255, 255, 255, 0.8)" }}>
                {primaryItem.subtitle}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default AboutVisualSection;
