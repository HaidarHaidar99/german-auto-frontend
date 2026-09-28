import React from "react";
import { useTranslation } from "react-i18next";
import Input from "../../forms/Input";
import Select from "../../forms/Select";
import Button from "../../ui/Button";

export function ReviewFiltersBar({
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
    (filters.status && filters.status !== "ALL") ||
    (filters.rating && filters.rating !== "ALL") ||
    (filters.sort && filters.sort !== "newest") ||
    (filters.imageFilter && filters.imageFilter !== "ALL")
  );

  const statusOptions = [
    { value: "ALL", label: t("filterAllStatuses", { defaultValue: "Alle Status" }) },
    { value: "PENDING", label: t("statusPending", { defaultValue: "Ausstehend" }) },
    { value: "PUBLISHED", label: t("statusPublished", { defaultValue: "Veröffentlicht" }) },
    { value: "HIDDEN", label: t("statusHidden", { defaultValue: "Ausgeblendet" }) },
    { value: "DELETED", label: t("statusDeleted", { defaultValue: "Gelöscht" }) },
  ];

  const ratingOptions = [
    { value: "ALL", label: t("filterAllRatings", { defaultValue: "Alle Sterne" }) },
    { value: "5", label: `5 ${t("stars", { defaultValue: "Sterne" })} (★★★★★)` },
    { value: "4", label: `4 ${t("stars", { defaultValue: "Sterne" })} (★★★★☆)` },
    { value: "3", label: `3 ${t("stars", { defaultValue: "Sterne" })} (★★★☆☆)` },
    { value: "2", label: `2 ${t("stars", { defaultValue: "Sterne" })} (★★☆☆☆)` },
    { value: "1", label: `1 ${t("star", { defaultValue: "Stern" })} (★☆☆☆☆)` },
  ];

  const sortOptions = [
    { value: "newest", label: t("sortNewest", { defaultValue: "Neueste zuerst" }) },
    { value: "oldest", label: t("sortOldest", { defaultValue: "Älteste zuerst" }) },
    { value: "rating_desc", label: t("sortRatingHigh", { defaultValue: "Beste Bewertung" }) },
    { value: "rating_asc", label: t("sortRatingLow", { defaultValue: "Niedrigste Bewertung" }) },
  ];

  const imageOptions = [
    { value: "ALL", label: t("filterAllImages", { defaultValue: "Alle (mit & ohne Foto)" }) },
    { value: "with_image", label: t("filterHasImage", { defaultValue: "Nur mit Foto" }) },
    { value: "without_image", label: t("filterNoImage", { defaultValue: "Ohne Foto" }) },
  ];

  return (
    <div
      className={`review-filters-bar ${className}`.trim()}
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
      {/* Search Input */}
      <div style={{ flex: 2, minWidth: "220px" }}>
        <Input
          value={filters.search || ""}
          onChange={(e) => handleFieldChange("search", e.target.value)}
          placeholder={t("searchReviewsPlaceholder", { defaultValue: "Name oder Rezensionstext durchsuchen..." })}
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

      {/* Rating Select */}
      <div style={{ flex: 1, minWidth: "150px" }}>
        <Select
          value={filters.rating || "ALL"}
          onChange={(e) => handleFieldChange("rating", e.target.value)}
          options={ratingOptions}
          style={{ height: "38px" }}
        />
      </div>

      {/* Sort Select */}
      <div style={{ flex: 1, minWidth: "160px" }}>
        <Select
          value={filters.sort || "newest"}
          onChange={(e) => handleFieldChange("sort", e.target.value)}
          options={sortOptions}
          style={{ height: "38px" }}
        />
      </div>

      {/* Image Filter Select */}
      <div style={{ flex: 1, minWidth: "160px" }}>
        <Select
          value={filters.imageFilter || "ALL"}
          onChange={(e) => handleFieldChange("imageFilter", e.target.value)}
          options={imageOptions}
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

export default ReviewFiltersBar;
