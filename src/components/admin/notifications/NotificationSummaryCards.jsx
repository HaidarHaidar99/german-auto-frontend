import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "../../common/Icon";

export function NotificationSummaryCards({
  notifications = [],
  unreadCount = 0,
  activeStatusFilter = "all",
  activeTypeFilter = "",
  onSelectStatusFilter,
  onSelectTypeFilter,
  className = "",
  style = {},
}) {
  const { t } = useTranslation(["admin", "common"]);

  const stats = React.useMemo(() => {
    let formsCount = 0;
    let reviewsCount = 0;
    let readCount = 0;

    for (const n of notifications) {
      if (n.is_read) readCount++;
      if (n.type === "CONTACT_FORM" || n.type === "SELL_CAR_FORM") formsCount++;
      else if (n.type === "NEW_REVIEW") reviewsCount++;
    }

    return {
      total: notifications.length,
      unread: unreadCount,
      read: readCount,
      forms: formsCount,
      reviews: reviewsCount,
    };
  }, [notifications, unreadCount]);

  const cards = [
    {
      id: "total",
      label: t("statTotalNotifications", { defaultValue: "Gesamte Meldungen" }),
      count: stats.total,
      icon: "bell",
      color: "var(--color-primary, var(--color-text))",
      isActive: activeStatusFilter === "all" && !activeTypeFilter,
      onClick: () => {
        onSelectStatusFilter?.("all");
        onSelectTypeFilter?.("");
      },
    },
    {
      id: "unread",
      label: t("statUnreadNotificationsCount", { defaultValue: "Ungelesen" }),
      count: stats.unread,
      icon: "inbox",
      color: "#f59e0b",
      isActive: activeStatusFilter === "unread",
      onClick: () =>
        onSelectStatusFilter?.(activeStatusFilter === "unread" ? "all" : "unread"),
    },
    {
      id: "read",
      label: t("statReadNotificationsCount", { defaultValue: "Gelesen" }),
      count: stats.read,
      icon: "check-circle",
      color: "#22c55e",
      isActive: activeStatusFilter === "read",
      onClick: () =>
        onSelectStatusFilter?.(activeStatusFilter === "read" ? "all" : "read"),
    },
    {
      id: "forms",
      label: t("statFormsNotifications", { defaultValue: "Formulare" }),
      count: stats.forms,
      icon: "message-square",
      color: "#a855f7",
      isActive:
        activeTypeFilter === "CONTACT_FORM" || activeTypeFilter === "SELL_CAR_FORM",
      onClick: () => {
        onSelectTypeFilter?.(
          activeTypeFilter === "CONTACT_FORM" ? "" : "CONTACT_FORM"
        );
      },
    },
    {
      id: "reviews",
      label: t("statReviewsNotifications", { defaultValue: "Reviews" }),
      count: stats.reviews,
      icon: "star",
      color: "#06b6d4",
      isActive: activeTypeFilter === "NEW_REVIEW",
      onClick: () =>
        onSelectTypeFilter?.(activeTypeFilter === "NEW_REVIEW" ? "" : "NEW_REVIEW"),
    },
  ];

  return (
    <div
      className={`notification-summary-grid ${className}`.trim()}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        gap: "var(--space-sm, 12px)",
        ...style,
      }}
    >
      {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={card.onClick}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "12px 14px",
            backgroundColor: card.isActive
              ? "rgba(255, 255, 255, 0.12)"
              : "var(--color-admin-card, #121418)",
            borderRadius: "var(--radius-md, 8px)",
            border: card.isActive
              ? "1px solid var(--color-primary, var(--color-text))"
              : "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.2s ease",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: card.isActive
                  ? "var(--color-primary, var(--color-text))"
                  : "var(--color-admin-muted, #94a3b8)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {card.label}
            </span>
            <Icon name={card.icon} size={15} style={{ color: card.color, opacity: 0.9 }} />
          </div>

          <div
            style={{
              fontSize: "var(--font-size-xl, 22px)",
              fontWeight: 700,
              color: card.isActive ? "var(--color-primary, var(--color-text))" : "#ffffff",
              lineHeight: 1,
            }}
          >
            {card.count}
          </div>
        </button>
      ))}
    </div>
  );
}

export default NotificationSummaryCards;
