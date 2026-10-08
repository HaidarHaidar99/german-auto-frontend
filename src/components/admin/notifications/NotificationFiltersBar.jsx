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
    { value: "", label: t("filterAllTypes", { defaultValue: "All Types" }) },
    { value: "CONTACT_FORM", label: t("filterContactForms", { defaultValue: "Contact Inquiries" }) },
    { value: "SELL_CAR_FORM", label: t("filterSellCarForms", { defaultValue: "Car Submissions" }) },
    { value: "NEW_REVIEW", label: t("filterReviews", { defaultValue: "Customer Reviews" }) },
    { value: "SYSTEM", label: t("filterSystem", { defaultValue: "System Alerts" }) },
  ];

  const sortOptions = [
    { value: "newest", label: t("sortNewest", { defaultValue: "Newest first" }) },
    { value: "oldest", label: t("sortOldest", { defaultValue: "Oldest first" }) },
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
        backgroundColor: "var(--color-admin-card, #ffffff)",
        borderRadius: "var(--radius-md, 8px)",
        border: "1px solid var(--color-admin-border, rgba(0, 0, 0, 0.08))",
        ...style,
      }}
    >
      {/* Status Toggle Buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          backgroundColor: "var(--color-admin-border-subtle, rgba(0, 0, 0, 0.03))",
          padding: "3px",
          borderRadius: "var(--radius-sm, 6px)",
          border: "1px solid var(--color-admin-border, rgba(0, 0, 0, 0.08))",
        }}
      >
        <button
          type="button"
          onClick={() => onChangeStatus?.("all")}
          style={{
            padding: "6px 14px",
            fontSize: "12px",
            fontWeight: 700,
            borderRadius: "5px",
            border: "none",
            backgroundColor: statusFilter === "all" ? "var(--color-admin-accent, #2563eb)" : "transparent",
            color: statusFilter === "all" ? "#ffffff" : "var(--color-admin-muted, #64748b)",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {t("filterAll", { defaultValue: "All" })}
        </button>

        <button
          type="button"
          onClick={() => onChangeStatus?.("unread")}
          style={{
            padding: "6px 14px",
            fontSize: "12px",
            fontWeight: 700,
            borderRadius: "5px",
            border: "none",
            backgroundColor: statusFilter === "unread" ? "var(--color-admin-accent, #2563eb)" : "transparent",
            color: statusFilter === "unread" ? "#ffffff" : "var(--color-admin-muted, #64748b)",
            cursor: "pointer",
            transition: "all 0.15s ease",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>{t("filterUnread", { defaultValue: "Unread" })}</span>
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: "10px",
                padding: "1px 6px",
                borderRadius: "10px",
                backgroundColor: statusFilter === "unread" ? "rgba(255, 255, 255, 0.25)" : "var(--color-admin-accent-subtle, #eff6ff)",
                color: statusFilter === "unread" ? "#ffffff" : "var(--color-admin-accent, #2563eb)",
                fontWeight: 800,
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
            padding: "6px 14px",
            fontSize: "12px",
            fontWeight: 700,
            borderRadius: "5px",
            border: "none",
            backgroundColor: statusFilter === "read" ? "var(--color-admin-accent, #2563eb)" : "transparent",
            color: statusFilter === "read" ? "#ffffff" : "var(--color-admin-muted, #64748b)",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {t("filterRead", { defaultValue: "Read" })}
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
          {t("resetFilters", { defaultValue: "Reset filters" })}
        </Button>
      )}
    </div>
  );
}

export default NotificationFiltersBar;
