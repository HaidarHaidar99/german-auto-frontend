import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, Section } from "../ui/Layout";
import { Eyebrow, Heading } from "../ui/Typography";
import Button from "../ui/Button";
import reviewsService from "../../services/reviews/reviews.service";

/**
 * German Auto — Dynamic Reviews Section & Carousel
 * - Desktop: 3 cards per view, automated carousel with pause on hover
 * - Mobile: 1 card per view, horizontal swipable/navigable
 * - Card order: 1. Name -> 2. d/m/y -> 3. Stars -> 4. Message -> 5. Images
 * - "Leave a Review →" button placed UNDER the cards without shadow
 * - Fullscreen centered lightbox with left/right arrows for multiple images
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

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState(null);

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

  // Auto-play Carousel Timer (every 4.5 seconds)
  useEffect(() => {
    if (reviews.length <= itemsPerPage || isPaused || lightboxIndex !== null) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(timer);
  }, [reviews.length, itemsPerPage, maxIndex, isPaused, lightboxIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Collect all images from reviews for Lightbox navigation
  const allImages = reviews
    .filter((r) => Boolean(r.image_url))
    .map((r) => ({
      url: r.image_url,
      reviewerName: r.name,
    }));

  const openLightboxByUrl = (url) => {
    const idx = allImages.findIndex((img) => img.url === url);
    if (idx !== -1) {
      setLightboxIndex(idx);
    } else if (url) {
      setLightboxIndex(0);
    }
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  // Lightbox keyboard navigation (ESC, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, allImages.length]);

  // Format Date in d/m/y (e.g. 01.10.2026)
  const formatDateDMY = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
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

        {/* ── Case 1: Reviews Carousel ─────────────────────────────── */}
        {reviews.length > 0 && (
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            style={{ position: "relative", marginBottom: "var(--space-2xl)" }}
          >
            {/* Carousel Container */}
            <div style={{ overflow: "hidden", width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  transition: "transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)",
                  transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
                }}
              >
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      flex: `0 0 ${100 / itemsPerPage}%`,
                      padding: "0 10px",
                      boxSizing: "border-box",
                    }}
                  >
                    {/* Review Card */}
                    <div
                      style={{
                        backgroundColor: "#0d0d0d",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "var(--radius-lg)",
                        padding: "clamp(var(--space-lg), 4vw, var(--space-xl))",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "280px",
                        boxSizing: "border-box",
                        transition: "border-color 0.25s ease, transform 0.25s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.4)";
                        e.currentTarget.style.transform = "translateY(-4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {/* 1. Name at first as top */}
                      <div
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          color: "#ffffff",
                          marginBottom: "2px",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {rev.name}
                      </div>

                      {/* 2. Under it: d/m/y date */}
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--color-text-muted, #a1a1aa)",
                          marginBottom: "10px",
                          fontWeight: 500,
                        }}
                      >
                        {formatDateDMY(rev.created_at)}
                      </div>

                      {/* 3. Under it: stars rating */}
                      <div
                        style={{
                          display: "flex",
                          gap: "3px",
                          color: "#D4AF37",
                          fontSize: "1.15rem",
                          marginBottom: "14px",
                        }}
                      >
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} style={{ opacity: i < (rev.rating || 5) ? 1 : 0.2 }}>
                            ★
                          </span>
                        ))}
                      </div>

                      {/* 4. Then: the message */}
                      <p
                        style={{
                          margin: 0,
                          color: "rgba(255, 255, 255, 0.88)",
                          fontSize: "0.925rem",
                          lineHeight: 1.6,
                          fontStyle: "italic",
                          flex: 1,
                        }}
                      >
                        "{rev.text}"
                      </p>

                      {/* 5. After that: the images */}
                      {rev.image_url && (
                        <div style={{ marginTop: "16px" }}>
                          <button
                            type="button"
                            onClick={() => openLightboxByUrl(rev.image_url)}
                            title={currentLang === "en" ? "Click to enlarge photo" : "Klicken zum Vergrößern"}
                            style={{
                              padding: 0,
                              border: "1px solid rgba(212, 175, 55, 0.4)",
                              borderRadius: "var(--radius-sm)",
                              overflow: "hidden",
                              cursor: "pointer",
                              background: "none",
                              display: "inline-block",
                              transition: "transform 0.2s ease, border-color 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "scale(1.04)";
                              e.currentTarget.style.borderColor = "#D4AF37";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "scale(1)";
                              e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.4)";
                            }}
                          >
                            <img
                              src={rev.image_url}
                              alt={`Vehicle from ${rev.name}`}
                              style={{
                                width: "95px",
                                height: "65px",
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Navigation Arrows */}
            {reviews.length > itemsPerPage && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous review"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "-16px",
                    transform: "translateY(-50%)",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(10, 10, 10, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#ffffff",
                    fontSize: "20px",
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

                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next review"
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "-16px",
                    transform: "translateY(-50%)",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(10, 10, 10, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#ffffff",
                    fontSize: "20px",
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
              </>
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

        {/* ── Case 2: Empty State ──────────────────────────────────── */}
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

        {/* ── Button UNDER the cards without shadow, with arrow text ── */}
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
              boxShadow: "none", // Explicitly no shadow as requested
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

      {/* ── Lightbox Image Viewer (Centered, never exceeds screen) ─── */}
      {lightboxIndex !== null && allImages[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={closeLightbox}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.94)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            zIndex: 999999, // Stays above everything
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          {/* Close 'X' Button at Top-Right */}
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close image preview"
            style={{
              position: "fixed",
              top: "24px",
              right: "24px",
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "#ffffff",
              fontSize: "20px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000000,
              transition: "background-color 0.2s ease, transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(212, 175, 55, 0.8)";
              e.currentTarget.style.color = "#000000";
              e.currentTarget.style.transform = "scale(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            ✕
          </button>

          {/* Previous Arrow Button */}
          {allImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
              }}
              aria-label="Previous image"
              style={{
                position: "fixed",
                left: "24px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                backgroundColor: "rgba(20, 20, 20, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "#ffffff",
                fontSize: "28px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000000,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#D4AF37";
                e.currentTarget.style.color = "#000000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(20, 20, 20, 0.8)";
                e.currentTarget.style.color = "#ffffff";
              }}
            >
              ‹
            </button>
          )}

          {/* Centered Image Container - Fits completely inside page */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "min(90vw, 1000px)",
              maxHeight: "82vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={allImages[lightboxIndex].url}
              alt={`Review image by ${allImages[lightboxIndex].reviewerName}`}
              style={{
                maxWidth: "100%",
                maxHeight: "78vh",
                objectFit: "contain",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(212, 175, 55, 0.4)",
                boxShadow: "0 25px 50px rgba(0, 0, 0, 0.9)",
                display: "block",
              }}
            />

            {/* Bottom Details & Image Counter */}
            <div
              style={{
                marginTop: "12px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "0.875rem",
              }}
            >
              <span>{allImages[lightboxIndex].reviewerName}</span>
              {allImages.length > 1 && (
                <span>
                  {lightboxIndex + 1} / {allImages.length}
                </span>
              )}
            </div>
          </div>

          {/* Next Arrow Button */}
          {allImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
              }}
              aria-label="Next image"
              style={{
                position: "fixed",
                right: "24px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                backgroundColor: "rgba(20, 20, 20, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "#ffffff",
                fontSize: "28px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000000,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#D4AF37";
                e.currentTarget.style.color = "#000000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(20, 20, 20, 0.8)";
                e.currentTarget.style.color = "#ffffff";
              }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </Section>
  );
}

export default ReviewsSection;
