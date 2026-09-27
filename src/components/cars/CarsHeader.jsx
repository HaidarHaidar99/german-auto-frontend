import React from "react";
import { useTranslation } from "react-i18next";
import { Container } from "../ui/Layout";
import { Eyebrow, Display, Text } from "../ui/Typography";

/**
 * German Auto — Cinematic Cars Header
 */

export function CarsHeader() {
  const { t } = useTranslation(["cars"]);

  return (
    <section
      style={{
        position: "relative",
        padding: "clamp(var(--space-2xl), 5vw, var(--space-4xl)) 0 clamp(var(--space-xl), 3vw, var(--space-2xl))",
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border-subtle)",
        overflow: "hidden",
      }}
    >
      {/* Subtle Cinematic Background Stage Glow */}
      <div
        style={{
          position: "absolute",
          top: "-30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "400px",
          background: "radial-gradient(ellipse at 50% 50%, var(--color-accent-subtle) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Container size="default" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "780px" }}>
          <Eyebrow>{t("title", "Fahrzeugbestand")}</Eyebrow>
          <Display size="xl" style={{ margin: "var(--space-2xs) 0 var(--space-sm)" }}>
            {t("pageTitle", "Exklusiver Fahrzeugbestand")}
          </Display>
          <Text variant="lead" style={{ margin: 0, color: "var(--color-text-muted)" }}>
            {t("pageSubtitle", "Kuratierte Auswahl erstklassiger Automobile mit meisterhafter Ingenieurskunst und geprüfter Qualität.")}
          </Text>
        </div>
      </Container>
    </section>
  );
}

export default CarsHeader;
