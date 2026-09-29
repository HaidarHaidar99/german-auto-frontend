import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../contexts/SettingsContext";
import AboutHero from "../../components/about/AboutHero";
import AboutStory from "../../components/about/AboutStory";
import AboutVisualSection from "../../components/about/AboutVisualSection";
import AboutLocations from "../../components/about/AboutLocations";
import AboutContactCta from "../../components/about/AboutContactCta";
import { useGsapContext } from "../../hooks/useAnimation";
import { gsap, isReducedMotion } from "../../utils/animation";

/**
 * German Auto — Production About Page
 * Route: /about
 * Built strictly with verified CMS data (/api/settings) via SettingsContext.
 * Zero invented business claims, fake history, or placeholder images.
 */
export function AboutPage() {
  const { t, i18n } = useTranslation(["about", "common"]);
  const { settings } = useSettings();
  const pageContainerRef = useRef(null);

  const siteConfig = settings?.site || {};
  const footerConfig = settings?.footer || {};
  const contactConfig = settings?.contact || {};
  const hoursConfig = settings?.hours || {};
  const locationsConfig = settings?.locations || [];
  const heroConfig = settings?.hero || {};
  const sellCarConfig = settings?.sell_car || {};

  const currentLang = i18n.language || "de";

  // Real CMS description
  const storyDescription =
    currentLang === "de"
      ? footerConfig.description_de || siteConfig.description
      : footerConfig.description_en || siteConfig.description;

  // Real configured CMS media assets
  const heroItems = Array.isArray(heroConfig.items) ? heroConfig.items : [];
  const sellCarMedia = sellCarConfig.media_url ? [{ media_url: sellCarConfig.media_url }] : [];
  const allMedia = [...heroItems, ...sellCarMedia].filter(
    (item) => item && (item.media_url || item.url || (typeof item === "string" && item.trim().length > 0))
  );

  // If multiple CMS media items exist, use first for hero background and remaining for visual storytelling.
  // If only 1 exists, keep Hero typography-led and render visual section with that asset.
  const heroBgMedia =
    allMedia.length > 1
      ? allMedia[0]?.media_url || allMedia[0]?.url || (typeof allMedia[0] === "string" ? allMedia[0] : null)
      : null;

  const visualMediaItems = allMedia.length > 1 ? allMedia.slice(1) : allMedia;

  // Dynamic SEO metadata
  const siteName = siteConfig.name || "German Auto";
  const pageTitle = t("heroTitle");
  const metaDescription = storyDescription || t("heroSubtitle");

  useEffect(() => {
    document.title = `${pageTitle} | ${siteName}`;

    let metaTag = document.querySelector('meta[name="description"]');
    if (!metaTag) {
      metaTag = document.createElement("meta");
      metaTag.name = "description";
      document.head.appendChild(metaTag);
    }
    metaTag.content = metaDescription;
  }, [pageTitle, siteName, metaDescription]);

  // Entrance animations using GSAP Context
  useGsapContext(pageContainerRef, () => {
    if (isReducedMotion()) return;

    const animatedSections = [
      ".about-header-section",
      ".about-story-section",
      ".about-visual-section",
      ".about-locations-section",
      ".about-contact-cta",
    ];

    gsap.from(animatedSections, {
      opacity: 0,
      y: 25,
      duration: 0.65,
      stagger: 0.12,
      ease: "power2.out",
      delay: 0.1,
    });
  });

  return (
    <main
      ref={pageContainerRef}
      className="about-page"
      style={{
        maxWidth: "1320px",
        margin: "0 auto",
        padding: "var(--space-4xl) var(--space-md) var(--space-4xl)",
      }}
    >
      {/* 1. Typography Header (No Hero Media) */}
      <div className="about-header-section" style={{ textAlign: "center", marginBottom: "var(--space-4xl)" }}>
        <h1 style={{ 
          fontFamily: "var(--font-family-display)", 
          fontSize: "clamp(2.5rem, 5vw, 4.5rem)", 
          lineHeight: "1.1", 
          margin: "0 0 var(--space-md) 0",
          color: "var(--color-text)" 
        }}>
          {t("heroTitle")}
        </h1>
        <p style={{
          fontSize: "var(--font-size-xl)",
          color: "var(--color-text-muted)",
          maxWidth: "800px",
          margin: "0 auto",
          lineHeight: "1.6"
        }}>
          {t("heroSubtitle")}
        </p>
      </div>

      {/* 2. Story / Introduction (omits cleanly if no CMS description) */}
      <AboutStory
        description={storyDescription}
        siteName={siteConfig.name}
      />

      {/* 3. Visual Storytelling (omits cleanly if no CMS media) */}
      <AboutVisualSection mediaItems={visualMediaItems} />

      {/* 4. Values / Principles (omitted because no values/principles exist in CMS) */}

      {/* 5. Configured Dealership Locations (omits cleanly if no locations in CMS) */}
      <AboutLocations locations={locationsConfig} />

      {/* 6. Contact CTA (uses real contact channels & opening hours) */}
      <AboutContactCta
        contact={contactConfig}
        hours={hoursConfig}
      />
    </main>
  );
}

export default AboutPage;
