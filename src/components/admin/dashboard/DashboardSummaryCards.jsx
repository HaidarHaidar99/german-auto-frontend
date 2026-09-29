import React from "react";
import { useTranslation } from "react-i18next";
import AdminStatCard from "../AdminStatCard";

export function DashboardSummaryCards({
  inventory,
  forms,
  reviews,
  users,
  notifications,
  isSuperAdmin,
  loading = false,
}) {
  const { t } = useTranslation(["admin", "common"]);

  return (
    <div
      className="dashboard-summary-cards-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "var(--space-md)",
        marginBottom: "var(--space-xl)",
      }}
    >
      {/* 1. Total Inventory */}
      <AdminStatCard
        label={t("statTotalVehicles", { defaultValue: "Total Services / Vehicles" })}
        value={inventory?.total ?? 0}
        subtitle={`${inventory?.available ?? 0} ${t("statAvailableVehicles", { defaultValue: "available" })}`}
        icon="layers"
        iconBg="var(--color-admin-stat-icon-bg-1)"
        to="/admincoresecure/cars"
        loading={loading}
      />

      {/* 2. Available Cars / Products */}
      <AdminStatCard
        label={t("statAvailableVehicles", { defaultValue: "Total Products / Cars" })}
        value={inventory?.available ?? 0}
        subtitle={`${inventory?.featured ?? 0} ${t("featuredVehicles", { defaultValue: "featured" })}`}
        icon="box"
        iconBg="var(--color-admin-stat-icon-bg-2)"
        to="/admincoresecure/cars?status=AVAILABLE"
        loading={loading}
      />

      {/* 3. Forms */}
      <AdminStatCard
        label={t("totalForms", { defaultValue: "Total Forms" })}
        value={forms?.total ?? forms?.pending ?? 0}
        subtitle={`${forms?.pending ?? 0} ${t("pendingForms", { defaultValue: "pending review" })}`}
        icon="mail"
        iconBg="var(--color-admin-stat-icon-bg-3)"
        to="/admincoresecure/forms"
        loading={loading}
      />

      {/* 4. Total Admins / Users */}
      {isSuperAdmin ? (
        <AdminStatCard
          label={t("statTotalUsers", { defaultValue: "Total Admins" })}
          value={users?.total ?? 0}
          subtitle={`${users?.unverified ?? 0} ${t("unverifiedUsersSubtitle", { defaultValue: "unverified" })}`}
          icon="users"
          iconBg="var(--color-admin-stat-icon-bg-4)"
          to="/admincoresecure/users"
          loading={loading}
        />
      ) : (
        <AdminStatCard
          label={t("statSoldVehicles", { defaultValue: "Sold Vehicles" })}
          value={inventory?.sold ?? 0}
          subtitle={`${inventory?.reserved ?? 0} ${t("statusReserved", { defaultValue: "reserved" })}`}
          icon="tag"
          iconBg="var(--color-admin-stat-icon-bg-4)"
          to="/admincoresecure/cars?status=SOLD"
          loading={loading}
        />
      )}

      {/* 5. Pending Reviews */}
      <AdminStatCard
        label={t("statPendingReviews", { defaultValue: "Reviews" })}
        value={reviews?.total ?? reviews?.pending ?? 0}
        subtitle={`${reviews?.pending ?? 0} ${t("totalReviewsSubtitle", { defaultValue: "pending" })}`}
        icon="star"
        iconBg="#8b5cf6"
        to="/admincoresecure/reviews"
        loading={loading}
      />

      {/* 6. Notifications */}
      <AdminStatCard
        label={t("statUnreadNotifications", { defaultValue: "Notifications" })}
        value={notifications?.unreadCount ?? 0}
        icon="bell"
        iconBg="#0ea5e9"
        to="/admincoresecure/notifications"
        loading={loading}
      />
    </div>
  );
}

export default DashboardSummaryCards;
