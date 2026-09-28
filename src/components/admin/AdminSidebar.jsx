import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import notificationsService from "../../services/notifications/notifications.service";
import AdminNavItem from "./AdminNavItem";
import Badge from "../ui/Badge";
import Icon from "../common/Icon";

export function AdminSidebar({ className = "", style = {} }) {
  const { t } = useTranslation(["admin", "common"]);
  const { logout } = useAuth();
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
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/admincoresecure", end: true, label: t("dashboard"), icon: "layout" },
    { to: "/admincoresecure/settings", end: false, label: t("settings"), icon: "settings" },
    { to: "/admincoresecure/cars", end: false, label: t("inventory"), icon: "car" },
    { to: "/admincoresecure/forms", end: false, label: t("forms"), icon: "mail" },
    { to: "/admincoresecure/reviews", end: false, label: t("reviews"), icon: "star" },
    {
      to: "/admincoresecure/notifications",
      end: false,
      label: t("notifications"),
      icon: "bell",
      badgeCount: unreadCount,
    },
  ];

  return (
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
        ...style,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: "var(--space-lg) var(--space-md)",
          borderBottom: "1px solid var(--color-admin-border)",
        }}
      >
        <Link
          to="/admincoresecure"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-xs)",
            textDecoration: "none",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-family-display)",
              fontSize: "1.125rem",
              fontWeight: 800,
              letterSpacing: "0.5px",
              color: "#ffffff",
            }}
          >
            ADMINCORE
          </span>
          <Badge variant="secondary" size="sm">
            CMS
          </Badge>
        </Link>
        <div style={{ fontSize: "11px", color: "var(--color-admin-muted)", marginTop: "4px" }}>
          German Auto Control Center
        </div>
      </div>

      {/* Navigation Sections */}
      <nav
        style={{
          flex: 1,
          padding: "var(--space-md) var(--space-sm)",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
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

      {/* Footer Navigation (Website / Customer Portal / Logout) */}
      <div
        style={{
          padding: "var(--space-md)",
          borderTop: "1px solid var(--color-admin-border)",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-admin-muted)",
            textDecoration: "none",
            padding: "8px 10px",
            borderRadius: "var(--radius-sm)",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-admin-muted)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <Icon name="external-link" size={14} />
          <span>{t("backToWebsite")}</span>
        </Link>

        <Link
          to="/account"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-admin-muted)",
            textDecoration: "none",
            padding: "8px 10px",
            borderRadius: "var(--radius-sm)",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-admin-muted)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <Icon name="user" size={14} />
          <span>{t("customerArea")}</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-error)",
            background: "none",
            border: "none",
            padding: "8px 10px",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            textAlign: "left",
            width: "100%",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <Icon name="log-out" size={14} />
          <span>{t("logout")}</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
