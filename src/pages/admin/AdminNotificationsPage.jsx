import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import notificationsService from "../../services/notifications/notifications.service";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import NotificationSummaryCards from "../../components/admin/notifications/NotificationSummaryCards";
import NotificationFiltersBar from "../../components/admin/notifications/NotificationFiltersBar";
import NotificationList from "../../components/admin/notifications/NotificationList";
import NotificationDetailDrawer from "../../components/admin/notifications/NotificationDetailDrawer";
import NotificationPreferencesCard from "../../components/admin/notifications/NotificationPreferencesCard";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import AdminLoadingState from "../../components/admin/AdminLoadingState";
import ErrorState from "../../components/ui/ErrorState";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Icon from "../../components/common/Icon";
import { useGsapContext } from "../../hooks/useAnimation";
import { gsap, isReducedMotion } from "../../utils/animation";

export function AdminNotificationsPage() {
  const { t } = useTranslation(["admin", "common"]);
  const pageContainerRef = useRef(null);

  // ─── State ──────────────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'unread' | 'read'
  const [typeFilter, setTypeFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Selected Notification for Detail Drawer
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Notification Preferences
  const [preferences, setPreferences] = useState({
    forms: true,
    reviews: true,
    push: true,
    sound: true,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Toast feedback
  const [toastNotification, setToastNotification] = useState(null);

  const showToast = (type, text) => {
    setToastNotification({ type, text });
    setTimeout(() => {
      setToastNotification(null);
    }, 4000);
  };

  useEffect(() => {
    document.title = `${t("notifications", { defaultValue: "Benachrichtigungen" })} | ADMINCORE`;
  }, [t]);

  // ─── Fetch Notifications ────────────────────────────────────────────────────
  const fetchNotifications = useCallback(
    async (isRefresh = false, page = currentPage) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const params = {
          page,
          limit: 20,
          sort,
        };
        if (statusFilter !== "all") params.status = statusFilter;
        if (typeFilter) params.type = typeFilter;

        const res = await notificationsService.getNotifications(params);
        setNotifications(res?.data?.notifications || []);
        setUnreadCount(res?.data?.unread_count ?? 0);
        if (res?.meta) setMeta(res.meta);
        setError(null);
      } catch (err) {
        setError(err?.message || "Fehler beim Laden der Benachrichtigungen.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [statusFilter, typeFilter, sort, currentPage]
  );

  // ─── Fetch Preferences ──────────────────────────────────────────────────────
  const fetchPreferences = useCallback(async () => {
    try {
      const res = await notificationsService.getPreferences();
      if (res?.data?.preferences) {
        setPreferences(res.data.preferences);
      }
    } catch {
      // Keep default preferences if call fails
    }
  }, []);

  useEffect(() => {
    fetchNotifications(false, currentPage);
  }, [fetchNotifications, currentPage]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // Gentle auto-refresh every 60s when tab is active
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        fetchNotifications(true, currentPage);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [fetchNotifications, currentPage]);

  // GSAP animation
  useGsapContext(pageContainerRef, () => {
    if (isReducedMotion()) return;
    gsap.from(".admin-notifs-animated-content", {
      opacity: 0,
      y: 18,
      duration: 0.5,
      ease: "power2.out",
    });
  });

  // ─── Handlers ───────────────────────────────────────────────────────────────

  // Toggle Read / Unread
  const handleToggleRead = async (id, currentRead) => {
    try {
      setUpdatingId(id);
      if (currentRead) {
        await notificationsService.markUnread(id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: false } : n))
        );
        setUnreadCount((c) => c + 1);
        if (selectedNotif && selectedNotif.id === id) {
          setSelectedNotif((prev) => ({ ...prev, is_read: false }));
        }
        showToast("success", t("notificationMarkedUnread", { defaultValue: "Als ungelesen markiert." }));
      } else {
        await notificationsService.markRead(id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
        if (selectedNotif && selectedNotif.id === id) {
          setSelectedNotif((prev) => ({ ...prev, is_read: true }));
        }
        window.dispatchEvent(new CustomEvent("notificationsUpdated", { detail: { unreadCount: Math.max(0, unreadCount - 1) } }));
        showToast("success", t("notificationMarkedRead", { defaultValue: "Als gelesen markiert." }));
      }
    } catch (err) {
      showToast("error", err?.message || "Fehler beim Aktualisieren des Status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
    } catch {
      // ignore
    } finally {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent("notificationsUpdated", { detail: { unreadCount: 0 } }));
      showToast("success", t("allMarkedAsRead", { defaultValue: "Alle Benachrichtigungen wurden als gelesen markiert." }));
    }
  };

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e?.detail?.unreadCount !== undefined) {
        setUnreadCount(e.detail.unreadCount);
        if (e.detail.unreadCount === 0) {
          setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        }
      }
    };
    window.addEventListener("notificationsUpdated", handleUpdate);
    return () => window.removeEventListener("notificationsUpdated", handleUpdate);
  }, []);

  // Dismiss notification from feed
  const handleDismiss = async (id) => {
    try {
      setUpdatingId(id);
      await notificationsService.dismissNotification(id);
      const target = notifications.find((n) => n.id === id);
      if (target && !target.is_read) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setMeta((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      if (selectedNotif && selectedNotif.id === id) {
        setIsDrawerOpen(false);
        setSelectedNotif(null);
      }
      showToast("success", t("notificationDismissed", { defaultValue: "Mitteilung wurde verworfen." }));
    } catch (err) {
      showToast("error", err?.message || "Fehler beim Verwerfen der Mitteilung.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Update preferences
  const handleUpdatePreferences = async (newPrefs) => {
    try {
      setSavingPrefs(true);
      const res = await notificationsService.updatePreferences(newPrefs);
      if (res?.data?.preferences) {
        setPreferences(res.data.preferences);
      } else {
        setPreferences(newPrefs);
      }
      showToast("success", t("preferencesSaved", { defaultValue: "Einstellungen erfolgreich aktualisiert." }));
      // Re-fetch notifications in case forms/reviews toggle altered visible items
      fetchNotifications(true, 1);
    } catch (err) {
      showToast("error", err?.message || "Fehler beim Speichern der Einstellungen.");
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleOpenDetail = (notif) => {
    setSelectedNotif(notif);
    setIsDrawerOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDrawerOpen(false);
    setSelectedNotif(null);
  };

  const handleResetFilters = () => {
    setStatusFilter("all");
    setTypeFilter("");
    setSort("newest");
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    statusFilter !== "all" || typeFilter !== "" || sort !== "newest"
  );

  return (
    <div ref={pageContainerRef} className="admin-notifications-page" style={{ position: "relative" }}>
      {/* Toast Feedback */}
      {toastNotification && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            padding: "12px 18px",
            borderRadius: "var(--radius-md, 8px)",
            backgroundColor:
              toastNotification.type === "success"
                ? "rgba(34, 197, 94, 0.95)"
                : "rgba(239, 68, 68, 0.95)",
            color: "#ffffff",
            fontSize: "var(--font-size-sm, 14px)",
            fontWeight: 600,
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backdropFilter: "blur(8px)",
          }}
        >
          <Icon
            name={toastNotification.type === "success" ? "check-circle" : "alert-circle"}
            size={18}
          />
          <span>{toastNotification.text}</span>
        </div>
      )}

      {/* Header */}
      <AdminPageHeader
        title={t("notifications", { defaultValue: "Benachrichtigungen" })}
        subtitle={t("notificationsSubtitle", {
          defaultValue: "Ereignis-Feed für Lead-Eingänge, Reviews und Systemmeldungen",
        })}
        badge={
          unreadCount > 0 ? (
            <Badge variant="secondary" size="sm">
              {unreadCount} {t("filterUnread", { defaultValue: "Ungelesen" })}
            </Badge>
          ) : (
            <Badge variant="outline" size="sm">
              {t("current", { defaultValue: "Aktuell" })}
            </Badge>
          )
        }
        actions={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Icon name="check-circle" size={14} />
              <span>{t("markAllAsRead", { defaultValue: "Alle als gelesen markieren" })}</span>
            </Button>
          ) : null
        }
      />

      <div
        className="admin-notifs-animated-content"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-lg, 24px)",
        }}
      >
        {/* Quick Summary Cards */}
        <NotificationSummaryCards
          notifications={notifications}
          unreadCount={unreadCount}
          activeStatusFilter={statusFilter}
          activeTypeFilter={typeFilter}
          onSelectStatusFilter={(s) => {
            setStatusFilter(s);
            setCurrentPage(1);
          }}
          onSelectTypeFilter={(tVal) => {
            setTypeFilter(tVal);
            setCurrentPage(1);
          }}
          onMarkAllAsRead={handleMarkAllAsRead}
        />

        {/* Filter and Sort Bar */}
        <NotificationFiltersBar
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          sort={sort}
          unreadCount={unreadCount}
          onChangeStatus={(s) => {
            setStatusFilter(s);
            setCurrentPage(1);
          }}
          onChangeType={(tVal) => {
            setTypeFilter(tVal);
            setCurrentPage(1);
          }}
          onChangeSort={(sortVal) => {
            setSort(sortVal);
            setCurrentPage(1);
          }}
          onReset={handleResetFilters}
        />

        {/* Notification Feed States */}
        {loading ? (
          <AdminLoadingState message="Lade Benachrichtigungen..." />
        ) : error ? (
          <ErrorState
            title="Fehler beim Laden"
            message={error}
            onRetry={() => fetchNotifications(false, currentPage)}
          />
        ) : notifications.length === 0 ? (
          <AdminEmptyState
            icon="bell"
            title={hasActiveFilters ? t("noFilteredNotificationsTitle", { defaultValue: "Keine passenden Benachrichtigungen" }) : t("noRecentNotifications", { defaultValue: "Keine Benachrichtigungen" })}
            message={hasActiveFilters ? t("noFilteredNotificationsDesc", { defaultValue: "Zu den gewählten Filterkriterien liegen keine Mitteilungen vor." }) : t("noNotificationsDesc", { defaultValue: "Es liegen derzeit keine aktiven Mitteilungen in Ihrem Feed vor." })}
            actionLabel={hasActiveFilters ? t("resetFilters", { defaultValue: "Filter zurücksetzen" }) : undefined}
            onAction={hasActiveFilters ? handleResetFilters : undefined}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md, 16px)" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 4px",
                fontSize: "12px",
                color: "var(--color-admin-muted, #94a3b8)",
              }}
            >
              <span>
                {notifications.length} von {meta.total} Mitteilungen angezeigt
              </span>
              {unreadCount > 0 && (
                <span style={{ color: "var(--color-admin-accent, #2563eb)", fontWeight: 700 }}>
                  {unreadCount} ungelese(n)
                </span>
              )}
            </div>

            <NotificationList
              notifications={notifications}
              onSelectNotification={handleOpenDetail}
              onToggleRead={handleToggleRead}
              onDismiss={handleDismiss}
              updatingId={updatingId}
            />

            {/* Pagination Controls */}
            {meta.pages > 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "var(--space-md, 16px)",
                }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  style={{ fontSize: "12px" }}
                >
                  <Icon name="chevron-left" size={14} /> Zurück
                </Button>

                <span style={{ fontSize: "12px", color: "var(--color-admin-muted, #94a3b8)", padding: "0 8px" }}>
                  Seite {meta.page} von {meta.pages}
                </span>

                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage >= meta.pages || loading}
                  onClick={() => setCurrentPage((p) => Math.min(meta.pages, p + 1))}
                  style={{ fontSize: "12px" }}
                >
                  Weiter <Icon name="chevron-right" size={14} />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Notification Preferences Card */}
        <NotificationPreferencesCard
          preferences={preferences}
          onUpdatePreferences={handleUpdatePreferences}
          isSaving={savingPrefs}
        />
      </div>

      {/* Detail Slide-Over Drawer */}
      <NotificationDetailDrawer
        isOpen={isDrawerOpen}
        notification={selectedNotif}
        onClose={handleCloseDetail}
        onToggleRead={handleToggleRead}
        onDismiss={handleDismiss}
        updatingId={updatingId}
      />
    </div>
  );
}

export default AdminNotificationsPage;
