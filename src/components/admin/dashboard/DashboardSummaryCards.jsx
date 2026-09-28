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
        label={t("statTotalVehicles", { defaultValue: "Fahrzeuge im Bestand" })}
        value={inventory?.total ?? 0}
        subtitle={`${inventory?.available ?? 0} ${t("statAvailableVehicles", { defaultValue: "verfügbar" })}`}
        icon="car"
        to="/admincoresecure/cars"
        loading={loading}
      />

      {/* 2. Available Cars */}
      <AdminStatCard
        label={t("statAvailableVehicles", { defaultValue: "Verfügbare Fahrzeuge" })}
        value={inventory?.available ?? 0}
        subtitle={`${inventory?.featured ?? 0} ${t("featuredVehicles", { defaultValue: "hervorgehoben" })}`}
        icon="check"
        to="/admincoresecure/cars?status=AVAILABLE"
        loading={loading}
      />

      {/* 3. Sold Cars */}
      <AdminStatCard
        label={t("statSoldVehicles", { defaultValue: "Verkaufte Fahrzeuge" })}
        value={inventory?.sold ?? 0}
        subtitle={`${inventory?.reserved ?? 0} ${t("statusReserved", { defaultValue: "reserviert" })}`}
        icon="tag"
        to="/admincoresecure/cars?status=SOLD"
        loading={loading}
      />

      {/* 4. Total Users (SUPER_ADMIN) or Unread Inquiries (ADMIN) */}
      {isSuperAdmin ? (
        <AdminStatCard
          label={t("statTotalUsers", { defaultValue: "Registrierte Benutzer" })}
          value={users?.total ?? 0}
          subtitle={`${users?.unverified ?? 0} ${t("unverifiedUsersSubtitle", { defaultValue: "unbestätigt" })}`}
          icon="users"
          to="/admincoresecure/users"
          loading={loading}
        />
      ) : (
        <AdminStatCard
          label={t("statPendingInquiries", { defaultValue: "Offene Anfragen" })}
          value={forms?.pending ?? 0}
          subtitle={`${forms?.total ?? 0} ${t("totalFormsSubtitle", { defaultValue: "gesamt eingegangen" })}`}
          icon="mail"
          to="/admincoresecure/forms?status=NEW"
          loading={loading}
        />
      )}

      {/* 5. Pending Reviews */}
      <AdminStatCard
        label={t("statPendingReviews", { defaultValue: "Ausstehende Rezensionen" })}
        value={reviews?.pending ?? 0}
        subtitle={`${reviews?.total ?? 0} ${t("totalReviewsSubtitle", { defaultValue: "Gesamtbewertungen" })}`}
        icon="star"
        to="/admincoresecure/reviews?status=PENDING"
        loading={loading}
      />

      {/* 6. Notifications */}
      <AdminStatCard
        label={t("statUnreadNotifications", { defaultValue: "Ungelesene Meldungen" })}
        value={notifications?.unreadCount ?? 0}
        icon="bell"
        to="/admincoresecure/notifications"
        loading={loading}
      />
    </div>
  );
}

export default DashboardSummaryCards;
