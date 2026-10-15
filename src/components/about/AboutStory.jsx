import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import Badge from "../ui/Badge";
import Icon from "../common/Icon";
import img1 from "../../assets/4images/1.jpeg";
import img2 from "../../assets/4images/2.jpeg";
import img3 from "../../assets/4images/3.jpeg";
import img4 from "../../assets/4images/4.jpeg";
import img5 from "../../assets/4images/5.jpeg";

const ABOUT_IMAGES = [img1, img2, img3, img4, img5];

/**
 * German Auto — AboutStory Component
 * Luxury editorial showcase displaying the official dealership story directly on top
 * of authentic dealership photography, with interactive image controls and glassmorphism.
 */
export function AboutStory({ className = "", style = {} }) {
  const { t, i18n } = useTranslation(["about", "common"]);
  const { isDark } = useTheme?.() || { isDark: true };
  const [activeImageIdx, setActiveImageIdx] = useState(0);

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

  const currentImage = ABOUT_IMAGES[activeImageIdx] || img1;

  return (
    <section
      className={`about-story-section ${className}`.trim()}
      aria-labelledby="story-heading"
      style={{
        marginTop: 0,
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
            ? "0 12px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(212, 175, 55, 0.15)"
            : "0 12px 36px rgba(0, 0, 0, 0.1)",
          minHeight: "560px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Background Dealership Image with Smooth Fade */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            backgroundColor: "#07080a",
          }}
        >
          <img
            key={currentImage}
            src={currentImage}
            alt="König Automobile Rheinberg"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 40%",
              display: "block",
              transform: "scale(1.02)",
              transition: "opacity 0.5s ease, transform 6s ease-out",
            }}
          />

          {/* Luxury Gradient Overlay for Guaranteed Text Readability */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: isDark
                ? "linear-gradient(135deg, rgba(5, 6, 8, 0.94) 0%, rgba(9, 11, 15, 0.82) 55%, rgba(9, 11, 15, 0.6) 100%)"
                : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.86) 55%, rgba(255, 255, 255, 0.65) 100%)",
              backdropFilter: "blur(2px)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Content Container positioned cleanly on the image */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: "clamp(24px, 5vw, 48px)",
            maxWidth: "840px",
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
              fontSize: "clamp(1.85rem, 3.8vw, 2.9rem)",
              fontWeight: 800,
              letterSpacing: "var(--tracking-tight)",
              lineHeight: 1.15,
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

          {/* Paragraphs with Luxury Spacing */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              fontSize: "clamp(0.95rem, 1.5vw, 1.08rem)",
              lineHeight: 1.68,
              color: isDark ? "rgba(243, 244, 246, 0.92)" : "#334155",
            }}
          >
            {paragraphs.map((para, pIdx) => (
              <p
                key={pIdx}
                style={{
                  margin: 0,
                  textShadow: isDark ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
                }}
              >
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* Bottom Interactive Thumbnail Strip & Counter to view all images */}
        <div
          style={{
            position: "relative",
            zIndex: 3,
            padding: "clamp(16px, 3vw, 24px) clamp(24px, 5vw, 48px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
            borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)",
            backgroundColor: isDark ? "rgba(7, 8, 10, 0.65)" : "rgba(255, 255, 255, 0.65)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Active Image Indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: isDark ? "#D4AF37" : "#B8860B",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            <Icon name="image" size={16} color={isDark ? "#D4AF37" : "#B8860B"} />
            <span>
              {currentLang === "en" ? "Impression" : "Ansicht"} {activeImageIdx + 1} / {ABOUT_IMAGES.length}
            </span>
          </div>

          {/* Thumbnails to switch between all 5 images */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              overflowX: "auto",
              padding: "2px 0",
            }}
          >
            {ABOUT_IMAGES.map((img, idx) => {
              const isActive = idx === activeImageIdx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  aria-label={`Bild ${idx + 1} anzeigen`}
                  style={{
                    width: "56px",
                    height: "38px",
                    borderRadius: "8px",
                    padding: 0,
                    overflow: "hidden",
                    border: isActive
                      ? "2px solid #D4AF37"
                      : isDark
                      ? "1px solid rgba(255, 255, 255, 0.2)"
                      : "1px solid rgba(0, 0, 0, 0.15)",
                    cursor: "pointer",
                    opacity: isActive ? 1 : 0.65,
                    transform: isActive ? "scale(1.06)" : "scale(1)",
                    transition: "all 0.2s ease",
                    boxShadow: isActive && isDark ? "0 0 10px rgba(212, 175, 55, 0.5)" : "none",
                    backgroundColor: "transparent",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutStory;
