import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../contexts/SettingsContext";
import TopOfferBar from "../../components/home/TopOfferBar";
import HeroSection from "../../components/home/HeroSection";
import FeaturedInventorySection from "../../components/home/FeaturedInventorySection";
import AutomotiveShowcaseSection from "../../components/home/AutomotiveShowcaseSection";
import SellYourCarSection from "../../components/home/SellYourCarSection";
import ReviewsSection from "../../components/home/ReviewsSection";
import LocationsSection from "../../components/home/LocationsSection";
import ContactCtaSection from "../../components/home/ContactCtaSection";
import { Container, Section } from "../../components/ui/Layout";
import { Eyebrow, Heading, Text } from "../../components/ui/Typography";
import LoadingState from "../../components/ui/LoadingState";
import carsService from "../../services/cars/cars.service";

/**
 * German Auto — Production Homepage
 * CMS-driven automotive presentation respecting sections_order and sections_enabled.
 * No fake business content or synthetic car listings.
 */

export function HomePage() {
  const { t, i18n } = useTranslation(["common", "navigation"]);
  const { settings, loading } = useSettings();
  const currentLang = i18n.language?.startsWith("en") ? "en" : "de";

  const [topCar, setTopCar] = useState(null);

  // Fetch top featured car for the cinematic showcase section
  useEffect(() => {
    let isMounted = true;
    carsService
      .getCars({ is_featured: true, limit: 1 })
      .then((res) => {
        if (!isMounted) return;
        const car = res?.data?.cars?.[0];
        if (car) {
          setTopCar(car);
        } else {
          // If no featured car, try fetching any available car with an image
          carsService
            .getCars({ limit: 1 })
            .then((anyRes) => {
              if (isMounted) setTopCar(anyRes?.data?.cars?.[0] || null);
            })
            .catch(() => {});
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Set document title dynamically from CMS
  useEffect(() => {
    const siteTitle = settings?.site?.seo_title || settings?.site?.name;
    if (siteTitle) {
      document.title = siteTitle;
    }
  }, [settings]);

  const homepageConfig = settings?.homepage || {};
  const sectionsEnabled = homepageConfig.sections_enabled || {
    hero: true,
    featured_cars: true,
    offers: true,
    sell_car: true,
    testimonials: true,
    google_reviews: true,
    locations: true,
    contact: true,
  };

  const defaultOrder = [
    "hero",
    "featured_cars",
    "experience",
    "offers",
    "sell_car",
    "google_reviews",
    "testimonials",
    "locations",
    "about",
    "contact",
  ];

  const sectionsOrder = Array.isArray(homepageConfig.sections_order) && homepageConfig.sections_order.length > 0
    ? homepageConfig.sections_order
    : defaultOrder;

  // Render individual sections conditionally based on CMS configuration
  const renderSection = (sectionKey) => {
    switch (sectionKey) {
      case "hero":
        if (sectionsEnabled.hero === false) return null;
        return (
          <HeroSection
            key="hero"
            heroConfig={settings?.hero}
            siteConfig={settings?.site}
          />
        );

      case "featured_cars":
        if (sectionsEnabled.featured_cars === false) return null;
        return <FeaturedInventorySection key="featured_cars" />;

      case "experience":
        // Showcase section rendered only when a real vehicle exists
        if (!topCar) return null;
        return <AutomotiveShowcaseSection key="experience" car={topCar} />;

      case "sell_car":
        if (sectionsEnabled.sell_car === false) return null;
        return (
          <SellYourCarSection
            key="sell_car"
            sellCarConfig={settings?.sell_car}
          />
        );

      case "google_reviews":
      case "testimonials":
        if (sectionsEnabled.google_reviews === false && sectionsEnabled.testimonials === false) return null;
        return (
          <ReviewsSection
            key={sectionKey}
            googleReviewsConfig={settings?.google_reviews}
          />
        );

      case "locations":
        if (sectionsEnabled.locations === false) return null;
        return (
          <LocationsSection
            key="locations"
            locations={settings?.locations}
          />
        );

      case "about":
        // Editorial story block if description is provided in CMS
        if (!settings?.site?.description) return null;
        return (
          <Section key="about" spacing="default" style={{ backgroundColor: "var(--color-surface)" }}>
            <Container size="default">
              <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
                <Eyebrow>{settings?.site?.name || t("common:appName")}</Eyebrow>
                <Heading level={2} style={{ margin: "var(--space-xs) 0 var(--space-md)" }}>
                  {settings?.site?.seo_title || t("common:experienceTitle")}
                </Heading>
                <Text variant="lead" style={{ margin: 0 }}>
                  {currentLang === "en" ? (settings?.site?.description_en || settings?.site?.description) : settings?.site?.description}
                </Text>
              </div>
            </Container>
          </Section>
        );

      case "contact":
        if (sectionsEnabled.contact === false) return null;
        return (
          <ContactCtaSection
            key="contact"
            contactConfig={settings?.contact}
            hoursConfig={settings?.hours}
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <LoadingState minHeight="100vh" />;
  }

  return (
    <div className="homepage-root" style={{ width: "100%", overflowX: "hidden", backgroundColor: "var(--color-background)" }}>
      {/* Top Animated Offer Bar (Controlled by settings.offers) */}
      <TopOfferBar offersConfig={settings?.offers} />

      {/* Dynamic Homepage Sections */}
      {sectionsOrder.map((sectionKey) => renderSection(sectionKey))}
    </div>
  );
}

export default HomePage;
