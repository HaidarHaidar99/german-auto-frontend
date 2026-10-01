import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, Section, Grid } from "../ui/Layout";
import { Eyebrow, Heading } from "../ui/Typography";
import Button from "../ui/Button";
import Icon from "../common/Icon";

/**
 * German Auto — Contact Information & CTA Section
 * Connects exclusively to settings.contact and settings.hours from CMS.
 */

export function ContactCtaSection({ contactConfig, hoursConfig }) {
  const { t } = useTranslation(["common", "navigation"]);

  const hasPhone = Boolean(contactConfig?.phone);
  const hasEmail = Boolean(contactConfig?.email);
  const hasWhatsapp = Boolean(contactConfig?.whatsapp);

  const hasAnyContact = hasPhone || hasEmail || hasWhatsapp;

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
            <div data-aos="fade-up" data-aos-delay="200">
              <Grid cols="responsive" gap="md">
              {hasPhone && (
                <div
                  style={{
                    padding: "var(--space-md)",
                    backgroundColor: "var(--color-surface)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-md)",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-card)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-secondary)",
                    }}
                  >
                    <Icon name="phone" size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: "var(--font-size-2xs)", textTransform: "uppercase", color: "var(--color-text-subtle)", letterSpacing: "var(--tracking-wide)" }}>
                      Telefon
                    </span>
                    <div>
                      <a href={`tel:${contactConfig.phone}`} style={{ fontWeight: 600, fontSize: "var(--font-size-sm)" }}>
                        {contactConfig.phone}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {hasEmail && (
                <div
                  style={{
                    padding: "var(--space-md)",
                    backgroundColor: "var(--color-surface)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-md)",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-card)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-secondary)",
                    }}
                  >
                    <Icon name="mail" size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: "var(--font-size-2xs)", textTransform: "uppercase", color: "var(--color-text-subtle)", letterSpacing: "var(--tracking-wide)" }}>
                      E-Mail
                    </span>
                    <div>
                      <a href={`mailto:${contactConfig.email}`} style={{ fontWeight: 600, fontSize: "var(--font-size-sm)" }}>
                        {contactConfig.email}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {hasWhatsapp && (
                <div
                  style={{
                    padding: "var(--space-md)",
                    backgroundColor: "var(--color-surface)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-md)",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-card)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-secondary)",
                    }}
                  >
                    <Icon name="whatsapp" size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: "var(--font-size-2xs)", textTransform: "uppercase", color: "var(--color-text-subtle)", letterSpacing: "var(--tracking-wide)" }}>
                      WhatsApp
                    </span>
                    <div>
                      <a
                        href={`https://wa.me/${contactConfig.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontWeight: 600, fontSize: "var(--font-size-sm)" }}
                      >
                        {contactConfig.whatsapp}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {hoursConfig?.monday?.open && (
                <div
                  style={{
                    padding: "var(--space-md)",
                    backgroundColor: "var(--color-surface)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-md)",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-card)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-secondary)",
                    }}
                  >
                    <Icon name="clock" size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: "var(--font-size-2xs)", textTransform: "uppercase", color: "var(--color-text-subtle)", letterSpacing: "var(--tracking-wide)" }}>
                      {t("openingHours", "Öffnungszeiten")}
                    </span>
                    <div style={{ fontWeight: 600, fontSize: "var(--font-size-sm)" }}>
                      Mo–Fr: {hoursConfig.monday.open}–{hoursConfig.monday.close} Uhr
                    </div>
                  </div>
                </div>
              )}
            </Grid>
          </div>
        )}
        </div>
      </Container>
    </Section>
  );
}

export default ContactCtaSection;
