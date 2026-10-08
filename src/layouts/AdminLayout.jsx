import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminMobileNav from "../components/admin/AdminMobileNav";
import AdminHeader from "../components/admin/AdminHeader";
import AdminErrorBoundary from "../components/admin/AdminErrorBoundary";

export function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [adminTheme, setAdminTheme] = useState(() => {
    return localStorage.getItem("admin_theme") || "light";
  });

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-admin-theme", adminTheme);
      document.body.setAttribute("data-admin-theme", adminTheme);
    }
    return () => {
      if (typeof document !== "undefined") {
        document.documentElement.removeAttribute("data-admin-theme");
        document.body.removeAttribute("data-admin-theme");
      }
    };
  }, [adminTheme]);

  const toggleAdminTheme = () => {
    setAdminTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("admin_theme", next);
      return next;
    });
  };

  return (
    <div
      className="admin-layout"
      data-admin-theme={adminTheme}
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--color-admin-bg)",
        color: "var(--color-admin-text)",
        position: "relative",
        transition: "background-color 0.25s ease, color 0.25s ease",
      }}
    >
      {/* Desktop Fixed Sidebar */}
      <AdminSidebar />

      {/* Mobile Drawer Navigation */}
      <AdminMobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Main Admin Work Area */}
      <div
        className="admin-main-container"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: "100vh",
        }}
      >
        <main
          style={{
            flex: 1,
            padding: "clamp(16px, 2.5vw, 32px)",
            maxWidth: "1600px",
            width: "100%",
            margin: "0 auto",
          }}
        >
          {/* Floating Top Header Card */}
          <AdminHeader
            onOpenMobileNav={() => setMobileNavOpen(true)}
            adminTheme={adminTheme}
            toggleAdminTheme={toggleAdminTheme}
          />

          <AdminErrorBoundary>
            <Outlet />
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
