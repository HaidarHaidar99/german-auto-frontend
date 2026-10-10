import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../contexts/SettingsContext";
import { useTheme } from "../../contexts/ThemeContext";
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

function formatOpeningHoursLines(hours, lang = "de") {
  if (!hours || typeof hours !== "object") return [];
  const days = [
    { key: "monday", de: "Mo", en: "Mon" },
    { key: "tuesday", de: "Di", en: "Tue" },
    { key: "wednesday", de: "Mi", en: "Wed" },
    { key: "thursday", de: "Do", en: "Thu" },
    { key: "friday", de: "Fr", en: "Fri" },
    { key: "saturday", de: "Sa", en: "Sat" },
    { key: "sunday", de: "So", en: "Sun" },
  ];

  const activeDays = days.filter(
    (d) => hours[d.key]?.enabled && hours[d.key]?.open && hours[d.key]?.close
  );
  if (activeDays.length === 0) return [];

  const groups = [];
  let currentGroup = null;

  for (let i = 0; i < days.length; i++) {
    const d = days[i];
    const h = hours[d.key];
    if (h?.enabled && h?.open && h?.close) {
      const timeStr = `${h.open} – ${h.close}`;
      if (currentGroup && currentGroup.timeStr === timeStr && currentGroup.lastIndex === i - 1) {
        currentGroup.days.push(d);
        currentGroup.lastIndex = i;
      } else {
        currentGroup = { timeStr, days: [d], lastIndex: i };
        groups.push(currentGroup);
      }
    }
  }

  const suffix = lang === "de" ? " Uhr" : "";
  return groups.map((g) => {
    const startDay = lang === "de" ? g.days[0].de : g.days[0].en;
    const endDay = lang === "de" ? g.days[g.days.length - 1].de : g.days[g.days.length - 1].en;
    const daySpan =
      g.days.length > 2
        ? `${startDay}–${endDay}`
        : g.days.map((d) => (lang === "de" ? d.de : d.en)).join(", ");
    return `${daySpan}: ${g.timeStr}${suffix}`;
  });
}

export function ContactCtaSection({ contactConfig: propContactConfig, hoursConfig: propHoursConfig }) {
  const { t, i18n } = useTranslation(["common", "navigation"]);
  const { settings } = useSettings();
  const { isDark } = useTheme?.() || { isDark: true };

  const contactConfig = propContactConfig || settings?.contact || {};
  const hoursConfig = propHoursConfig || settings?.hours || {};
  const socialConfig = settings?.social || {};

  const hasPhone = Boolean(contactConfig?.phone);
  const hasEmail = Boolean(contactConfig?.email);
  const hasWhatsapp = Boolean(contactConfig?.whatsapp);
  const formattedHourLines = formatOpeningHoursLines(hoursConfig, i18n?.language || "de");
  const hasHours = formattedHourLines.length > 0;

  const hasAnyContact = hasPhone || hasEmail || hasWhatsapp || hasHours;

  // Active Social Media accounts configured in CMS
  const activeSocialList = Object.entries(socialConfig)
    .filter(([, conf]) => conf && conf.enabled && conf.url && String(conf.url).trim().length > 0)
    .map(([key, conf]) => {
      const details = PLATFORM_DETAILS[key.toLowerCase()] || {
        label: key.charAt(0).toUpperCase() + key.slice(1),
        icon: key.toLowerCase(),
      };
      return {
        key,
        url: conf.url.trim(),
        label: details.label,
        icon: details.icon,
      };
    });

  const cleanPhone = (contactConfig.phone || "").replace(/[^0-9+]/g, "");
  const cleanWhatsapp = (contactConfig.whatsapp || "").replace(/\D/g, "");

  return (
    <Section spacing="spacious" style={{ position: "relative" }}>
      <Container size="default">
        <div
          data-aos="fade-up"
          data-aos-duration="850"
          className="surface-card contact-cta-card-interactive"
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "clamp(var(--space-lg), 4vw, var(--space-2xl))",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-lg)",
            background: "linear-gradient(135deg, var(--color-card) 0%, var(--color-surface) 100%)",
            transition: "border-color 0.3s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "var(--space-md)",
              position: "relative",
              zIndex: 1,
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

          {/* Real Contact Channels in 4 Horizontal Columns on Desktop: Phone, WhatsApp, Email, Hours */}
          {hasAnyContact && (
            <div data-aos="fade-up" data-aos-delay="200" style={{ width: "100%" }}>
              <div className="contact-cta-channels-grid">
                {/* 1. Phone */}
                {hasPhone && (
                  <a
                    href={`tel:${cleanPhone}`}
                    className="contact-channel-row"
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      className="contact-channel-icon-circle"
                      style={{
                        backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(212, 175, 55, 0.12)",
                        border: isDark ? "1px solid rgba(255, 255, 255, 0.14)" : "1px solid rgba(212, 175, 55, 0.32)",
                        color: isDark ? "#D4AF37" : "#B8860B",
                      }}
                    >
                      <Icon name="phone" size={17} />
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

                {/* 2. WhatsApp */}
                {hasWhatsapp && (
                  <a
                    href={`https://wa.me/${cleanWhatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-channel-row"
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      className="contact-channel-icon-circle"
                      style={{
                        backgroundColor: "rgba(37, 211, 102, 0.12)",
                        border: "1px solid rgba(37, 211, 102, 0.28)",
                        color: "#25D366",
                      }}
                    >
                      <Icon name="whatsapp" size={17} />
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

                {/* 3. Email (Full address displayed without ellipsis) */}
                {hasEmail && (
                  <a
                    href={`mailto:${contactConfig.email}`}
                    className="contact-channel-row"
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      className="contact-channel-icon-circle"
                      style={{
                        backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(212, 175, 55, 0.12)",
                        border: isDark ? "1px solid rgba(255, 255, 255, 0.14)" : "1px solid rgba(212, 175, 55, 0.32)",
                        color: isDark ? "#D4AF37" : "#B8860B",
                      }}
                    >
                      <Icon name="mail" size={17} />
                    </div>
                    <div className="contact-channel-info">
                      <span className="contact-channel-label">
                        {t("email", { defaultValue: "E-Mail" })}
                      </span>
                      <div className="contact-channel-value contact-channel-email">
                        {contactConfig.email}
                      </div>
                    </div>
                  </a>
                )}

                {/* 4. Opening Hours (Multi-line: Mo–Fr on line 1, Sa on line 2) */}
                {hasHours && (
                  <div className="contact-channel-row" style={{ alignItems: "flex-start" }}>
                    <div
                      className="contact-channel-icon-circle"
                      style={{
                        backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(212, 175, 55, 0.12)",
                        border: isDark ? "1px solid rgba(255, 255, 255, 0.14)" : "1px solid rgba(212, 175, 55, 0.32)",
                        color: isDark ? "#D4AF37" : "#B8860B",
                        marginTop: "2px",
                      }}
                    >
                      <Icon name="clock" size={17} />
                    </div>
                    <div className="contact-channel-info" style={{ minWidth: 0 }}>
                      <span className="contact-channel-label">
                        {t("openingHours", { defaultValue: "Öffnungszeiten" })}
                      </span>
                      <div className="contact-channel-value" style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "12px", lineHeight: 1.35 }}>
                        {formattedHourLines.map((line, idx) => (
                          <div key={idx} style={{ whiteSpace: "nowrap" }}>
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Homepage Social Media Card: Compact Centered Group, Gold Icons, No Glow */}
              {activeSocialList.length > 0 && (
                <div
                  data-aos="fade-up"
                  data-aos-delay="250"
                  className="contact-social-card"
                >
                  <div className="contact-social-header">
                    <span className="contact-social-title">
                      {t("socialHeading", { defaultValue: "Offizielle Kanäle & Soziale Netzwerke" })}
                    </span>
                  </div>

                  <div className="contact-social-icons-compact">
                    {activeSocialList.map((item) => (
                      <a
                        key={item.key}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                        title={item.label}
                        className="homepage-social-icon-btn"
                      >
                        <Icon name={item.icon} size={18} />
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
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.35fr) minmax(0, 1.15fr);
          gap: 12px;
          width: 100%;
          box-sizing: border-box;
        }

        .contact-channel-row {
          padding: 12px 14px;
          background-color: var(--color-surface);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08));
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          box-sizing: border-box;
          transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
          overflow: hidden;
        }

        .contact-channel-row:hover {
          border-color: #D4AF37;
          background-color: var(--color-surface-hover, rgba(255, 255, 255, 0.04));
          transform: translateY(-2px);
        }

        .contact-channel-icon-circle {
          width: 38px;
          height: 38px;
          min-width: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: none !important;
          filter: none !important;
        }

        .contact-channel-info {
          min-width: 0;
          flex: 1;
          overflow: hidden;
        }

        .contact-channel-label {
          display: block;
          font-size: 10px;
          text-transform: uppercase;
          color: var(--color-text-subtle, #94a3b8);
          letter-spacing: 0.08em;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .contact-channel-value {
          font-weight: 600;
          font-size: 13px;
          color: var(--color-text, #ffffff);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .contact-channel-email {
          font-size: clamp(10px, 0.8vw, 12px);
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          letter-spacing: -0.02em;
          max-width: 100%;
          display: block;
        }

        .contact-social-card {
          margin-top: 16px;
          padding: 16px 20px;
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(212, 175, 55, 0.25);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
          width: 100%;
          box-sizing: border-box;
          box-shadow: none !important;
          filter: none !important;
        }

        .contact-social-header {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .contact-social-title {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #D4AF37;
        }

        .contact-social-icons-compact {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          margin: 0 auto;
        }

        .homepage-social-icon-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background-color: rgba(212, 175, 55, 0.08);
          border: 1px solid #D4AF37;
          color: #D4AF37;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          box-shadow: none !important;
          filter: none !important;
          flex-shrink: 0;
          transition: background-color 0.2s ease, transform 0.2s ease;
        }

        .homepage-social-icon-btn:hover {
          background-color: rgba(212, 175, 55, 0.22);
          transform: translateY(-2px);
          color: #D4AF37;
          box-shadow: none !important;
          filter: none !important;
        }

        @media (max-width: 1080px) {
          .contact-cta-channels-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 640px) {
          .contact-cta-channels-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .contact-channel-row {
            padding: 10px 12px !important;
          }
        }
      `}</style>
    </Section>
  );
}

export default ContactCtaSection;

