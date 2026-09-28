import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import Drawer from "../ui/Drawer";
import AdminNavItem from "./AdminNavItem";
import LanguageSwitcher from "../common/LanguageSwitcher";
import Icon from "../common/Icon";

export function AdminMobileNav({ isOpen, onClose }) {
  const { t } = useTranslation(["admin", "common"]);
  const { logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/admincoresecure", end: true, label: t("dashboard"), icon: "layout" },
    { to: "/admincoresecure/settings", end: false, label: t("settings"), icon: "settings" },
    { to: "/admincoresecure/cars", end: false, label: t("inventory"), icon: "car" },
    { to: "/admincoresecure/forms", end: false, label: t("forms"), icon: "mail" },
    { to: "/admincoresecure/reviews", end: false, label: t("reviews"), icon: "star" },
    { to: "/admincoresecure/notifications", end: false, label: t("notifications"), icon: "bell" },
    ...(isSuperAdmin
      ? [
          {
            to: "/admincoresecure/users",
            end: false,
            label: t("userManagement", { defaultValue: "Benutzerverwaltung" }),
            icon: "users",
          },
        ]
      : []),
  ];

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="ADMINCORE">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-lg)",
          paddingTop: "var(--space-md)",
          height: "100%",
        }}
      >
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

        <hr style={{ border: "none", borderTop: "1px solid var(--color-admin-border)" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-admin-muted)" }}>Sprache / Language</span>
          <LanguageSwitcher />
        </div>

        <hr style={{ border: "none", borderTop: "1px solid var(--color-admin-border)" }} />

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
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
              padding: "10px",
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
              padding: "10px",
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
              color: "var(--color-error)",
              background: "none",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "var(--radius-md)",
              padding: "10px",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              marginTop: "var(--space-xs)",
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
