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
        padding: "20px 0 16px",
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
          width: "600px",
          height: "250px",
          background: "radial-gradient(ellipse at 50% 50%, var(--color-accent-subtle) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Container size="default" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "680px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-secondary, #D4AF37)", display: "block", marginBottom: "2px" }}>
            {t("title", "Fahrzeugbestand")}
          </span>
          <h1 style={{ margin: "2px 0 4px", fontSize: "clamp(1.4rem, 2.2vw, 1.85rem)", fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
            {t("pageTitle", "Exklusiver Fahrzeugbestand")}
          </h1>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text-muted)", lineHeight: 1.4 }}>
            {t("pageSubtitle", "Kuratierte Auswahl erstklassiger Automobile mit meisterhafter Ingenieurskunst und geprüfter Qualität.")}
          </p>
        </div>
      </Container>
    </section>
  );
}

export default CarsHeader;
