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
      label: t("statTotalNotifications", { defaultValue: "Total Notifications" }),
      count: stats.total,
      icon: "bell",
      iconBg: "#2563eb",
      isActive: activeStatusFilter === "all" && !activeTypeFilter,
      onClick: () => {
        onSelectStatusFilter?.("all");
        onSelectTypeFilter?.("");
      },
    },
    {
      id: "unread",
      label: t("statUnreadNotificationsCount", { defaultValue: "Unread Notifications" }),
      count: stats.unread,
      icon: "bell",
      iconBg: "#f59e0b",
      isActive: activeStatusFilter === "unread",
      onClick: () =>
        onSelectStatusFilter?.(activeStatusFilter === "unread" ? "all" : "unread"),
    },
    {
      id: "read",
      label: t("statReadNotificationsCount", { defaultValue: "Read" }),
      count: stats.read,
      icon: "check-circle",
      iconBg: "#10b981",
      isActive: activeStatusFilter === "read",
      onClick: () =>
        onSelectStatusFilter?.(activeStatusFilter === "read" ? "all" : "read"),
    },
    {
      id: "forms",
      label: t("statFormsNotifications", { defaultValue: "Forms" }),
      count: stats.forms,
      icon: "mail",
      iconBg: "#8b5cf6",
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
      iconBg: "#06b6d4",
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
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "20px",
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
            alignItems: "center",
            gap: "16px",
            padding: "18px 20px",
            backgroundColor: card.isActive
              ? "var(--color-admin-accent-subtle)"
              : "var(--color-admin-card)",
            borderRadius: "16px",
            border: card.isActive
              ? "2px solid var(--color-admin-accent)"
              : "1px solid var(--color-admin-border)",
            boxShadow: card.isActive
              ? "0 4px 12px rgba(37, 99, 235, 0.12)"
              : "0 1px 3px rgba(0, 0, 0, 0.04)",
            cursor: "pointer",
            textAlign: "left",
            transition: "transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
            outline: "none",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            if (!card.isActive) {
              e.currentTarget.style.borderColor = "var(--color-admin-accent)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.06)";
            }
          }}
          onMouseLeave={(e) => {
            if (!card.isActive) {
              e.currentTarget.style.borderColor = "var(--color-admin-border)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.04)";
            }
          }}
        >
          {/* Left Squircle Icon Container */}
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              backgroundColor: card.iconBg,
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.12)",
            }}
          >
            <Icon name={card.icon} size={22} strokeWidth={2} />
          </div>

          {/* Right Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0, flex: 1 }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                color: card.isActive ? "var(--color-admin-accent)" : "var(--color-admin-muted)",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {card.label}
            </span>
            <span
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                color: "var(--color-admin-text)",
                lineHeight: 1.1,
              }}
            >
              {card.count}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

export default NotificationSummaryCards;
