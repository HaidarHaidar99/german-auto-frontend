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
  const aboutConfig = settings?.about || {};
  const contactConfig = settings?.contact || {};
  const hoursConfig = settings?.hours || {};
  const locationsConfig = settings?.locations || [];
  const heroConfig = settings?.hero || {};
  const sellCarConfig = settings?.sell_car || {};

  const currentLang = i18n.language || "de";

  // Real CMS title, subtitle & story description
  const pageTitle =
    currentLang === "de"
      ? aboutConfig.title_de || t("heroTitle")
      : aboutConfig.title_en || t("heroTitle");

  const pageSubtitle =
    currentLang === "de"
      ? aboutConfig.subtitle_de || t("heroSubtitle")
      : aboutConfig.subtitle_en || t("heroSubtitle");

  const storyDescription =
    currentLang === "de"
      ? aboutConfig.story_de || footerConfig.description_de || siteConfig.description
      : aboutConfig.story_en || footerConfig.description_en || siteConfig.description;

  // Real configured CMS media assets
  const aboutMedia = aboutConfig.media_url ? [{ media_url: aboutConfig.media_url }] : [];
  const sellCarMedia = sellCarConfig.media_url ? [{ media_url: sellCarConfig.media_url }] : [];
  const allMedia = [...aboutMedia, ...sellCarMedia].filter(
    (item) => item && (item.media_url || item.url || (typeof item === "string" && item.trim().length > 0))
  );

  const visualMediaItems = allMedia;

  // Dynamic SEO metadata
  const siteName = siteConfig.name || "König Automobile Rheinberg";
  const metaDescription = storyDescription || pageSubtitle;

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
        width: "100%",
        maxWidth: "1320px",
        margin: "0 auto",
        padding: "0 clamp(16px, 4vw, 32px) clamp(2.5rem, 5vw, 4rem)",
        boxSizing: "border-box",
      }}
    >
      {/* 1. Main About Story Card (Starts at top of page with 0 space) */}
      <div data-aos="fade-up" style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box", marginTop: 0 }}>
        <AboutStory
          title={pageTitle}
          subtitle={pageSubtitle}
          description={storyDescription}
          siteName={siteConfig.name}
          style={{ marginTop: 0 }}
        />
      </div>

      {/* 2. Visual Storytelling (omits cleanly if no CMS media) */}
      <div data-aos="zoom-in" data-aos-delay="100" style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
        <AboutVisualSection mediaItems={visualMediaItems} />
      </div>

      {/* 3. Configured Dealership Locations (omits cleanly if no locations in CMS) */}
      <div data-aos="fade-up" data-aos-delay="150" style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
        <AboutLocations locations={locationsConfig} />
      </div>

      {/* 4. Contact CTA (uses real contact channels & opening hours) */}
      <div data-aos="fade-up" data-aos-delay="200" style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
        <AboutContactCta
          contact={contactConfig}
          hours={hoursConfig}
        />
      </div>

      <style>{`
        @media (max-width: 639px) {
          .about-page {
            padding-left: 16px !important;
            padding-right: 16px !important;
            padding-top: 0 !important;
          }
        }
      `}</style>
    </main>
  );
}

export default AboutPage;
