import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings, DEFAULT_BRAND_NAME, DEFAULT_LOGO_URL } from "../../contexts/SettingsContext";
import { useTheme } from "../../contexts/ThemeContext";
import Icon from "../common/Icon";

export function Footer() {
  const { t, i18n } = useTranslation(["navigation", "common", "footer"]);
  const { settings } = useSettings();
  const { isDark } = useTheme();
  const currentLang = i18n.language?.startsWith("en") ? "en" : "de";

  const siteConfig = settings?.site || {};
  const brandingConfig = settings?.branding || {};
  const footerConfig = settings?.footer || {};
  const contactConfig = settings?.contact || {};
  const socialConfig = settings?.social || {};
  const locationsConfig = settings?.locations || [];

  const siteName = siteConfig.name || DEFAULT_BRAND_NAME;

  // Footer Logo priority based on active theme with fallback to default
  const footerLogo = !isDark && (footerConfig.footer_logo_light_url || brandingConfig.logo_light_url)
    ? (footerConfig.footer_logo_light_url || brandingConfig.logo_light_url)
    : (footerConfig.footer_logo_url || brandingConfig.logo_url || DEFAULT_LOGO_URL);

  // Description (German)
  const description =
    footerConfig.description_de || siteConfig.description || "König Automobile Rheinberg — Ihr exklusiver Partner für Automobile höchster Güteklasse.";

  // Copyright text (German)
  const copyright =
    footerConfig.copyright_de || `© ${new Date().getFullYear()} ${siteName}. Alle Rechte vorbehalten.`;

  // Visibility toggles
  const showContact = footerConfig.show_contact !== false;
  const showSocial = footerConfig.show_social !== false;
  const showLocations = footerConfig.show_locations !== false;

  // Active Social Media accounts
  const socialPlatforms = [
    { key: "facebook", icon: "facebook", label: "Facebook", url: socialConfig.facebook?.url, enabled: socialConfig.facebook?.enabled },
    { key: "instagram", icon: "instagram", label: "Instagram", url: socialConfig.instagram?.url, enabled: socialConfig.instagram?.enabled },
    { key: "whatsapp", icon: "whatsapp", label: "WhatsApp", url: socialConfig.whatsapp?.url, enabled: socialConfig.whatsapp?.enabled },
    { key: "youtube", icon: "youtube", label: "YouTube", url: socialConfig.youtube?.url, enabled: socialConfig.youtube?.enabled },
    { key: "tiktok", icon: "tiktok", label: "TikTok", url: socialConfig.tiktok?.url, enabled: socialConfig.tiktok?.enabled },
    { key: "linkedin", icon: "linkedin", label: "LinkedIn", url: socialConfig.linkedin?.url, enabled: socialConfig.linkedin?.enabled },
    { key: "x", icon: "x", label: "X (Twitter)", url: socialConfig.x?.url, enabled: socialConfig.x?.enabled },
  ].filter((p) => p.enabled && p.url);

  const cleanPhone = (contactConfig.phone || "").replace(/[^0-9+]/g, "");
  const cleanWhatsapp = (contactConfig.whatsapp || "").replace(/[^0-9+]/g, "");

  return (
    <footer
      style={{
        backgroundColor: "var(--color-footer-bg, var(--color-background))",
        borderTop: "1px solid var(--color-border)",
        color: "var(--color-text)",
        marginTop: "auto",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Main Footer Container */}
      <div
        className="container"
        style={{
          paddingTop: "clamp(3.5rem, 6vw, 5rem)",
          paddingBottom: "clamp(2.5rem, 4vw, 3.5rem)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "clamp(2rem, 4vw, 3.5rem)",
            marginBottom: "3.5rem",
          }}
        >
          {/* Column 1: Brand & Logo & Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.35rem" }}>
            <Link
              to="/"
              style={{
                display: "inline-block",
                maxWidth: "380px",
                textDecoration: "none",
                backgroundColor: isDark ? "#000000" : "#FFFFFF",
                border: "none",
                boxShadow: "none",
                borderRadius: "0px",
                padding: 0,
              }}
            >
              {footerLogo ? (
                <img
                  src={footerLogo}
                  alt={siteName}
                  style={{
                    maxHeight: "115px",
                    maxWidth: "340px",
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                    display: "block",
                    backgroundColor: isDark ? "#000000" : "#FFFFFF",
                    border: "none",
                    boxShadow: "none",
                  }}
                />
              ) : (
                <span
                  style={{
                    fontFamily: "var(--font-family-display)",
                    fontSize: "2rem",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    color: "#D4AF37",
                  }}
                >
                  {siteName}
                </span>
              )}
            </Link>

            <p
              style={{
                fontSize: "0.975rem",
                lineHeight: 1.7,
                color: "var(--color-text-muted, #94a3b8)",
                margin: 0,
                maxWidth: "380px",
              }}
            >
              {description}
            </p>

            {/* Social Icons */}
            {showSocial && socialPlatforms.length > 0 && (
              <div style={{ display: "flex", gap: "12px", marginTop: "0.5rem", flexWrap: "wrap" }}>
                {socialPlatforms.map((social) => (
                  <a
                    key={social.key}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-accent-subtle)",
                      border: "1px solid var(--color-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-text-muted)",
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#D4AF37";
                      e.currentTarget.style.color = "#000000";
                      e.currentTarget.style.borderColor = "#D4AF37";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--color-accent-subtle)";
                      e.currentTarget.style.color = "var(--color-text-muted)";
                      e.currentTarget.style.borderColor = "var(--color-border)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <Icon name={social.icon} size={18} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Explore Navigation Links */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h4
              style={{
                fontSize: "1.05rem",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#D4AF37",
                marginBottom: "1.35rem",
                display: "block",
              }}
            >
              <span>{currentLang === "de" ? "Navigation" : "Explore"}</span>
            </h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.95rem" }}>
              <li>
                <Link
                  to="/"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--color-text-muted, #94a3b8)", textDecoration: "none", fontSize: "0.975rem", transition: "color 0.15s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted, #94a3b8)")}
                >
                  <Icon name="chevron-right" size={14} style={{ color: "rgba(212, 175, 55, 0.8)" }} />
                  <span>{t("home", { defaultValue: "Startseite" })}</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/cars"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--color-text-muted, #94a3b8)", textDecoration: "none", fontSize: "0.975rem", transition: "color 0.15s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted, #94a3b8)")}
                >
                  <Icon name="chevron-right" size={14} style={{ color: "rgba(212, 175, 55, 0.8)" }} />
                  <span>{t("inventory", { defaultValue: "Fahrzeugbestand" })}</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/sell-your-car"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--color-text-muted, #94a3b8)", textDecoration: "none", fontSize: "0.975rem", transition: "color 0.15s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted, #94a3b8)")}
                >
                  <Icon name="chevron-right" size={14} style={{ color: "rgba(212, 175, 55, 0.8)" }} />
                  <span>{t("sellCar", { defaultValue: "Fahrzeug verkaufen" })}</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/reviews"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--color-text-muted, #94a3b8)", textDecoration: "none", fontSize: "0.975rem", transition: "color 0.15s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted, #94a3b8)")}
                >
                  <Icon name="chevron-right" size={14} style={{ color: "rgba(212, 175, 55, 0.8)" }} />
                  <span>{t("reviews", { defaultValue: "Kundenbewertungen" })}</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--color-text-muted, #94a3b8)", textDecoration: "none", fontSize: "0.975rem", transition: "color 0.15s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted, #94a3b8)")}
                >
                  <Icon name="chevron-right" size={14} style={{ color: "rgba(212, 175, 55, 0.8)" }} />
                  <span>{t("about", { defaultValue: "Über uns" })}</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--color-text-muted, #94a3b8)", textDecoration: "none", fontSize: "0.975rem", transition: "color 0.15s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted, #94a3b8)")}
                >
                  <Icon name="chevron-right" size={14} style={{ color: "rgba(212, 175, 55, 0.8)" }} />
                  <span>{t("contact", { defaultValue: "Kontakt" })}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Services */}
          {showContact && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h4
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#D4AF37",
                  marginBottom: "1.35rem",
                  display: "block",
                }}
              >
                <span>{currentLang === "de" ? "Kontakt & Services" : "Contact & Services"}</span>
              </h4>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.95rem" }}>
                {contactConfig.phone && (
                  <li>
                    <a
                      href={`tel:${cleanPhone}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        color: "var(--color-text-muted, #94a3b8)",
                        textDecoration: "none",
                        fontSize: "0.975rem",
                        transition: "color 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted, #94a3b8)")}
                    >
                      <Icon name="phone" size={18} style={{ color: "#D4AF37", flexShrink: 0 }} />
                      <span>{contactConfig.phone}</span>
                    </a>
                  </li>
                )}

                {(contactConfig.email || "konigautomobilerheinberg@gmail.com") && (
                  <li>
                    <a
                      href={`mailto:${contactConfig.email || "konigautomobilerheinberg@gmail.com"}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        color: "var(--color-text-muted, #94a3b8)",
                        textDecoration: "none",
                        fontSize: "0.975rem",
                        transition: "color 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted, #94a3b8)")}
                    >
                      <Icon name="mail" size={18} style={{ color: "#D4AF37", flexShrink: 0 }} />
                      <span>{contactConfig.email || "konigautomobilerheinberg@gmail.com"}</span>
                    </a>
                  </li>
                )}

                {contactConfig.whatsapp && (
                  <li>
                    <a
                      href={`https://wa.me/${cleanWhatsapp.replace("+", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        color: "var(--color-text-muted, #94a3b8)",
                        textDecoration: "none",
                        fontSize: "0.975rem",
                        transition: "color 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#22c55e")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted, #94a3b8)")}
                    >
                      <Icon name="whatsapp" size={18} style={{ color: "#22c55e", flexShrink: 0 }} />
                      <span>WhatsApp Chat</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Column 4: Locations */}
          {showLocations && locationsConfig.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h4
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#D4AF37",
                  marginBottom: "1.35rem",
                  display: "block",
                }}
              >
                <span>{currentLang === "de" ? "Standorte" : "Locations"}</span>
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
                {locationsConfig.slice(0, 3).map((loc, idx) => (
                  <div key={idx} style={{ fontSize: "0.975rem", color: "var(--color-text-muted, #94a3b8)", lineHeight: 1.5, display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ fontWeight: 600, color: "var(--color-text)", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Icon name="map-pin" size={17} style={{ color: "#D4AF37", flexShrink: 0 }} />
                      <span>{loc.city || loc.name}</span>
                    </div>
                    {loc.street && <div style={{ fontSize: "0.925rem", paddingLeft: "25px" }}>{loc.street}</div>}
                    {loc.postal_code && <div style={{ fontSize: "0.925rem", paddingLeft: "25px" }}>{loc.postal_code} {loc.city}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar: Copyright Only — absolutely nothing below it */}
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            paddingTop: "1.85rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            fontSize: "0.95rem",
            color: "var(--color-text-muted, #94a3b8)",
            letterSpacing: "0.02em",
          }}
        >
          <div>{copyright}</div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
