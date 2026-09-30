import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import LanguageSwitcher from "../common/LanguageSwitcher";
import IconButton from "../ui/IconButton";
import Button from "../ui/Button";
import Icon from "../common/Icon";
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
  const activeLogoUrl = settings?.branding?.logo_url || "https://ylmahjqspbudmtewjhcg.supabase.co/storage/v1/object/public/german-auto-media/site/branding/1790760237272-so6ety.jpg";

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
          {/* Logo / Brand Name (hidden when mobile menu is open per user request) */}
          <Link
            to="/"
            onClick={() => menuOpen && closeMenu()}
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              zIndex: 10000,
              transition: "opacity 0.3s ease, visibility 0.3s ease",
              opacity: menuOpen ? 0 : 1,
              pointerEvents: menuOpen ? "none" : "auto",
              visibility: menuOpen ? "hidden" : "visible",
            }}
          >
            <img
              src={activeLogoUrl}
              alt={siteName}
              style={{
                height: "72px",
                maxHeight: "76px",
                width: "auto",
                maxWidth: "280px",
                objectFit: "contain",
                borderRadius: "4px",
                display: "block",
                filter: menuOpen ? "brightness(0) invert(1)" : "none",
              }}
            />
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
            <Link to="/" style={{ fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#ffffff", transition: "color 0.3s ease" }}>
              {t("home", { defaultValue: "Home" })}
            </Link>
            <Link to="/cars" style={{ fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#ffffff", transition: "color 0.3s ease" }}>
              {t("cars", { defaultValue: "Cars" })}
            </Link>
            <Link to="/sell-your-car" style={{ fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#ffffff", transition: "color 0.3s ease" }}>
              {t("sellYourCar")}
            </Link>
            <Link to="/about" style={{ fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#ffffff", transition: "color 0.3s ease" }}>
              {t("about")}
            </Link>
          </nav>

          {/* Right Action Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", zIndex: 10000 }}>
            
            <div className="hide-mobile" style={{ opacity: menuOpen ? 0 : 1, transition: "opacity 0.3s ease", pointerEvents: menuOpen ? 'none' : 'auto', display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
              <LanguageSwitcher />
              {isAuthenticated ? (
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                  <Link
                    to="/account"
                    title={t("profile", { ns: "account", defaultValue: "Profile" })}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      transition: "all 0.3s ease",
                      border: "1px solid rgba(255, 255, 255, 0.2)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#ffffff";
                      e.currentTarget.style.color = "#000000";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                      e.currentTarget.style.color = "#ffffff";
                    }}
                  >
                    <Icon name="user" size={18} />
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => logout()}>
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
            <div className="hide-desktop" style={{ display: menuOpen ? "none" : "block" }}>
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
                zIndex: 10001,
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
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: "calc(var(--header-height, 70px) + 3rem)",
          paddingBottom: "3rem",
          paddingLeft: "var(--space-xl)",
          paddingRight: "var(--space-xl)",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          transform: "translateY(-100%)", // Initial state for GSAP
        }}
      >
        <nav style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "1.25rem", 
          textAlign: "center",
          width: "100%",
          maxWidth: "480px",
          margin: "0 auto",
        }}>
          {[
            { to: "/", label: t("home", { defaultValue: "Home" }) },
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
                fontSize: "clamp(1.5rem, 5vw, 2.15rem)", 
                fontWeight: 700, 
                color: "#ffffff", 
                textDecoration: "none",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                opacity: 0, // Initial state for GSAP
                display: "block",
                padding: "12px 20px",
                borderRadius: "var(--radius-md)",
                border: "1px solid transparent",
                backgroundColor: "transparent",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              {item.label}
            </Link>
          ))}
          
          <div 
            ref={el => menuItemsRef.current[5] = el} 
            style={{ 
              marginTop: "2rem", 
              opacity: 0, 
              display: "flex", 
              flexDirection: "column", 
              gap: "var(--space-md)",
              alignItems: "center",
              width: "100%",
            }}
          >
            {isAuthenticated ? (
              <>
                <Button as={Link} to="/account" variant="outline" size="lg" onClick={closeMenu} style={{ width: "100%", maxWidth: "320px", borderRadius: 0, color: "#fff", borderColor: "rgba(255, 255, 255, 0.3)" }}>
                  {t("profile", { ns: "account", defaultValue: "Profile" })}
                </Button>
                <Button variant="ghost" size="lg" onClick={() => { closeMenu(); logout(); }} style={{ color: "#a1a1aa" }}>
                  {t("logout")}
                </Button>
              </>
            ) : (
              <Button as={Link} to="/login" variant="primary" size="lg" onClick={closeMenu} style={{ width: "100%", maxWidth: "320px", borderRadius: 0, backgroundColor: "#fff", color: "#000" }}>
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
