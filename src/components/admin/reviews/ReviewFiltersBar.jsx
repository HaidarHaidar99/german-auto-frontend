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
    (filters.sort && filters.sort !== "newest")
  );

  const statusOptions = [
    { value: "ALL", label: t("filterAllStatuses", { defaultValue: "All Statuses" }) },
    { value: "PUBLISHED", label: t("statusPublished", { defaultValue: "Published" }) },
    { value: "HIDDEN", label: t("statusHidden", { defaultValue: "Hidden" }) },
  ];

  const ratingOptions = [
    { value: "ALL", label: t("filterAllRatings", { defaultValue: "All Ratings" }) },
    { value: "5", label: `5 ${t("stars", { defaultValue: "Stars" })} (★★★★★)` },
    { value: "4", label: `4 ${t("stars", { defaultValue: "Stars" })} (★★★★☆)` },
    { value: "3", label: `3 ${t("stars", { defaultValue: "Stars" })} (★★★☆☆)` },
    { value: "2", label: `2 ${t("stars", { defaultValue: "Stars" })} (★★☆☆☆)` },
    { value: "1", label: `1 ${t("star", { defaultValue: "Star" })} (★☆☆☆☆)` },
  ];

  const sortOptions = [
    { value: "newest", label: t("sortNewest", { defaultValue: "Newest first" }) },
    { value: "oldest", label: t("sortOldest", { defaultValue: "Oldest first" }) },
    { value: "rating_desc", label: t("sortRatingHigh", { defaultValue: "Highest rating" }) },
    { value: "rating_asc", label: t("sortRatingLow", { defaultValue: "Lowest rating" }) },
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
        backgroundColor: "var(--color-admin-card, #ffffff)",
        borderRadius: "var(--radius-md, 8px)",
        border: "1px solid var(--color-admin-border, #e2e8f0)",
        ...style,
      }}
    >
      {/* Search Input */}
      <div style={{ flex: 2, minWidth: "220px" }}>
        <Input
          value={filters.search || ""}
          onChange={(e) => handleFieldChange("search", e.target.value)}
          placeholder={t("searchReviewsPlaceholder", { defaultValue: "Search by reviewer name or text..." })}
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

export default ReviewFiltersBar;
