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
  const hasEmail = Boolean(contact?.email);
  const hasWhatsapp = Boolean(contact?.whatsapp);

  // Format hours if configured in CMS
  const hasMondayHours = Boolean(hours?.monday?.open && hours?.monday?.close && !hours?.monday?.closed);
  const hasSaturdayHours = Boolean(hours?.saturday?.open && hours?.saturday?.close && !hours?.saturday?.closed);

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

            {/* CTAs */}
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
                to="/contact"
                variant="primary"
                size="lg"
                iconRight="arrow-right"
              >
                {t("contactCtaButton")}
              </Button>
              <Button
                as={Link}
                to="/cars"
                variant="outline"
                size="lg"
              >
                {t("viewInventoryButton")}
              </Button>
            </div>
          </div>

          {/* Real Contact Channels & Hours Grid */}
          {(hasPhone || hasEmail || hasWhatsapp || hasMondayHours) && (
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
                  href={`mailto:${contact.email}`}
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
                      {contact.email}
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
                    <Icon name="phone" size={18} />
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

              {hasMondayHours && (
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
                      Mo–Fr: {hours.monday.open}–{hours.monday.close} Uhr
                      {hasSaturdayHours ? ` · Sa: ${hours.saturday.open}–${hours.saturday.close}` : ""}
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
