import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import notificationsService from "../../services/notifications/notifications.service";
import AdminNavItem from "./AdminNavItem";
import Badge from "../ui/Badge";
import Icon from "../common/Icon";

export function AdminSidebar({ className = "", style = {} }) {
  const { t } = useTranslation(["admin", "common"]);
  const { user, role, logout } = useAdminAuth();
  const isSuperAdmin = role === "SUPER_ADMIN";
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

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
    { to: "/admincoresecure", end: true, label: "Dashboard", icon: "layout" },
    { to: "/admincoresecure/cars", end: false, label: "Inventory", icon: "car" },
    { to: "/admincoresecure/forms", end: false, label: "Forms", icon: "mail" },
    { to: "/admincoresecure/reviews", end: false, label: "Reviews", icon: "star" },
    {
      to: "/admincoresecure/notifications",
      end: false,
      label: "Notifications",
      icon: "bell",
      badgeCount: unreadCount,
    },
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
        <div
          style={{
            padding: "24px 20px 20px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            borderBottom: "1px solid var(--color-admin-border)",
          }}
        >
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              letterSpacing: "-0.3px",
              color: "var(--color-admin-text)",
              lineHeight: 1.2,
            }}
          >
            Admin Panel
          </span>
          <div>
            <span
              style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: "4px",
                border: "1px solid #3b82f6",
                backgroundColor: "var(--color-admin-accent-subtle)",
                color: "var(--color-admin-accent)",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
              }}
            >
              {isSuperAdmin ? "SUPER ADMIN" : "ADMIN"}
            </span>
          </div>
        </div>

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
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
