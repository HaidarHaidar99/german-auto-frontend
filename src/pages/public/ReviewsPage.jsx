import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSettings, DEFAULT_BRAND_NAME } from "../../contexts/SettingsContext";
import ReviewsSection from "../../components/home/ReviewsSection";

/**
 * German Auto — Standalone Reviews Page
 * Route: /reviews
 * Displays client experiences & reviews with full functionality,
 * reusable component architecture, and responsive layout.
 */
export function ReviewsPage() {
  const { i18n } = useTranslation(["common", "navigation"]);
  const { settings } = useSettings();
  const currentLang = i18n.language?.startsWith("en") ? "en" : "de";
  const siteName = settings?.site?.name || DEFAULT_BRAND_NAME;

  useEffect(() => {
    const pageTitle = currentLang === "en"
      ? `Client Feedback & Reviews | ${siteName}`
      : `Kundenstimmen & Rezensionen | ${siteName}`;
    document.title = pageTitle;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentLang, siteName]);

  return (
    <div className="reviews-page" style={{ padding: "var(--space-2xl) 0" }}>
      <ReviewsSection googleReviewsConfig={settings?.google_reviews} />
    </div>
  );
}

export default ReviewsPage;
