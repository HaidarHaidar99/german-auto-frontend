import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "../common/Icon";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

/**
 * German Auto — AboutContactCta Component
 * Connects exclusively to real settings.contact and settings.hours from CMS.
 * Never invents missing contact values; hides individual missing channels cleanly.
 */
export function AboutContactCta({ contact = {}, hours = {}, className = "", style = {} }) {
  const { t } = useTranslation(["about", "common"]);

  const hasPhone = Boolean(contact?.phone);
  const contactEmail = contact?.email || "konigautomobilerheinberg@gmail.com";
  const hasEmail = true;
  const hasWhatsapp = Boolean(contact?.whatsapp);

  // Format hours dynamically if configured in CMS
  const formatHours = (h) => {
    if (!h) return null;
    const days = [
      { key: "monday", de: "Mo", en: "Mon" },
      { key: "tuesday", de: "Di", en: "Tue" },
      { key: "wednesday", de: "Mi", en: "Wed" },
      { key: "thursday", de: "Do", en: "Thu" },
      { key: "friday", de: "Fr", en: "Fri" },
      { key: "saturday", de: "Sa", en: "Sat" },
      { key: "sunday", de: "So", en: "Sun" },
    ];
    const groups = [];
    let cur = null;
    for (let i = 0; i < days.length; i++) {
      const d = days[i];
      const entry = h[d.key];
      if (entry?.enabled !== false && entry?.open && entry?.close && !entry?.closed) {
        const timeStr = `${entry.open}–${entry.close}`;
        if (cur && cur.timeStr === timeStr && cur.lastIndex === i - 1) {
          cur.days.push(d);
          cur.lastIndex = i;
        } else {
          cur = { timeStr, days: [d], lastIndex: i };
          groups.push(cur);
        }
      }
    }
    if (groups.length === 0) return null;
    const parts = groups.map((g) => {
      const start = g.days[0].de;
      const end = g.days[g.days.length - 1].de;
      const span = g.days.length > 2 ? `${start}–${end}` : g.days.map((d) => d.de).join(", ");
      return `${span}: ${g.timeStr}`;
    });
    return parts.join(" | ") + " Uhr";
  };
  const formattedHours = formatHours(hours);

  return (
    <section
      className={`about-contact-cta ${className}`.trim()}
      aria-labelledby="about-contact-heading"
      style={{
        marginBottom: "var(--space-4xl)",
        ...style,
      }}
    >
      <div
        className="surface-card"
        style={{
          backgroundColor: "var(--color-card)",
          borderRadius: "var(--radius-2xl)",
          border: "1px solid var(--color-border)",
          padding: "clamp(var(--space-xl), 5vw, var(--space-3xl))",
          boxShadow: "var(--shadow-elevation-2)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle background ambient glow */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "350px",
            height: "350px",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2xl)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Header & CTA Actions */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: "var(--space-xl)",
            }}
          >
            <div style={{ maxWidth: "620px" }}>
              <div style={{ display: "inline-block", marginBottom: "var(--space-sm)" }}>
                <Badge variant="outline" size="sm">
                  {t("contactCtaBadge")}
                </Badge>
              </div>
              <h2
                id="about-contact-heading"
                style={{
                  fontSize: "clamp(1.75rem, 3.2vw, 2.75rem)",
                  fontWeight: "var(--font-weight-bold)",
                  letterSpacing: "var(--tracking-tight)",
                  margin: "0 0 var(--space-xs) 0",
                  color: "var(--color-text)",
                  lineHeight: 1.15,
                }}
              >
                {t("contactCtaHeading")}
              </h2>
              <p
                style={{
                  margin: 0,
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--font-size-base)",
                  lineHeight: 1.6,
                }}
              >
                {t("contactCtaSubtitle")}
              </p>
            </div>

            {/* CTAs: Only View Inventory */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--space-sm)",
                alignItems: "center",
              }}
            >
              <Button
                as={Link}
                to="/cars"
                variant="primary"
                size="lg"
                iconRight="arrow-right"
              >
                {t("viewInventoryButton", { defaultValue: t("viewCarsButton", { defaultValue: "Fahrzeugbestand ansehen" }) })}
              </Button>
            </div>
          </div>

          {/* Real Contact Channels & Hours Grid */}
          {(hasPhone || hasEmail || hasWhatsapp || Boolean(formattedHours)) && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "var(--space-md)",
                paddingTop: "var(--space-xl)",
                borderTop: "1px solid var(--color-border-subtle)",
              }}
            >
              {hasPhone && (
                <a
                  href={`tel:${contact.phone}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-md)",
                    padding: "var(--space-md)",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border-subtle)",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "transform var(--transition-fast), border-color var(--transition-fast)",
                  }}
                  className="surface-card-hover"
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 255, 255, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-secondary)",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="phone" size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: "var(--font-size-2xs)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--color-text-subtle)", fontWeight: 600 }}>
                      {t("phoneLabel")}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: "var(--color-text)", marginTop: "2px" }}>
                      {contact.phone}
                    </div>
                  </div>
                </a>
              )}

              {hasEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-md)",
                    padding: "var(--space-md)",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border-subtle)",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "transform var(--transition-fast), border-color var(--transition-fast)",
                  }}
                  className="surface-card-hover"
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 255, 255, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-secondary)",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="mail" size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: "var(--font-size-2xs)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--color-text-subtle)", fontWeight: 600 }}>
                      {t("emailLabel")}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: "var(--color-text)", marginTop: "2px" }}>
                      {contactEmail}
                    </div>
                  </div>
                </a>
              )}

              {hasWhatsapp && (
                <a
                  href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-md)",
                    padding: "var(--space-md)",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border-subtle)",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "transform var(--transition-fast), border-color var(--transition-fast)",
                  }}
                  className="surface-card-hover"
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 255, 255, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-secondary)",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="whatsapp" size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: "var(--font-size-2xs)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--color-text-subtle)", fontWeight: 600 }}>
                      {t("whatsappLabel")}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: "var(--color-text)", marginTop: "2px" }}>
                      {contact.whatsapp}
                    </div>
                  </div>
                </a>
              )}

              {formattedHours && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-md)",
                    padding: "var(--space-md)",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border-subtle)",
                  }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 255, 255, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-secondary)",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="clock" size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: "var(--font-size-2xs)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--color-text-subtle)", fontWeight: 600 }}>
                      {t("hoursLabel")}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: "var(--color-text)", marginTop: "2px" }}>
                      {formattedHours}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AboutContactCta;
