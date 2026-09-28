import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import notificationsService from "../../services/notifications/notifications.service";
import AdminBreadcrumbs from "./AdminBreadcrumbs";
import AdminUserMenu from "./AdminUserMenu";
import LanguageSwitcher from "../common/LanguageSwitcher";
import IconButton from "../ui/IconButton";
import Icon from "../common/Icon";

export function AdminHeader({ onOpenMobileNav, className = "", style = {} }) {
  const { t } = useTranslation(["admin", "common"]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchUnreadCount = async () => {
      try {
        const res = await notificationsService.getNotifications({ status: "unread", limit: 1 });
        if (isMounted) {
          const count = res?.data?.unread_count ?? 0;
          setUnreadCount(count);
        }
      } catch {
        // Silently fallback to 0 if notifications fail
        if (isMounted) setUnreadCount(0);
      }
    };

    fetchUnreadCount();

    // Re-check periodically every 60s
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header
      className={`admin-header ${className}`.trim()}
      style={{
        height: "64px",
        backgroundColor: "var(--color-admin-sidebar)",
        borderBottom: "1px solid var(--color-admin-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(var(--space-md), 3vw, var(--space-xl))",
        position: "sticky",
        top: 0,
        zIndex: 50,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
        {/* Mobile menu hamburger toggle button */}
        <div className="hide-desktop">
          <IconButton
            icon="menu"
            ariaLabel="Admin-Menü öffnen"
            variant="ghost"
            size="sm"
            onClick={onOpenMobileNav}
          />
        </div>

        <AdminBreadcrumbs />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
        {/* Notifications Shortcut with unread badge */}
        <Link
          to="/admincoresecure/notifications"
          title={t("notifications")}
          aria-label={t("notifications")}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-admin-border)",
            color: "var(--color-admin-muted)",
            textDecoration: "none",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--color-secondary)";
            e.currentTarget.style.borderColor = "var(--color-secondary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-admin-muted)";
            e.currentTarget.style.borderColor = "var(--color-admin-border)";
          }}
        >
          <Icon name="bell" size={17} />
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                backgroundColor: "var(--color-secondary)",
                color: "var(--color-primary)",
                fontSize: "10px",
                fontWeight: 700,
                minWidth: "16px",
                height: "16px",
                borderRadius: "var(--radius-full)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* User Monogram & Logout */}
        <AdminUserMenu />
      </div>
    </header>
  );
}

export default AdminHeader;
