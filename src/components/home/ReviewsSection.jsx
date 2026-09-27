import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Container, Section, Grid } from "../ui/Layout";
import { Eyebrow, Heading, Text } from "../ui/Typography";
import Button from "../ui/Button";
import reviewsService from "../../services/reviews/reviews.service";

/**
 * German Auto — Reviews Section
 * Shows real approved customer reviews or official Google Reviews link.
 * Never invents fake reviews or manufactured testimonials.
 */

export function ReviewsSection({ googleReviewsConfig }) {
  const { t, i18n } = useTranslation(["common"]);
  const currentLang = i18n.language?.startsWith("en") ? "en" : "de";

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const isGoogleReviewsEnabled = Boolean(googleReviewsConfig?.enabled && googleReviewsConfig?.profile_url);

  useEffect(() => {
    let isMounted = true;
    reviewsService
      .getReviews({ limit: 3 })
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

  // If no approved reviews in database and no Google Reviews profile URL: hide completely
  if (!loading && reviews.length === 0 && !isGoogleReviewsEnabled) {
    return null;
  }

  const googleLabel = currentLang === "en"
    ? (googleReviewsConfig?.display_label_en || "View on Google")
    : (googleReviewsConfig?.display_label_de || "Auf Google ansehen");

  return (
    <Section spacing="default" style={{ backgroundColor: "var(--color-surface)" }}>
      <Container size="default">
        <div
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
            <Eyebrow>{t("reviews", "Kundenstimmen")}</Eyebrow>
            <Heading level={2} style={{ margin: 0 }}>
              Erfahrungen & Rezensionen
            </Heading>
          </div>

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

        {reviews.length > 0 && (
          <Grid cols="responsive" gap="lg">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="surface-card"
                style={{
                  padding: "var(--space-xl)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-md)",
                }}
              >
                {/* Rating Stars */}
                <div style={{ display: "flex", gap: "2px", color: "var(--color-secondary)" }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ opacity: i < (rev.rating || 5) ? 1 : 0.25 }}>
                      ★
                    </span>
                  ))}
                </div>

                {/* Review Text */}
                <Text variant="body" style={{ margin: 0, fontStyle: "italic", flex: 1 }}>
                  "{rev.text}"
                </Text>

                {/* Reviewer Name */}
                <div style={{ marginTop: "auto", borderTop: "1px solid var(--color-border-subtle)", paddingTop: "var(--space-sm)" }}>
                  <span style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: "var(--color-text)" }}>
                    {rev.name}
                  </span>
                </div>
              </div>
            ))}
          </Grid>
        )}
      </Container>
    </Section>
  );
}

export default ReviewsSection;
