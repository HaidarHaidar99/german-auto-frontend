import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdminSectionCard from "../AdminSectionCard";
import AdminEmptyState from "../AdminEmptyState";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import Icon from "../../common/Icon";

export function RecentUsers({ users = [], isSuperAdmin = false, loading = false }) {
  const { t, i18n } = useTranslation(["admin", "common"]);
  const currentLang = i18n.language || "de";

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(currentLang === "de" ? "de-DE" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Badge variant="secondary" size="sm">{t("superAdmin", { defaultValue: "Super Admin" })}</Badge>;
      case "ADMIN":
        return <Badge variant="primary" size="sm">{t("admin", { defaultValue: "Admin" })}</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{t("customer", { defaultValue: "Kunde" })}</Badge>;
    }
  };

  // If the logged in user is only ADMIN, render a clean permission notice
  if (!isSuperAdmin) {
    return (
      <AdminSectionCard
        title={t("recentUsers", { defaultValue: "Neueste Benutzerkonten" })}
        subtitle={t("userManagementRestrictedSubtitle", {
          defaultValue: "Zugangsbeschränkte Hauptadministrator-Funktion",
        })}
      >
        <div
          style={{
            padding: "var(--space-lg)",
            backgroundColor: "rgba(255, 255, 255, 0.02)",
            borderRadius: "var(--radius-lg)",
            border: "1px dashed var(--color-admin-border)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-md)",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "var(--color-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="shield" size={18} />
          </div>
          <div>
            <h4
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: 600,
                color: "var(--color-admin-text)",
                margin: "0 0 2px 0",
              }}
            >
              {t("superAdminOnly", { defaultValue: "Nur für Hauptadministratoren" })}
            </h4>
            <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-admin-muted)" }}>
              {t("userManagementSuperAdminNotice", {
                defaultValue: "Die Anzeige und Verwaltung von Benutzerkonten ist autorisierten Super-Administratoren vorbehalten.",
              })}
            </p>
          </div>
        </div>
      </AdminSectionCard>
    );
  }

  return (
    <AdminSectionCard
      title={t("recentUsers", { defaultValue: "Neueste Benutzerkonten" })}
      subtitle={t("recentUsersSubtitle", { defaultValue: "Zuletzt registrierte Kunden und Administratoren" })}
      actions={
        <Button
          as={Link}
          to="/admincoresecure/users"
          variant="ghost"
          size="sm"
          iconRight="arrow-right"
        >
          {t("manageUsers", { defaultValue: "Benutzer verwalten" })}
        </Button>
      }
    >
      {users.length === 0 ? (
        <AdminEmptyState
          icon="users"
          title={t("noRecentUsers", { defaultValue: "Keine Benutzerkonten gefunden." })}
          actionLabel={t("manageUsers", { defaultValue: "Benutzer verwalten" })}
          actionTo="/admincoresecure/users"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
          {users.map((usr) => (
            <Link
              key={usr.id}
              to={`/admincoresecure/users?search=${encodeURIComponent(usr.email)}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--color-admin-border)",
                gap: "var(--space-sm)",
                textDecoration: "none",
                color: "inherit",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-secondary)";
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-admin-border)";
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", minWidth: 0 }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.12)",
                    color: "var(--color-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "var(--font-size-xs)",
                    flexShrink: 0,
                  }}
                >
                  {(usr.full_name || usr.email || "U").charAt(0).toUpperCase()}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "var(--font-size-sm)",
                      fontWeight: 600,
                      color: "var(--color-admin-text)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {usr.full_name || "—"}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--font-size-2xs)",
                      color: "var(--color-admin-muted)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {usr.email}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", flexShrink: 0 }}>
                {getRoleBadge(usr.role)}
                {usr.is_verified ? (
                  <Badge variant="success" size="sm">
                    {t("verified", { defaultValue: "Verifiziert" })}
                  </Badge>
                ) : (
                  <Badge variant="neutral" size="sm">
                    {t("unverified", { defaultValue: "Offen" })}
                  </Badge>
                )}
                <span style={{ fontSize: "10px", color: "var(--color-admin-muted)", marginLeft: "4px" }}>
                  {formatDate(usr.created_at)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AdminSectionCard>
  );
}

export default RecentUsers;
