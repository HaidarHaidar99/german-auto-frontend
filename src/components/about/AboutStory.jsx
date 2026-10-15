import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import Badge from "../ui/Badge";
import img3 from "../../assets/4images/3.jpeg";

/**
 * German Auto — AboutStory Component
 * Displays the dealership story directly over the authentic dealership image (3.jpeg).
 * High-definition presentation with zero blurring or pixelation, and comfortable spacing.
 */
export function AboutStory({ className = "", style = {} }) {
  const { i18n } = useTranslation(["about", "common"]);
  const { isDark } = useTheme?.() || { isDark: true };

  const currentLang = i18n.language?.startsWith("en") ? "en" : "de";

  const badgeText = currentLang === "en" ? "About Our Dealership" : "Über unser Haus";
  const titleText = currentLang === "en" ? "About König Automobile Rheinberg" : "Über König Automobile Rheinberg";
  const subtitleText = currentLang === "en"
    ? "Passion, Precision & Automotive Perfection"
    : "Leidenschaft, Präzision & automobile Perfektion";

  const paragraphs = currentLang === "en"
    ? [
        "Welcome to König Automobile Rheinberg – your premier destination for certified pre-owned vehicles in Rheinberg and the surrounding region.",
        "Discover our carefully selected portfolio of vehicles across diverse brands and price segments. Whether vehicle purchase, trade-in, financing, or car acquisition: we prioritize personal consultation, transparent processes, and fair conditions.",
        "Visit our showroom at Neuweide 26 in 47495 Rheinberg. We look forward to guiding you in finding your next distinguished automobile.",
      ]
    : [
        "Willkommen bei König Automobile Rheinberg – Ihrem Ansprechpartner für Gebrauchtwagen in Rheinberg und Umgebung.",
        "Entdecken Sie unsere Fahrzeugangebote verschiedener Marken und Preisklassen. Ob Fahrzeugkauf, Autoankauf, Finanzierung oder Inzahlungnahme: Wir legen Wert auf persönliche Beratung, transparente Abläufe und faire Konditionen.",
        "Besuchen Sie uns an der Neuweide 26 in 47495 Rheinberg. Wir freuen uns darauf, Sie bei der Suche nach Ihrem nächsten Fahrzeug zu unterstützen.",
      ];

  return (
    <section
      className={`about-story-section ${className}`.trim()}
      aria-labelledby="story-heading"
      style={{
        marginTop: "clamp(28px, 4.5vw, 52px)",
        marginBottom: "clamp(2.5rem, 5vw, 4rem)",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div
        className="surface-card"
        style={{
          position: "relative",
          borderRadius: "var(--radius-2xl, 20px)",
          overflow: "hidden",
          border: isDark ? "1px solid rgba(212, 175, 55, 0.4)" : "1px solid rgba(212, 175, 55, 0.5)",
          boxShadow: isDark
            ? "0 16px 48px rgba(0, 0, 0, 0.7), 0 0 24px rgba(212, 175, 55, 0.15)"
            : "0 12px 36px rgba(0, 0, 0, 0.12)",
          minHeight: "540px",
          display: "flex",
          alignItems: "center",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Background Dealership Image - 3.jpeg (Clear, sharp, not blurred) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            backgroundColor: "#07080a",
          }}
        >
          <img
            src={img3}
            alt="König Automobile Rheinberg Standort"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 35%",
              display: "block",
            }}
          />

          {/* High-Contrast Luxury Gradient: leaves image sharp while ensuring 100% text legibility */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: isDark
                ? "linear-gradient(105deg, rgba(6, 8, 11, 0.94) 0%, rgba(9, 11, 15, 0.88) 50%, rgba(9, 11, 15, 0.55) 100%)"
                : "linear-gradient(105deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.90) 50%, rgba(255, 255, 255, 0.6) 100%)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Content Container positioned cleanly over the image */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: "clamp(28px, 5vw, 56px)",
            maxWidth: "860px",
            boxSizing: "border-box",
          }}
        >
          {/* Eyebrow Badge */}
          <div style={{ display: "inline-block", marginBottom: "var(--space-xs)" }}>
            <Badge variant="outline" size="sm">
              {badgeText}
            </Badge>
          </div>

          {/* Main Title */}
          <h1
            id="story-heading"
            style={{
              fontSize: "clamp(1.85rem, 3.8vw, 2.85rem)",
              fontWeight: 800,
              letterSpacing: "var(--tracking-tight)",
              lineHeight: 1.16,
              color: isDark ? "#ffffff" : "#0f172a",
              margin: "0 0 10px 0",
              textShadow: isDark ? "0 2px 10px rgba(0, 0, 0, 0.7)" : "none",
            }}
          >
            {titleText}
          </h1>

          {/* Subtitle with Gold Accent */}
          <p
            style={{
              fontSize: "clamp(1.05rem, 1.8vw, 1.25rem)",
              color: isDark ? "#D4AF37" : "#B8860B",
              fontWeight: 600,
              letterSpacing: "0.02em",
              lineHeight: 1.45,
              margin: "0 0 clamp(16px, 2.5vw, 24px) 0",
            }}
          >
            {subtitleText}
          </p>

          {/* Paragraphs */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              fontSize: "clamp(0.95rem, 1.5vw, 1.08rem)",
              lineHeight: 1.68,
              color: isDark ? "rgba(243, 244, 246, 0.94)" : "#334155",
            }}
          >
            {paragraphs.map((para, pIdx) => (
              <p
                key={pIdx}
                style={{
                  margin: 0,
                  textShadow: isDark ? "0 1px 4px rgba(0,0,0,0.5)" : "none",
                }}
              >
                {para}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutStory;
