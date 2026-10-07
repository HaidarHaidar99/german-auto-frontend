import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings, DEFAULT_BRAND_NAME, DEFAULT_LOGO_URL } from "../../contexts/SettingsContext";
import LanguageSwitcher from "../common/LanguageSwitcher";
import ThemeToggle from "../common/ThemeToggle";
import { useTheme } from "../../contexts/ThemeContext";
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
  const { isAuthenticated, logout, isAdmin, favorites = [], user } = useAuth();
  const { isDark } = useTheme();
  const isUserLoggedIn = Boolean(isAuthenticated && user);
  const { settings } = useSettings();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const menuRef = useRef(null);
  const menuBgRef = useRef(null);
  const menuItemsRef = useRef([]);

  const accumulatedDown = useRef(0);
  const accumulatedUp = useRef(0);
  const currentVisibility = useRef(true);

  // Always ensure header is visible, close mobile menu, and reset scroll tracking on route change
  useEffect(() => {
    if (menuOpen) {
      closeMenu();
    }
    setIsVisible(true);
    currentVisibility.current = true;
    setIsScrolled(false);
    lastScrollY.current = 0;
    accumulatedDown.current = 0;
    accumulatedUp.current = 0;
  }, [location.pathname, location.search]);

  // Dynamic header visibility with a proper threshold / dead zone:
  // - Tiny movements (few pixels) are completely ignored (dead zone).
  // - Navbar stays exactly where it is until a meaningful distance is scrolled.
  // - Meaningful continuous downward scroll (> 75px) smoothly slides the navbar upward to hide it.
  // - Meaningful continuous upward scroll (> 60px) smoothly slides the navbar downward to reveal it.
  // - Near the top of the page (scrollY <= 70px) or with mobile menu open, navbar is always visible.
  useEffect(() => {
    let ticking = false;
    const DOWN_THRESHOLD = 75; // Pixels of meaningful continuous downward scroll to hide
    const UP_THRESHOLD = 60;   // Pixels of meaningful continuous upward scroll to reveal
    const TOP_ZONE = 70;       // Near top of page where navbar is always visible

    const onScroll = () => {
      const currentScrollY = Math.max(0, window.scrollY || document.documentElement?.scrollTop || document.body?.scrollTop || 0);
      const delta = currentScrollY - lastScrollY.current;

      // Sub-pixel jitter filter: ignore movements less than 2px
      if (Math.abs(delta) < 2) {
        ticking = false;
        return;
      }

      // 1. Top of page or menu open: always visible and reset accumulators
      if (menuOpen || currentScrollY <= TOP_ZONE) {
        if (!currentVisibility.current) {
          currentVisibility.current = true;
          setIsVisible(true);
        }
        accumulatedDown.current = 0;
        accumulatedUp.current = 0;
      } else if (delta > 0) {
        // Scrolling DOWN
        accumulatedDown.current += delta;
        // Direction change dead-zone: only clear upward accumulator on deliberate downward movement (> 4px)
        if (delta > 4) {
          accumulatedUp.current = 0;
        }

        // Dead zone: small downward movements are completely ignored
        if (accumulatedDown.current >= DOWN_THRESHOLD && currentScrollY > TOP_ZONE) {
          if (currentVisibility.current) {
            currentVisibility.current = false;
            setIsVisible(false);
          }
          accumulatedDown.current = 0; // Reset after triggering
        }
      } else if (delta < 0) {
        // Scrolling UP
        accumulatedUp.current += Math.abs(delta);
        // Direction change dead-zone: only clear downward accumulator on deliberate upward movement (> 4px)
        if (Math.abs(delta) > 4) {
          accumulatedDown.current = 0;
        }

        // Dead zone: small upward movements are completely ignored
        if (accumulatedUp.current >= UP_THRESHOLD) {
          if (!currentVisibility.current) {
            currentVisibility.current = true;
            setIsVisible(true);
          }
          accumulatedUp.current = 0; // Reset after triggering
        }
      }

      setIsScrolled(currentScrollY > 25);
      lastScrollY.current = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Dynamic subscription to Lenis smooth scroll engine (desktop)
    const lenisInterval = setInterval(() => {
      if (window.__lenis && typeof window.__lenis.on === "function" && !window.__lenis.__hasHeaderAttached) {
        window.__lenis.on("scroll", handleScroll);
        window.__lenis.__hasHeaderAttached = true;
      }
    }, 150);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(lenisInterval);
      if (window.__lenis && window.__lenis.__hasHeaderAttached) {
        try {
          window.__lenis.off("scroll", handleScroll);
          window.__lenis.__hasHeaderAttached = false;
        } catch {}
      }
    };
  }, [menuOpen, location.pathname]);

  const openMenu = () => {
    setMenuOpen(true);
    document.body.style.overflow = "hidden"; // Prevent scrolling
    if (window.__lenis && typeof window.__lenis.stop === "function") {
      window.__lenis.stop();
    }

    gsap.killTweensOf([menuBgRef.current, ...menuItemsRef.current]);

    const tl = gsap.timeline();
    tl.to(menuBgRef.current, {
      y: "0%",
      duration: 0.35,
      ease: "power2.out",
    })
    .fromTo(menuItemsRef.current, {
      y: -24,
      opacity: 0,
    }, {
      y: 0,
      opacity: 1,
      duration: 0.28,
      stagger: 0.04,
      ease: "power1.out", // Falls smoothly in one single direction with zero recoil
      clearProps: "transform",
    }, "-=0.1");
  };

  const closeMenu = () => {
    gsap.killTweensOf([menuBgRef.current, ...menuItemsRef.current]);

    const tl = gsap.timeline({
      onComplete: () => {
        setMenuOpen(false);
        document.body.style.overflow = "";
        if (window.__lenis && typeof window.__lenis.start === "function") {
          window.__lenis.start();
        }
      }
    });

    tl.to(menuItemsRef.current, {
      opacity: 0,
      duration: 0.15,
      ease: "power1.in",
    })
    .to(menuBgRef.current, {
      y: "-100%",
      duration: 0.3,
      ease: "power2.in",
    }, "-=0.05");
  };

  const handleHomeClick = (e) => {
    if (menuOpen) closeMenu();
    if (location.pathname === "/") {
      e.preventDefault();
      if (location.hash) {
        window.history.replaceState(null, "", "/");
      }
      if (window.__lenis?.instance?.scrollTo) {
        window.__lenis.instance.scrollTo(0, { immediate: false });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleReviewsClick = (e) => {
    if (menuOpen) closeMenu();
    if (location.pathname === "/reviews") {
      e.preventDefault();
      if (window.__lenis?.instance?.scrollTo) {
        window.__lenis.instance.scrollTo(0, { immediate: false });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleAboutClick = (e) => {
    if (menuOpen) closeMenu();
    if (location.pathname === "/about") {
      e.preventDefault();
      if (window.__lenis?.instance?.scrollTo) {
        window.__lenis.instance.scrollTo(0, { immediate: false });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleContactClick = (e) => {
    if (menuOpen) closeMenu();
    if (location.pathname === "/contact") {
      e.preventDefault();
      if (window.__lenis?.instance?.scrollTo) {
        window.__lenis.instance.scrollTo(0, { immediate: false });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleMobileNavClick = (item) => {
    closeMenu();
    if (item.isHome && location.pathname === "/") {
      if (location.hash) {
        window.history.replaceState(null, "", "/");
      }
      setTimeout(() => {
        if (window.__lenis?.instance?.scrollTo) {
          window.__lenis.instance.scrollTo(0, { immediate: false });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 150);
    } else if (item.isAbout && location.pathname === "/about") {
      setTimeout(() => {
        if (window.__lenis?.instance?.scrollTo) {
          window.__lenis.instance.scrollTo(0, { immediate: false });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 150);
    } else if (item.isContact && location.pathname === "/contact") {
      setTimeout(() => {
        if (window.__lenis?.instance?.scrollTo) {
          window.__lenis.instance.scrollTo(0, { immediate: false });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 150);
    }
  };

  const siteName = settings?.site?.name || DEFAULT_BRAND_NAME;
  const activeLogoUrl = (!isDark && settings?.branding?.logo_light_url)
    ? settings.branding.logo_light_url
    : (settings?.branding?.logo_url || settings?.branding?.logo_dark_url || DEFAULT_LOGO_URL);

  const isTransparent = transparent && !isScrolled && !menuOpen;

  return (
    <>
      <header
        className={`header-nav ${className}`.trim()}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          height: "var(--header-height)",
          zIndex: 9999, // High z-index to stay above everything
          backgroundColor: isDark ? "#000000" : "#FFFFFF",
          backdropFilter: "none",
          WebkitBackdropFilter: "none",
          borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.08)",
          display: menuOpen ? "none" : "flex",
          alignItems: "center",
          transform: isVisible ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease, border-color 0.2s ease",
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
          {/* Logo / Brand Name - completely stable with no shadow or action on nav click */}
          <Link
            to="/"
            onClick={handleHomeClick}
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              zIndex: 10000,
              boxShadow: "none",
              border: "none",
              outline: "none",
            }}
          >
            <img
              src={activeLogoUrl}
              alt={siteName}
              style={{
                height: "96px",
                maxHeight: "100px",
                width: "auto",
                maxWidth: "380px",
                objectFit: "contain",
                borderRadius: "4px",
                display: "block",
                border: "none",
                boxShadow: "none",
                filter: "none",
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
            <Link
              to="/"
              onClick={handleHomeClick}
              style={{ fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text)", transition: "color 0.3s ease" }}
            >
              {t("home", { defaultValue: "Home" })}
            </Link>
            <Link to="/cars" style={{ fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text)", transition: "color 0.3s ease" }}>
              {t("cars", { defaultValue: "Cars" })}
            </Link>
            <Link to="/sell-your-car" style={{ fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text)", transition: "color 0.3s ease" }}>
              {t("sellYourCar")}
            </Link>
            <Link
              to="/about"
              onClick={handleAboutClick}
              style={{ fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text)", transition: "color 0.3s ease" }}
            >
              {t("about")}
            </Link>
            <Link
              to="/reviews"
              onClick={handleReviewsClick}
              style={{ fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text)", transition: "color 0.3s ease" }}
            >
              {t("reviews", { defaultValue: "Bewertungen" })}
            </Link>
            <Link
              to="/contact"
              onClick={handleContactClick}
              style={{ fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text)", transition: "color 0.3s ease" }}
            >
              {t("contact", { defaultValue: "Kontakt" })}
            </Link>
          </nav>

          {/* Right Action Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", zIndex: 10000 }}>
            
            <div className="hide-mobile" style={{ opacity: menuOpen ? 0 : 1, transition: "opacity 0.3s ease", pointerEvents: menuOpen ? 'none' : 'auto', display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
              <LanguageSwitcher />

              {/* Favorites Action Button (Desktop) */}
              <Link
                to="/account/favorites"
                title={t("favorites", { defaultValue: "Favoriten" })}
                style={{
                  position: "relative",
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-accent-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: favorites.length > 0 ? "#ef4444" : "var(--color-text)",
                  border: favorites.length > 0 ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid var(--color-border)",
                  transition: "all 0.25s ease",
                  textDecoration: "none",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-surface)";
                  e.currentTarget.style.borderColor = "var(--color-secondary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-accent-subtle)";
                  e.currentTarget.style.borderColor = favorites.length > 0 ? "rgba(239, 68, 68, 0.5)" : "var(--color-border)";
                }}
              >
                <Icon name={favorites.length > 0 ? "heart-filled" : "heart"} size={18} color={favorites.length > 0 ? "#ef4444" : "currentColor"} />
                {favorites.length > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-4px",
                      minWidth: "18px",
                      height: "18px",
                      borderRadius: "9px",
                      backgroundColor: "#D4AF37",
                      color: "#000000",
                      fontSize: "10px",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 4px",
                      lineHeight: 1,
                      boxShadow: "none",
                    }}
                  >
                    {favorites.length}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                  <Link
                    to="/account"
                    title={t("profile", { ns: "account", defaultValue: "Profile" })}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-accent-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-text)",
                      transition: "all 0.3s ease",
                      border: "1px solid var(--color-border)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--color-text)";
                      e.currentTarget.style.color = "var(--color-background)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--color-accent-subtle)";
                      e.currentTarget.style.color = "var(--color-text)";
                    }}
                  >
                    <Icon name="user" size={18} />
                  </Link>
                  {/* Theme Switcher replaces Logout button on desktop */}
                  <ThemeToggle size="desktop" />
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                  <Button as={Link} to="/login" variant="secondary" size="sm" style={{ borderRadius: "0px" }}> {/* Sharper edges for premium feel */}
                    {t("login")}
                  </Button>
                  {/* Theme Switcher replaces Logout button spot on desktop */}
                  <ThemeToggle size="desktop" />
                </div>
              )}
            </div>

            {/* Mobile Actions: Language only */}
            <div className="hide-desktop" style={{ display: menuOpen ? "none" : "flex", alignItems: "center" }}>
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

      {/* Full Screen Cinematic Menu (No Scroll in All Languages & Modes) */}
      <div 
        ref={menuBgRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100dvh",
          maxHeight: "100dvh",
          boxSizing: "border-box",
          backgroundColor: "var(--color-background)",
          zIndex: 9998,
          display: menuOpen ? "flex" : "none", // Avoid rendering when closed to prevent interaction
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "clamp(12px, 2.5vh, 22px)",
          paddingBottom: "clamp(14px, 3vh, 24px)",
          paddingLeft: "clamp(16px, 4vw, 24px)",
          paddingRight: "clamp(16px, 4vw, 24px)",
          overflow: "hidden",
          overflowY: "hidden",
          overflowX: "hidden",
          touchAction: "none",
          overscrollBehavior: "none",
          WebkitOverflowScrolling: "auto",
          transform: "translateY(-100%)", // Initial state for GSAP
        }}
      >
        {/* Mobile Menu Top Bar: Close Button */}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            flexShrink: 0,
            zIndex: 10001,
          }}
        >
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close menu"
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              backgroundColor: "var(--color-accent-subtle)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-surface)";
              e.currentTarget.style.borderColor = "var(--color-secondary)";
              e.currentTarget.style.color = "var(--color-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-accent-subtle)";
              e.currentTarget.style.borderColor = "var(--color-border)";
              e.currentTarget.style.color = "var(--color-text)";
            }}
          >
            ✕
          </button>
        </div>

        <nav style={{ 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center",
          alignItems: "center",
          gap: "clamp(4px, 1.2vh, 10px)", 
          textAlign: "center",
          width: "100%",
          maxWidth: "420px",
          margin: "auto 0",
          flex: "1 1 auto",
          overflow: "hidden",
        }}>
          {[
            { to: "/", label: t("home", { defaultValue: "Home" }), isHome: true },
            { to: "/cars", label: t("inventory") },
            { to: "/sell-your-car", label: t("sellYourCar") },
            { to: "/reviews", label: t("reviews", { defaultValue: "Bewertungen" }) },
            { to: "/about", label: t("about"), isAbout: true },
            { to: "/contact", label: t("contact"), isContact: true }
          ].map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => handleMobileNavClick(item)}
              ref={el => menuItemsRef.current[i] = el}
              style={{ 
                fontSize: "clamp(1.1rem, 2.7vh, 1.55rem)", 
                fontWeight: 700, 
                color: "var(--color-text)", 
                textDecoration: "none",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                opacity: 0, // Initial state for GSAP
                display: "block",
                padding: "clamp(4px, 0.9vh, 8px) 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid transparent",
                backgroundColor: "transparent",
                lineHeight: 1.2,
                transition: "color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-secondary)";
                e.currentTarget.style.backgroundColor = "var(--color-accent-subtle)";
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--color-text)";
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              {item.label}
            </Link>
          ))}
          
          {/* Mobile Menu Bottom: Exactly 3 Centered Circular Icons with White Border */}
          <div 
            ref={el => menuItemsRef.current[6] = el} 
            style={{ 
              marginTop: "clamp(8px, 1.8vh, 16px)", 
              opacity: 0, 
              display: "flex", 
              flexDirection: "row", 
              gap: "20px",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              flexShrink: 0,
            }}
          >
            {/* 1. Favorites Icon with Live Count Badge */}
            <Link
              to="/account/favorites"
              onClick={closeMenu}
              aria-label={t("favorites", { defaultValue: "Favoriten" })}
              title={t("favorites", { defaultValue: "Favoriten" })}
              style={{
                position: "relative",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                border: favorites.length > 0 ? "1.5px solid #ef4444" : "1.5px solid var(--color-text)",
                backgroundColor: favorites.length > 0 ? "rgba(239, 68, 68, 0.12)" : "transparent",
                color: favorites.length > 0 ? "#ef4444" : "var(--color-text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textDecoration: "none",
                flexShrink: 0,
                boxShadow: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-accent-subtle)";
                e.currentTarget.style.borderColor = "var(--color-secondary)";
                e.currentTarget.style.color = "var(--color-secondary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = favorites.length > 0 ? "rgba(239, 68, 68, 0.12)" : "transparent";
                e.currentTarget.style.borderColor = favorites.length > 0 ? "#ef4444" : "var(--color-text)";
                e.currentTarget.style.color = favorites.length > 0 ? "#ef4444" : "var(--color-text)";
              }}
            >
              <Icon name={favorites.length > 0 ? "heart-filled" : "heart"} size={19} color={favorites.length > 0 ? "#ef4444" : "currentColor"} />
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  minWidth: "18px",
                  height: "18px",
                  borderRadius: "9px",
                  backgroundColor: "#D4AF37",
                  color: "#000000",
                  fontSize: "10px",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                  lineHeight: 1,
                  boxShadow: "none",
                  border: "1px solid rgba(0, 0, 0, 0.2)",
                }}
              >
                {favorites.length}
              </span>
            </Link>

            {/* 2. Profile Icon */}
            <Link
              to={isUserLoggedIn ? "/account" : "/login"}
              onClick={closeMenu}
              aria-label={t("profile", { ns: "account", defaultValue: "Profile" })}
              title={t("profile", { ns: "account", defaultValue: "Profile" })}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                border: "1.5px solid var(--color-text)",
                backgroundColor: "transparent",
                color: "var(--color-text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textDecoration: "none",
                flexShrink: 0,
                boxShadow: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-accent-subtle)";
                e.currentTarget.style.borderColor = "var(--color-secondary)";
                e.currentTarget.style.color = "var(--color-secondary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "var(--color-text)";
                e.currentTarget.style.color = "var(--color-text)";
              }}
            >
              <Icon name="user" size={19} color="currentColor" />
            </Link>

            {/* 3. Theme Toggle Switch (replaces Logout in mobile menu and closes menu upon toggle) */}
            <ThemeToggle size="mobile" onClick={closeMenu} />
          </div>
        </nav>
      </div>
    </>
  );
}

export default HeaderNav;
