import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import LanguageSwitcher from "../common/LanguageSwitcher";
import IconButton from "../ui/IconButton";
import Drawer from "../ui/Drawer";
import Button from "../ui/Button";

/**
 * German Auto — HeaderNav Primitive
 * Supports transparent-over-hero, solid, and scrolled/sticky states.
 */

export function HeaderNav({
  transparent = false,
  className = "",
}) {
  const { t } = useTranslation(["navigation", "common"]);
  const { isAuthenticated, logout, isAdmin } = useAuth();
  const { settings } = useSettings();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const siteName = settings?.site?.name || "German Auto";
  const logoUrl = settings?.branding?.logo_url;

  const isTransparent = transparent && !isScrolled;

  return (
    <>
      <header
        className={`header-nav ${className}`.trim()}
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          right: 0,
          height: "var(--header-height)",
          zIndex: 100,
          backgroundColor: isTransparent
            ? "transparent"
            : "rgba(9, 10, 12, 0.85)",
          backdropFilter: isTransparent ? "none" : "blur(16px)",
          WebkitBackdropFilter: isTransparent ? "none" : "blur(16px)",
          borderBottom: `1px solid ${isTransparent ? "transparent" : "var(--color-border)"}`,
          transition: "background-color var(--duration-normal) var(--ease-smooth), border-color var(--duration-normal) var(--ease-smooth)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Logo / Brand Name */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-sm)",
              color: "var(--color-text)",
              textDecoration: "none",
            }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} style={{ maxHeight: "36px", objectFit: "contain" }} />
            ) : (
              <span
                style={{
                  fontFamily: "var(--font-family-display)",
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  letterSpacing: "var(--tracking-tight)",
                }}
              >
                {siteName}
              </span>
            )}
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hide-mobile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-xl)",
            }}
          >
            <Link to="/cars" style={{ fontWeight: 500, fontSize: "var(--font-size-sm)" }}>
              {t("inventory")}
            </Link>
            <Link to="/sell-your-car" style={{ fontWeight: 500, fontSize: "var(--font-size-sm)" }}>
              {t("sellYourCar")}
            </Link>
            <Link to="/about" style={{ fontWeight: 500, fontSize: "var(--font-size-sm)" }}>
              {t("about")}
            </Link>
            <Link to="/contact" style={{ fontWeight: 500, fontSize: "var(--font-size-sm)" }}>
              {t("contact")}
            </Link>
          </nav>

          {/* Right Action Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
            <LanguageSwitcher />

            <div className="hide-mobile">
              {isAuthenticated ? (
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                  {isAdmin && (
                    <Button as={Link} to="/admincoresecure" variant="outline" size="sm">
                      {t("admin")}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={logout}>
                    {t("logout")}
                  </Button>
                </div>
              ) : (
                <Button as={Link} to="/login" variant="secondary" size="sm">
                  {t("login")}
                </Button>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="hide-desktop">
              <IconButton
                icon="menu"
                ariaLabel="Menü öffnen"
                variant="ghost"
                size="md"
                onClick={() => setMobileMenuOpen(true)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Responsive Mobile Drawer Navigation */}
      <Drawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title={siteName}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)", paddingTop: "var(--space-md)" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <Link
              to="/cars"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, padding: "var(--space-xs) 0" }}
            >
              {t("inventory")}
            </Link>
            <Link
              to="/sell-your-car"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, padding: "var(--space-xs) 0" }}
            >
              {t("sellYourCar")}
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, padding: "var(--space-xs) 0" }}
            >
              {t("about")}
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, padding: "var(--space-xs) 0" }}
            >
              {t("contact")}
            </Link>
          </nav>

          <hr style={{ border: "none", borderTop: "1px solid var(--color-border-subtle)" }} />

          {/* Auth in Mobile Menu */}
          <div>
            {isAuthenticated ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                {isAdmin && (
                  <Button
                    as={Link}
                    to="/admincoresecure"
                    variant="outline"
                    size="md"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ width: "100%" }}
                  >
                    {t("admin")}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  style={{ width: "100%" }}
                >
                  {t("logout")}
                </Button>
              </div>
            ) : (
              <Button
                as={Link}
                to="/login"
                variant="primary"
                size="md"
                onClick={() => setMobileMenuOpen(false)}
                style={{ width: "100%" }}
              >
                {t("login")}
              </Button>
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
}

export default HeaderNav;
