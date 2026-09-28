import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import adminDashboardService from "../../services/adminDashboard/adminDashboard.service";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import DashboardSummaryCards from "../../components/admin/dashboard/DashboardSummaryCards";
import InventoryOverview from "../../components/admin/dashboard/InventoryOverview";
import AttentionRequired from "../../components/admin/dashboard/AttentionRequired";
import QuickActions from "../../components/admin/dashboard/QuickActions";
import RecentCars from "../../components/admin/dashboard/RecentCars";
import RecentUsers from "../../components/admin/dashboard/RecentUsers";
import RecentActivity from "../../components/admin/dashboard/RecentActivity";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Icon from "../../components/common/Icon";
import { useGsapContext } from "../../hooks/useAnimation";
import { gsap, isReducedMotion } from "../../utils/animation";

export function AdminDashboardPage() {
  const { t } = useTranslation(["admin", "common"]);
  const { user } = useAuth();
  const pageContainerRef = useRef(null);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [dashboardData, setDashboardData] = useState({
    inventory: {
      total: 0,
      available: 0,
      sold: 0,
      reserved: 0,
      hidden: 0,
      featured: 0,
      recent: [],
    },
    forms: {
      pending: 0,
      total: 0,
      recent: [],
    },
    reviews: {
      pending: 0,
      total: 0,
      recent: [],
    },
    notifications: {
      unreadCount: 0,
      recent: [],
    },
    users: null,
  });

  useEffect(() => {
    document.title = `${t("dashboard", { defaultValue: "Dashboard" })} | ADMINCORE`;
  }, [t]);

  // ── Fetch Dashboard Data ─────────────────────────────────────────────────────
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setFetchError(null);

    try {
      const data = await adminDashboardService.getDashboardData({ isSuperAdmin });
      setDashboardData(data);
    } catch (err) {
      setFetchError(err.message || t("errorLoading", { defaultValue: "Fehler beim Laden der Verwaltungsdaten." }));
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
        subtitle={`${t("welcomeAdmin", { defaultValue: "Willkommen im Kontrollzentrum" })}, ${user?.full_name || user?.email || "Administrator"}`}
        badge={
          <Badge variant={isSuperAdmin ? "secondary" : "primary"} size="sm">
            {isSuperAdmin
              ? t("superAdmin", { defaultValue: "SUPER_ADMIN" })
              : t("admin", { defaultValue: "ADMIN" })}
          </Badge>
        }
        actions={
          <Button
            onClick={() => loadData(true)}
            variant="outline"
            size="sm"
            disabled={loading || refreshing}
          >
            <span
              style={{
                display: "inline-flex",
                transform: refreshing ? "rotate(360deg)" : "none",
                transition: refreshing ? "transform 0.8s linear infinite" : "none",
              }}
            >
              <Icon name="refresh-cw" size={14} />
            </span>
            <span>
              {refreshing
                ? t("refreshing", { defaultValue: "Wird aktualisiert..." })
                : t("refreshDashboard", { defaultValue: "Aktualisieren" })}
            </span>
          </Button>
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

      {/* ── Inventory Overview ──────────────────────────────────────────────── */}
      <div className="admin-dashboard-section" style={{ marginBottom: "var(--space-xl)" }}>
        <InventoryOverview inventory={dashboardData.inventory} loading={loading} />
      </div>

      {/* ── Main Dual-Column Operational Grid ───────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
          gap: "var(--space-xl)",
          marginBottom: "var(--space-xl)",
        }}
      >
        {/* Urgent Attention / Action Required */}
        <div className="admin-dashboard-section">
          <AttentionRequired
            forms={dashboardData.forms}
            reviews={dashboardData.reviews}
            users={dashboardData.users}
            inventory={dashboardData.inventory}
            notifications={dashboardData.notifications}
            isSuperAdmin={isSuperAdmin}
            loading={loading}
          />
        </div>

        {/* Recent Real Vehicles */}
        <div className="admin-dashboard-section">
          <RecentCars cars={dashboardData.inventory?.recent || []} loading={loading} />
        </div>
      </div>

      {/* ── Secondary Dual-Column Grid: Users & Activity ─────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
          gap: "var(--space-xl)",
        }}
      >
        {/* Recent Users (SUPER_ADMIN full / ADMIN permission banner) */}
        <div className="admin-dashboard-section">
          <RecentUsers
            users={dashboardData.users?.recent || []}
            isSuperAdmin={isSuperAdmin}
            loading={loading}
          />
        </div>

        {/* Real Live System Activity Feed */}
        <div className="admin-dashboard-section">
          <RecentActivity
            notifications={dashboardData.notifications?.recent || []}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
