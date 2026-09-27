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
        <div style={{ marginBottom: "var(--space-2xl)" }}>
          <Eyebrow>{t("locations", "Standorte")}</Eyebrow>
          <Heading level={2} style={{ margin: 0 }}>
            Besuchen Sie unsere Standorte
          </Heading>
        </div>

        <Grid cols="responsive" gap="lg">
          {locations.map((loc, idx) => (
            <div
              key={idx}
              className="surface-card"
              style={{
                padding: "var(--space-xl)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-md)",
              }}
            >
              <div>
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
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
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
                <div style={{ marginTop: "auto", paddingTop: "var(--space-xs)" }}>
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
    </Section>
  );
}

export default LocationsSection;
