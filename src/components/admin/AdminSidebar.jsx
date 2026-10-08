import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { useSettings, DEFAULT_LOGO_URL, DEFAULT_BRAND_NAME } from "../../contexts/SettingsContext";
import notificationsService from "../../services/notifications/notifications.service";
import AdminNavItem from "./AdminNavItem";
import Badge from "../ui/Badge";
import Icon from "../common/Icon";

export function AdminSidebar({ className = "", style = {} }) {
  const { t } = useTranslation(["admin", "common"]);
  const { user, role, logout } = useAdminAuth();
  const { settings } = useSettings?.() || {};
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const brandName = settings?.site?.name || DEFAULT_BRAND_NAME;

  const [adminTheme, setAdminTheme] = useState(() => {
    return typeof window !== "undefined" ? localStorage.getItem("admin_theme") || "light" : "light";
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const current = document.documentElement.getAttribute("data-admin-theme") || "light";
      setAdminTheme(current);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-admin-theme"] });
    return () => observer.disconnect();
  }, []);

  const logoUrl = (adminTheme === "light" && settings?.branding?.logo_light_url)
    ? settings.branding.logo_light_url
    : (settings?.branding?.logo_url || DEFAULT_LOGO_URL);

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const res = await notificationsService.getNotifications({ is_read: false, limit: 1 });
        if (isMounted) {
          setUnreadCount(res?.data?.unread_count ?? 0);
        }
      } catch {
        if (isMounted) setUnreadCount(0);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);

    const handleUpdate = (e) => {
      if (e?.detail?.unreadCount !== undefined) {
        setUnreadCount(e.detail.unreadCount);
      } else {
        fetchUnread();
      }
    };
    window.addEventListener("notificationsUpdated", handleUpdate);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("notificationsUpdated", handleUpdate);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const navItems = [
    { to: "/admincoresecure", end: true, label: t("dashboard", { defaultValue: "Dashboard" }), icon: "layout" },
    { to: "/admincoresecure/cars", end: false, label: t("inventory", { defaultValue: "Inventory" }), icon: "car" },
    { to: "/admincoresecure/forms", end: false, label: t("forms", { defaultValue: "Forms" }), icon: "mail" },
    { to: "/admincoresecure/reviews", end: false, label: t("reviews", { defaultValue: "Reviews" }), icon: "star" },
    {
      to: "/admincoresecure/notifications",
      end: false,
      label: t("notifications", { defaultValue: "Notifications" }),
      icon: "bell",
      badgeCount: unreadCount,
    },
    ...(isAdmin
      ? [
          {
            to: "/admincoresecure/users",
            end: false,
            label: t("userManagement", { defaultValue: "User Management" }),
            icon: "users",
          },
        ]
      : []),
    { to: "/admincoresecure/profile", end: false, label: t("profile", { defaultValue: "Profile" }), icon: "user" },
    { to: "/admincoresecure/settings", end: false, label: t("settings", { defaultValue: "Settings" }), icon: "settings" },
  ];

  return (
    <>
      <aside
        className={`admin-sidebar hide-mobile ${className}`.trim()}
        style={{
          width: "var(--admin-sidebar-width)",
          backgroundColor: "var(--color-admin-sidebar)",
          borderRight: "1px solid var(--color-admin-border)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          height: "100vh",
          position: "sticky",
          top: 0,
          zIndex: 60,
          transition: "background-color 0.25s ease, border-color 0.25s ease",
          ...style,
        }}
      >
        {/* Brand Header */}
        <Link
          to="/admincoresecure"
          style={{
            padding: "18px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            borderBottom: "1px solid var(--color-admin-border)",
            textDecoration: "none",
          }}
        >
          {logoUrl && (
            <img
              src={logoUrl}
              alt={brandName}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "8px",
                objectFit: "contain",
                backgroundColor: adminTheme === "light" ? "#f8fafc" : "#000000",
                padding: "2px",
                border: "1px solid var(--color-admin-border)",
                flexShrink: 0,
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: 0 }}>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: "-0.2px",
                color: "var(--color-admin-text, #0f172a)",
                lineHeight: 1.25,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={t("adminTitle", { defaultValue: "Admin" })}
            >
              {t("adminTitle", { defaultValue: "Admin" })}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  backgroundColor: "var(--color-admin-accent-subtle)",
                  color: "var(--color-admin-accent)",
                  fontSize: "9px",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                {isSuperAdmin ? "SUPER ADMIN" : "ADMIN"}
              </span>
              <span style={{ fontSize: "11px", color: "var(--color-admin-muted)" }}>
                Portal
              </span>
            </div>
          </div>
        </Link>

        {/* Navigation Sections */}
        <nav
          style={{
            flex: 1,
            padding: "16px 12px 16px 0",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          {navItems.map((item) => (
            <AdminNavItem
              key={item.to}
              to={item.to}
              end={item.end}
              label={item.label}
              icon={item.icon}
              badgeCount={item.badgeCount}
            />
          ))}
        </nav>

        {/* Footer Navigation (Website Link & Logout) */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--color-admin-border)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "var(--color-admin-muted)",
              textDecoration: "none",
              padding: "6px 8px",
              borderRadius: "6px",
              transition: "all 0.15s ease",
            }}
          >
            <Icon name="external-link" size={14} />
            <span>{t("backToWebsite", { defaultValue: "Back to Website" })}</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--color-admin-logout-text)",
              backgroundColor: "var(--color-admin-logout-bg)",
              border: "1px solid rgba(239, 68, 68, 0.15)",
              padding: "10px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              transition: "all 0.15s ease",
            }}
          >
            <Icon name="log-out" size={16} />
            <span>{t("logout", { defaultValue: "Logout" })}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
