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

  // Use native high-performance hardware scrolling (disables Lenis JS interceptor lag)
  useSmoothScroll(false);

  const location = useLocation();
  const siteName = settings?.site?.name || DEFAULT_BRAND_NAME;

  // Handle URL hash anchor scrolling (e.g. /#reviews)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      let cancelled = false;

      const performScroll = () => {
        if (cancelled) return;
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      };

      const timer = setTimeout(performScroll, 100);

      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
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
