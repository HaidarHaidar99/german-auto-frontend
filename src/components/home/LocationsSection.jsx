import React from "react";
import { useTranslation } from "react-i18next";
import { Container, Section, Grid } from "../ui/Layout";
import { Eyebrow, Heading, Text } from "../ui/Typography";
import Button from "../ui/Button";
import Icon from "../common/Icon";

/**
 * German Auto — Locations Section
 * Displays real CMS locations exclusively.
 * If settings.locations is empty, hides the section completely.
 */

export function LocationsSection({ locations = [] }) {
  const { t } = useTranslation(["common"]);

  if (!Array.isArray(locations) || locations.length === 0) {
    return null;
  }

  return (
    <Section spacing="default" style={{ position: "relative" }}>
      <Container size="default">
        <div data-aos="fade-up" style={{ marginBottom: "var(--space-2xl)" }}>
          <Eyebrow>{t("locations", "Standorte")}</Eyebrow>
          <Heading level={2} style={{ margin: 0 }}>
            Besuchen Sie unsere Standorte
          </Heading>
        </div>

        <Grid cols="responsive" gap="lg">
          {locations.map((loc, idx) => (
            <div
              key={idx}
              data-aos="fade-up"
              data-aos-delay={idx * 150}
              className="surface-card location-card-animated"
              style={{
                position: "relative",
                overflow: "hidden",
                padding: "var(--space-xl)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-md)",
                borderRadius: "var(--radius-xl, 16px)",
                border: "1px solid var(--color-border)",
                background: "linear-gradient(135deg, var(--color-card) 0%, var(--color-surface) 100%)",
                transition: "border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.45)";
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Falling Navigation / Location Sparkles Animation */}
              <div
                className="locations-rain-container"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  overflow: "hidden",
                  pointerEvents: "none",
                  userSelect: "none",
                  zIndex: 0,
                }}
              >
                {[
                  { symbol: "✦", left: "6%", size: "18px", dur: "5.4s", delay: "-1.8s", opacity: 0.25 },
                  { symbol: "📍", left: "18%", size: "16px", dur: "6.3s", delay: "-3.9s", opacity: 0.22 },
                  { symbol: "◈", left: "34%", size: "20px", dur: "4.8s", delay: "-0.6s", opacity: 0.28 },
                  { symbol: "✧", left: "50%", size: "22px", dur: "5.8s", delay: "-4.2s", opacity: 0.24 },
                  { symbol: "◆", left: "66%", size: "16px", dur: "5.1s", delay: "-2.1s", opacity: 0.26 },
                  { symbol: "📍", left: "82%", size: "17px", dur: "6.5s", delay: "-4.8s", opacity: 0.20 },
                  { symbol: "✦", left: "94%", size: "19px", dur: "4.6s", delay: "-1.3s", opacity: 0.27 },
                ].map((item, pIdx) => (
                  <span
                    key={pIdx}
                    style={{
                      position: "absolute",
                      top: "-30px",
                      left: item.left,
                      fontSize: item.size,
                      color: "#D4AF37",
                      opacity: item.opacity,
                      textShadow: "0 0 8px rgba(212, 175, 55, 0.4)",
                      animation: `locationFall ${item.dur} linear infinite`,
                      animationDelay: item.delay,
                      willChange: "transform, opacity",
                    }}
                  >
                    {item.symbol}
                  </span>
                ))}
              </div>

              <div style={{ position: "relative", zIndex: 1 }}>
                <h3
                  style={{
                    margin: "0 0 var(--space-xs)",
                    fontSize: "var(--font-size-lg)",
                    fontWeight: 700,
                  }}
                >
                  {loc.name || `Standort ${idx + 1}`}
                </h3>

                {loc.address && (
                  <Text variant="body-sm" style={{ margin: 0 }}>
                    {loc.address}
                    {loc.city && `, ${loc.postal_code || ""} ${loc.city}`.trim()}
                  </Text>
                )}
              </div>

              {/* Contact metadata */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)", position: "relative", zIndex: 1 }}>
                {loc.phone && (
                  <a
                    href={`tel:${loc.phone}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "var(--space-xs)",
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    <Icon name="phone" size={16} style={{ color: "var(--color-secondary)" }} />
                    <span>{loc.phone}</span>
                  </a>
                )}

                {loc.email && (
                  <a
                    href={`mailto:${loc.email}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "var(--space-xs)",
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    <Icon name="mail" size={16} style={{ color: "var(--color-secondary)" }} />
                    <span>{loc.email}</span>
                  </a>
                )}
              </div>

              {loc.map_url && (
                <div style={{ marginTop: "auto", paddingTop: "var(--space-xs)", position: "relative", zIndex: 1 }}>
                  <Button
                    as="a"
                    href={loc.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    size="sm"
                    iconRight="external-link"
                    style={{ width: "100%" }}
                  >
                    {t("openInMaps", "In Google Maps öffnen")}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </Grid>
      </Container>

      <style>{`
        @keyframes locationFall {
          0% {
            transform: translateY(0) rotate(0deg) scale(0.9);
            opacity: 0;
          }
          15% {
            opacity: 0.32;
          }
          85% {
            opacity: 0.26;
          }
          100% {
            transform: translateY(460px) rotate(360deg) scale(1.1);
            opacity: 0;
          }
        }
      `}</style>
    </Section>
  );
}

export default LocationsSection;
