import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings } from "../contexts/SettingsContext";
import { useSmoothScroll } from "../hooks/useAnimation";
import HeaderNav from "../components/layout/HeaderNav";

export function PublicLayout() {
  const { t } = useTranslation(["navigation", "common"]);
  const { settings } = useSettings();

  // Initialize accessible smooth scrolling
  useSmoothScroll(true);

  const siteName = settings?.site?.name || "German Auto";

  return (
    <div className="public-layout" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Dynamic Header Primitive */}
      <HeaderNav />

      {/* Main Page Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Outlet />
      </main>

      {/* Global Footer */}
      <footer
        style={{
          backgroundColor: "var(--color-background)", // Strictly black
          borderTop: "1px solid var(--color-border)",
          padding: "var(--space-2xl) 0 var(--space-xl)",
          marginTop: "auto",
        }}
      >
        <div className="container flex flex-col gap-lg items-center justify-between" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", margin: 0 }}>
            {settings?.footer?.copyright_de || `© ${new Date().getFullYear()} ${siteName}. Alle Rechte vorbehalten.`}
          </p>
          <div style={{ display: "flex", gap: "var(--space-md)", fontSize: "0.875rem" }}>
            <Link to="/about" style={{ color: "var(--color-text-muted)" }}>{t("about")}</Link>
            <Link to="/contact" style={{ color: "var(--color-text-muted)" }}>{t("contact")}</Link>
            <Link to="/cars" style={{ color: "var(--color-text-muted)" }}>{t("inventory")}</Link>
          </div>
        </div>
      </footer>

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
