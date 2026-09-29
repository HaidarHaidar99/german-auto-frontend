import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import LanguageSwitcher from "../common/LanguageSwitcher";
import IconButton from "../ui/IconButton";
import Button from "../ui/Button";
import gsap from "gsap";

/**
 * German Auto — Premium Cinematic HeaderNav
 * Supports transparent-over-hero, solid, and scrolled/sticky states.
 * Features a full-screen GSAP animated mobile menu.
 */

export function HeaderNav({
  transparent = false,
  className = "",
}) {
  const { t } = useTranslation(["navigation", "common"]);
  const { isAuthenticated, logout, isAdmin } = useAuth();
  const { settings } = useSettings();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const menuRef = useRef(null);
  const menuBgRef = useRef(null);
  const menuItemsRef = useRef([]);

  // Close menu on route change
  useEffect(() => {
    if (menuOpen) {
      closeMenu();
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openMenu = () => {
    setMenuOpen(true);
    document.body.style.overflow = "hidden"; // Prevent scrolling

    const tl = gsap.timeline();
    tl.to(menuBgRef.current, {
      y: "0%",
      duration: 0.6,
      ease: "power3.inOut",
    })
    .fromTo(menuItemsRef.current, {
      y: 50,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: 0.5,
      stagger: 0.05,
      ease: "power2.out",
    }, "-=0.2");
  };

  const closeMenu = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        setMenuOpen(false);
        document.body.style.overflow = "";
      }
    });

    tl.to(menuItemsRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.3,
      stagger: -0.05,
      ease: "power2.in",
    })
    .to(menuBgRef.current, {
      y: "-100%",
      duration: 0.5,
      ease: "power3.inOut",
    }, "-=0.1");
  };

  const siteName = settings?.site?.name || "German Auto";
  const logoUrl = settings?.branding?.logo_url;

  const isTransparent = transparent && !isScrolled && !menuOpen;

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
          zIndex: 9999, // High z-index to stay above everything
          backgroundColor: isTransparent
            ? "transparent"
            : menuOpen 
              ? "transparent" // Let the menu background show through
              : "rgba(0, 0, 0, 0.85)", // Use pure black overlay
          backdropFilter: isTransparent || menuOpen ? "none" : "blur(16px)",
          WebkitBackdropFilter: isTransparent || menuOpen ? "none" : "blur(16px)",
          borderBottom: `1px solid ${isTransparent || menuOpen ? "transparent" : "var(--color-border)"}`,
          transition: "background-color 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease",
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
            onClick={() => menuOpen && closeMenu()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-sm)",
              color: menuOpen ? "#fff" : "var(--color-text)", // Force white when menu is open
              textDecoration: "none",
              zIndex: 10000,
              transition: "color 0.3s ease"
            }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} style={{ maxHeight: "36px", objectFit: "contain", filter: menuOpen ? "brightness(0) invert(1)" : "none" }} />
            ) : (
              <span
                style={{
                  fontFamily: "var(--font-family-display)",
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  letterSpacing: "var(--tracking-widest)", // More premium tracking
                  textTransform: "uppercase"
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
              gap: "var(--space-2xl)", // Increased spacing
              opacity: menuOpen ? 0 : 1, // Hide when mobile menu is open (if resized)
              pointerEvents: menuOpen ? 'none' : 'auto',
              transition: "opacity 0.3s ease"
            }}
          >
            <Link to="/cars" style={{ fontWeight: 500, fontSize: "var(--font-size-sm)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase" }}>
              {t("inventory")}
            </Link>
            <Link to="/sell-your-car" style={{ fontWeight: 500, fontSize: "var(--font-size-sm)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase" }}>
              {t("sellYourCar")}
            </Link>
            <Link to="/about" style={{ fontWeight: 500, fontSize: "var(--font-size-sm)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase" }}>
              {t("about")}
            </Link>
          </nav>

          {/* Right Action Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", zIndex: 10000 }}>
            
            <div className="hide-mobile" style={{ opacity: menuOpen ? 0 : 1, transition: "opacity 0.3s ease", pointerEvents: menuOpen ? 'none' : 'auto', display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
              <LanguageSwitcher />
              {isAuthenticated ? (
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                  <Button as={Link} to="/account" variant="outline" size="sm">
                    {t("navOverview", { ns: "account" }) || "Account"}
                  </Button>
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
                <Button as={Link} to="/login" variant="secondary" size="sm" style={{ borderRadius: "0px" }}> {/* Sharper edges for premium feel */}
                  {t("login")}
                </Button>
              )}
            </div>

            {/* Cinematic Hamburger Toggle (Mobile & Desktop optional) */}
            <div className="hide-desktop">
               <LanguageSwitcher />
            </div>
            <button
              onClick={menuOpen ? closeMenu : openMenu}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-end",
                gap: "6px",
                width: "40px",
                height: "40px",
                color: menuOpen ? "#fff" : "var(--color-text)",
              }}
              className="hide-desktop"
            >
              <span style={{ 
                display: "block", 
                height: "2px", 
                width: menuOpen ? "24px" : "24px", 
                backgroundColor: "currentColor", 
                transition: "all 0.3s ease",
                transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none"
              }} />
              <span style={{ 
                display: "block", 
                height: "2px", 
                width: menuOpen ? "24px" : "16px", 
                backgroundColor: "currentColor", 
                transition: "all 0.3s ease",
                opacity: menuOpen ? 0 : 1
              }} />
              <span style={{ 
                display: "block", 
                height: "2px", 
                width: "24px", 
                backgroundColor: "currentColor", 
                transition: "all 0.3s ease",
                transform: menuOpen ? "rotate(-45deg) translate(6px, -6px)" : "none"
              }} />
            </button>
          </div>
        </div>
      </header>

      {/* Full Screen Cinematic Menu */}
      <div 
        ref={menuBgRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100dvh",
          backgroundColor: "#000000", // Strictly Black
          zIndex: 9998,
          display: menuOpen ? "flex" : "none", // Avoid rendering when closed to prevent interaction
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "var(--space-2xl)",
          transform: "translateY(-100%)", // Initial state for GSAP
        }}
      >
        <nav style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "var(--space-xl)", 
          textAlign: "center",
          width: "100%",
          maxWidth: "600px"
        }}>
          {[
            { to: "/cars", label: t("inventory") },
            { to: "/sell-your-car", label: t("sellYourCar") },
            { to: "/about", label: t("about") },
            { to: "/contact", label: t("contact") }
          ].map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={closeMenu}
              ref={el => menuItemsRef.current[i] = el}
              style={{ 
                fontSize: "var(--font-size-4xl)", 
                fontWeight: 700, 
                color: "#ffffff", 
                textDecoration: "none",
                letterSpacing: "var(--tracking-tight)",
                textTransform: "uppercase",
                opacity: 0, // Initial state for GSAP
                display: "block",
                padding: "10px 0"
              }}
              onMouseEnter={(e) => gsap.to(e.target, { color: "#8e95a5", duration: 0.3 })}
              onMouseLeave={(e) => gsap.to(e.target, { color: "#ffffff", duration: 0.3 })}
            >
              {item.label}
            </Link>
          ))}
          
          <div 
            ref={el => menuItemsRef.current[4] = el} 
            style={{ 
              marginTop: "var(--space-2xl)", 
              opacity: 0, 
              display: "flex", 
              flexDirection: "column", 
              gap: "var(--space-md)",
              alignItems: "center"
            }}
          >
            {isAuthenticated ? (
              <>
                <Button as={Link} to="/account" variant="outline" size="lg" style={{ width: "100%", maxWidth: "300px", borderRadius: 0, color: "#fff", borderColor: "#3b4255" }}>
                  {t("navOverview", { ns: "account" }) || "Account"}
                </Button>
                {isAdmin && (
                  <Button as={Link} to="/admincoresecure" variant="outline" size="lg" style={{ width: "100%", maxWidth: "300px", borderRadius: 0, color: "#fff", borderColor: "#3b4255" }}>
                    {t("admin")}
                  </Button>
                )}
                <Button variant="ghost" size="lg" onClick={logout} style={{ color: "#a1a1aa" }}>
                  {t("logout")}
                </Button>
              </>
            ) : (
              <Button as={Link} to="/login" variant="primary" size="lg" style={{ width: "100%", maxWidth: "300px", borderRadius: 0, backgroundColor: "#fff", color: "#000" }}>
                {t("login")}
              </Button>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}

export default HeaderNav;
