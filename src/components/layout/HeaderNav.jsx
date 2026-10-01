import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings, DEFAULT_BRAND_NAME, DEFAULT_LOGO_URL } from "../../contexts/SettingsContext";
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
  const { isAuthenticated, logout, isAdmin, favorites = [], user } = useAuth();
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

  // Always ensure header is visible, close mobile menu, and reset scroll tracking on route change
  useEffect(() => {
    if (menuOpen) {
      closeMenu();
    }
    setIsVisible(true);
    setIsScrolled(false);
    lastScrollY.current = 0;
  }, [location.pathname, location.search]);

  const upScrollAccumulator = useRef(0);
  const downScrollAccumulator = useRef(0);

  // Dynamic header visibility: smooth and deliberate scrolling/touch response
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      const currentScrollY = Math.max(0, window.scrollY || document.documentElement?.scrollTop || document.body?.scrollTop || 0);
      const diff = currentScrollY - lastScrollY.current;

      if (menuOpen || currentScrollY <= 60) {
        setIsVisible(true);
        upScrollAccumulator.current = 0;
        downScrollAccumulator.current = 0;
      } else if (diff > 0) {
        // Scrolling down
        downScrollAccumulator.current += diff;
        upScrollAccumulator.current = 0;
        if (downScrollAccumulator.current > 20 && currentScrollY > 80) {
          setIsVisible(false);
        }
      } else if (diff < 0) {
        // Scrolling up - require deliberate smooth upward scroll (~25px)
        upScrollAccumulator.current += Math.abs(diff);
        downScrollAccumulator.current = 0;
        if (upScrollAccumulator.current > 25) {
          setIsVisible(true);
        }
      }

      setIsScrolled(currentScrollY > 20);
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

    // Desktop mouse wheel listener for smooth natural scroll
    let wheelDeltaAccumulator = 0;
    let wheelTimer = null;
    const handleWheel = (e) => {
      if (menuOpen) return;
      const currentScrollY = Math.max(0, window.scrollY || document.documentElement?.scrollTop || 0);
      if (currentScrollY <= 60) {
        setIsVisible(true);
        return;
      }

      wheelDeltaAccumulator += e.deltaY;
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        wheelDeltaAccumulator = 0;
      }, 200);

      if (wheelDeltaAccumulator < -40) {
        // Smooth intentional upward movement
        setIsVisible(true);
      } else if (wheelDeltaAccumulator > 30 && currentScrollY > 80) {
        // Smooth downward movement
        setIsVisible(false);
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: true });

    // Mobile touch listener for smooth, natural gestures
    let touchStartY = 0;
    const handleTouchStart = (e) => {
      if (e.touches?.[0]) touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e) => {
      if (menuOpen || !e.touches?.[0]) return;
      const currentTouchY = e.touches[0].clientY;
      const touchDiff = currentTouchY - touchStartY;
      const currentScrollY = Math.max(0, window.scrollY || document.documentElement?.scrollTop || 0);

      if (currentScrollY <= 60) {
        setIsVisible(true);
      } else if (touchDiff > 25) {
        // Smooth deliberate touch swipe down (scroll content up)
        setIsVisible(true);
      } else if (touchDiff < -25) {
        // Smooth deliberate touch swipe up (scroll content down)
        setIsVisible(false);
      }
    };
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // Dynamic subscription to Lenis smooth scroll engine
    const lenisInterval = setInterval(() => {
      if (window.__lenis && typeof window.__lenis.on === "function" && !window.__lenis.__hasHeaderAttached) {
        window.__lenis.on("scroll", handleScroll);
        window.__lenis.__hasHeaderAttached = true;
      }
    }, 150);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      clearInterval(lenisInterval);
      clearTimeout(wheelTimer);
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

  const handleReviewsClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      const el = document.getElementById("reviews");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleMobileNavClick = (item) => {
    closeMenu();
    if (item.isReviews && location.pathname === "/") {
      setTimeout(() => {
        const el = document.getElementById("reviews");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 350);
    }
  };

  const siteName = settings?.site?.name || DEFAULT_BRAND_NAME;
  const activeLogoUrl = settings?.branding?.logo_url || DEFAULT_LOGO_URL;

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
          backgroundColor: isTransparent ? "transparent" : "rgba(0, 0, 0, 0.85)",
          backdropFilter: isTransparent ? "none" : "blur(16px)",
          WebkitBackdropFilter: isTransparent ? "none" : "blur(16px)",
          borderBottom: isTransparent ? "none" : "1px solid var(--color-border)",
          display: menuOpen ? "none" : "flex",
          alignItems: "center",
          transform: isVisible ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease, border-color 0.25s ease",
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
            onClick={() => menuOpen && closeMenu()}
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
            <Link
              to="/#reviews"
              onClick={handleReviewsClick}
              style={{ fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#ffffff", transition: "color 0.3s ease" }}
            >
              {t("reviews", { defaultValue: "Bewertungen" })}
            </Link>
            <Link to="/contact" style={{ fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#ffffff", transition: "color 0.3s ease" }}>
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
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: favorites.length > 0 ? "#ef4444" : "#ffffff",
                  border: favorites.length > 0 ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid rgba(255, 255, 255, 0.2)",
                  transition: "all 0.25s ease",
                  textDecoration: "none",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.18)";
                  e.currentTarget.style.borderColor = "#D4AF37";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.borderColor = favorites.length > 0 ? "rgba(239, 68, 68, 0.5)" : "rgba(255, 255, 255, 0.2)";
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
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.5)",
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
        {/* Mobile Menu Top Bar: Language & Close Button */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            right: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 10001,
          }}
        >
          <LanguageSwitcher />

          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close menu"
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              color: "#ffffff",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
            }}
          >
            ✕
          </button>
        </div>

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
            { to: "/#reviews", label: t("reviews", { defaultValue: "Bewertungen" }), isReviews: true },
            { to: "/about", label: t("about") },
            { to: "/contact", label: t("contact") }
          ].map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => handleMobileNavClick(item)}
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
                transition: "color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease",
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
          
          {/* Mobile Menu Bottom: Exactly 3 Centered Circular Icons with White Border */}
          <div 
            ref={el => menuItemsRef.current[6] = el} 
            style={{ 
              marginTop: "2.5rem", 
              opacity: 0, 
              display: "flex", 
              flexDirection: "row", 
              gap: "24px",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            {/* 1. Favorites Icon */}
            <Link
              to="/account/favorites"
              onClick={closeMenu}
              aria-label={t("favorites", { defaultValue: "Favoriten" })}
              title={t("favorites", { defaultValue: "Favoriten" })}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "1.5px solid #ffffff",
                backgroundColor: "transparent",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textDecoration: "none",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Icon name="heart" size={20} color="#ffffff" />
            </Link>

            {/* 2. Profile Icon */}
            <Link
              to={isUserLoggedIn ? "/account" : "/login"}
              onClick={closeMenu}
              aria-label={t("profile", { ns: "account", defaultValue: "Profile" })}
              title={t("profile", { ns: "account", defaultValue: "Profile" })}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "1.5px solid #ffffff",
                backgroundColor: "transparent",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
                textDecoration: "none",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Icon name="user" size={20} color="#ffffff" />
            </Link>

            {/* 3. Login or Logout Icon */}
            {isUserLoggedIn ? (
              <button
                type="button"
                onClick={() => { closeMenu(); logout(); }}
                aria-label={t("logout", { defaultValue: "Abmelden" })}
                title={t("logout", { defaultValue: "Abmelden" })}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  border: "1.5px solid #ffffff",
                  backgroundColor: "transparent",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                  flexShrink: 0,
                  padding: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Icon name="log-out" size={20} color="#ffffff" />
              </button>
            ) : (
              <Link
                to="/login"
                onClick={closeMenu}
                aria-label={t("login", { defaultValue: "Anmelden" })}
                title={t("login", { defaultValue: "Anmelden" })}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  border: "1.5px solid #ffffff",
                  backgroundColor: "transparent",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                  textDecoration: "none",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Icon name="log-in" size={20} color="#ffffff" />
              </Link>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}

export default HeaderNav;
