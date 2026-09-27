import React from "react";
import { Container } from "../ui/Layout";
import { Eyebrow, Display, Text } from "../ui/Typography";
import Button from "../ui/Button";

/**
 * German Auto — HeroPrimitive Component
 * Reusable hero layout capable of supporting video, photography, and editorial compositions.
 */

export function HeroPrimitive({
  eyebrow = "Kategorie / Auszeichnung",
  title = "Leistung & Präzision",
  subtitle = "Exklusive Fahrzeugauswahl mit meisterhafter Ingenieurskunst und unvergleichlicher Fahrkultur.",
  primaryCtaLabel = "Fahrzeuge entdecken",
  onPrimaryCta,
  secondaryCtaLabel = "Fahrzeug verkaufen",
  onSecondaryCta,
  backgroundMedia,
  slideCount = 1,
  activeSlide = 0,
  onSlideChange,
  className = "",
  style = {},
}) {
  return (
    <section
      className={`hero-primitive ${className}`.trim()}
      style={{
        position: "relative",
        minHeight: "clamp(540px, 85vh, 920px)",
        width: "100%",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: "var(--color-background)",
        ...style,
      }}
    >
      {/* Background Media Slot (Video or CinematicImage) */}
      {backgroundMedia && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            overflow: "hidden",
          }}
        >
          {backgroundMedia}
        </div>
      )}

      {/* Cinematic Gradient Vignette & Dark Tint */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(9, 10, 12, 0.4) 0%, rgba(9, 10, 12, 0.75) 60%, rgba(9, 10, 12, 1) 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Foreground Content */}
      <Container size="default" style={{ position: "relative", zIndex: 2 }}>
        <div
          style={{
            maxWidth: "760px",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
            padding: "var(--space-2xl) 0",
          }}
        >
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}

          {title && (
            <Display size="2xl" style={{ margin: 0 }}>
              {title}
            </Display>
          )}

          {subtitle && (
            <Text variant="lead" style={{ margin: 0, maxWidth: "600px" }}>
              {subtitle}
            </Text>
          )}

          {/* CTA Buttons */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-md)",
              marginTop: "var(--space-md)",
            }}
          >
            {primaryCtaLabel && (
              <Button
                variant="primary"
                size="lg"
                iconRight="arrow-right"
                onClick={onPrimaryCta}
              >
                {primaryCtaLabel}
              </Button>
            )}

            {secondaryCtaLabel && (
              <Button
                variant="outline"
                size="lg"
                onClick={onSecondaryCta}
              >
                {secondaryCtaLabel}
              </Button>
            )}
          </div>
        </div>
      </Container>

      {/* Slide Indicators (if multiple slides provided) */}
      {slideCount > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "var(--space-xl)",
            right: "var(--space-xl)",
            display: "flex",
            gap: "var(--space-xs)",
            zIndex: 10,
          }}
        >
          {Array.from({ length: slideCount }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Folie ${idx + 1}`}
              onClick={() => onSlideChange && onSlideChange(idx)}
              style={{
                width: idx === activeSlide ? "32px" : "12px",
                height: "3px",
                borderRadius: "2px",
                backgroundColor: idx === activeSlide ? "var(--color-secondary)" : "rgba(255, 255, 255, 0.25)",
                transition: "all var(--duration-fast) var(--ease-smooth)",
                padding: 0,
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default HeroPrimitive;
