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
    { value: "ALL", label: t("filterAllTypes", { defaultValue: "Alle Formulararten" }) },
    { value: "CONTACT", label: t("formTypeContact", { defaultValue: "Kontaktanfragen" }) },
    { value: "SELL_CAR", label: t("formTypeSellCar", { defaultValue: "Fahrzeugankauf" }) },
  ];

  const statusOptions = [
    { value: "ALL", label: t("filterAllStatuses", { defaultValue: "Alle Status" }) },
    { value: "NEW", label: t("statusNew", { defaultValue: "Neu" }) },
    { value: "READ", label: t("statusRead", { defaultValue: "Gelesen" }) },
    { value: "IN_PROGRESS", label: t("statusInProgress", { defaultValue: "In Bearbeitung" }) },
    { value: "COMPLETED", label: t("statusCompleted", { defaultValue: "Abgeschlossen" }) },
    { value: "ARCHIVED", label: t("statusArchived", { defaultValue: "Archiviert" }) },
  ];

  const sortOptions = [
    { value: "newest", label: t("sortNewest", { defaultValue: "Neueste zuerst" }) },
    { value: "oldest", label: t("sortOldest", { defaultValue: "Älteste zuerst" }) },
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
        backgroundColor: "var(--color-admin-card, #121418)",
        borderRadius: "var(--radius-md, 8px)",
        border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
        ...style,
      }}
    >
      {/* Search Input */}
      <div style={{ flex: 2, minWidth: "240px" }}>
        <Input
          value={filters.search || ""}
          onChange={(e) => handleFieldChange("search", e.target.value)}
          placeholder={t("searchFormsPlaceholder", { defaultValue: "Name, E-Mail, Telefon, Marke, Modell, FIN durchsuchen..." })}
          startIcon="search"
          style={{ height: "38px" }}
        />
      </div>

      {/* Form Type Select */}
      <div style={{ flex: 1, minWidth: "160px" }}>
        <Select
          value={filters.form_type || "ALL"}
          onChange={(e) => handleFieldChange("form_type", e.target.value)}
          options={typeOptions}
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
            color: "var(--color-admin-muted, #94a3b8)",
            fontSize: "var(--font-size-xs)",
            whiteSpace: "nowrap",
          }}
        >
          {t("resetFilters", { defaultValue: "Filter zurücksetzen" })}
        </Button>
      )}
    </div>
  );
}

export default FormFiltersBar;
