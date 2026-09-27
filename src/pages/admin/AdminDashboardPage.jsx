import React from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import EmptyState from "../../components/ui/EmptyState";

export function AdminDashboardPage() {
  const { t } = useTranslation(["admin", "common"]);
  const { user, role } = useAuth();

  return (
    <div>
      <div style={{ marginBottom: "var(--space-2xl)" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "var(--space-xs)" }}>
          {t("dashboard")}
        </h1>
        <p style={{ color: "var(--color-admin-muted)", margin: 0 }}>
          Willkommen im geschützten Verwaltungsbereich, {user?.full_name || user?.email} ({role})
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "var(--space-md)",
          marginBottom: "var(--space-2xl)",
        }}
      >
        <div style={{ padding: "var(--space-lg)", backgroundColor: "var(--color-admin-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-admin-border)" }}>
          <div style={{ color: "var(--color-admin-muted)", fontSize: "0.875rem" }}>{t("inventory")}</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "var(--space-xs)" }}>—</div>
        </div>
        <div style={{ padding: "var(--space-lg)", backgroundColor: "var(--color-admin-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-admin-border)" }}>
          <div style={{ color: "var(--color-admin-muted)", fontSize: "0.875rem" }}>{t("forms")}</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "var(--space-xs)" }}>—</div>
        </div>
        <div style={{ padding: "var(--space-lg)", backgroundColor: "var(--color-admin-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-admin-border)" }}>
          <div style={{ color: "var(--color-admin-muted)", fontSize: "0.875rem" }}>{t("reviews")}</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "var(--space-xs)" }}>—</div>
        </div>
        <div style={{ padding: "var(--space-lg)", backgroundColor: "var(--color-admin-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-admin-border)" }}>
          <div style={{ color: "var(--color-admin-muted)", fontSize: "0.875rem" }}>{t("notifications")}</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "var(--space-xs)" }}>—</div>
        </div>
      </div>

      <EmptyState
        title="Verwaltungsmodule & CMS"
        message="Fahrzeugverwaltung, Lead-Bearbeitung, Bewertungsmoderation und CMS-Konfigurationen sind über die Backend-API angebunden und werden in der Admin-Designphase integriert."
      />
    </div>
  );
}

export default AdminDashboardPage;
