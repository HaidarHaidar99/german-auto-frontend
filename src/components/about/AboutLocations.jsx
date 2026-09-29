import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "../common/Icon";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

/**
 * German Auto — AboutLocations Component
 * Displays real showroom and dealership locations configured in CMS settings.
 * If no locations are configured, the section is completely omitted.
 */
export function AboutLocations({ locations = [], className = "", style = {} }) {
  const { t } = useTranslation(["about", "common"]);

  const validLocations = (Array.isArray(locations) ? locations : []).filter(
    (loc) => loc && (loc.name || loc.address || loc.city)
  );

  if (validLocations.length === 0) {
    return null;
  }

  return (
    <section
      className={`about-locations-section ${className}`.trim()}
      aria-labelledby="locations-heading"
      style={{
        marginBottom: "var(--space-4xl)",
        ...style,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto var(--space-2xl)" }}>
        <div style={{ display: "inline-block", marginBottom: "var(--space-sm)" }}>
          <Badge variant="outline" size="sm">
            {t("locationsBadge")}
          </Badge>
        </div>
        <h2
          id="locations-heading"
          style={{
            fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
            fontWeight: "var(--font-weight-bold)",
            letterSpacing: "var(--tracking-tight)",
            margin: "0 0 var(--space-xs) 0",
            color: "var(--color-text)",
          }}
        >
          {t("locationsHeading")}
        </h2>
        <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "var(--font-size-base)" }}>
          {t("locationsSubtitle")}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "var(--space-lg)",
        }}
      >
        {validLocations.map((loc, idx) => {
          const addressLines = [
            loc.address,
            [loc.postal_code, loc.city].filter(Boolean).join(" "),
            loc.country,
          ].filter(Boolean);

          return (
            <div
              key={idx}
              className="about-location-card surface-card"
              style={{
                backgroundColor: "var(--color-card)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--color-border)",
                padding: "var(--space-xl)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-md)",
                boxShadow: "var(--shadow-elevation-1)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-secondary)",
                    flexShrink: 0,
                  }}
                >
                  <Icon name="map-pin" size={18} />
                </div>
                <h3
                  style={{
                    fontSize: "var(--font-size-lg)",
                    fontWeight: "var(--font-weight-semibold)",
                    margin: 0,
                    color: "var(--color-text)",
                  }}
                >
                  {loc.name || `Standort ${idx + 1}`}
                </h3>
              </div>

              {addressLines.length > 0 && (
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                  {addressLines.map((line, lIdx) => (
                    <div key={lIdx}>{line}</div>
                  ))}
                </div>
              )}

              {(loc.phone || loc.email) && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-2xs)",
                    paddingTop: "var(--space-xs)",
                    borderTop: "1px solid var(--color-border-subtle)",
                    fontSize: "var(--font-size-xs)",
                  }}
                >
                  {loc.phone && (
                    <a
                      href={`tel:${loc.phone}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "var(--space-2xs)",
                        color: "var(--color-text-muted)",
                        textDecoration: "none",
                      }}
                    >
                      <Icon name="phone" size={14} color="var(--color-secondary)" />
                      <span>{loc.phone}</span>
                    </a>
                  )}
                  {loc.email && (
                    <a
                      href={`mailto:${loc.email}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "var(--space-2xs)",
                        color: "var(--color-text-muted)",
                        textDecoration: "none",
                      }}
                    >
                      <Icon name="mail" size={14} color="var(--color-secondary)" />
                      <span>{loc.email}</span>
                    </a>
                  )}
                </div>
              )}

              {loc.map_url && (
                <div style={{ marginTop: "auto", paddingTop: "var(--space-sm)" }}>
                  <Button
                    as="a"
                    href={loc.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    size="sm"
                    fullWidth
                    iconRight="external-link"
                  >
                    {t("openInMaps")}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default AboutLocations;
