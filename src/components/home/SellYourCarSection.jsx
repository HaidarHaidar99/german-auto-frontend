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
          data-aos="zoom-in"
          data-aos-duration="800"
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

          {/* Falling Euros and Dollars Luxury Animation */}
          <div
            className="currency-rain-container"
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
              { symbol: "€", left: "4%", size: "22px", dur: "5.2s", delay: "-1.8s", opacity: 0.28 },
              { symbol: "$", left: "10%", size: "18px", dur: "6.4s", delay: "-4.1s", opacity: 0.22 },
              { symbol: "€", left: "17%", size: "26px", dur: "4.8s", delay: "-0.5s", opacity: 0.32 },
              { symbol: "$", left: "24%", size: "16px", dur: "5.8s", delay: "-3.2s", opacity: 0.18 },
              { symbol: "€", left: "31%", size: "20px", dur: "6.1s", delay: "-2.3s", opacity: 0.25 },
              { symbol: "$", left: "38%", size: "24px", dur: "4.5s", delay: "-5.0s", opacity: 0.30 },
              { symbol: "€", left: "45%", size: "17px", dur: "6.8s", delay: "-1.2s", opacity: 0.20 },
              { symbol: "$", left: "52%", size: "25px", dur: "5.0s", delay: "-3.7s", opacity: 0.28 },
              { symbol: "€", left: "59%", size: "19px", dur: "5.6s", delay: "-0.8s", opacity: 0.24 },
              { symbol: "$", left: "66%", size: "23px", dur: "4.7s", delay: "-4.6s", opacity: 0.30 },
              { symbol: "€", left: "73%", size: "16px", dur: "6.5s", delay: "-2.9s", opacity: 0.19 },
              { symbol: "$", left: "80%", size: "27px", dur: "5.3s", delay: "-1.5s", opacity: 0.32 },
              { symbol: "€", left: "87%", size: "21px", dur: "5.9s", delay: "-3.9s", opacity: 0.26 },
              { symbol: "$", left: "94%", size: "18px", dur: "4.9s", delay: "-0.2s", opacity: 0.22 },
              { symbol: "€", left: "13%", size: "20px", dur: "7.0s", delay: "-2.6s", opacity: 0.24 },
              { symbol: "$", left: "42%", size: "22px", dur: "5.4s", delay: "-4.3s", opacity: 0.27 },
              { symbol: "€", left: "70%", size: "20px", dur: "6.0s", delay: "-1.0s", opacity: 0.23 },
              { symbol: "$", left: "89%", size: "24px", dur: "5.1s", delay: "-3.4s", opacity: 0.29 },
            ].map((item, idx) => (
              <span
                key={idx}
                className="currency-rain-particle"
                style={{
                  position: "absolute",
                  top: "-40px",
                  left: item.left,
                  fontSize: item.size,
                  color: "#D4AF37",
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontWeight: 700,
                  opacity: item.opacity,
                  textShadow: "0 0 10px rgba(212, 175, 55, 0.45), 0 0 20px rgba(245, 215, 127, 0.25)",
                  animation: `currencyFall ${item.dur} linear infinite`,
                  animationDelay: item.delay,
                  willChange: "transform, opacity",
                }}
              >
                {item.symbol}
              </span>
            ))}
          </div>

          <style>{`
            @keyframes currencyFall {
              0% {
                transform: translateY(0) rotate(0deg) scale(0.9);
                opacity: 0;
              }
              12% {
                opacity: 0.35;
              }
              80% {
                opacity: 0.3;
              }
              100% {
                transform: translateY(420px) rotate(360deg) scale(1.1);
                opacity: 0;
              }
            }
          `}</style>

          {/* Left Text Block */}
          <div data-aos="fade-right" data-aos-delay="100" style={{ maxWidth: "600px", position: "relative", zIndex: 1 }}>
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
          <div data-aos="fade-left" data-aos-delay="200" style={{ position: "relative", zIndex: 1 }}>
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
