import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import Drawer from "../ui/Drawer";
import AdminNavItem from "./AdminNavItem";
import LanguageSwitcher from "../common/LanguageSwitcher";
import Icon from "../common/Icon";

export function AdminMobileNav({ isOpen, onClose }) {
  const { t } = useTranslation(["admin", "common"]);
  const { user, role, logout, isSuperAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate("/admin/login");
  };

  const displayName =
    user?.full_name ||
    user?.name ||
    (user?.email ? user.email.split("@")[0] : "Admin");
  const avatarInitial = (displayName || "A").charAt(0).toUpperCase();

  const navItems = [
    { to: "/admincoresecure", end: true, label: "Dashboard", icon: "layout" },
    { to: "/admincoresecure/cars", end: false, label: "Inventory", icon: "car" },
    { to: "/admincoresecure/forms", end: false, label: "Forms", icon: "mail" },
    { to: "/admincoresecure/reviews", end: false, label: "Reviews", icon: "star" },
    { to: "/admincoresecure/notifications", end: false, label: "Notifications", icon: "bell" },
    ...(isSuperAdmin
      ? [
          {
            to: "/admincoresecure/users",
            end: false,
            label: "User Management",
            icon: "users",
          },
        ]
      : []),
    { to: "/admincoresecure/profile", end: false, label: "Profile", icon: "user" },
    { to: "/admincoresecure/settings", end: false, label: "Settings", icon: "settings" },
  ];

  return (
    <Drawer isOpen={isOpen} onClose={onClose} position="left" title="Admin Panel">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-md)",
          paddingTop: "var(--space-xs)",
          minHeight: "100%",
        }}
      >
        {/* Navigation Links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "var(--space-2xs)" }}>
          {navItems.map((item) => (
            <AdminNavItem
              key={item.to}
              to={item.to}
              end={item.end}
              label={item.label}
              icon={item.icon}
              onClick={onClose}
            />
          ))}
        </nav>

        <hr style={{ border: "none", borderTop: "1px solid var(--color-admin-border)", margin: "8px 0" }} />

        {/* ── Bottom Section: User Info Card & Actions ──────────────── */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingTop: "12px" }}>
          {/* User Profile Box inside Nav (At Bottom as Requested) */}
          <Link
            to="/admincoresecure/profile"
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 12px",
              backgroundColor: "var(--color-admin-border-subtle, #f8fafc)",
              border: "1px solid var(--color-admin-border, #e2e8f0)",
              borderRadius: "12px",
              textDecoration: "none",
              transition: "border-color 0.15s ease",
            }}
          >
            {/* White circle initial avatar */}
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                backgroundColor: "var(--color-admin-card, #ffffff)",
                border: "1.5px solid var(--color-admin-border, #e2e8f0)",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-admin-accent, #2563eb)",
                fontWeight: 800,
                fontSize: "14px",
                flexShrink: 0,
              }}
            >
              {avatarInitial}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--color-admin-text, #0f172a)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displayName}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--color-admin-muted, #64748b)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.email || "admin@germanauto.de"}
              </div>
            </div>

            <Icon name="chevron-right" size={14} style={{ color: "var(--color-admin-muted)" }} />
          </Link>

          <Link
            to="/"
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-admin-muted)",
              textDecoration: "none",
              padding: "8px 10px",
            }}
          >
            <Icon name="external-link" size={16} />
            <span>{t("backToWebsite")}</span>
          </Link>

          <Link
            to="/account"
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-admin-muted)",
              textDecoration: "none",
              padding: "8px 10px",
            }}
          >
            <Icon name="user" size={16} />
            <span>{t("customerArea")}</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "var(--font-size-sm)",
              fontWeight: 600,
              color: "var(--color-admin-logout-text, #ef4444)",
              backgroundColor: "var(--color-admin-logout-bg, rgba(239, 68, 68, 0.08))",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "var(--radius-md)",
              padding: "10px",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
            }}
          >
            <Icon name="log-out" size={16} />
            <span>{t("logout")}</span>
          </button>
        </div>
      </div>
    </Drawer>
  );
}

export default AdminMobileNav;
