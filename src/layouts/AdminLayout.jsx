import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminMobileNav from "../components/admin/AdminMobileNav";
import AdminHeader from "../components/admin/AdminHeader";

export function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div
      className="admin-layout"
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--color-admin-bg)",
        color: "var(--color-admin-text)",
        position: "relative",
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
        <AdminHeader onOpenMobileNav={() => setMobileNavOpen(true)} />

        <main
          style={{
            flex: 1,
            padding: "clamp(var(--space-md), 3vw, var(--space-2xl))",
            maxWidth: "1600px",
            width: "100%",
            margin: "0 auto",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
