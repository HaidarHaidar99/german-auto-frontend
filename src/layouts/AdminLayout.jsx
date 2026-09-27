import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import LanguageSwitcher from "../components/common/LanguageSwitcher";

export function AdminLayout() {
  const { t } = useTranslation(["admin", "common"]);
  const { user, role, logout } = useAuth();

  return (
    <div
      className="admin-layout"
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--color-admin-bg)",
        color: "var(--color-admin-text)",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "var(--admin-sidebar-width)",
          backgroundColor: "var(--color-admin-sidebar)",
          borderRight: "1px solid var(--color-admin-border)",
          padding: "var(--space-lg) var(--space-md)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-xl)",
        }}
      >
        <div>
          <Link
            to="/admincoresecure"
            style={{
              fontSize: "1.125rem",
              fontWeight: 800,
              color: "var(--color-admin-text)",
              letterSpacing: "-0.5px",
            }}
          >
            ADMINCORE
          </Link>
          <div style={{ fontSize: "0.75rem", color: "var(--color-admin-muted)", marginTop: "4px" }}>
            German Auto Control Center
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
          <Link
            to="/admincoresecure"
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              color: "var(--color-admin-text)",
              fontWeight: 500,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            }}
          >
            {t("dashboard")}
          </Link>
        </nav>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
          <Link
            to="/"
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-admin-muted)",
              padding: "6px 0",
            }}
          >
            ← Zurück zur Website
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Container */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Admin Topbar */}
        <header
          style={{
            height: "64px",
            borderBottom: "1px solid var(--color-admin-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 var(--space-xl)",
            backgroundColor: "var(--color-admin-sidebar)",
          }}
        >
          <div style={{ fontSize: "0.875rem", color: "var(--color-admin-muted)" }}>
            Sichere Verwaltungssitzung
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-lg)" }}>
            <LanguageSwitcher />

            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--color-secondary)",
                  color: "var(--color-primary)",
                }}
              >
                {role}
              </span>
              <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                {user?.full_name || user?.email}
              </span>
            </div>

            <button
              onClick={logout}
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-error)",
                fontWeight: 600,
                padding: "6px 12px",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "var(--radius-md)",
              }}
            >
              Abmelden
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main style={{ flex: 1, padding: "var(--space-xl)", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
