import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container } from "../ui/Layout";
import { Eyebrow, Display, Text } from "../ui/Typography";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import { isReducedMotion } from "../../utils/animation";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * German Auto — Production Cinematic Hero Section
 * Driven exclusively by settings.hero (1-3 items) with accessible controls,
 * swipe support, video/image mixed slides, and GSAP/reduced-motion awareness.
 */

export function HeroSection({ heroConfig, siteConfig }) {
  const { t, i18n } = useTranslation(["common", "navigation"]);
  const { isDark } = useTheme();
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
  const touchStartY = useRef(0);
  const heroRef = useRef(null);
  const videoRefs = useRef({});

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

  // Synchronize video playback: ensure only the currently active slide plays and prevent overlapping playback
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([idxStr, videoEl]) => {
      if (!videoEl) return;
      const idx = Number(idxStr);
      if (idx === currentIndex) {
        try {
          const playPromise = videoEl.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {});
          }
        } catch (_) {}
      } else {
        try {
          videoEl.pause();
          videoEl.currentTime = 0;
        } catch (_) {}
      }
    });
  }, [currentIndex, isDark]);

  // Touch swipe handling: strictly horizontal swipes advance slides, never interfering with vertical page scrolling
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    // Only advance slide if gesture was distinctly horizontal and significantly larger than vertical movement
    if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY) * 1.8) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  if (!isEnabled) {
    return null;
  }

  // No fallback state - if no hero items are configured, render nothing
  if (itemCount === 0) {
    return null;
  }

  const currentItem = activeItems[currentIndex] || activeItems[0];
  const title = currentLang === "en"
    ? (currentItem.title_en || currentItem.title_de)
    : (currentItem.title_de || currentItem.title_en);
  const subtitle = currentLang === "en"
    ? (currentItem.subtitle_en || currentItem.subtitle_de)
    : (currentItem.subtitle_de || currentItem.subtitle_en);
  const ctaText = currentLang === "en"
    ? (currentItem.cta_text_en || currentItem.cta_text_de || "Explore Inventory")
    : (currentItem.cta_text_de || currentItem.cta_text_en || "Fahrzeuge entdecken");
  const ctaLink = currentLang === "en"
    ? (currentItem.button_link_en || currentItem.button_link || currentItem.cta_link || "/cars")
    : (currentItem.button_link_de || currentItem.button_link || currentItem.cta_link || "/cars");

  const secondaryCtaText = currentLang === "en"
    ? (currentItem.secondary_cta_text_en || currentItem.secondary_cta_text_de || t("navigation:inventory", "Inventory"))
    : (currentItem.secondary_cta_text_de || currentItem.secondary_cta_text_en || t("navigation:inventory", "Fahrzeugbestand"));
  const secondaryCtaLink = currentLang === "en"
    ? (currentItem.secondary_button_link_en || currentItem.secondary_button_link || "/cars")
    : (currentItem.secondary_button_link_de || currentItem.secondary_button_link || "/cars");

  return (
    <section
      ref={heroRef}
      tabIndex={0}
      role="region"
      aria-roledescription="Karussell"
      aria-label="Hauptbühne"
      className="hero-section"
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
        touchAction: "pan-y",
      }}
    >
      {/* Background Media Slides Layer - pointerEvents none ensures natural page touch scrolling */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {activeItems.map((item, idx) => {
          const isActive = idx === currentIndex;
          const useLightMedia = !isDark && Boolean(item.media_light_url);
          const currentMediaUrl = useLightMedia ? item.media_light_url : item.media_url;
          const currentMediaType = useLightMedia
            ? (item.type_light || item.type || "IMAGE")
            : (item.type || "IMAGE");
          const isItemVideo = currentMediaType === "VIDEO" || currentMediaUrl?.match(/\.(mp4|webm)$/i);
          const currentPoster = useLightMedia
            ? (item.poster_light_url || item.poster_url)
            : item.poster_url;

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
                pointerEvents: "none",
              }}
            >
              {isItemVideo && currentMediaUrl ? (
                <video
                  ref={(el) => {
                    if (el) videoRefs.current[idx] = el;
                    else delete videoRefs.current[idx];
                  }}
                  key={`${idx}-${currentMediaUrl}`}
                  src={currentMediaUrl}
                  poster={currentPoster}
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
              ) : currentMediaUrl ? (
                <img
                  key={`${idx}-${currentMediaUrl}`}
                  src={currentMediaUrl}
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
                    background: "radial-gradient(ellipse at 50% 60%, rgba(255, 255, 255, 0.08) 0%, rgba(0, 0, 0, 0.95) 75%)",
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
          className="hero-content-wrapper"
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
            <div>
              <Eyebrow>{siteConfig.name}</Eyebrow>
            </div>
          )}

          {title && (
            <div>
              <Display size="2xl" style={{ margin: 0 }}>
                {title}
              </Display>
            </div>
          )}

          {subtitle && (
            <div>
              <Text variant="lead" style={{ margin: 0, maxWidth: "620px" }}>
                {subtitle}
              </Text>
            </div>
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
              to={secondaryCtaLink}
              variant="outline"
              size="lg"
              className="hero-secondary-btn"
              style={{
                backgroundColor: "transparent",
                borderColor: isDark ? "rgba(255, 255, 255, 0.18)" : "rgba(0, 0, 0, 0.15)",
                color: "var(--color-text)",
              }}
            >
              {secondaryCtaText}
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

        @media (max-width: 768px) {
          .hero-section {
            min-height: calc(100svh - var(--header-height, 70px)) !important;
            height: calc(100svh - var(--header-height, 70px)) !important;
          }
          .hero-content-wrapper {
            padding: clamp(18px, 3vh, 32px) 0 !important;
            gap: var(--space-sm) !important;
          }
        }
      `}</style>
    </section>
  );
}

export default HeroSection;
