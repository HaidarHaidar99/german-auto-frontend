import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "../../common/Icon";

export function FormSummaryCards({
  forms = [],
  activeStatusFilter = "ALL",
  activeTypeFilter = "",
  onSelectStatusFilter,
  onSelectTypeFilter,
  className = "",
  style = {},
}) {
  const { t } = useTranslation(["admin", "common"]);

  const counts = React.useMemo(() => {
    let total = forms.length;
    let countNew = 0;
    let countRead = 0;
    let countInProgress = 0;
    let countCompleted = 0;
    let countArchived = 0;
    let countContact = 0;
    let countSellCar = 0;

    for (const f of forms) {
      if (f.status === "NEW") countNew++;
      else if (f.status === "READ") countRead++;
      else if (f.status === "IN_PROGRESS") countInProgress++;
      else if (f.status === "COMPLETED") countCompleted++;
      else if (f.status === "ARCHIVED") countArchived++;

      if (f.form_type === "CONTACT") countContact++;
      else if (f.form_type === "SELL_CAR") countSellCar++;
    }

    return {
      total,
      new: countNew,
      read: countRead,
      in_progress: countInProgress,
      completed: countCompleted,
      archived: countArchived,
      contact: countContact,
      sell_car: countSellCar,
    };
  }, [forms]);

  const cards = [
    {
      id: "total",
      label: t("statTotalForms", { defaultValue: "Gesamte Eingänge" }),
      count: counts.total,
      icon: "inbox",
      color: "var(--color-primary, var(--color-text))",
      isActive: activeStatusFilter === "ALL" && !activeTypeFilter,
      onClick: () => {
        onSelectStatusFilter?.("ALL");
        onSelectTypeFilter?.("");
      },
    },
    {
      id: "new",
      label: t("statusNew", { defaultValue: "Neu" }),
      count: counts.new,
      icon: "mail",
      color: "#3b82f6",
      badgeBg: "rgba(59, 130, 246, 0.12)",
      isActive: activeStatusFilter === "NEW",
      onClick: () => {
        onSelectStatusFilter?.(activeStatusFilter === "NEW" ? "ALL" : "NEW");
      },
    },
    {
      id: "read",
      label: t("statusRead", { defaultValue: "Gelesen" }),
      count: counts.read,
      icon: "book-open",
      color: "#06b6d4",
      badgeBg: "rgba(6, 182, 212, 0.12)",
      isActive: activeStatusFilter === "READ",
      onClick: () => {
        onSelectStatusFilter?.(activeStatusFilter === "READ" ? "ALL" : "READ");
      },
    },
    {
      id: "in_progress",
      label: t("statusInProgress", { defaultValue: "In Bearbeitung" }),
      count: counts.in_progress,
      icon: "clock",
      color: "#eab308",
      badgeBg: "rgba(234, 179, 8, 0.12)",
      isActive: activeStatusFilter === "IN_PROGRESS",
      onClick: () => {
        onSelectStatusFilter?.(activeStatusFilter === "IN_PROGRESS" ? "ALL" : "IN_PROGRESS");
      },
    },
    {
      id: "completed",
      label: t("statusCompleted", { defaultValue: "Abgeschlossen" }),
      count: counts.completed,
      icon: "check-circle",
      color: "#22c55e",
      badgeBg: "rgba(34, 197, 94, 0.12)",
      isActive: activeStatusFilter === "COMPLETED",
      onClick: () => {
        onSelectStatusFilter?.(activeStatusFilter === "COMPLETED" ? "ALL" : "COMPLETED");
      },
    },
    {
      id: "archived",
      label: t("statusArchived", { defaultValue: "Archiviert" }),
      count: counts.archived,
      icon: "archive",
      color: "var(--color-admin-muted, #94a3b8)",
      badgeBg: "rgba(148, 163, 184, 0.12)",
      isActive: activeStatusFilter === "ARCHIVED",
      onClick: () => {
        onSelectStatusFilter?.(activeStatusFilter === "ARCHIVED" ? "ALL" : "ARCHIVED");
      },
    },
    {
      id: "contact",
      label: t("statContactForms", { defaultValue: "Kontaktanfragen" }),
      count: counts.contact,
      icon: "message-square",
      color: "#a855f7",
      badgeBg: "rgba(168, 85, 247, 0.12)",
      isActive: activeTypeFilter === "CONTACT",
      onClick: () => {
        onSelectTypeFilter?.(activeTypeFilter === "CONTACT" ? "" : "CONTACT");
      },
    },
    {
      id: "sell_car",
      label: t("statSellCarForms", { defaultValue: "Fahrzeugankauf" }),
      count: counts.sell_car,
      icon: "car",
      color: "#f97316",
      badgeBg: "rgba(249, 115, 22, 0.12)",
      isActive: activeTypeFilter === "SELL_CAR",
      onClick: () => {
        onSelectTypeFilter?.(activeTypeFilter === "SELL_CAR" ? "" : "SELL_CAR");
      },
    },
  ];

  return (
    <div
      className={`form-summary-grid ${className}`.trim()}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        gap: "var(--space-sm)",
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
            <Icon name={card.icon} size={15} style={{ color: card.color, opacity: 0.85 }} />
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

export default FormSummaryCards;
