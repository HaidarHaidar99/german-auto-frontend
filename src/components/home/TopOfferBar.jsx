import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "../common/Icon";

/**
 * German Auto — Top Animated Offer Bar
 * CMS-controlled top announcement bar with subtle rotation and pause-on-hover.
 */

export function TopOfferBar({ offersConfig }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith("en") ? "en" : "de";

  const isEnabled = offersConfig?.enabled !== false;
  const rawItems = Array.isArray(offersConfig?.items) ? offersConfig.items : [];

  // Filter only active offers with text
  const activeOffers = rawItems.filter((item) => {
    if (item.enabled === false) return false;
    const text = currentLang === "en" ? (item.text_en || item.text_de) : (item.text_de || item.text_en);
    return Boolean(text && text.trim());
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isEnabled || activeOffers.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeOffers.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [isEnabled, activeOffers.length, isPaused]);

  if (!isEnabled || activeOffers.length === 0) {
    return null;
  }

  const currentOffer = activeOffers[currentIndex] || activeOffers[0];
  const offerText = currentLang === "en"
    ? (currentOffer.text_en || currentOffer.text_de)
    : (currentOffer.text_de || currentOffer.text_en);

  const linkText = currentLang === "en"
    ? (currentOffer.link_text_en || currentOffer.link_text_de || "Details")
    : (currentOffer.link_text_de || currentOffer.link_text_en || "Details");

  return (
    <div
      role="region"
      aria-label="Angebote & Aktionen"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        backgroundColor: "var(--color-primary)",
        borderBottom: "1px solid var(--color-border-subtle)",
        color: "var(--color-text)",
        fontSize: "var(--font-size-xs)",
        padding: "6px var(--space-md)",
        position: "relative",
        zIndex: 101,
        transition: "background-color var(--duration-fast) var(--ease-smooth)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-md)",
          textAlign: "center",
          minHeight: "24px",
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-xs)" }}>
          <span
            style={{
              color: "var(--color-secondary)",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <Icon name="award" size={14} />
          </span>
          <span
            key={currentIndex}
            style={{
              fontWeight: 500,
              letterSpacing: "var(--tracking-normal)",
              animation: "fadeInOffer 0.4s var(--ease-smooth)",
            }}
          >
            {offerText}
          </span>
        </div>

        {currentOffer.link && (
          <Link
            to={currentOffer.link}
            style={{
              color: "var(--color-secondary)",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              flexShrink: 0,
            }}
          >
            <span>{linkText}</span>
            <Icon name="arrow-right" size={12} />
          </Link>
        )}
      </div>

      <style>{`
        @keyframes fadeInOffer {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default TopOfferBar;
