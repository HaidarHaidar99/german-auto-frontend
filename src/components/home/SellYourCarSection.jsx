import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, Section } from "../ui/Layout";
import { Eyebrow, Heading, Text } from "../ui/Typography";
import Button from "../ui/Button";

/**
 * German Auto — Sell Your Car CTA Section
 * Driven exclusively by settings.sell_car CMS configuration.
 * Never invents claims or fake metrics.
 */

export function SellYourCarSection({ sellCarConfig }) {
  const { t, i18n } = useTranslation(["common", "navigation"]);
  const currentLang = i18n.language?.startsWith("en") ? "en" : "de";

  if (!sellCarConfig || sellCarConfig.enabled === false) {
    return null;
  }

  const title = currentLang === "en"
    ? (sellCarConfig.title_en || sellCarConfig.title_de)
    : (sellCarConfig.title_de || sellCarConfig.title_en);

  const description = currentLang === "en"
    ? (sellCarConfig.description_en || sellCarConfig.description_de)
    : (sellCarConfig.description_de || sellCarConfig.description_en);

  const ctaText = currentLang === "en"
    ? (sellCarConfig.cta_text_en || sellCarConfig.cta_text_de || t("common:sellCar", "Fahrzeug verkaufen"))
    : (sellCarConfig.cta_text_de || sellCarConfig.cta_text_en || t("common:sellCar", "Fahrzeug verkaufen"));

  return (
    <Section spacing="spacious" style={{ position: "relative" }}>
      <Container size="default">
        <div
          className="surface-card"
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "var(--radius-xl)",
            padding: "clamp(var(--space-xl), 6vw, var(--space-3xl))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "var(--space-2xl)",
            border: "1px solid var(--color-border)",
            background: "linear-gradient(135deg, var(--color-card) 0%, var(--color-surface) 100%)",
          }}
        >
          {/* Subtle Background Glow */}
          <div
            style={{
              position: "absolute",
              top: "-50%",
              right: "-20%",
              width: "400px",
              height: "400px",
              background: "radial-gradient(circle, var(--color-accent-subtle) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Left Text Block */}
          <div style={{ maxWidth: "600px", position: "relative", zIndex: 1 }}>
            <Eyebrow>{t("navigation:sellYourCar", "Ankauf & Vermittlung")}</Eyebrow>

            <Heading level={2} style={{ margin: "var(--space-xs) 0 var(--space-md)" }}>
              {title || t("common:sellCar", "Möchten Sie Ihr Fahrzeug verkaufen?")}
            </Heading>

            {description && (
              <Text variant="lead" style={{ margin: 0, color: "var(--color-text-muted)" }}>
                {description}
              </Text>
            )}
          </div>

          {/* Right Action Block */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <Button
              as={Link}
              to="/sell-your-car"
              variant="primary"
              size="lg"
              iconRight="arrow-right"
            >
              {ctaText}
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default SellYourCarSection;
