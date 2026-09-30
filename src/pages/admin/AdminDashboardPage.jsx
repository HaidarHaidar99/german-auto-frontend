import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import adminDashboardService from "../../services/adminDashboard/adminDashboard.service";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import DashboardSummaryCards from "../../components/admin/dashboard/DashboardSummaryCards";
import QuickActions from "../../components/admin/dashboard/QuickActions";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Icon from "../../components/common/Icon";
import { useGsapContext } from "../../hooks/useAnimation";
import { gsap, isReducedMotion } from "../../utils/animation";

export function AdminDashboardPage() {
  const { t } = useTranslation(["admin", "common"]);
  const { user } = useAdminAuth();
  const pageContainerRef = useRef(null);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const DASHBOARD_CACHE_KEY = "german_auto_admin_dashboard_cache";

  const [dashboardData, setDashboardData] = useState(() => {
    try {
      const cached = localStorage.getItem(DASHBOARD_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.inventory) return parsed;
      }
    } catch {}
    return {
      inventory: { total: 0, available: 0, sold: 0, reserved: 0, hidden: 0, featured: 0, recent: [] },
      forms: { pending: 0, total: 0, recent: [] },
      reviews: { pending: 0, total: 0, recent: [] },
      notifications: { unreadCount: 0, recent: [] },
      users: null,
    };
  });

  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem(DASHBOARD_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.inventory) return false;
      }
    } catch {}
    return true;
  });
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    document.title = `${t("dashboard", { defaultValue: "Dashboard" })} | ADMINCORE`;
  }, [t]);

  // ── Fetch Dashboard Data ─────────────────────────────────────────────────────
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }
    setFetchError(null);

    try {
      const data = await adminDashboardService.getDashboardData({ isSuperAdmin });
      setDashboardData(data);
      try {
        localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(data));
      } catch {}
    } catch (err) {
      setFetchError(err.message || t("errorLoading", { defaultValue: "Error loading dashboard data." }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isSuperAdmin, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── GSAP Staggered Entrance ─────────────────────────────────────────────────
  useGsapContext(pageContainerRef, () => {
    if (isReducedMotion() || loading) return;

    gsap.from(".admin-stat-card", {
      opacity: 0,
      y: 12,
      duration: 0.4,
      stagger: 0.06,
      ease: "power2.out",
    });

    gsap.from(".admin-dashboard-section", {
      opacity: 0,
      y: 16,
      duration: 0.5,
      stagger: 0.08,
      ease: "power2.out",
      delay: 0.08,
    });
  });

  return (
    <div ref={pageContainerRef} className="admin-dashboard-page" style={{ width: "100%", maxWidth: "1600px" }}>
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <AdminPageHeader
        title={t("dashboard", { defaultValue: "Dashboard" })}
        subtitle={`${t("welcomeAdmin", { defaultValue: "Welcome to the Control Center" })}, ${user?.full_name || user?.email || "Administrator"}`}
        badge={
          <span
            style={{
              display: "inline-block",
              padding: "3px 10px",
              borderRadius: "6px",
              backgroundColor: isSuperAdmin ? "#dcfce7" : "#e0f2fe",
              color: isSuperAdmin ? "#16a34a" : "#0284c7",
              fontWeight: 700,
              fontSize: "11px",
              letterSpacing: "0.5px",
            }}
          >
            {isSuperAdmin ? "SUPER ADMIN" : "ADMIN"}
          </span>
        }
      />

      {/* ── Error Banner (if complete fetch failure) ─────────────────────────── */}
      {fetchError && (
        <div
          style={{
            padding: "var(--space-md) var(--space-lg)",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "var(--space-xl)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-md)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
            <Icon name="alert-circle" size={18} style={{ color: "var(--color-danger, #ef4444)" }} />
            <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-admin-text)" }}>
              {fetchError}
            </span>
          </div>
          <Button onClick={() => loadData(false)} variant="outline" size="sm">
            {t("retry", { defaultValue: "Erneut versuchen" })}
          </Button>
        </div>
      )}

      {/* ── Quick Actions ───────────────────────────────────────────────────── */}
      <QuickActions isSuperAdmin={isSuperAdmin} />

      {/* ── Top Summary Cards ───────────────────────────────────────────────── */}
      <DashboardSummaryCards
        inventory={dashboardData.inventory}
        forms={dashboardData.forms}
        reviews={dashboardData.reviews}
        users={dashboardData.users}
        notifications={dashboardData.notifications}
        isSuperAdmin={isSuperAdmin}
        loading={loading}
      />
    </div>
  );
}

export default AdminDashboardPage;
