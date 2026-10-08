import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "../../common/Icon";

export function QuickActions({ isSuperAdmin }) {
  const { t } = useTranslation(["admin", "common"]);

  const actions = [
    {
      label: t("addVehicle", { defaultValue: "Add Vehicle" }),
      to: "/admincoresecure/cars",
      icon: "plus",
      iconBg: "#2563eb",
    },
    {
      label: t("manageVehicles", { defaultValue: "Manage Inventory" }),
      to: "/admincoresecure/cars",
      icon: "car",
      iconBg: "#3b82f6",
    },
    {
      label: t("viewForms", { defaultValue: "View Submissions" }),
      to: "/admincoresecure/forms",
      icon: "mail",
      iconBg: "#06b6d4",
    },
    {
      label: t("manageReviews", { defaultValue: "Moderate Reviews" }),
      to: "/admincoresecure/reviews",
      icon: "star",
      iconBg: "#8b5cf6",
    },
    {
      label: t("viewNotifications", { defaultValue: "Notifications" }),
      to: "/admincoresecure/notifications",
      icon: "bell",
      iconBg: "#f59e0b",
    },
    {
      label: t("manageWebsite", { defaultValue: "Website CMS" }),
      to: "/admincoresecure/settings",
      icon: "settings",
      iconBg: "#64748b",
    },
  ];

  if (isSuperAdmin) {
    actions.push({
      label: t("manageUsers", { defaultValue: "User Management" }),
      to: "/admincoresecure/users",
      icon: "users",
      iconBg: "#10b981",
    });
  }

  return (
    <div
      className="admin-dashboard-quick-actions"
      style={{
        marginBottom: "24px",
        padding: "16px 20px",
        backgroundColor: "var(--color-admin-card)",
        borderRadius: "16px",
        border: "1px solid var(--color-admin-border)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Icon name="sliders" size={16} style={{ color: "var(--color-admin-accent)" }} />
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--color-admin-accent)",
            textTransform: "uppercase",
            letterSpacing: "0.6px",
          }}
        >
          {t("quickActions", { defaultValue: "Quick Actions" })}
        </span>
      </div>

      <div
        className="quick-actions-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "10px",
          width: "100%",
        }}
      >
        {actions.map((act) => (
          <Link
            key={act.label}
            to={act.to}
            className="quick-action-card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              backgroundColor: "var(--color-admin-pill-bg)",
              border: "1px solid var(--color-admin-border)",
              borderRadius: "10px",
              textDecoration: "none",
              color: "var(--color-admin-text)",
              fontSize: "12px",
              fontWeight: 600,
              minHeight: "44px",
              boxSizing: "border-box",
              transition: "border-color 0.15s ease, transform 0.15s ease",
            }}
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "7px",
                backgroundColor: act.iconBg,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name={act.icon} size={14} strokeWidth={2} />
            </div>
            <span
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.2,
              }}
            >
              {act.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;
