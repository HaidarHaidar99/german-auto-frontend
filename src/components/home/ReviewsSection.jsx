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

  // Auto-play Carousel Timer (every 5 seconds)
  useEffect(() => {
    if (reviews.length <= itemsPerPage || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [reviews.length, itemsPerPage, maxIndex, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

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
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            style={{
              position: "relative",
              maxWidth: isMobile ? "360px" : "1140px",
              margin: "0 auto var(--space-xl)",
              padding: isMobile ? "0 34px" : "0 46px",
              boxSizing: "border-box",
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
                  return (
                    <div
                      key={rev.id}
                      style={{
                        flex: `0 0 ${100 / itemsPerPage}%`,
                        padding: "0 10px",
                        boxSizing: "border-box",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      {/* Exact Uniform Review Card */}
                      <div
                        style={{
                          width: "100%",
                          maxWidth: "340px",
                          height: "360px",
                          minHeight: "360px",
                          maxHeight: "360px",
                          backgroundColor: "#0d0d0d",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "16px",
                          padding: "24px",
                          display: "flex",
                          flexDirection: "column",
                          boxSizing: "border-box",
                          transition: "border-color 0.25s ease, transform 0.25s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.45)";
                          e.currentTarget.style.transform = "translateY(-4px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        {/* 1. Top Header Row: Avatar + Name & Relative Date + Google 'G' Icon */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "16px",
                            flexShrink: 0,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
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
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: "1rem",
                                  fontWeight: 700,
                                  color: "#ffffff",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  lineHeight: 1.2,
                                }}
                              >
                                {rev.name}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.8rem",
                                  color: "rgba(255, 255, 255, 0.45)",
                                  marginTop: "3px",
                                  fontWeight: 500,
                                }}
                              >
                                {formatReviewTime(rev.created_at)}
                              </div>
                            </div>
                          </div>

                          {/* Subtle Google 'G' Icon matching autoweltnoris */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: 0.45,
                              flexShrink: 0,
                              marginLeft: "8px",
                            }}
                            title="Google Review"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#ffffff"
                              />
                              <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#ffffff"
                              />
                              <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                fill="#ffffff"
                              />
                              <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                fill="#ffffff"
                              />
                            </svg>
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
                          }}
                        >
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} style={{ opacity: i < (rev.rating || 5) ? 1 : 0.2 }}>
                              ★
                            </span>
                          ))}
                        </div>

                        {/* 3. Review Text - Strictly limited to prevent overflow */}
                        <div
                          style={{
                            flex: 1,
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "flex-start",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              color: "rgba(255, 255, 255, 0.88)",
                              fontSize: "0.885rem",
                              lineHeight: 1.6,
                              display: "-webkit-box",
                              WebkitLineClamp: 8,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
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

            {/* Left Carousel Arrow */}
            {reviews.length > itemsPerPage && (
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

            {/* Right Carousel Arrow */}
            {reviews.length > itemsPerPage && (
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
