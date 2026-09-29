import React from "react";
import { useTranslation } from "react-i18next";
import Select from "../../forms/Select";
import Button from "../../ui/Button";

export function NotificationFiltersBar({
  statusFilter = "all",
  typeFilter = "",
  sort = "newest",
  unreadCount = 0,
  onChangeStatus,
  onChangeType,
  onChangeSort,
  onReset,
  className = "",
  style = {},
}) {
  const { t } = useTranslation(["admin", "common"]);

  const hasActiveFilters = Boolean(
    statusFilter !== "all" || typeFilter !== "" || sort !== "newest"
  );

  const typeOptions = [
    { value: "", label: t("filterAllTypes", { defaultValue: "Alle Arten" }) },
    { value: "CONTACT_FORM", label: t("filterContactForms", { defaultValue: "Kontaktanfragen" }) },
    { value: "SELL_CAR_FORM", label: t("filterSellCarForms", { defaultValue: "Fahrzeugankauf" }) },
    { value: "NEW_REVIEW", label: t("filterReviews", { defaultValue: "Kundenbewertungen" }) },
    { value: "SYSTEM", label: t("filterSystem", { defaultValue: "Systemmeldungen" }) },
  ];

  const sortOptions = [
    { value: "newest", label: t("sortNewest", { defaultValue: "Neueste zuerst" }) },
    { value: "oldest", label: t("sortOldest", { defaultValue: "Älteste zuerst" }) },
  ];

  return (
    <div
      className={`notification-filters-bar ${className}`.trim()}
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "var(--space-sm, 12px)",
        padding: "var(--space-md, 16px) var(--space-lg, 20px)",
        backgroundColor: "var(--color-admin-card, #121418)",
        borderRadius: "var(--radius-md, 8px)",
        border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
        ...style,
      }}
    >
      {/* Status Toggle Buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          backgroundColor: "rgba(255, 255, 255, 0.04)",
          padding: "3px",
          borderRadius: "var(--radius-sm, 6px)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <button
          type="button"
          onClick={() => onChangeStatus?.("all")}
          style={{
            padding: "5px 12px",
            fontSize: "12px",
            fontWeight: 600,
            borderRadius: "4px",
            border: "none",
            backgroundColor: statusFilter === "all" ? "var(--color-primary, var(--color-text))" : "transparent",
            color: statusFilter === "all" ? "#000000" : "var(--color-admin-muted, #94a3b8)",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {t("filterAll", { defaultValue: "Alle" })}
        </button>

        <button
          type="button"
          onClick={() => onChangeStatus?.("unread")}
          style={{
            padding: "5px 12px",
            fontSize: "12px",
            fontWeight: 600,
            borderRadius: "4px",
            border: "none",
            backgroundColor: statusFilter === "unread" ? "var(--color-primary, var(--color-text))" : "transparent",
            color: statusFilter === "unread" ? "#000000" : "var(--color-admin-muted, #94a3b8)",
            cursor: "pointer",
            transition: "all 0.15s ease",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span>{t("filterUnread", { defaultValue: "Ungelesen" })}</span>
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: "10px",
                padding: "0 5px",
                borderRadius: "10px",
                backgroundColor: statusFilter === "unread" ? "#000000" : "rgba(245, 158, 11, 0.2)",
                color: statusFilter === "unread" ? "#ffffff" : "#f59e0b",
                lineHeight: "14px",
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onChangeStatus?.("read")}
          style={{
            padding: "5px 12px",
            fontSize: "12px",
            fontWeight: 600,
            borderRadius: "4px",
            border: "none",
            backgroundColor: statusFilter === "read" ? "var(--color-primary, var(--color-text))" : "transparent",
            color: statusFilter === "read" ? "#000000" : "var(--color-admin-muted, #94a3b8)",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {t("filterRead", { defaultValue: "Gelesen" })}
        </button>
      </div>

      {/* Type Dropdown */}
      <div style={{ flex: 1, minWidth: "180px" }}>
        <Select
          value={typeFilter}
          onChange={(e) => onChangeType?.(e.target.value)}
          options={typeOptions}
          style={{ height: "38px" }}
        />
      </div>

      {/* Sort Dropdown */}
      <div style={{ flex: 1, minWidth: "150px" }}>
        <Select
          value={sort}
          onChange={(e) => onChangeSort?.(e.target.value)}
          options={sortOptions}
          style={{ height: "38px" }}
        />
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          style={{
            height: "38px",
            color: "var(--color-admin-muted, #94a3b8)",
            fontSize: "var(--font-size-xs, 12px)",
            whiteSpace: "nowrap",
          }}
        >
          {t("resetFilters", { defaultValue: "Filter zurücksetzen" })}
        </Button>
      )}
    </div>
  );
}

export default NotificationFiltersBar;
