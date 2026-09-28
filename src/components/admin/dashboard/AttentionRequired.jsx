import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdminSectionCard from "../AdminSectionCard";
import Badge from "../../ui/Badge";
import Icon from "../../common/Icon";

export function AttentionRequired({
  forms,
  reviews,
  users,
  inventory,
  notifications,
  isSuperAdmin,
  loading = false,
}) {
  const { t } = useTranslation(["admin", "common"]);

  const items = [];

  // 1. Pending inquiries / forms
  if ((forms?.pending || 0) > 0) {
    items.push({
      id: "pending-forms",
      icon: "mail",
      title: t("pendingFormsCount", {
        defaultValue: "{{count}} neue Formulareingänge",
        count: forms.pending,
      }),
      subtitle: t("pendingFormsSubtitle", {
        defaultValue: "Kundenanfragen & Fahrzeugangebote warten auf Bearbeitung",
      }),
      count: forms.pending,
      badgeVariant: "warning",
      to: "/admincoresecure/forms?status=NEW",
    });
  }

  // 2. Pending reviews
  if ((reviews?.pending || 0) > 0) {
    items.push({
      id: "pending-reviews",
      icon: "star",
      title: t("pendingReviewsCount", {
        defaultValue: "{{count}} Kundenrezensionen ausstehend",
        count: reviews.pending,
      }),
      subtitle: t("pendingReviewsSubtitle", {
        defaultValue: "Bewertungen müssen vor Veröffentlichung freigegeben werden",
      }),
      count: reviews.pending,
      badgeVariant: "warning",
      to: "/admincoresecure/reviews?status=PENDING",
    });
  }

  // 3. Unverified users (SUPER_ADMIN only)
  if (isSuperAdmin && (users?.unverified || 0) > 0) {
    items.push({
      id: "unverified-users",
      icon: "users",
      title: t("unverifiedUsersCount", {
        defaultValue: "{{count}} unbestätigte Benutzerkonten",
        count: users.unverified,
      }),
      subtitle: t("unverifiedUsersSubtitleAction", {
        defaultValue: "E-Mail-Verifizierung oder manuelle Freigabe ausstehend",
      }),
      count: users.unverified,
      badgeVariant: "neutral",
      to: "/admincoresecure/users?is_verified=false",
    });
  }

  // 4. Hidden vehicles
  if ((inventory?.hidden || 0) > 0) {
    items.push({
      id: "hidden-vehicles",
      icon: "eye",
      title: t("hiddenVehiclesCount", {
        defaultValue: "{{count}} ausgeblendete Fahrzeuge",
        count: inventory.hidden,
      }),
      subtitle: t("hiddenVehiclesSubtitle", {
        defaultValue: "Fahrzeuge sind derzeit für Kunden im Showroom unsichtbar",
      }),
      count: inventory.hidden,
      badgeVariant: "secondary",
      to: "/admincoresecure/cars?status=HIDDEN",
    });
  }

  // 5. Unread notifications
  if ((notifications?.unreadCount || 0) > 0) {
    items.push({
      id: "unread-notifications",
      icon: "bell",
      title: t("unreadNotificationsCount", {
        defaultValue: "{{count}} ungelesene Systemmeldungen",
        count: notifications.unreadCount,
      }),
      subtitle: t("unreadNotificationsSubtitle", {
        defaultValue: "Wichtige Systemereignisse und Anfragen",
      }),
      count: notifications.unreadCount,
      badgeVariant: "primary",
      to: "/admincoresecure/notifications",
    });
  }

  return (
    <AdminSectionCard
      title={t("attentionRequired", { defaultValue: "Dringender Handlungsbedarf" })}
      subtitle={t("actionRequiredSubtitle", {
        defaultValue: "Aufgaben und Vorgänge, die administrative Aufmerksamkeit erfordern",
      })}
    >
      {items.length === 0 ? (
        <div
          style={{
            padding: "var(--space-xl)",
            backgroundColor: "rgba(34, 197, 94, 0.05)",
            border: "1px dashed rgba(34, 197, 94, 0.3)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-md)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "rgba(34, 197, 94, 0.15)",
              color: "var(--color-success, #22c55e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="check" size={20} />
          </div>
          <div>
            <h3
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: 700,
                color: "var(--color-admin-text)",
                margin: "0 0 2px 0",
              }}
            >
              {t("noAttentionRequiredTitle", { defaultValue: "Alles auf aktuellem Stand" })}
            </h3>
            <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-admin-muted)" }}>
              {t("noAttentionRequired", {
                defaultValue: "Keine ausstehenden Aufgaben. Alle Kundenanfragen und Bewertungen sind bearbeitet.",
              })}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
          {items.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--color-admin-border)",
                textDecoration: "none",
                color: "inherit",
                transition: "all var(--transition-fast)",
                gap: "var(--space-sm)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-secondary)";
                e.currentTarget.style.transform = "translateX(2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-admin-border)";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", minWidth: 0 }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "rgba(197, 160, 89, 0.1)",
                    color: "var(--color-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon name={item.icon} size={16} />
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
                    {item.title}
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
                    {item.subtitle}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", flexShrink: 0 }}>
                <Badge variant={item.badgeVariant} size="sm">
                  {item.count}
                </Badge>
                <Icon name="chevron-right" size={14} style={{ color: "var(--color-admin-muted)" }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </AdminSectionCard>
  );
}

export default AttentionRequired;
