import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../contexts/SettingsContext";
import ContactHero from "../../components/contact/ContactHero";
import ContactInfoCards from "../../components/contact/ContactInfoCards";
import ContactLocationsSection from "../../components/contact/ContactLocationsSection";
import ContactFormSection from "../../components/contact/ContactFormSection";
import { useGsapContext } from "../../hooks/useAnimation";
import { gsap, isReducedMotion } from "../../utils/animation";

/**
 * German Auto — Production Contact Page
 * Route: /contact
 * Loaded entirely from real CMS settings and backend contact form endpoint.
 */
export function ContactPage() {
  const { t, i18n } = useTranslation(["forms", "common"]);
  const { settings } = useSettings();
  const pageContainerRef = useRef(null);

  const contactConfig = settings?.contact || {};
  const hoursConfig = settings?.hours || {};
  const socialConfig = settings?.social || {};
  const locationsConfig = settings?.locations || [];
  const contactFormConfig = settings?.contact_form || {};

  const currentLang = i18n.language || "de";
  const customTitle = contactFormConfig[`title_${currentLang}`] || t("contactHeroTitle");
  const customSubtitle = contactFormConfig[`description_${currentLang}`] || t("contactHeroSubtitle");

  // Dynamic SEO metadata
  useEffect(() => {
    const siteName = settings?.site?.name || "German Auto";
    document.title = `${customTitle} | ${siteName}`;

    let metaTag = document.querySelector('meta[name="description"]');
    if (!metaTag) {
      metaTag = document.createElement("meta");
      metaTag.name = "description";
      document.head.appendChild(metaTag);
    }
    metaTag.content = customSubtitle;
  }, [customTitle, customSubtitle, settings]);

  // Entrance animations using GSAP Context
  useGsapContext(pageContainerRef, () => {
    if (isReducedMotion()) return;

    gsap.from(".contact-hero", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power2.out",
    });

    gsap.from(".contact-main-grid", {
      opacity: 0,
      y: 25,
      duration: 0.65,
      ease: "power2.out",
      delay: 0.1,
    });
  });

  return (
    <main
      ref={pageContainerRef}
      className="contact-page"
      style={{
        maxWidth: "1320px",
        margin: "0 auto",
        padding: "var(--space-xl) var(--space-md) var(--space-4xl)",
      }}
    >
      {/* ─── Hero Section ────────────────────────────────────────────── */}
      <ContactHero title={customTitle} subtitle={customSubtitle} />

      {/* ─── Two-Column Editorial Layout ─────────────────────────────── */}
      <div
        className="contact-main-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "var(--space-2xl)",
          alignItems: "start",
        }}
      >
        {/* Left Column: Contact Form */}
        <div style={{ minWidth: 0 }}>
          <ContactFormSection contactFormConfig={contactFormConfig} />
        </div>

        {/* Right Column: Direct Channels, Opening Hours, and Social Media */}
        <div>
          <ContactInfoCards
            contact={contactConfig}
            hours={hoursConfig}
            social={socialConfig}
          />
        </div>
      </div>

      {/* ─── Configured Locations Section ────────────────────────────── */}
      <ContactLocationsSection locations={locationsConfig} />

      {/* Responsive layout styles via embedded CSS */}
      <style>{`
        @media (min-width: 1024px) {
          .contact-main-grid {
            grid-template-columns: minmax(0, 1.25fr) minmax(360px, 0.85fr) !important;
          }
        }
        @media (min-width: 1280px) {
          .contact-main-grid {
            grid-template-columns: minmax(0, 1.35fr) 420px !important;
            gap: var(--space-3xl) !important;
          }
        }
      `}</style>
    </main>
  );
}

export default ContactPage;
