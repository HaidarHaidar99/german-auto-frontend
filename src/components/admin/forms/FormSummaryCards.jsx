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
      label: t("statTotalForms", { defaultValue: "Total Submissions" }),
      count: counts.total,
      icon: "inbox",
      iconBg: "#2563eb",
      isActive: activeStatusFilter === "ALL" && !activeTypeFilter,
      onClick: () => {
        onSelectStatusFilter?.("ALL");
        onSelectTypeFilter?.("");
      },
    },
    {
      id: "new",
      label: t("statusNew", { defaultValue: "New" }),
      count: counts.new,
      icon: "mail",
      iconBg: "#3b82f6",
      isActive: activeStatusFilter === "NEW",
      onClick: () => {
        onSelectStatusFilter?.(activeStatusFilter === "NEW" ? "ALL" : "NEW");
      },
    },
    {
      id: "read",
      label: t("statusRead", { defaultValue: "Read" }),
      count: counts.read,
      icon: "check",
      iconBg: "#06b6d4",
      isActive: activeStatusFilter === "READ",
      onClick: () => {
        onSelectStatusFilter?.(activeStatusFilter === "READ" ? "ALL" : "READ");
      },
    },
    {
      id: "in_progress",
      label: t("statusInProgress", { defaultValue: "In Progress" }),
      count: counts.in_progress,
      icon: "clock",
      iconBg: "#eab308",
      isActive: activeStatusFilter === "IN_PROGRESS",
      onClick: () => {
        onSelectStatusFilter?.(activeStatusFilter === "IN_PROGRESS" ? "ALL" : "IN_PROGRESS");
      },
    },
    {
      id: "completed",
      label: t("statusCompleted", { defaultValue: "Completed" }),
      count: counts.completed,
      icon: "check-circle",
      iconBg: "#10b981",
      isActive: activeStatusFilter === "COMPLETED",
      onClick: () => {
        onSelectStatusFilter?.(activeStatusFilter === "COMPLETED" ? "ALL" : "COMPLETED");
      },
    },
    {
      id: "archived",
      label: t("statusArchived", { defaultValue: "Archived" }),
      count: counts.archived,
      icon: "archive",
      iconBg: "#64748b",
      isActive: activeStatusFilter === "ARCHIVED",
      onClick: () => {
        onSelectStatusFilter?.(activeStatusFilter === "ARCHIVED" ? "ALL" : "ARCHIVED");
      },
    },
    {
      id: "contact",
      label: t("statContactForms", { defaultValue: "Contact Requests" }),
      count: counts.contact,
      icon: "message-square",
      iconBg: "#8b5cf6",
      isActive: activeTypeFilter === "CONTACT",
      onClick: () => {
        onSelectTypeFilter?.(activeTypeFilter === "CONTACT" ? "" : "CONTACT");
      },
    },
    {
      id: "sell_car",
      label: t("statSellCarForms", { defaultValue: "Vehicle Purchases" }),
      count: counts.sell_car,
      icon: "car",
      iconBg: "#f97316",
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
          {/* Left Squircle Icon Box */}
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

export default FormSummaryCards;
