import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../../ui/Button";
import Icon from "../../common/Icon";

export function QuickActions({ isSuperAdmin }) {
  const { t } = useTranslation(["admin", "common"]);

  const actions = [
    {
      label: t("addVehicle", { defaultValue: "Fahrzeug anlegen" }),
      to: "/admincoresecure/cars",
      icon: "plus",
      variant: "primary",
    },
    {
      label: t("manageVehicles", { defaultValue: "Fahrzeugbestand" }),
      to: "/admincoresecure/cars",
      icon: "car",
      variant: "outline",
    },
    {
      label: t("viewForms", { defaultValue: "Anfragen" }),
      to: "/admincoresecure/forms",
      icon: "mail",
      variant: "outline",
    },
    {
      label: t("manageReviews", { defaultValue: "Kundenrezensionen" }),
      to: "/admincoresecure/reviews",
      icon: "star",
      variant: "outline",
    },
    {
      label: t("viewNotifications", { defaultValue: "Benachrichtigungen" }),
      to: "/admincoresecure/notifications",
      icon: "bell",
      variant: "outline",
    },
    {
      label: t("manageWebsite", { defaultValue: "CMS Einstellungen" }),
      to: "/admincoresecure/settings",
      icon: "settings",
      variant: "outline",
    },
  ];

  // User Management is strictly SUPER_ADMIN only
  if (isSuperAdmin) {
    actions.push({
      label: t("manageUsers", { defaultValue: "Benutzerverwaltung" }),
      to: "/admincoresecure/users",
      icon: "users",
      variant: "outline",
      isSuperAdminOnly: true,
    });
  }

  return (
    <div
      className="admin-dashboard-quick-actions"
      style={{
        marginBottom: "var(--space-xl)",
        padding: "var(--space-md) var(--space-lg)",
        backgroundColor: "var(--color-admin-card)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--color-admin-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-md)",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
        <Icon name="sliders" size={16} style={{ color: "var(--color-secondary)" }} />
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            fontWeight: 700,
            color: "var(--color-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {t("quickActions", { defaultValue: "Schnellaktionen" })}:
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", flexWrap: "wrap" }}>
        {actions.map((act) => (
          <Button
            key={act.label}
            as={Link}
            to={act.to}
            variant={act.variant}
            size="sm"
          >
            <Icon name={act.icon} size={14} />
            <span>{act.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;
