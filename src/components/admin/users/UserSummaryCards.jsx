import React from "react";
import { useTranslation } from "react-i18next";
import AdminStatCard from "../AdminStatCard";

export function UserSummaryCards({
  stats = { total: 0, customers: 0, admins: 0, superAdmins: 0 },
  loading = false,
  className = "",
  style = {},
}) {
  const { t } = useTranslation(["admin", "common"]);

  return (
    <div
      className={`admin-user-summary-cards ${className}`.trim()}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "var(--space-md)",
        marginBottom: "var(--space-xl)",
        ...style,
      }}
    >
      <AdminStatCard
        label={t("statTotalUsers", { defaultValue: "Gesamte Benutzer" })}
        value={stats.total}
        subtitle={t("statTotalUsersDesc", { defaultValue: "Registrierte Konten in der Datenbank" })}
        icon="users"
        iconBg="#2563eb"
        loading={loading}
      />

      <AdminStatCard
        label={t("statCustomers", { defaultValue: "Kundenkonten" })}
        value={stats.customers}
        subtitle={t("statCustomersDesc", { defaultValue: "Normale Kunden (CUSTOMER)" })}
        icon="user"
        iconBg="#0284c7"
        loading={loading}
      />

      <AdminStatCard
        label={t("statAdmins", { defaultValue: "Administratoren" })}
        value={stats.admins}
        subtitle={t("statAdminsDesc", { defaultValue: "Verwaltungskonten (ADMIN)" })}
        icon="shield"
        iconBg="#10b981"
        loading={loading}
      />

      <AdminStatCard
        label={t("statSuperAdmins", { defaultValue: "Super-Administratoren" })}
        value={stats.superAdmins}
        subtitle={t("statSuperAdminsDesc", { defaultValue: "Vollzugriff (SUPER_ADMIN)" })}
        icon="award"
        iconBg="#f59e0b"
        loading={loading}
      />
    </div>
  );
}

export default UserSummaryCards;
