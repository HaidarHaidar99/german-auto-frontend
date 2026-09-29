import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdminSectionCard from "../AdminSectionCard";
import AdminEmptyState from "../AdminEmptyState";
import Button from "../../ui/Button";
import Icon from "../../common/Icon";

export function RecentActivity({ notifications = [], loading = false }) {
  const { t, i18n } = useTranslation(["admin", "common"]);
  const currentLang = i18n.language || "de";

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(currentLang === "de" ? "de-DE" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSourceIcon = (type) => {
    switch (type) {
      case "CONTACT_FORM":
        return "mail";
      case "SELL_CAR_FORM":
        return "tag";
      case "NEW_REVIEW":
        return "star";
      default:
        return "bell";
    }
  };

  return (
    <AdminSectionCard
      title={t("recentActivity", { defaultValue: "Aktuelle Systemaktivität" })}
      subtitle={t("recentActivitySubtitle", { defaultValue: "Eingegangene Anfragen, Bewertungen und Systemereignisse" })}
      actions={
        <Button
          as={Link}
          to="/admincoresecure/notifications"
          variant="ghost"
          size="sm"
          iconRight="arrow-right"
        >
          {t("viewAll", { defaultValue: "Alle anzeigen" })}
        </Button>
      }
    >
      {notifications.length === 0 ? (
        <AdminEmptyState
          icon="bell"
          title={t("noRecentActivity", { defaultValue: "Keine aktuellen Aktivitäten verzeichnet." })}
          actionLabel={t("viewNotifications", { defaultValue: "Mitteilungen ansehen" })}
          actionTo="/admincoresecure/notifications"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
          {notifications.map((notif) => (
            <Link
              key={notif.id}
              to={notif.link?.replace("/admin/", "/admincoresecure/") || "/admincoresecure/notifications"}
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                backgroundColor: notif.is_read ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.06)",
                border: `1px solid ${notif.is_read ? "var(--color-admin-border)" : "rgba(255, 255, 255, 0.3)"}`,
                gap: "var(--space-sm)",
                textDecoration: "none",
                color: "inherit",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-admin-accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = notif.is_read
                  ? "var(--color-admin-border)"
                  : "rgba(255, 255, 255, 0.3)";
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-sm)", minWidth: 0 }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "rgba(255, 255, 255, 0.12)",
                    color: "var(--color-admin-accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  <Icon name={getSourceIcon(notif.type)} size={14} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "var(--font-size-sm)",
                      fontWeight: notif.is_read ? 500 : 700,
                      color: "var(--color-admin-text)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {notif.title}
                  </div>
                  {notif.summary && (
                    <div
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--color-admin-muted)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {notif.summary}
                    </div>
                  )}
                  <div style={{ fontSize: "10px", color: "var(--color-admin-muted)", marginTop: "2px" }}>
                    {formatDate(notif.created_at)}
                  </div>
                </div>
              </div>

              {!notif.is_read && (
                <span
                  title={t("unread", { defaultValue: "Ungelesen" })}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-admin-accent)",
                    marginTop: "6px",
                    flexShrink: 0,
                  }}
                />
              )}
            </Link>
          ))}
        </div>
      )}
    </AdminSectionCard>
  );
}

export default RecentActivity;
