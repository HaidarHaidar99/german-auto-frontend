import React, { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings, DEFAULT_BRAND_NAME } from "../contexts/SettingsContext";
import { useSmoothScroll } from "../hooks/useAnimation";
import HeaderNav from "../components/layout/HeaderNav";
import Footer from "../components/layout/Footer";

export function PublicLayout() {
  const { t } = useTranslation(["navigation", "common"]);
  const { settings } = useSettings();

  // Initialize accessible smooth scrolling
  useSmoothScroll(true);

  const location = useLocation();
  const siteName = settings?.site?.name || DEFAULT_BRAND_NAME;

  // Handle URL hash anchor scrolling (e.g. /#reviews) and home top scroll
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      let cancelled = false;
      let count = 0;

      const performScroll = () => {
        if (cancelled) return;
        const el = document.getElementById(id);
        if (el) {
          if (window.__lenis?.instance?.scrollTo) {
            window.__lenis.instance.scrollTo(el, { offset: -70, immediate: count === 0 ? false : true });
          } else {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
        if (count < 6) {
          count++;
          setTimeout(performScroll, count * 150);
        }
      };

      performScroll();

      return () => {
        cancelled = true;
      };
    } else if (location.pathname === "/" && !location.hash) {
      // Direct navigation to home with no hash: ensure scroll to top
      if (window.__lenis?.instance?.scrollTo) {
        window.__lenis.instance.scrollTo(0, { immediate: false });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="public-layout" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Dynamic Header Primitive */}
      <HeaderNav />

      {/* Fixed Header Spacer */}
      <div style={{ height: "var(--header-height)", flexShrink: 0 }} aria-hidden="true" />

      {/* Main Page Content with Fluid Page-to-Page Entrance Animation */}
      <main
        key={location.pathname}
        className="page-transition-enter"
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        <Outlet />
      </main>

      {/* Global Luxury Footer */}
      <Footer />

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
        style={{
          position: "fixed",
          bottom: "var(--space-xl)",
          right: "var(--space-xl)",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 9000,
          boxShadow: "var(--shadow-card)",
          transition: "transform 0.3s ease, background-color 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.backgroundColor = "var(--color-border-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.backgroundColor = "var(--color-surface)";
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      </button>
    </div>
  );
}

export default PublicLayout;
