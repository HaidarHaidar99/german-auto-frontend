import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "../common/Icon";
import Button from "../ui/Button";

/**
 * German Auto — ContactLocationsSection Component
 * Displays configured dealership locations from CMS settings.
 * If no locations exist in CMS, the section is cleanly omitted.
 */
export function ContactLocationsSection({ locations = [], className = "", style = {} }) {
  const { t } = useTranslation(["forms", "common"]);

  if (!Array.isArray(locations) || locations.length === 0) {
    return null;
  }

  // Filter valid locations that have at least a name or address
  const validLocations = locations.filter(
    (loc) => loc && (loc.name || loc.address || loc.city)
  );

  if (validLocations.length === 0) {
    return null;
  }

  return (
    <section
      className={`contact-locations-section ${className}`.trim()}
      aria-labelledby="locations-heading"
      style={{
        marginTop: "var(--space-3xl)",
        paddingTop: "var(--space-2xl)",
        borderTop: "1px solid var(--color-border-subtle)",
        ...style,
      }}
    >
      <div style={{ marginBottom: "var(--space-xl)", textAlign: "center" }}>
        <h2
          id="locations-heading"
          style={{
            fontSize: "var(--font-size-2xl)",
            fontWeight: "var(--font-weight-bold)",
            letterSpacing: "var(--tracking-tight)",
            margin: "0 0 var(--space-2xs) 0",
            color: "var(--color-text)",
          }}
        >
          {t("contactLocationsHeading")}
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "var(--space-lg)",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        {validLocations.map((loc, idx) => {
          const fullAddress = [loc.address, [loc.postal_code, loc.city].filter(Boolean).join(" "), loc.country]
            .filter(Boolean)
            .join(", ");

          return (
            <div
              key={idx}
              className="location-card surface-card"
              style={{
                backgroundColor: "var(--color-card)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--color-border)",
                padding: "clamp(16px, 4vw, 28px)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-md)",
                boxShadow: "var(--shadow-elevation-1)",
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
                <Icon name="map-pin" size={20} color="var(--color-secondary)" />
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

              {fullAddress && (
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                  {loc.address && <div>{loc.address}</div>}
                  {(loc.postal_code || loc.city) && (
                    <div>
                      {loc.postal_code} {loc.city}
                    </div>
                  )}
                  {loc.country && <div>{loc.country}</div>}
                </div>
              )}

              {/* Direct phone / email if location-specific */}
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

              {/* External Google Maps Button */}
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
                    {t("openMapAction")}
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

export default ContactLocationsSection;
