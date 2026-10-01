import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Container, Section, Grid } from "../ui/Layout";
import { Eyebrow, Heading, Text } from "../ui/Typography";
import Button from "../ui/Button";
import Icon from "../common/Icon";
import reviewsService from "../../services/reviews/reviews.service";
import CreateReviewModal from "../reviews/CreateReviewModal";

/**
 * German Auto — Reviews Section
 * Shows real approved customer reviews, Google Reviews link,
 * and a prominent "Bewertung abgeben" (Leave a Review) button.
 */
export function ReviewsSection({ googleReviewsConfig }) {
  const { t, i18n } = useTranslation(["common", "navigation"]);
  const currentLang = i18n.language?.startsWith("en") ? "en" : "de";

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const isGoogleReviewsEnabled = Boolean(googleReviewsConfig?.enabled && googleReviewsConfig?.profile_url);

  const fetchReviews = useCallback(() => {
    let isMounted = true;
    reviewsService
      .getReviews({ limit: 6 })
      .then((res) => {
        if (isMounted) {
          setReviews(res?.data?.reviews || []);
        }
      })
      .catch(() => {
        if (isMounted) setReviews([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const googleLabel = currentLang === "en"
    ? (googleReviewsConfig?.display_label_en || "View on Google")
    : (googleReviewsConfig?.display_label_de || "Auf Google ansehen");

  return (
    <Section
      id="reviews"
      spacing="default"
      style={{
        backgroundColor: "var(--color-surface)",
        position: "relative",
        borderTop: "1px solid var(--color-border-subtle)",
        borderBottom: "1px solid var(--color-border-subtle)",
      }}
    >
      <Container size="default">
        {/* Section Header */}
        <div
          data-aos="fade-up"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "var(--space-md)",
            marginBottom: "var(--space-2xl)",
          }}
        >
          <div>
            <Eyebrow>{t("reviews", { defaultValue: "Kundenstimmen & Rezensionen" })}</Eyebrow>
            <Heading level={2} style={{ margin: "var(--space-2xs) 0 0", color: "#ffffff" }}>
              {currentLang === "en" ? "Experiences & Reviews" : "Erfahrungen & Rezensionen"}
            </Heading>
          </div>

          {/* Action Buttons: Write Review & Google Reviews */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", flexWrap: "wrap" }}>
            <Button
              type="button"
              variant="secondary"
              size="md"
              iconLeft="star"
              onClick={() => setIsModalOpen(true)}
              style={{
                boxShadow: "0 4px 14px rgba(212, 175, 55, 0.2)",
              }}
            >
              {currentLang === "en" ? "Leave a Review" : "Bewertung schreiben"}
            </Button>

            {isGoogleReviewsEnabled && (
              <Button
                as="a"
                href={googleReviewsConfig.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                size="md"
                iconRight="external-link"
              >
                {googleLabel}
              </Button>
            )}
          </div>
        </div>

        {/* ── Case 1: Reviews List ──────────────────────────────────── */}
        {reviews.length > 0 && (
          <Grid cols="responsive" gap="lg">
            {reviews.map((rev, idx) => (
              <div
                key={rev.id}
                data-aos="fade-up"
                data-aos-delay={idx * 100}
                className="surface-card"
                style={{
                  padding: "var(--space-xl)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-md)",
                  borderRadius: "var(--radius-lg)",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.4)";
                  e.currentTarget.style.boxShadow = "0 12px 24px rgba(0, 0, 0, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Top: Stars and Verified Badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", gap: "3px", color: "#D4AF37", fontSize: "1.15rem" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} style={{ opacity: i < (rev.rating || 5) ? 1 : 0.2 }}>
                        ★
                      </span>
                    ))}
                  </div>

                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#D4AF37",
                      backgroundColor: "rgba(212, 175, 55, 0.12)",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    ✓ {currentLang === "en" ? "Verified Purchase" : "Verifizierter Kauf"}
                  </span>
                </div>

                {/* Review Text */}
                <Text
                  variant="body"
                  style={{
                    margin: 0,
                    fontStyle: "italic",
                    flex: 1,
                    color: "rgba(255, 255, 255, 0.9)",
                    lineHeight: 1.6,
                    fontSize: "0.95rem",
                  }}
                >
                  "{rev.text}"
                </Text>

                {/* Optional Customer Image Thumbnail */}
                {rev.image_url && (
                  <div style={{ marginTop: "var(--space-xs)" }}>
                    <button
                      type="button"
                      onClick={() => setSelectedPhoto(rev.image_url)}
                      style={{
                        padding: 0,
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "var(--radius-sm)",
                        overflow: "hidden",
                        cursor: "pointer",
                        background: "none",
                        display: "block",
                      }}
                    >
                      <img
                        src={rev.image_url}
                        alt={`Review by ${rev.name}`}
                        style={{
                          width: "80px",
                          height: "60px",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </button>
                  </div>
                )}

                {/* Reviewer Details */}
                <div
                  style={{
                    marginTop: "auto",
                    borderTop: "1px solid var(--color-border-subtle)",
                    paddingTop: "var(--space-sm)",
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-sm)",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "#D4AF37",
                      color: "#000000",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.875rem",
                      flexShrink: 0,
                    }}
                  >
                    {(rev.name || "K")[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: "#ffffff" }}>
                      {rev.name}
                    </div>
                    {rev.created_at && (
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        {new Date(rev.created_at).toLocaleDateString(currentLang === "en" ? "en-US" : "de-DE", {
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Grid>
        )}

        {/* ── Case 2: Empty State (Never Hide Completely) ────────────── */}
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
              margin: "0 auto",
            }}
          >
            {/* Golden Star Banner */}
            <div style={{ display: "flex", justifyContent: "center", gap: "6px", color: "#D4AF37", fontSize: "1.8rem", marginBottom: "var(--space-md)" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>

            <h3 style={{ margin: "0 0 var(--space-xs)", fontSize: "1.35rem", color: "#ffffff", fontWeight: 700 }}>
              {currentLang === "en" ? "Be the First to Share Your Experience" : "Teilen Sie Ihre Erfahrung mit German Auto"}
            </h3>

            <p style={{ margin: "0 auto var(--space-xl)", color: "var(--color-text-muted)", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: "520px" }}>
              {currentLang === "en"
                ? "Your feedback shapes our dedication to perfection. We welcome your review on our vehicles and exclusive customer service."
                : "Ihre Meinung ist uns wichtig. Berichten Sie über Ihren Fahrzeugkauf, die Beratung und unseren erstklassigen Service."}
            </p>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              iconLeft="star"
              onClick={() => setIsModalOpen(true)}
              style={{
                boxShadow: "0 4px 18px rgba(212, 175, 55, 0.25)",
              }}
            >
              {currentLang === "en" ? "Write a Review" : "Jetzt Bewertung schreiben"}
            </Button>
          </div>
        )}
      </Container>

      {/* Review Creation Modal */}
      <CreateReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchReviews}
      />

      {/* Full Photo Preview Modal */}
      {selectedPhoto && (
        <div
          role="presentation"
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-lg)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            <img
              src={selectedPhoto}
              alt="Enlarged review photo"
              style={{
                maxWidth: "100%",
                maxHeight: "85vh",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(212, 175, 55, 0.5)",
                display: "block",
              }}
            />
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              style={{
                position: "absolute",
                top: "-16px",
                right: "-16px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#D4AF37",
                color: "#000000",
                border: "none",
                fontWeight: 700,
                fontSize: "16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </Section>
  );
}

export default ReviewsSection;
