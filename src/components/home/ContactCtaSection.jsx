import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../contexts/SettingsContext";
import { Container, Section } from "../ui/Layout";
import { Eyebrow, Heading } from "../ui/Typography";
import Button from "../ui/Button";
import Icon from "../common/Icon";

/**
 * German Auto — Contact Information & CTA Section
 * Connects to settings.contact, settings.hours, and settings.social from CMS.
 */

const PLATFORM_DETAILS = {
  whatsapp: { label: "WhatsApp", icon: "whatsapp", brandColor: "#25D366" },
  instagram: { label: "Instagram", icon: "instagram", brandColor: "#E1306C" },
  facebook: { label: "Facebook", icon: "facebook", brandColor: "#1877F2" },
  tiktok: { label: "TikTok", icon: "tiktok", brandColor: "#EE1D52" },
  x: { label: "X (Twitter)", icon: "x", brandColor: "#FFFFFF" },
  twitter: { label: "Twitter", icon: "twitter", brandColor: "#1DA1F2" },
  linkedin: { label: "LinkedIn", icon: "linkedin", brandColor: "#0A66C2" },
  youtube: { label: "YouTube", icon: "youtube", brandColor: "#FF0000" },
};

export function ContactCtaSection({ contactConfig: propContactConfig, hoursConfig: propHoursConfig }) {
  const { t } = useTranslation(["common", "navigation"]);
  const { settings } = useSettings();

  const contactConfig = propContactConfig || settings?.contact || {};
  const hoursConfig = propHoursConfig || settings?.hours || {};
  const socialConfig = settings?.social || {};

  const hasPhone = Boolean(contactConfig?.phone);
  const hasEmail = Boolean(contactConfig?.email);
  const hasWhatsapp = Boolean(contactConfig?.whatsapp);

  const hasAnyContact = hasPhone || hasEmail || hasWhatsapp;

  // Active Social Media accounts that the admin configured in CMS
  const activeSocialList = Object.entries(socialConfig)
    .filter(([, conf]) => conf && conf.enabled && conf.url && String(conf.url).trim().length > 0)
    .map(([key, conf]) => {
      const details = PLATFORM_DETAILS[key.toLowerCase()] || {
        label: key.charAt(0).toUpperCase() + key.slice(1),
        icon: key.toLowerCase(),
        brandColor: "#D4AF37",
      };
      return {
        key,
        url: conf.url.trim(),
        label: details.label,
        icon: details.icon,
        brandColor: details.brandColor,
      };
    });

  return (
    <Section spacing="spacious" style={{ position: "relative" }}>
      <Container size="default">
        <div
          data-aos="zoom-in"
          data-aos-duration="800"
          className="surface-card"
          style={{
            padding: "clamp(var(--space-xl), 5vw, var(--space-3xl))",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-xl)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "var(--space-md)",
            }}
          >
            <div data-aos="fade-up">
              <Eyebrow>{t("navigation:contact", "Kontakt & Anfahrt")}</Eyebrow>
              <Heading level={2} style={{ margin: "var(--space-xs) 0 0" }}>
                {t("contactUs", "Wir freuen uns auf Ihre Anfrage")}
              </Heading>
            </div>

            <div data-aos="fade-up" data-aos-delay="100">
              <Button
                as={Link}
                to="/contact"
                variant="primary"
                size="lg"
                iconRight="arrow-right"
              >
                {t("contactUs", "Kontakt aufnehmen")}
              </Button>
            </div>
          </div>

          {/* Real Contact Channels */}
          {hasAnyContact && (
            <div data-aos="fade-up" data-aos-delay="200" style={{ width: "100%" }}>
              <div className="contact-cta-channels-grid">
                {hasPhone && (
                  <a
                    href={`tel:${contactConfig.phone}`}
                    className="contact-channel-row"
                    style={{ textDecoration: "none" }}
                  >
                    <div className="contact-channel-icon-circle">
                      <Icon name="phone" size={18} />
                    </div>
                    <div className="contact-channel-info">
                      <span className="contact-channel-label">
                        {t("phone", { defaultValue: "Telefon" })}
                      </span>
                      <div className="contact-channel-value">
                        {contactConfig.phone}
                      </div>
                    </div>
                  </a>
                )}

                {hasEmail && (
                  <a
                    href={`mailto:${contactConfig.email}`}
                    className="contact-channel-row"
                    style={{ textDecoration: "none" }}
                  >
                    <div className="contact-channel-icon-circle">
                      <Icon name="mail" size={18} />
                    </div>
                    <div className="contact-channel-info">
                      <span className="contact-channel-label">
                        {t("email", { defaultValue: "E-Mail" })}
                      </span>
                      <div className="contact-channel-value">
                        {contactConfig.email}
                      </div>
                    </div>
                  </a>
                )}

                {hasWhatsapp && (
                  <a
                    href={`https://wa.me/${contactConfig.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-channel-row"
                    style={{ textDecoration: "none" }}
                  >
                    <div className="contact-channel-icon-circle" style={{ color: "#25D366" }}>
                      <Icon name="whatsapp" size={18} />
                    </div>
                    <div className="contact-channel-info">
                      <span className="contact-channel-label">
                        WhatsApp
                      </span>
                      <div className="contact-channel-value">
                        {contactConfig.whatsapp}
                      </div>
                    </div>
                  </a>
                )}

                {hoursConfig?.monday?.open && (
                  <div className="contact-channel-row">
                    <div className="contact-channel-icon-circle">
                      <Icon name="clock" size={18} />
                    </div>
                    <div className="contact-channel-info">
                      <span className="contact-channel-label">
                        {t("openingHours", { defaultValue: "Öffnungszeiten" })}
                      </span>
                      <div className="contact-channel-value">
                        Mo–Fr: {hoursConfig.monday.open}–{hoursConfig.monday.close} Uhr
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Animated Social Media Card (Under contact items) */}
              {activeSocialList.length > 0 && (
                <div
                  data-aos="fade-up"
                  data-aos-delay="250"
                  className="contact-social-card"
                >
                  <div className="contact-social-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Icon name="share-2" size={16} color="var(--color-secondary, #D4AF37)" />
                      <span style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text)" }}>
                        {t("socialHeading", { defaultValue: "Soziale Netzwerke" })}
                      </span>
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--color-text-subtle)" }}>
                      {t("socialConnect", { defaultValue: "Offizielle Kanäle" })}
                    </span>
                  </div>

                  <div className="contact-social-icons-wrapper">
                    {activeSocialList.map((item, idx) => (
                      <a
                        key={item.key}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                        title={item.label}
                        className="animated-social-icon-btn"
                        style={{
                          animationDelay: `${idx * 0.28}s`,
                          "--brand-color": item.brandColor,
                        }}
                      >
                        <Icon name={item.icon} size={20} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>

      <style>{`
        .contact-cta-channels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
          gap: var(--space-md, 16px);
          width: 100%;
        }

        .contact-channel-row {
          padding: 14px 16px;
          background-color: var(--color-surface);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08));
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          box-sizing: border-box;
          transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
        }

        .contact-channel-row:hover {
          border-color: var(--color-secondary, #D4AF37);
          background-color: var(--color-surface-hover, rgba(255, 255, 255, 0.04));
          transform: translateY(-2px);
        }

        .contact-channel-icon-circle {
          width: 42px;
          height: 42px;
          min-width: 42px;
          border-radius: 50%;
          background-color: var(--color-card, #0f1115);
          border: 1px solid var(--color-border, rgba(255, 255, 255, 0.12));
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-secondary, #D4AF37);
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .contact-channel-info {
          min-width: 0;
          overflow: hidden;
          flex: 1;
        }

        .contact-channel-label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          color: var(--color-text-subtle, #94a3b8);
          letter-spacing: 0.08em;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .contact-channel-value {
          font-weight: 600;
          font-size: 14px;
          color: var(--color-text, #ffffff);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .contact-social-card {
          margin-top: var(--space-lg, 20px);
          padding: 18px 20px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(212, 175, 55, 0.05) 100%);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(212, 175, 55, 0.2);
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
          box-sizing: border-box;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        }

        .contact-social-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }

        .contact-social-icons-wrapper {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
        }

        .animated-social-icon-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: var(--color-card, #0f1115);
          border: 1.5px solid rgba(212, 175, 55, 0.35);
          color: var(--color-text, #ffffff);
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
          animation: socialPulseFloat 3.4s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes socialPulseFloat {
          0%, 100% {
            transform: translateY(0);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35), 0 0 0 rgba(212, 175, 55, 0);
            border-color: rgba(212, 175, 55, 0.35);
          }
          50% {
            transform: translateY(-4px);
            box-shadow: 0 8px 18px rgba(0, 0, 0, 0.5), 0 0 14px rgba(212, 175, 55, 0.35);
            border-color: rgba(212, 175, 55, 0.7);
          }
        }

        .animated-social-icon-btn:hover {
          transform: translateY(-6px) scale(1.14);
          border-color: #D4AF37 !important;
          color: #000000 !important;
          background: linear-gradient(135deg, #D4AF37, #F5D77F) !important;
          box-shadow: 0 10px 24px rgba(212, 175, 55, 0.55), 0 0 18px rgba(212, 175, 55, 0.45);
        }

        .animated-social-icon-btn:active {
          transform: translateY(-2px) scale(0.96);
        }

        @media (max-width: 768px) {
          .contact-cta-channels-grid {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            gap: 12px !important;
          }

          .contact-channel-row {
            width: 100% !important;
            padding: 12px 14px !important;
          }

          .contact-channel-icon-circle {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </Section>
  );
}

export default ContactCtaSection;

