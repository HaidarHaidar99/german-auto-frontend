import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container } from "../ui/Layout";
import { Eyebrow, Display, Text } from "../ui/Typography";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import { isReducedMotion } from "../../utils/animation";

/**
 * German Auto — Production Cinematic Hero Section
 * Driven exclusively by settings.hero (1-3 items) with accessible controls,
 * swipe support, video/image mixed slides, and GSAP/reduced-motion awareness.
 */

export function HeroSection({ heroConfig, siteConfig }) {
  const { t, i18n } = useTranslation(["common", "navigation"]);
  const currentLang = i18n.language?.startsWith("en") ? "en" : "de";

  const isEnabled = heroConfig?.enabled !== false;
  const rawItems = Array.isArray(heroConfig?.items) ? heroConfig.items : [];

  // Filter and sort active hero items
  const activeItems = rawItems
    .filter((item) => item.enabled !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const heroRef = useRef(null);

  const itemCount = activeItems.length;

  const nextSlide = useCallback(() => {
    if (itemCount > 1) {
      setCurrentIndex((prev) => (prev + 1) % itemCount);
    }
  }, [itemCount]);

  const prevSlide = useCallback(() => {
    if (itemCount > 1) {
      setCurrentIndex((prev) => (prev - 1 + itemCount) % itemCount);
    }
  }, [itemCount]);

  // Autoplay timer (7s per slide)
  useEffect(() => {
    if (itemCount <= 1 || isPaused || isReducedMotion()) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 7000);

    return () => clearInterval(timer);
  }, [itemCount, isPaused, nextSlide]);

  // Keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "ArrowRight") {
        nextSlide();
      }
    };

    const node = heroRef.current;
    if (node) {
      node.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      if (node) node.removeEventListener("keydown", handleKeyDown);
    };
  }, [nextSlide, prevSlide]);

  // Touch swipe handling
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  if (!isEnabled) {
    return null;
  }

  // Fallback state if no hero items are configured in CMS
  if (itemCount === 0) {
    const siteName = siteConfig?.name || "German Auto";
    return (
      <section
        style={{
          position: "relative",
          minHeight: "clamp(480px, 75vh, 800px)",
          width: "100%",
          display: "flex",
          alignItems: "center",
          backgroundColor: "var(--color-background)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 60%, rgba(197, 160, 89, 0.08) 0%, rgba(9, 10, 12, 0.95) 75%)",
            pointerEvents: "none",
          }}
        />
        <Container size="default" style={{ position: "relative", zIndex: 2 }}>
          <div style={{ maxWidth: "680px", display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <Eyebrow>{siteName}</Eyebrow>
            <Display size="2xl" style={{ margin: 0 }}>
              {siteConfig?.seo_title || siteName}
            </Display>
            <Text variant="lead" style={{ margin: 0, maxWidth: "560px" }}>
              {siteConfig?.description || t("experienceSubtitle")}
            </Text>
            <div style={{ marginTop: "var(--space-md)" }}>
              <Button as={Link} to="/cars" variant="primary" size="lg" iconRight="arrow-right">
                {t("navigation:inventory", "Fahrzeugbestand")}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  const currentItem = activeItems[currentIndex] || activeItems[0];
  const title = currentLang === "en"
    ? (currentItem.title_en || currentItem.title_de)
    : (currentItem.title_de || currentItem.title_en);
  const subtitle = currentLang === "en"
    ? (currentItem.subtitle_en || currentItem.subtitle_de)
    : (currentItem.subtitle_de || currentItem.subtitle_en);
  const ctaText = currentLang === "en"
    ? (currentItem.cta_text_en || currentItem.cta_text_de || "Fahrzeuge entdecken")
    : (currentItem.cta_text_de || currentItem.cta_text_en || "Fahrzeuge entdecken");
  const ctaLink = currentItem.cta_link || "/cars";

  return (
    <section
      ref={heroRef}
      tabIndex={0}
      role="region"
      aria-roledescription="Karussell"
      aria-label="Hauptbühne"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "relative",
        minHeight: "clamp(560px, 86vh, 920px)",
        width: "100%",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: "var(--color-background)",
        outline: "none",
      }}
    >
      {/* Background Media Slides Layer */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {activeItems.map((item, idx) => {
          const isActive = idx === currentIndex;
          const isItemVideo = item.media_type === "video";

          return (
            <div
              key={idx}
              aria-hidden={!isActive}
              style={{
                position: "absolute",
                inset: 0,
                opacity: isActive ? 1 : 0,
                transition: "opacity 1.2s var(--ease-smooth)",
                zIndex: isActive ? 1 : 0,
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              {isItemVideo && item.media_url ? (
                <video
                  src={item.media_url}
                  poster={item.poster_url}
                  autoPlay={isActive}
                  loop
                  muted
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : item.media_url ? (
                <img
                  src={item.media_url}
                  alt={item.title_de || item.title_en || "Hero"}
                  fetchPriority={idx === 0 ? "high" : "auto"}
                  loading={idx === 0 ? "eager" : "lazy"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: isActive && !isReducedMotion() ? "scale(1.03)" : "scale(1)",
                    transition: "transform 7s ease-out",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "radial-gradient(ellipse at 50% 60%, rgba(197, 160, 89, 0.08) 0%, rgba(9, 10, 12, 0.95) 75%)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Cinematic Gradient Mask (Ensures Readable Typography) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(9, 10, 12, 0.35) 0%, rgba(9, 10, 12, 0.65) 60%, rgba(9, 10, 12, 1) 100%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Foreground Content */}
      <Container size="default" style={{ position: "relative", zIndex: 3, width: "100%" }}>
        <div
          key={currentIndex}
          style={{
            maxWidth: "760px",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
            padding: "var(--space-3xl) 0 var(--space-xl)",
            animation: "fadeInSlideContent 0.7s var(--ease-smooth)",
          }}
        >
          {siteConfig?.name && (
            <Eyebrow>{siteConfig.name}</Eyebrow>
          )}

          {title && (
            <Display size="2xl" style={{ margin: 0 }}>
              {title}
            </Display>
          )}

          {subtitle && (
            <Text variant="lead" style={{ margin: 0, maxWidth: "620px" }}>
              {subtitle}
            </Text>
          )}

          {/* Action Button Group */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-md)",
              marginTop: "var(--space-sm)",
            }}
          >
            <Button
              as={Link}
              to={ctaLink}
              variant="primary"
              size="lg"
              iconRight="arrow-right"
            >
              {ctaText}
            </Button>

            <Button
              as={Link}
              to="/cars"
              variant="outline"
              size="lg"
            >
              {t("navigation:inventory", "Fahrzeugbestand")}
            </Button>
          </div>
        </div>
      </Container>

      {/* Slide Navigation Controls (Visible if more than 1 item) */}
      {itemCount > 1 && (
        <>
          {/* Arrow Buttons (Desktop & Tablet) */}
          <div
            className="hide-mobile"
            style={{
              position: "absolute",
              bottom: "var(--space-xl)",
              left: "clamp(var(--gutter-mobile), 3vw, var(--gutter-desktop))",
              display: "flex",
              gap: "var(--space-xs)",
              zIndex: 10,
            }}
          >
            <IconButton
              icon="chevron-left"
              ariaLabel="Vorherige Folie"
              variant="secondary"
              size="sm"
              onClick={prevSlide}
              style={{ backgroundColor: "rgba(9, 10, 12, 0.75)" }}
            />
            <IconButton
              icon="chevron-right"
              ariaLabel="Nächste Folie"
              variant="secondary"
              size="sm"
              onClick={nextSlide}
              style={{ backgroundColor: "rgba(9, 10, 12, 0.75)" }}
            />
          </div>

          {/* Slide Indicator Bars */}
          <div
            style={{
              position: "absolute",
              bottom: "var(--space-xl)",
              right: "clamp(var(--gutter-mobile), 3vw, var(--gutter-desktop))",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-xs)",
              zIndex: 10,
            }}
          >
            {activeItems.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Zu Folie ${idx + 1} springen`}
                aria-current={idx === currentIndex ? "true" : undefined}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: idx === currentIndex ? "36px" : "14px",
                  height: "3px",
                  borderRadius: "2px",
                  backgroundColor: idx === currentIndex ? "var(--color-secondary)" : "rgba(255, 255, 255, 0.3)",
                  transition: "all var(--duration-fast) var(--ease-smooth)",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeInSlideContent {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}

export default HeroSection;
