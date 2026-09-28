import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "../common/Icon";
import Badge from "../ui/Badge";

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

  const phone = contact?.phone ? String(contact.phone).trim() : null;
  const email = contact?.email ? String(contact.email).trim() : null;
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
        gap: "var(--space-xl)",
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
            padding: "var(--space-xl)",
            boxShadow: "var(--shadow-elevation-1)",
          }}
        >
          <h3
            style={{
              fontSize: "var(--font-size-base)",
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

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
            {phone && (
              <a
                href={`tel:${phone}`}
                className="contact-direct-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                  padding: "var(--space-sm) var(--space-md)",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border-subtle)",
                  color: "var(--color-text)",
                  textDecoration: "none",
                  fontSize: "var(--font-size-sm)",
                  transition: "all var(--duration-fast) var(--ease-smooth)",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(197, 160, 89, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-secondary)",
                    flexShrink: 0,
                  }}
                >
                  <Icon name="phone" size={16} />
                </div>
                <div style={{ minWidth: 0, overflow: "hidden" }}>
                  <div style={{ fontSize: "var(--font-size-2xs)", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "var(--tracking-wider)" }}>
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
                  gap: "var(--space-sm)",
                  padding: "var(--space-sm) var(--space-md)",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border-subtle)",
                  color: "var(--color-text)",
                  textDecoration: "none",
                  fontSize: "var(--font-size-sm)",
                  transition: "all var(--duration-fast) var(--ease-smooth)",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(37, 211, 102, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#25D366",
                    flexShrink: 0,
                  }}
                >
                  <Icon name="message-square" size={16} />
                </div>
                <div style={{ minWidth: 0, overflow: "hidden" }}>
                  <div style={{ fontSize: "var(--font-size-2xs)", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "var(--tracking-wider)" }}>
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
                  gap: "var(--space-sm)",
                  padding: "var(--space-sm) var(--space-md)",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border-subtle)",
                  color: "var(--color-text)",
                  textDecoration: "none",
                  fontSize: "var(--font-size-sm)",
                  transition: "all var(--duration-fast) var(--ease-smooth)",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(197, 160, 89, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-secondary)",
                    flexShrink: 0,
                  }}
                >
                  <Icon name="mail" size={16} />
                </div>
                <div style={{ minWidth: 0, overflow: "hidden" }}>
                  <div style={{ fontSize: "var(--font-size-2xs)", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "var(--tracking-wider)" }}>
                    {t("emailLabel", { defaultValue: "E-Mail" })}
                  </div>
                  <div style={{ fontWeight: "var(--font-weight-medium)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
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
                  gap: "var(--space-sm)",
                  padding: "var(--space-sm) var(--space-md)",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border-subtle)",
                  color: "var(--color-text)",
                  textDecoration: "none",
                  fontSize: "var(--font-size-sm)",
                  transition: "all var(--duration-fast) var(--ease-smooth)",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(197, 160, 89, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-secondary)",
                    flexShrink: 0,
                  }}
                >
                  <Icon name="external-link" size={16} />
                </div>
                <div style={{ minWidth: 0, overflow: "hidden" }}>
                  <div style={{ fontSize: "var(--font-size-2xs)", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "var(--tracking-wider)" }}>
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
            padding: "var(--space-xl)",
            boxShadow: "var(--shadow-elevation-1)",
          }}
        >
          <h3
            style={{
              fontSize: "var(--font-size-base)",
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

          <div style={{ display: "flex", flexDirection: "column" }}>
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
                    padding: "var(--space-xs) 0",
                    borderBottom: "1px solid var(--color-border-subtle)",
                    fontSize: "var(--font-size-sm)",
                    color: isToday ? "var(--color-text)" : "var(--color-text-secondary)",
                    fontWeight: isToday ? "var(--font-weight-semibold)" : "normal",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
                    <span>{t(`day_${dayKey}`)}</span>
                    {isToday && (
                      <Badge variant="secondary" size="sm">
                        {t("todayBadge")}
                      </Badge>
                    )}
                  </div>
                  <div>
                    {hasTimes ? (
                      <span style={{ fontVariantNumeric: "tabular-nums" }}>
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
            padding: "var(--space-xl)",
            boxShadow: "var(--shadow-elevation-1)",
          }}
        >
          <h3
            style={{
              fontSize: "var(--font-size-base)",
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

          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-xs)" }}>
            {socialList.map((item) => (
              <a
                key={item.platform}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-pill-link"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-2xs)",
                  padding: "var(--space-xs) var(--space-md)",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border-subtle)",
                  color: "var(--color-text)",
                  textDecoration: "none",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: "var(--font-weight-medium)",
                  transition: "all var(--duration-fast) var(--ease-smooth)",
                }}
              >
                <span>{item.label}</span>
                <Icon name="external-link" size={12} color="var(--color-secondary)" />
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
          transform: translateY(-1px);
        }
        .social-pill-link:hover {
          border-color: var(--color-secondary) !important;
          background-color: var(--color-accent-subtle) !important;
          color: var(--color-secondary) !important;
        }
      `}</style>
    </div>
  );
}

export default ContactInfoCards;
