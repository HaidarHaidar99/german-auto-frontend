import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import notificationsService from "../../services/notifications/notifications.service";
import IconButton from "../ui/IconButton";
import Icon from "../common/Icon";

export function AdminHeader({
  onOpenMobileNav,
  adminTheme = "light",
  toggleAdminTheme,
  className = "",
  style = {},
}) {
  const { user, role } = useAdminAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith("en") ? "en" : "de";

  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsList, setNotificationsList] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const dropdownRef = useRef(null);

  const isSuperAdmin = role === "SUPER_ADMIN";
  const displayRole = isSuperAdmin ? "Super Admin" : "Admin";

  const displayName =
    user?.full_name ||
    user?.name ||
    (user?.email ? user.email.split("@")[0] : "Admin");

  const avatarInitial = displayName.charAt(0).toUpperCase() || "A";

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const res = await notificationsService.getNotifications({ limit: 5 });
      const items = res?.data?.notifications || res?.data?.data || [];
      const count = res?.data?.unread_count ?? items.filter((n) => !n.is_read).length;
      setNotificationsList(items);
      setUnreadCount(count);
    } catch {
      // fallback
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e?.detail?.unreadCount !== undefined) {
        setUnreadCount(e.detail.unreadCount);
        if (e.detail.unreadCount === 0) {
          setNotificationsList((prev) => prev.map((n) => ({ ...n, is_read: true })));
        }
      } else {
        fetchNotifications();
      }
    };
    window.addEventListener("notificationsUpdated", handleUpdate);
    return () => window.removeEventListener("notificationsUpdated", handleUpdate);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    if (notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationsOpen]);

  const handleNotificationClick = async (item) => {
    try {
      if (!item.is_read) {
        await notificationsService.markAsRead(item.id);
        setNotificationsList((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => {
          const next = Math.max(0, prev - 1);
          window.dispatchEvent(new CustomEvent("notificationsUpdated", { detail: { unreadCount: next } }));
          return next;
        });
      }
      setNotificationsOpen(false);
      navigate("/admincoresecure/notifications");
    } catch {
      setNotificationsOpen(false);
      navigate("/admincoresecure/notifications");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
    } catch {
      // ignore
    } finally {
      setNotificationsList((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent("notificationsUpdated", { detail: { unreadCount: 0 } }));
    }
  };

  return (
    <>
      <header
        className={`admin-header-card ${className}`.trim()}
        style={{
          backgroundColor: "var(--color-admin-card)",
          borderRadius: "16px",
          border: "1px solid var(--color-admin-border)",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          padding: "14px 20px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          transition: "background-color 0.25s ease, border-color 0.25s ease",
          position: "relative",
          zIndex: 40,
          ...style,
        }}
      >
        {/* ─── MOBILE VIEW TOP BAR (Clean & Minimalist: 3 dashes, Admin Panel, Theme & Lang) ─ */}
        <div
          className="hide-desktop"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: "10px",
          }}
        >
          {/* Left: 3 Dashes Hamburger */}
          <IconButton
            icon="menu"
            ariaLabel="Open Admin Navigation"
            variant="ghost"
            size="sm"
            onClick={onOpenMobileNav}
          />

          {/* Middle: Admin Panel Text */}
          <span
            style={{
              fontWeight: 800,
              fontSize: "16px",
              color: "var(--color-admin-text)",
              letterSpacing: "-0.3px",
            }}
          >
            Admin Panel
          </span>

          {/* Right: Theme Toggle + Language Switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Theme Toggle Logo */}
            <button
              type="button"
              onClick={toggleAdminTheme}
              title={adminTheme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
              aria-label="Toggle dark/light theme"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                border: "1px solid var(--color-admin-border)",
                backgroundColor: "var(--color-admin-pill-bg)",
                cursor: "pointer",
              }}
            >
              {adminTheme === "dark" ? (
                <Icon name="sun" size={16} style={{ color: "#facc15" }} />
              ) : (
                <Icon name="moon" size={16} style={{ color: "#2563eb" }} />
              )}
            </button>

            {/* Language Switcher */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                backgroundColor: "var(--color-admin-pill-bg)",
                border: "1px solid var(--color-admin-border)",
                borderRadius: "9999px",
                padding: "2px",
                gap: "2px",
              }}
            >
              <button
                type="button"
                onClick={() => i18n.changeLanguage("de")}
                style={{
                  padding: "3px 8px",
                  borderRadius: "9999px",
                  fontSize: "10px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: currentLang === "de" ? "var(--color-admin-accent)" : "transparent",
                  color: currentLang === "de" ? "#ffffff" : "var(--color-admin-muted)",
                }}
              >
                DE
              </button>
              <button
                type="button"
                onClick={() => i18n.changeLanguage("en")}
                style={{
                  padding: "3px 8px",
                  borderRadius: "9999px",
                  fontSize: "10px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: currentLang === "en" ? "var(--color-admin-accent)" : "transparent",
                  color: currentLang === "en" ? "#ffffff" : "var(--color-admin-muted)",
                }}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {/* ─── DESKTOP VIEW: Welcome, Role, Bell, Profile, Controls ───────── */}
        <div
          className="hide-mobile"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Left: Welcome & Role */}
          <div>
            <h1
              style={{
                fontSize: "clamp(1.25rem, 2vw, 1.5rem)",
                fontWeight: 800,
                letterSpacing: "-0.4px",
                color: "var(--color-admin-text)",
                margin: 0,
                lineHeight: 1.25,
              }}
            >
              Welcome, {displayName}
            </h1>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--color-admin-muted)",
                marginTop: "3px",
              }}
            >
              Role:{" "}
              <span style={{ color: isSuperAdmin ? "#d97706" : "var(--color-admin-accent)", fontWeight: 700 }}>
                {displayRole}
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* 1. Language Switcher (DE / EN) */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                backgroundColor: "var(--color-admin-pill-bg)",
                border: "1px solid var(--color-admin-border)",
                borderRadius: "9999px",
                padding: "2px",
                gap: "2px",
              }}
              aria-label="Language selection"
            >
              <button
                type="button"
                onClick={() => i18n.changeLanguage("de")}
                style={{
                  padding: "5px 10px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: currentLang === "de" ? "var(--color-admin-accent)" : "transparent",
                  color: currentLang === "de" ? "#ffffff" : "var(--color-admin-muted)",
                  transition: "all 0.15s ease",
                }}
                aria-pressed={currentLang === "de"}
              >
                DE
              </button>
              <button
                type="button"
                onClick={() => i18n.changeLanguage("en")}
                style={{
                  padding: "5px 10px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: currentLang === "en" ? "var(--color-admin-accent)" : "transparent",
                  color: currentLang === "en" ? "#ffffff" : "var(--color-admin-muted)",
                  transition: "all 0.15s ease",
                }}
                aria-pressed={currentLang === "en"}
              >
                EN
              </button>
            </div>

            {/* 2. Theme Toggle Logo Button (Moon / Sun) */}
            <button
              type="button"
              onClick={toggleAdminTheme}
              title={adminTheme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
              aria-label="Toggle dark/light theme"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                border: "1px solid var(--color-admin-border)",
                backgroundColor: "var(--color-admin-pill-bg)",
                color: "var(--color-admin-text)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {adminTheme === "dark" ? (
                <Icon name="sun" size={18} style={{ color: "#facc15" }} />
              ) : (
                <Icon name="moon" size={18} style={{ color: "#2563eb" }} />
              )}
            </button>

            {/* 3. Interactive Notification Bell with Dropdown */}
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  if (!notificationsOpen) fetchNotifications();
                }}
                title="Notifications"
                aria-label="Notifications"
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-admin-pill-bg)",
                  border: "1px solid var(--color-admin-border)",
                  color: "var(--color-admin-text)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <Icon name="bell" size={18} strokeWidth={2} style={{ color: "var(--color-admin-text)" }} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-3px",
                      right: "-3px",
                      backgroundColor: "var(--color-admin-accent)",
                      color: "#ffffff",
                      fontSize: "10px",
                      fontWeight: 700,
                      minWidth: "18px",
                      height: "18px",
                      borderRadius: "9999px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 4px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                    }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Popover */}
              {notificationsOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "46px",
                    right: 0,
                    width: "340px",
                    backgroundColor: "var(--color-admin-card)",
                    borderRadius: "14px",
                    border: "1px solid var(--color-admin-border)",
                    boxShadow: "0 10px 28px rgba(0, 0, 0, 0.12)",
                    padding: "0",
                    zIndex: 100,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Dropdown Header */}
                  <div
                    style={{
                      padding: "14px 16px",
                      borderBottom: "1px solid var(--color-admin-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "var(--color-admin-border-subtle)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Icon name="bell" size={16} style={{ color: "var(--color-admin-accent)" }} />
                      <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--color-admin-text)" }}>
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span
                          style={{
                            backgroundColor: "var(--color-admin-accent-subtle)",
                            color: "var(--color-admin-accent)",
                            fontSize: "11px",
                            fontWeight: 700,
                            borderRadius: "4px",
                            padding: "2px 6px",
                          }}
                        >
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--color-admin-accent)",
                          fontSize: "11px",
                          fontWeight: 600,
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                    {notificationsLoading && notificationsList.length === 0 ? (
                      <div style={{ padding: "20px", textAlign: "center", fontSize: "12px", color: "var(--color-admin-muted)" }}>
                        Loading notifications...
                      </div>
                    ) : notificationsList.length === 0 ? (
                      <div style={{ padding: "28px 16px", textAlign: "center", color: "var(--color-admin-muted)", fontSize: "13px" }}>
                        <Icon name="check-circle" size={24} style={{ color: "#10b981", marginBottom: "6px" }} />
                        <div>All caught up! No notifications.</div>
                      </div>
                    ) : (
                      notificationsList.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleNotificationClick(item)}
                          style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid var(--color-admin-border)",
                            backgroundColor: item.is_read ? "transparent" : "var(--color-admin-accent-subtle)",
                            cursor: "pointer",
                            transition: "background-color 0.15s ease",
                            display: "flex",
                            gap: "10px",
                            alignItems: "flex-start",
                          }}
                        >
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: item.is_read ? "transparent" : "var(--color-admin-accent)",
                              marginTop: "5px",
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "12px", fontWeight: item.is_read ? 600 : 700, color: "var(--color-admin-text)", marginBottom: "2px" }}>
                              {item.title || item.type || "System Notice"}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--color-admin-muted)", lineHeight: 1.35, wordBreak: "break-word" }}>
                              {item.message || item.content || "Click to view details"}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Dropdown Footer Link */}
                  <Link
                    to="/admincoresecure/notifications"
                    onClick={() => setNotificationsOpen(false)}
                    style={{
                      padding: "10px 16px",
                      textAlign: "center",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--color-admin-accent)",
                      textDecoration: "none",
                      backgroundColor: "var(--color-admin-border-subtle)",
                      borderTop: "1px solid var(--color-admin-border)",
                      display: "block",
                    }}
                  >
                    View All Notifications →
                  </Link>
                </div>
              )}
            </div>

            {/* 4. User Pill (Navigates to Profile Page) */}
            <button
              type="button"
              onClick={() => navigate("/admincoresecure/profile")}
              title="View and edit profile"
              style={{
                backgroundColor: "var(--color-admin-pill-bg)",
                borderRadius: "9999px",
                border: "1px solid var(--color-admin-border)",
                padding: "4px 16px 4px 6px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                transition: "transform 0.15s ease, border-color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-admin-accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-admin-border)";
              }}
            >
              {/* User Avatar Circle */}
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-admin-card, #ffffff)",
                  border: "1.5px solid var(--color-admin-border)",
                  color: "var(--color-admin-accent)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "15px",
                  flexShrink: 0,
                }}
              >
                {avatarInitial}
              </div>

              {/* User Name & Email */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "left",
                  lineHeight: 1.2,
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--color-admin-text)",
                  }}
                >
                  {displayName}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--color-admin-muted)",
                  }}
                >
                  {user?.email || "admin@germanauto.de"}
                </span>
              </div>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

export default AdminHeader;
