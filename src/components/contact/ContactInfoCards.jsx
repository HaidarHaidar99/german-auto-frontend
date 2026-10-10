import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "../common/Icon";
import Badge from "../ui/Badge";
import { useTheme } from "../../contexts/ThemeContext";

const DAYS_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

// Day index matching JavaScript Date.getDay() (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
const DAY_INDEX_MAP = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/**
 * German Auto — ContactInfoCards Component
 * Displays real direct contact options (phone, email, WhatsApp), opening hours with
 * active-day detection, and enabled social channels directly from CMS settings.
 */
export function ContactInfoCards({ contact = {}, hours = {}, social = {}, className = "", style = {} }) {
  const { t } = useTranslation(["forms", "common"]);
  const { isDark } = useTheme?.() || { isDark: true };

  const phone = contact?.phone ? String(contact.phone).trim() : null;
  const email = contact?.email ? String(contact.email).trim() : "konigautomobilerheinberg@gmail.com";
  const whatsapp = contact?.whatsapp ? String(contact.whatsapp).trim() : null;
  const contactUrl = contact?.contact_url ? String(contact.contact_url).trim() : null;

  const hasAnyContact = Boolean(phone || email || whatsapp || contactUrl);

  // Check if any hours are configured
  const hasHoursConfigured =
    hours && typeof hours === "object" && Object.values(hours).some((h) => h && (h.enabled || h.open));

  const currentDayIndex = new Date().getDay();

  // Filter enabled social media channels
  const socialList = Object.entries(social || {})
    .filter(([, conf]) => conf && conf.enabled && conf.url && String(conf.url).trim().length > 0)
    .map(([key, conf]) => ({
      platform: key,
      url: conf.url,
      label: key.charAt(0).toUpperCase() + key.slice(1),
    }));

  const hasSocial = socialList.length > 0;

  if (!hasAnyContact && !hasHoursConfigured && !hasSocial) {
    return null;
  }

  // WhatsApp clean URL builder
  const whatsappClean = whatsapp ? whatsapp.replace(/[^0-9]/g, "") : "";
  const whatsappLink = whatsappClean ? `https://wa.me/${whatsappClean}` : null;

  return (
    <div
      className={`contact-info-cards ${className}`.trim()}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "clamp(1.25rem, 3vw, 2rem)",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {/* ─── 1. DIRECT CONTACT CHANNELS ────────────────────────────── */}
      {hasAnyContact && (
        <div
          className="contact-card surface-card"
          style={{
            backgroundColor: "var(--color-card)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            padding: "clamp(16px, 4vw, 28px)",
            boxShadow: "var(--shadow-elevation-1)",
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <h3
            style={{
              fontSize: "clamp(1rem, 2vw, 1.15rem)",
              fontWeight: "var(--font-weight-semibold)",
              letterSpacing: "var(--tracking-tight)",
              margin: "0 0 var(--space-md) 0",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-xs)",
              color: "var(--color-text)",
            }}
          >
            <Icon name="phone" size={18} color="var(--color-secondary)" />
            <span>{t("contactDirectHeading")}</span>
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", boxSizing: "border-box" }}>
            {phone && (
              <a
                href={`tel:${phone}`}
                className="contact-direct-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border-subtle)",
                  color: "var(--color-text)",
                  textDecoration: "none",
                  fontSize: "var(--font-size-sm)",
                  transition: "all var(--duration-fast) var(--ease-smooth)",
                  width: "100%",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    minWidth: "40px",
                    borderRadius: "50%",
                    backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(212, 175, 55, 0.12)",
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(212, 175, 55, 0.32)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isDark ? "var(--color-secondary)" : "#B8860B",
                    flexShrink: 0,
                    boxShadow: "none",
                  }}
                >
                  <Icon name="phone" size={18} />
                </div>
                <div style={{ minWidth: 0, overflow: "hidden", flex: 1 }}>
                  <div style={{ fontSize: "11px", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                    {t("phoneLabel", { defaultValue: "Telefon" })}
                  </div>
                  <div style={{ fontWeight: "var(--font-weight-medium)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {phone}
                  </div>
                </div>
              </a>
            )}

            {whatsapp && whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-direct-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border-subtle)",
                  color: "var(--color-text)",
                  textDecoration: "none",
                  fontSize: "var(--font-size-sm)",
                  transition: "all var(--duration-fast) var(--ease-smooth)",
                  width: "100%",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    minWidth: "40px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(37, 211, 102, 0.12)",
                    border: "1px solid rgba(37, 211, 102, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#25D366",
                    flexShrink: 0,
                  }}
                >
                  <Icon name="whatsapp" size={18} />
                </div>
                <div style={{ minWidth: 0, overflow: "hidden", flex: 1 }}>
                  <div style={{ fontSize: "11px", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                    WhatsApp
                  </div>
                  <div style={{ fontWeight: "var(--font-weight-medium)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {whatsapp}
                  </div>
                </div>
              </a>
            )}

            {email && (
              <a
                href={`mailto:${email}`}
                className="contact-direct-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border-subtle)",
                  color: "var(--color-text)",
                  textDecoration: "none",
                  fontSize: "var(--font-size-sm)",
                  transition: "all var(--duration-fast) var(--ease-smooth)",
                  width: "100%",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    minWidth: "40px",
                    borderRadius: "50%",
                    backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(212, 175, 55, 0.12)",
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(212, 175, 55, 0.32)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isDark ? "var(--color-secondary)" : "#B8860B",
                    flexShrink: 0,
                    boxShadow: "none",
                  }}
                >
                  <Icon name="mail" size={18} />
                </div>
                <div style={{ minWidth: 0, overflow: "hidden", flex: 1 }}>
                  <div style={{ fontSize: "11px", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                    {t("emailLabel", { defaultValue: "E-Mail" })}
                  </div>
                  <div
                    style={{
                      fontWeight: "var(--font-weight-medium)",
                      fontSize: "clamp(11px, 3.1vw, 13.5px)",
                      letterSpacing: "-0.015em",
                      whiteSpace: "nowrap",
                      overflow: "visible",
                    }}
                  >
                    {email}
                  </div>
                </div>
              </a>
            )}

            {contactUrl && (
              <a
                href={contactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-direct-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border-subtle)",
                  color: "var(--color-text)",
                  textDecoration: "none",
                  fontSize: "var(--font-size-sm)",
                  transition: "all var(--duration-fast) var(--ease-smooth)",
                  width: "100%",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    minWidth: "40px",
                    borderRadius: "50%",
                    backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(212, 175, 55, 0.12)",
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(212, 175, 55, 0.32)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isDark ? "var(--color-secondary)" : "#B8860B",
                    flexShrink: 0,
                    boxShadow: "none",
                  }}
                >
                  <Icon name="external-link" size={18} />
                </div>
                <div style={{ minWidth: 0, overflow: "hidden", flex: 1 }}>
                  <div style={{ fontSize: "11px", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                    Website / Portal
                  </div>
                  <div style={{ fontWeight: "var(--font-weight-medium)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {contactUrl}
                  </div>
                </div>
              </a>
            )}
          </div>
        </div>
      )}

      {/* ─── 2. OPENING HOURS ───────────────────────────────────────── */}
      {hasHoursConfigured && (
        <div
          className="contact-card surface-card"
          style={{
            backgroundColor: "var(--color-card)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            padding: "clamp(16px, 4vw, 28px)",
            boxShadow: "var(--shadow-elevation-1)",
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <h3
            style={{
              fontSize: "clamp(1rem, 2vw, 1.15rem)",
              fontWeight: "var(--font-weight-semibold)",
              letterSpacing: "var(--tracking-tight)",
              margin: "0 0 var(--space-md) 0",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-xs)",
              color: "var(--color-text)",
            }}
          >
            <Icon name="clock" size={18} color="var(--color-secondary)" />
            <span>{t("contactHoursHeading")}</span>
          </h3>

          <div style={{ display: "flex", flexDirection: "column", width: "100%", boxSizing: "border-box" }}>
            {DAYS_ORDER.map((dayKey) => {
              const dayConfig = hours[dayKey];
              const isToday = DAY_INDEX_MAP[dayKey] === currentDayIndex;
              const isEnabled = dayConfig && dayConfig.enabled;
              const hasTimes = isEnabled && dayConfig.open && dayConfig.close;

              return (
                <div
                  key={dayKey}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "var(--space-2xs)",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--color-border-subtle)",
                    fontSize: "var(--font-size-sm)",
                    color: isToday ? "var(--color-text)" : "var(--color-text-secondary)",
                    fontWeight: isToday ? "var(--font-weight-semibold)" : "normal",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", minWidth: 0, flexShrink: 0 }}>
                    <span>{t(`day_${dayKey}`)}</span>
                    {isToday && (
                      <Badge variant="secondary" size="sm">
                        {t("todayBadge")}
                      </Badge>
                    )}
                  </div>
                  <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                    {hasTimes ? (
                      <span style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                        {dayConfig.open} – {dayConfig.close}
                      </span>
                    ) : (
                      <span style={{ color: "var(--color-text-subtle)", fontSize: "var(--font-size-xs)" }}>
                        {t("closed")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── 3. SOCIAL CHANNELS ─────────────────────────────────────── */}
      {hasSocial && (
        <div
          className="contact-card surface-card"
          style={{
            backgroundColor: "var(--color-card)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            padding: "clamp(16px, 4vw, 28px)",
            boxShadow: "var(--shadow-elevation-1)",
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <h3
            style={{
              fontSize: "clamp(1rem, 2vw, 1.15rem)",
              fontWeight: "var(--font-weight-semibold)",
              letterSpacing: "var(--tracking-tight)",
              margin: "0 0 var(--space-md) 0",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-xs)",
              color: "var(--color-text)",
            }}
          >
            <Icon name="share-2" size={18} color="var(--color-secondary)" />
            <span>{t("socialHeading")}</span>
          </h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center" }}>
            {socialList.map((item, idx) => (
              <a
                key={item.platform}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                title={item.label}
                className="animated-social-icon-btn"
                style={{
                  animationDelay: `${idx * 0.28}s`,
                }}
              >
                <Icon name={item.platform} size={20} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Local Hover styling */}
      <style>{`
        .contact-direct-link:hover {
          background-color: var(--color-surface-hover) !important;
          border-color: var(--color-secondary) !important;
          transform: translateY(-2px);
        }
        .animated-social-icon-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: var(--color-surface, #15181e);
          border: 1.5px solid rgba(212, 175, 55, 0.35);
          color: var(--color-text, #ffffff);
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          transition: all 0.2s ease;
          box-shadow: none !important;
          filter: none !important;
          animation: none !important;
          flex-shrink: 0;
        }
        .animated-social-icon-btn:hover {
          transform: translateY(-2px);
          border-color: #D4AF37 !important;
          color: #D4AF37 !important;
          background-color: rgba(212, 175, 55, 0.18) !important;
          box-shadow: none !important;
          filter: none !important;
        }
        .animated-social-icon-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}

export default ContactInfoCards;
