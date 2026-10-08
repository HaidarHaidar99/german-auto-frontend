import React from "react";
import { useTranslation } from "react-i18next";
import Input from "../../forms/Input";
import Select from "../../forms/Select";
import Button from "../../ui/Button";

export function FormFiltersBar({
  filters = {},
  onChange,
  onReset,
  className = "",
  style = {},
}) {
  const { t } = useTranslation(["admin", "common"]);

  const handleFieldChange = (field, val) => {
    onChange?.({
      ...filters,
      [field]: val,
    });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
    (filters.form_type && filters.form_type !== "ALL") ||
    (filters.status && filters.status !== "ALL") ||
    (filters.sort && filters.sort !== "newest")
  );

  const typeOptions = [
    { value: "ALL", label: t("filterAllTypes", { defaultValue: "All Form Types" }) },
    { value: "CONTACT", label: t("formTypeContact", { defaultValue: "Contact Inquiries" }) },
    { value: "SELL_CAR", label: t("formTypeSellCar", { defaultValue: "Vehicle Purchase" }) },
  ];

  const statusOptions = [
    { value: "ALL", label: t("filterAllStatuses", { defaultValue: "All Statuses" }) },
    { value: "NEW", label: t("statusNew", { defaultValue: "New" }) },
    { value: "READ", label: t("statusRead", { defaultValue: "Read" }) },
    { value: "IN_PROGRESS", label: t("statusInProgress", { defaultValue: "In Progress" }) },
    { value: "COMPLETED", label: t("statusCompleted", { defaultValue: "Completed" }) },
    { value: "ARCHIVED", label: t("statusArchived", { defaultValue: "Archived" }) },
  ];

  const sortOptions = [
    { value: "newest", label: t("sortNewest", { defaultValue: "Newest first" }) },
    { value: "oldest", label: t("sortOldest", { defaultValue: "Oldest first" }) },
  ];

  return (
    <div
      className={`form-filters-bar ${className}`.trim()}
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "var(--space-sm)",
        padding: "var(--space-md) var(--space-lg)",
        backgroundColor: "var(--color-admin-card, #ffffff)",
        borderRadius: "var(--radius-md, 8px)",
        border: "1px solid var(--color-admin-border, #e2e8f0)",
        ...style,
      }}
    >
      {/* Search Input */}
      <div style={{ flex: 2, minWidth: "240px" }}>
        <Input
          value={filters.search || ""}
          onChange={(e) => handleFieldChange("search", e.target.value)}
          placeholder={t("searchFormsPlaceholder", { defaultValue: "Search by name, email, phone, brand, model, VIN..." })}
          startIcon="search"
          style={{ height: "38px" }}
        />
      </div>


      {/* Status Select */}
      <div style={{ flex: 1, minWidth: "150px" }}>
        <Select
          value={filters.status || "ALL"}
          onChange={(e) => handleFieldChange("status", e.target.value)}
          options={statusOptions}
          style={{ height: "38px" }}
        />
      </div>

      {/* Sort Select */}
      <div style={{ flex: 1, minWidth: "140px" }}>
        <Select
          value={filters.sort || "newest"}
          onChange={(e) => handleFieldChange("sort", e.target.value)}
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
            color: "var(--color-admin-muted, #64748b)",
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

export default FormFiltersBar;
