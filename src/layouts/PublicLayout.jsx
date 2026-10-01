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
    </div>
  );
}

export default PublicLayout;
