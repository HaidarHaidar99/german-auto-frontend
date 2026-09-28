import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import carsService from "../../services/cars/cars.service";
import formsService from "../../services/forms/forms.service";
import reviewsService from "../../services/reviews/reviews.service";
import notificationsService from "../../services/notifications/notifications.service";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminStatCard from "../../components/admin/AdminStatCard";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Icon from "../../components/common/Icon";
import { useGsapContext } from "../../hooks/useAnimation";
import { gsap, isReducedMotion } from "../../utils/animation";

export function AdminDashboardPage() {
  const { t, i18n } = useTranslation(["admin", "common"]);
  const { user } = useAuth();
  const pageContainerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCars: 0,
    visibleCars: 0,
    unreadForms: 0,
    pendingReviews: 0,
    unreadNotifications: 0,
  });

  const [recentCars, setRecentCars] = useState([]);
  const [recentForms, setRecentForms] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);

  const currentLang = i18n.language || "de";

  useEffect(() => {
    document.title = `${t("dashboard")} | ADMINCORE`;
  }, [t]);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all 4 data sources in parallel from real endpoints
        const [carsRes, formsRes, reviewsRes, notifsRes] = await Promise.allSettled([
          carsService.adminGetCars({ limit: 5 }),
          formsService.adminGetForms({ limit: 5 }),
          reviewsService.adminGetReviews({ limit: 5 }),
          notificationsService.getNotifications({ limit: 5 }),
        ]);

        if (!isMounted) return;

        // 1. Cars
        let carsList = [];
        let totalCars = 0;
        let visibleCars = 0;
        if (carsRes.status === "fulfilled" && carsRes.value?.data) {
          carsList = carsRes.value.data.cars || [];
          totalCars = carsRes.value.meta?.total ?? carsList.length;
          visibleCars = carsList.filter((c) => c.is_visible).length;
        }

        // 2. Forms
        let formsList = [];
        let unreadForms = 0;
        if (formsRes.status === "fulfilled" && formsRes.value?.data) {
          formsList = formsRes.value.data.forms || [];
          unreadForms = formsList.filter((f) => f.status === "PENDING" || f.status === "NEW").length;
        }

        // 3. Reviews
        let reviewsList = [];
        let pendingReviews = 0;
        if (reviewsRes.status === "fulfilled" && reviewsRes.value?.data) {
          reviewsList = reviewsRes.value.data.reviews || [];
          pendingReviews = reviewsList.filter((r) => r.status === "PENDING").length;
        }

        // 4. Notifications
        let notifsList = [];
        let unreadNotifications = 0;
        if (notifsRes.status === "fulfilled" && notifsRes.value?.data) {
          notifsList = notifsRes.value.data.notifications || [];
          unreadNotifications = notifsRes.value.data.unread_count ?? notifsList.filter((n) => !n.is_read).length;
        }

        setStats({
          totalCars,
          visibleCars,
          unreadForms,
          pendingReviews,
          unreadNotifications,
        });

        setRecentCars(carsList);
        setRecentForms(formsList);
        setRecentReviews(reviewsList);
        setRecentNotifications(notifsList);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  useGsapContext(pageContainerRef, () => {
    if (isReducedMotion()) return;
    gsap.from(".admin-stat-card", {
      opacity: 0,
      y: 15,
      duration: 0.5,
      stagger: 0.08,
      ease: "power2.out",
    });

    gsap.from(".admin-dashboard-section", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      delay: 0.1,
    });
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(currentLang === "de" ? "de-DE" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const quickActions = [
    { label: t("manageWebsite"), to: "/admincoresecure/settings", icon: "settings" },
    { label: t("manageVehicles"), to: "/admincoresecure/cars", icon: "car" },
    { label: t("viewForms"), to: "/admincoresecure/forms", icon: "mail" },
    { label: t("manageReviews"), to: "/admincoresecure/reviews", icon: "star" },
    { label: t("viewNotifications"), to: "/admincoresecure/notifications", icon: "bell" },
  ];

  return (
    <div ref={pageContainerRef} className="admin-dashboard-page">
      <AdminPageHeader
        title={t("dashboard")}
        subtitle={`Willkommen im geschützten Kontrollzentrum, ${user?.full_name || user?.email}`}
        badge={
          <Badge variant="secondary" size="sm">
            {user?.role || "ADMIN"}
          </Badge>
        }
      />

      {/* ── 1. Stat Cards Grid ──────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--space-md)",
          marginBottom: "var(--space-xl)",
        }}
      >
        <AdminStatCard
          label={t("statTotalVehicles")}
          value={stats.totalCars}
          subtitle={`${stats.visibleCars} ${t("statVisibleVehicles")}`}
          icon="car"
          to="/admincoresecure/cars"
          loading={loading}
        />
        <AdminStatCard
          label={t("statUnreadForms")}
          value={stats.unreadForms}
          icon="inbox"
          to="/admincoresecure/forms"
          loading={loading}
        />
        <AdminStatCard
          label={t("statPendingReviews")}
          value={stats.pendingReviews}
          icon="star"
          to="/admincoresecure/reviews"
          loading={loading}
        />
        <AdminStatCard
          label={t("statUnreadNotifications")}
          value={stats.unreadNotifications}
          icon="bell"
          to="/admincoresecure/notifications"
          loading={loading}
        />
      </div>

      {/* ── 2. Quick Actions Bar ────────────────────────────────────────────── */}
      <div
        className="admin-dashboard-section"
        style={{
          marginBottom: "var(--space-xl)",
          padding: "var(--space-md) var(--space-lg)",
          backgroundColor: "var(--color-admin-card)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-admin-border)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-md)",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {t("quickActions")}:
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", flexWrap: "wrap" }}>
          {quickActions.map((qa) => (
            <Button
              key={qa.to}
              as={Link}
              to={qa.to}
              variant="outline"
              size="sm"
            >
              <Icon name={qa.icon} size={14} />
              <span>{qa.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* ── 3. Dual-Column Content Grid: Vehicles & Forms ───────────────────── */}
      <div
        className="admin-dashboard-section"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: "var(--space-xl)",
          marginBottom: "var(--space-xl)",
        }}
      >
        {/* Recent Real Vehicles */}
        <AdminSectionCard
          title={t("recentVehicles")}
          actions={
            <Button as={Link} to="/admincoresecure/cars" variant="ghost" size="sm" iconRight="arrow-right">
              {t("viewAll")}
            </Button>
          }
        >
          {recentCars.length === 0 ? (
            <AdminEmptyState
              icon="car"
              title={t("noRecentVehicles")}
              actionLabel={t("manageVehicles")}
              actionTo="/admincoresecure/cars"
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
              {recentCars.map((car) => {
                const img = car.media?.thumbnail || car.images?.[0] || car.image_url;
                return (
                  <div
                    key={car.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--color-admin-border)",
                      gap: "var(--space-sm)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                      {img ? (
                        <img
                          src={img}
                          alt={car.model || car.title}
                          style={{ width: "42px", height: "32px", objectFit: "cover", borderRadius: "var(--radius-sm)" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "42px",
                            height: "32px",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor: "var(--color-surface)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--color-admin-muted)",
                          }}
                        >
                          <Icon name="car" size={16} />
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-admin-text)" }}>
                          {car.brand} {car.model || car.title}
                        </div>
                        <div style={{ fontSize: "var(--font-size-2xs)", color: "var(--color-admin-muted)" }}>
                          {car.price ? `${car.price.toLocaleString("de-DE")} €` : "—"}
                        </div>
                      </div>
                    </div>

                    <Badge variant={car.status === "AVAILABLE" ? "success" : "neutral"} size="sm">
                      {car.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </AdminSectionCard>

        {/* Recent Real Form Inquiries */}
        <AdminSectionCard
          title={t("recentForms")}
          actions={
            <Button as={Link} to="/admincoresecure/forms" variant="ghost" size="sm" iconRight="arrow-right">
              {t("viewAll")}
            </Button>
          }
        >
          {recentForms.length === 0 ? (
            <AdminEmptyState
              icon="mail"
              title={t("noRecentForms")}
              actionLabel={t("viewForms")}
              actionTo="/admincoresecure/forms"
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
              {recentForms.map((form) => (
                <div
                  key={form.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--color-admin-border)",
                    gap: "var(--space-sm)",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Badge variant="outline" size="sm">
                        {form.type || "CONTACT"}
                      </Badge>
                      <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 600 }}>
                        {form.name || form.email || "Anfrage"}
                      </span>
                    </div>
                    <div style={{ fontSize: "var(--font-size-2xs)", color: "var(--color-admin-muted)", marginTop: "2px" }}>
                      {formatDate(form.created_at)}
                    </div>
                  </div>

                  <Badge variant={form.status === "PENDING" ? "warning" : "neutral"} size="sm">
                    {form.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </AdminSectionCard>
      </div>

      {/* ── 4. Dual-Column Content Grid: Reviews & Notifications ────────────── */}
      <div
        className="admin-dashboard-section"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: "var(--space-xl)",
        }}
      >
        {/* Recent Real Reviews */}
        <AdminSectionCard
          title={t("recentReviews")}
          actions={
            <Button as={Link} to="/admincoresecure/reviews" variant="ghost" size="sm" iconRight="arrow-right">
              {t("viewAll")}
            </Button>
          }
        >
          {recentReviews.length === 0 ? (
            <AdminEmptyState
              icon="star"
              title={t("noRecentReviews")}
              actionLabel={t("manageReviews")}
              actionTo="/admincoresecure/reviews"
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
              {recentReviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--color-admin-border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontWeight: 600, fontSize: "var(--font-size-sm)" }}>
                        {rev.author_name || "Kunde"}
                      </span>
                      <span style={{ color: "var(--color-secondary)", fontSize: "var(--font-size-xs)" }}>
                        {"★".repeat(rev.rating || 5)}
                      </span>
                    </div>

                    <Badge variant={rev.status === "APPROVED" ? "success" : rev.status === "PENDING" ? "warning" : "neutral"} size="sm">
                      {rev.status}
                    </Badge>
                  </div>

                  {rev.comment && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: "var(--font-size-xs)",
                        color: "var(--color-admin-muted)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {rev.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </AdminSectionCard>

        {/* Recent Real System Notifications */}
        <AdminSectionCard
          title={t("recentNotifications")}
          actions={
            <Button as={Link} to="/admincoresecure/notifications" variant="ghost" size="sm" iconRight="arrow-right">
              {t("viewAll")}
            </Button>
          }
        >
          {recentNotifications.length === 0 ? (
            <AdminEmptyState
              icon="bell"
              title={t("noRecentNotifications")}
              actionLabel={t("viewNotifications")}
              actionTo="/admincoresecure/notifications"
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
              {recentNotifications.map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: notif.is_read ? "rgba(255, 255, 255, 0.01)" : "rgba(197, 160, 89, 0.06)",
                    border: `1px solid ${notif.is_read ? "var(--color-admin-border)" : "rgba(197, 160, 89, 0.3)"}`,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "var(--space-sm)",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <div style={{ fontSize: "var(--font-size-sm)", fontWeight: notif.is_read ? 500 : 700, color: "var(--color-admin-text)" }}>
                      {notif.title}
                    </div>
                    {notif.message && (
                      <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-admin-muted)" }}>
                        {notif.message}
                      </div>
                    )}
                    <div style={{ fontSize: "10px", color: "var(--color-admin-muted)", marginTop: "2px" }}>
                      {formatDate(notif.created_at)}
                    </div>
                  </div>

                  {!notif.is_read && (
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "var(--color-secondary)",
                        marginTop: "6px",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </AdminSectionCard>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
