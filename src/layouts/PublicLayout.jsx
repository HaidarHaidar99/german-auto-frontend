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
          backgroundColor: "var(--color-primary)",
          borderTop: "1px solid var(--color-border)",
          padding: "var(--space-2xl) 0 var(--space-xl)",
          marginTop: "auto",
        }}
      >
        <div className="container flex flex-col gap-lg items-center justify-between" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--color-muted)", fontSize: "0.875rem", margin: 0 }}>
            {settings?.footer?.copyright_de || `© ${new Date().getFullYear()} ${siteName}. Alle Rechte vorbehalten.`}
          </p>
          <div style={{ display: "flex", gap: "var(--space-md)", fontSize: "0.875rem" }}>
            <Link to="/about" style={{ color: "var(--color-muted)" }}>{t("about")}</Link>
            <Link to="/contact" style={{ color: "var(--color-muted)" }}>{t("contact")}</Link>
            <Link to="/cars" style={{ color: "var(--color-muted)" }}>{t("inventory")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
