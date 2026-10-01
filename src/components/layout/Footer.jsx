import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../contexts/SettingsContext";
import Icon from "../common/Icon";

export function Footer() {
  const { t, i18n } = useTranslation(["navigation", "common", "footer"]);
  const { settings } = useSettings();
  const currentLang = i18n.language?.startsWith("en") ? "en" : "de";

  const siteConfig = settings?.site || {};
  const brandingConfig = settings?.branding || {};
  const footerConfig = settings?.footer || {};
  const contactConfig = settings?.contact || {};
  const socialConfig = settings?.social || {};
  const locationsConfig = settings?.locations || [];

  const siteName = siteConfig.name || "German Auto";

  // Footer Logo priority: footer_logo_url -> logo_dark_url -> logo_url -> default fallback
  const footerLogo =
    footerConfig.footer_logo_url ||
    brandingConfig.logo_url ||
    "https://ylmahjqspbudmtewjhcg.supabase.co/storage/v1/object/public/german-auto-media/site/branding/1790760237272-so6ety.jpg";

  // Description
  const description =
    currentLang === "de"
      ? footerConfig.description_de || siteConfig.description || "Ihr exklusiver Ansprechpartner für zertifizierte deutsche Premium- und Sportwagen."
      : footerConfig.description_en || siteConfig.description || "Your premier destination for certified German luxury and high-performance vehicles.";

  // Copyright text
  const copyright =
    currentLang === "de"
      ? footerConfig.copyright_de || `© ${new Date().getFullYear()} ${siteName}. Alle Rechte vorbehalten.`
      : footerConfig.copyright_en || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`;

  // Visibility toggles
  const showContact = footerConfig.show_contact !== false;
  const showSocial = footerConfig.show_social !== false;
  const showLocations = footerConfig.show_locations !== false;

  // Active Social Media accounts
  const socialPlatforms = [
    { key: "instagram", icon: "instagram", label: "Instagram", url: socialConfig.instagram?.url, enabled: socialConfig.instagram?.enabled },
    { key: "youtube", icon: "youtube", label: "YouTube", url: socialConfig.youtube?.url, enabled: socialConfig.youtube?.enabled },
    { key: "tiktok", icon: "video", label: "TikTok", url: socialConfig.tiktok?.url, enabled: socialConfig.tiktok?.enabled },
    { key: "linkedin", icon: "linkedin", label: "LinkedIn", url: socialConfig.linkedin?.url, enabled: socialConfig.linkedin?.enabled },
    { key: "x", icon: "share-2", label: "X / Twitter", url: socialConfig.x?.url, enabled: socialConfig.x?.enabled },
  ].filter((p) => p.enabled && p.url);

  const cleanPhone = (contactConfig.phone || "").replace(/[^0-9+]/g, "");
  const cleanWhatsapp = (contactConfig.whatsapp || "").replace(/[^0-9+]/g, "");

  return (
    <footer
      style={{
        backgroundColor: "#07080a",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        color: "#ffffff",
        marginTop: "auto",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Main Footer Container */}
      <div
        className="container"
        style={{
          paddingTop: "clamp(3rem, 6vw, 4.5rem)",
          paddingBottom: "clamp(2rem, 4vw, 3rem)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "clamp(2rem, 4vw, 3.5rem)",
            marginBottom: "3rem",
          }}
        >
          {/* Column 1: Brand & Logo & Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Link to="/" style={{ display: "inline-block", maxWidth: "180px", textDecoration: "none" }}>
              {footerLogo ? (
                <img
                  src={footerLogo}
                  alt={siteName}
                  style={{
                    maxHeight: "46px",
                    maxWidth: "180px",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              ) : (
                <span
                  style={{
                    fontFamily: "var(--font-family-display)",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    color: "var(--color-primary, #ffffff)",
                  }}
                >
                  {siteName}
                </span>
              )}
            </Link>

            <p
              style={{
                fontSize: "0.875rem",
                lineHeight: 1.65,
                color: "var(--color-text-muted, #94a3b8)",
                margin: 0,
                maxWidth: "340px",
              }}
            >
              {description}
            </p>

            {/* Social Icons */}
            {showSocial && socialPlatforms.length > 0 && (
              <div style={{ display: "flex", gap: "10px", marginTop: "0.5rem", flexWrap: "wrap" }}>
                {socialPlatforms.map((social) => (
                  <a
                    key={social.key}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#cbd5e1",
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--color-primary, #ffffff)";
                      e.currentTarget.style.color = "#000000";
                      e.currentTarget.style.borderColor = "var(--color-primary, #ffffff)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                      e.currentTarget.style.color = "#cbd5e1";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <Icon name={social.icon} size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4
              style={{
                fontSize: "0.8125rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#ffffff",
                marginBottom: "1.25rem",
              }}
            >
              {currentLang === "de" ? "Navigation" : "Explore"}
            </h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <li>
                <Link to="/" style={{ color: "var(--color-text-muted, #94a3b8)", textDecoration: "none", fontSize: "0.875rem", transition: "color 0.15s ease" }}
                  onMouseEnter={(e) => (e.target.style.color = "#ffffff")}
                  onMouseLeave={(e) => (e.target.style.color = "var(--color-text-muted, #94a3b8)")}
                >
                  {t("home", { defaultValue: "Startseite" })}
                </Link>
              </li>
              <li>
                <Link to="/cars" style={{ color: "var(--color-text-muted, #94a3b8)", textDecoration: "none", fontSize: "0.875rem", transition: "color 0.15s ease" }}
                  onMouseEnter={(e) => (e.target.style.color = "#ffffff")}
                  onMouseLeave={(e) => (e.target.style.color = "var(--color-text-muted, #94a3b8)")}
                >
                  {t("inventory", { defaultValue: "Fahrzeugbestand" })}
                </Link>
              </li>
              <li>
                <Link to="/sell-your-car" style={{ color: "var(--color-text-muted, #94a3b8)", textDecoration: "none", fontSize: "0.875rem", transition: "color 0.15s ease" }}
                  onMouseEnter={(e) => (e.target.style.color = "#ffffff")}
                  onMouseLeave={(e) => (e.target.style.color = "var(--color-text-muted, #94a3b8)")}
                >
                  {t("sellCar", { defaultValue: "Fahrzeug verkaufen" })}
                </Link>
              </li>
              <li>
                <Link to="/leave-review" style={{ color: "var(--color-text-muted, #94a3b8)", textDecoration: "none", fontSize: "0.875rem", transition: "color 0.15s ease" }}
                  onMouseEnter={(e) => (e.target.style.color = "#ffffff")}
                  onMouseLeave={(e) => (e.target.style.color = "var(--color-text-muted, #94a3b8)")}
                >
                  {t("reviews", { defaultValue: "Kundenbewertungen" })}
                </Link>
              </li>
              <li>
                <Link to="/about" style={{ color: "var(--color-text-muted, #94a3b8)", textDecoration: "none", fontSize: "0.875rem", transition: "color 0.15s ease" }}
                  onMouseEnter={(e) => (e.target.style.color = "#ffffff")}
                  onMouseLeave={(e) => (e.target.style.color = "var(--color-text-muted, #94a3b8)")}
                >
                  {t("about", { defaultValue: "Über uns" })}
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{ color: "var(--color-text-muted, #94a3b8)", textDecoration: "none", fontSize: "0.875rem", transition: "color 0.15s ease" }}
                  onMouseEnter={(e) => (e.target.style.color = "#ffffff")}
                  onMouseLeave={(e) => (e.target.style.color = "var(--color-text-muted, #94a3b8)")}
                >
                  {t("contact", { defaultValue: "Kontakt" })}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Concierge */}
          {showContact && (
            <div>
              <h4
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#ffffff",
                  marginBottom: "1.25rem",
                }}
              >
                {currentLang === "de" ? "Kontakt & Service" : "Contact & Service"}
              </h4>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {contactConfig.phone && (
                  <li>
                    <a
                      href={`tel:${cleanPhone}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "var(--color-text-muted, #94a3b8)",
                        textDecoration: "none",
                        fontSize: "0.875rem",
                        transition: "color 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted, #94a3b8)")}
                    >
                      <Icon name="phone" size={14} style={{ color: "var(--color-primary, #ffffff)" }} />
                      <span>{contactConfig.phone}</span>
                    </a>
                  </li>
                )}

                {contactConfig.email && (
                  <li>
                    <a
                      href={`mailto:${contactConfig.email}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "var(--color-text-muted, #94a3b8)",
                        textDecoration: "none",
                        fontSize: "0.875rem",
                        transition: "color 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted, #94a3b8)")}
                    >
                      <Icon name="mail" size={14} style={{ color: "var(--color-primary, #ffffff)" }} />
                      <span>{contactConfig.email}</span>
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
                        gap: "8px",
                        color: "var(--color-text-muted, #94a3b8)",
                        textDecoration: "none",
                        fontSize: "0.875rem",
                        transition: "color 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#22c55e")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted, #94a3b8)")}
                    >
                      <Icon name="message-circle" size={14} style={{ color: "#22c55e" }} />
                      <span>WhatsApp Chat</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Column 4: Showrooms / Locations Summary */}
          {showLocations && locationsConfig.length > 0 && (
            <div>
              <h4
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#ffffff",
                  marginBottom: "1.25rem",
                }}
              >
                {currentLang === "de" ? "Standorte" : "Locations"}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {locationsConfig.slice(0, 2).map((loc, idx) => (
                  <div key={idx} style={{ fontSize: "0.875rem", color: "var(--color-text-muted, #94a3b8)", lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 600, color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Icon name="map-pin" size={13} style={{ color: "var(--color-primary, #ffffff)" }} />
                      <span>{loc.city || loc.name}</span>
                    </div>
                    {loc.street && <div style={{ fontSize: "0.8125rem" }}>{loc.street}</div>}
                    {loc.postal_code && <div style={{ fontSize: "0.8125rem" }}>{loc.postal_code} {loc.city}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "1.5rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            fontSize: "0.8125rem",
            color: "var(--color-text-muted, #94a3b8)",
          }}
        >
          <div>{copyright}</div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <Link to="/about" style={{ color: "var(--color-text-muted, #94a3b8)", textDecoration: "none" }}>
              {t("about", { defaultValue: "Über uns" })}
            </Link>
            <Link to="/contact" style={{ color: "var(--color-text-muted, #94a3b8)", textDecoration: "none" }}>
              {t("contact", { defaultValue: "Kontakt" })}
            </Link>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-text-muted, #94a3b8)",
                cursor: "pointer",
                padding: 0,
                fontSize: "0.8125rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted, #94a3b8)")}
            >
              <span>{currentLang === "de" ? "Nach oben" : "Back to top"}</span>
              &uarr;
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
