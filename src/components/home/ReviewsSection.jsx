import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, Section } from "../ui/Layout";
import { Eyebrow, Heading } from "../ui/Typography";
import Button from "../ui/Button";
import reviewsService from "../../services/reviews/reviews.service";

/**
 * German Auto — Luxury Uniform Reviews Section & Carousel
 * - All review cards have the EXACT same height (360px) and width (max 340px).
 * - Text-only presentation (images in reviews completely removed).
 * - Matches the autoweltnoris layout:
 *   1. Avatar circle + Name + relative time ("vor einem Jahr") + Google 'G' icon
 *   2. 5 Gold stars rating
 *   3. Review text (strictly limited so it never overflows or stretches the card)
 * - Navigation: Side arrows < >, indicator dots, and "Leave a Review →" button without shadow.
 */
export function ReviewsSection({ googleReviewsConfig }) {
  const { t, i18n } = useTranslation(["common", "navigation"]);
  const currentLang = i18n.language?.startsWith("en") ? "en" : "de";

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carousel State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const isGoogleReviewsEnabled = Boolean(googleReviewsConfig?.enabled && googleReviewsConfig?.profile_url);

  // Detect Mobile Viewport (< 768px)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch Reviews
  const fetchReviews = useCallback(() => {
    reviewsService
      .getReviews({ limit: 15 })
      .then((res) => {
        setReviews(res?.data?.reviews || []);
      })
      .catch(() => {
        setReviews([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Carousel Calculation: 3 on desktop, 1 on mobile
  const itemsPerPage = isMobile ? 1 : 3;
  const maxIndex = Math.max(0, reviews.length - itemsPerPage);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  }, [maxIndex]);

  // Touch Swipe Handling for mobile & touchscreens
  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);
  const touchDiffXRef = useRef(0);

  const handleTouchStart = (e) => {
    setIsPaused(true);
    if (!e.touches || e.touches.length === 0) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    touchDiffXRef.current = 0;
  };

  const handleTouchMove = (e) => {
    if (touchStartXRef.current === null || !e.touches || e.touches.length === 0) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = touchStartXRef.current - currentX;
    const diffY = touchStartYRef.current - currentY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      touchDiffXRef.current = diffX;
    }
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartXRef.current === null) return;
    const threshold = 40; // 40px swipe threshold
    if (touchDiffXRef.current > threshold) {
      handleNext();
    } else if (touchDiffXRef.current < -threshold) {
      handlePrev();
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchDiffXRef.current = 0;
  };

  // Auto-play Carousel Timer (every 5 seconds)
  useEffect(() => {
    if (reviews.length <= itemsPerPage || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [reviews.length, itemsPerPage, maxIndex, isPaused]);

  // Relative Time Formatter matching "vor einem Jahr" in autoweltnoris
  const formatReviewTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      return currentLang === "en" ? "Today" : "Heute";
    }
    if (diffDays === 1) {
      return currentLang === "en" ? "Yesterday" : "Gestern";
    }
    if (diffDays < 7) {
      return currentLang === "en" ? `${diffDays} days ago` : `vor ${diffDays} Tagen`;
    }
    if (diffDays < 30) {
      const weeks = Math.max(1, Math.floor(diffDays / 7));
      return currentLang === "en"
        ? (weeks === 1 ? "1 week ago" : `${weeks} weeks ago`)
        : (weeks === 1 ? "vor einer Woche" : `vor ${weeks} Wochen`);
    }
    if (diffDays < 365) {
      const months = Math.max(1, Math.floor(diffDays / 30));
      return currentLang === "en"
        ? (months === 1 ? "1 month ago" : `${months} months ago`)
        : (months === 1 ? "vor einem Monat" : `vor ${months} Monaten`);
    }
    const years = Math.max(1, Math.floor(diffDays / 365));
    return currentLang === "en"
      ? (years === 1 ? "1 year ago" : `${years} years ago`)
      : (years === 1 ? "vor einem Jahr" : `vor ${years} Jahren`);
  };

  const googleLabel = currentLang === "en"
    ? (googleReviewsConfig?.display_label_en || "View on Google")
    : (googleReviewsConfig?.display_label_de || "Auf Google ansehen");

  return (
    <Section
      id="reviews"
      spacing="default"
      style={{
        backgroundColor: "var(--color-surface, #050505)",
        position: "relative",
        borderTop: "1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08))",
        borderBottom: "1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08))",
        overflow: "hidden",
      }}
    >
      <Container size="default">
        {/* Section Header */}
        <div
          data-aos="fade-up"
          style={{
            textAlign: "center",
            maxWidth: "700px",
            margin: "0 auto var(--space-2xl)",
          }}
        >
          <Eyebrow>{currentLang === "en" ? "Client Feedback & Reviews" : "Kundenstimmen & Rezensionen"}</Eyebrow>
          <Heading level={2} style={{ margin: "var(--space-2xs) 0 0", color: "#ffffff", fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
            {currentLang === "en" ? "Experiences & Reviews" : "Erfahrungen & Rezensionen"}
          </Heading>
        </div>

        {/* ── Reviews Carousel ─────────────────────────────────────── */}
        {reviews.length > 0 && (
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            style={{
              position: "relative",
              maxWidth: isMobile ? "min(360px, calc(100vw - 32px))" : "1140px",
              margin: "0 auto var(--space-xl)",
              padding: isMobile ? "0 28px" : "0 46px",
              boxSizing: "border-box",
              touchAction: "pan-y",
            }}
          >
            {/* Carousel Track Wrapper */}
            <div style={{ overflow: "hidden", width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  transition: "transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)",
                  transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
                }}
              >
                {reviews.map((rev) => {
                  const initial = (rev.name ? rev.name.trim()[0].toUpperCase() : "U");
                  const nameLen = (rev.name || "").trim().length;
                  const nameFontSize = nameLen > 24 ? "0.82rem" : nameLen > 16 ? "0.9rem" : "1rem";

                  return (
                    <div
                      key={rev.id}
                      style={{
                        flex: `0 0 ${100 / itemsPerPage}%`,
                        padding: isMobile ? "0 8px" : "0 12px",
                        boxSizing: "border-box",
                        display: "flex",
                        justifyContent: "center",
                        minWidth: 0,
                      }}
                    >
                      {/* Exact Uniform Review Card - Taller Height for full text */}
                      <div
                        style={{
                          width: "100%",
                          maxWidth: "340px",
                          height: "440px",
                          minHeight: "440px",
                          maxHeight: "440px",
                          backgroundColor: "#0d0d0d",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "16px",
                          padding: "24px",
                          display: "flex",
                          flexDirection: "column",
                          boxSizing: "border-box",
                          transition: "border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease",
                          position: "relative",
                          overflow: "hidden",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.5)";
                          e.currentTarget.style.transform = "translateY(-4px)";
                          e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {/* Falling Stars & Sparkles Background Animation */}
                        <div
                          className="reviews-stars-rain"
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
                            { symbol: "★", left: "6%", size: "18px", dur: "5.5s", delay: "-1.5s", opacity: 0.24 },
                            { symbol: "✦", left: "18%", size: "14px", dur: "6.2s", delay: "-3.8s", opacity: 0.28 },
                            { symbol: "★", left: "32%", size: "22px", dur: "4.8s", delay: "-0.6s", opacity: 0.3 },
                            { symbol: "✧", left: "46%", size: "16px", dur: "5.8s", delay: "-4.2s", opacity: 0.22 },
                            { symbol: "★", left: "58%", size: "19px", dur: "5.2s", delay: "-2.1s", opacity: 0.26 },
                            { symbol: "◈", left: "72%", size: "15px", dur: "6.5s", delay: "-4.9s", opacity: 0.2 },
                            { symbol: "★", left: "84%", size: "20px", dur: "4.6s", delay: "-1.2s", opacity: 0.28 },
                            { symbol: "✦", left: "94%", size: "16px", dur: "5.9s", delay: "-3.1s", opacity: 0.25 },
                          ].map((item, pIdx) => (
                            <span
                              key={pIdx}
                              style={{
                                position: "absolute",
                                top: "-30px",
                                left: item.left,
                                fontSize: item.size,
                                color: "#D4AF37",
                                opacity: item.opacity,
                                textShadow: "0 0 8px rgba(212, 175, 55, 0.4)",
                                animation: `reviewStarFall ${item.dur} linear infinite`,
                                animationDelay: item.delay,
                                willChange: "transform, opacity",
                              }}
                            >
                              {item.symbol}
                            </span>
                          ))}
                        </div>

                        {/* 1. Top Header Row: Avatar + Name & Relative Date */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            position: "relative",
                            zIndex: 1,
                            marginBottom: "16px",
                            flexShrink: 0,
                            minWidth: 0,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, width: "100%" }}>
                            {/* Circle Avatar with Initial */}
                            <div
                              style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "50%",
                                backgroundColor: "#221d18",
                                border: "1px solid rgba(212, 175, 55, 0.35)",
                                color: "#D4AF37",
                                fontWeight: 700,
                                fontSize: "1.1rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {initial}
                            </div>

                            {/* Name & Time */}
                            <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                              <div
                                style={{
                                  fontSize: nameFontSize,
                                  fontWeight: 700,
                                  color: "#ffffff",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  lineHeight: 1.25,
                                }}
                                title={rev.name}
                              >
                                {rev.name}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.8rem",
                                  color: "rgba(255, 255, 255, 0.45)",
                                  marginTop: "3px",
                                  fontWeight: 500,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {formatReviewTime(rev.created_at)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2. Stars Rating */}
                        <div
                          style={{
                            display: "flex",
                            gap: "3px",
                            color: "#D4AF37",
                            fontSize: "1.15rem",
                            marginBottom: "14px",
                            flexShrink: 0,
                            position: "relative",
                            zIndex: 1,
                          }}
                        >
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} style={{ opacity: i < (rev.rating || 5) ? 1 : 0.2 }}>
                              ★
                            </span>
                          ))}
                        </div>

                        {/* 3. Review Text - Taller height with smooth overflow so full text appears */}
                        <div
                          style={{
                            flex: 1,
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            paddingRight: "4px",
                            scrollbarWidth: "thin",
                            scrollbarColor: "rgba(212, 175, 55, 0.3) transparent",
                            position: "relative",
                            zIndex: 1,
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              color: "rgba(255, 255, 255, 0.9)",
                              fontSize: "0.92rem",
                              lineHeight: 1.65,
                              wordBreak: "break-word",
                            }}
                          >
                            {rev.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <style>{`
              @keyframes reviewStarFall {
                0% {
                  transform: translateY(0) rotate(0deg) scale(0.9);
                  opacity: 0;
                }
                15% {
                  opacity: 0.32;
                }
                85% {
                  opacity: 0.26;
                }
                100% {
                  transform: translateY(480px) rotate(360deg) scale(1.1);
                  opacity: 0;
                }
              }
            `}</style>

            {/* Left Carousel Arrow: not shown on the first card */}
            {reviews.length > itemsPerPage && currentIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous review"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: isMobile ? "0px" : "4px",
                  transform: "translateY(-50%)",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(10, 10, 10, 0.9)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  fontSize: "18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#D4AF37";
                  e.currentTarget.style.color = "#000000";
                  e.currentTarget.style.borderColor = "#D4AF37";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(10, 10, 10, 0.9)";
                  e.currentTarget.style.color = "#ffffff";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                }}
              >
                ‹
              </button>
            )}

            {/* Right Carousel Arrow: not shown at the end */}
            {reviews.length > itemsPerPage && currentIndex < maxIndex && (
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next review"
                style={{
                  position: "absolute",
                  top: "50%",
                  right: isMobile ? "0px" : "4px",
                  transform: "translateY(-50%)",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(10, 10, 10, 0.9)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  fontSize: "18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#D4AF37";
                  e.currentTarget.style.color = "#000000";
                  e.currentTarget.style.borderColor = "#D4AF37";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(10, 10, 10, 0.9)";
                  e.currentTarget.style.color = "#ffffff";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                }}
              >
                ›
              </button>
            )}

            {/* Dot Indicators */}
            {reviews.length > itemsPerPage && (
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "var(--space-lg)" }}>
                {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    style={{
                      width: currentIndex === idx ? "24px" : "8px",
                      height: "8px",
                      borderRadius: "4px",
                      backgroundColor: currentIndex === idx ? "#D4AF37" : "rgba(255, 255, 255, 0.2)",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Empty State ─────────────────────────────────────────── */}
        {!loading && reviews.length === 0 && (
          <div
            data-aos="fade-up"
            style={{
              textAlign: "center",
              padding: "var(--space-2xl) var(--space-lg)",
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              borderRadius: "var(--radius-lg)",
              border: "1px dashed rgba(212, 175, 55, 0.3)",
              maxWidth: "680px",
              margin: "0 auto var(--space-2xl)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", gap: "6px", color: "#D4AF37", fontSize: "1.8rem", marginBottom: "var(--space-md)" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>

            <h3 style={{ margin: "0 0 var(--space-xs)", fontSize: "1.35rem", color: "#ffffff", fontWeight: 700 }}>
              {currentLang === "en" ? "Be the First to Share Your Experience" : "Teilen Sie Ihre Erfahrung mit German Auto"}
            </h3>

            <p style={{ margin: "0 auto", color: "var(--color-text-muted)", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: "520px" }}>
              {currentLang === "en"
                ? "Your feedback shapes our dedication to perfection. We welcome your review on our vehicles and exclusive customer service."
                : "Ihre Meinung ist uns wichtig. Berichten Sie über Ihren Fahrzeugkauf, die Beratung und unseren erstklassigen Service."}
            </p>
          </div>
        )}

        {/* ── Action Buttons under the cards without shadow ────────── */}
        <div
          data-aos="fade-up"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "var(--space-md)",
            flexWrap: "wrap",
            marginTop: "var(--space-lg)",
          }}
        >
          <Button
            as={Link}
            to="/leave-review"
            variant="secondary"
            size="lg"
            style={{
              boxShadow: "none",
              borderRadius: "0px",
              fontWeight: 700,
              fontSize: "0.95rem",
              letterSpacing: "0.05em",
            }}
          >
            {currentLang === "en" ? "Leave a Review →" : "Bewertung schreiben →"}
          </Button>

          {isGoogleReviewsEnabled && (
            <Button
              as="a"
              href={googleReviewsConfig.profile_url}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              size="lg"
              style={{
                boxShadow: "none",
                borderRadius: "0px",
              }}
            >
              {googleLabel} ↗
            </Button>
          )}
        </div>
      </Container>
    </Section>
  );
}

export default ReviewsSection;
