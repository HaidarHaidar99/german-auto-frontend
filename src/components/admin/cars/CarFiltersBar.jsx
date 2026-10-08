import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Input from "../../forms/Input";
import Select from "../../forms/Select";
import Button from "../../ui/Button";
import Icon from "../../common/Icon";

export function CarFiltersBar({
  filters = {},
  onChange,
  onReset,
  availableBrands = [],
  className = "",
  style = {},
}) {
  const { t } = useTranslation(["admin", "cars", "common"]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const FUEL_OPTIONS = [
    { value: "", label: t("allFuels", { defaultValue: "All Fuels" }) },
    { value: "PETROL", label: t("fuelPetrol", { defaultValue: "Petrol" }) },
    { value: "DIESEL", label: t("fuelDiesel", { defaultValue: "Diesel" }) },
    { value: "ELECTRIC", label: t("fuelElectric", { defaultValue: "Electric" }) },
    { value: "HYBRID", label: t("fuelHybrid", { defaultValue: "Hybrid" }) },
    { value: "PLUGIN_HYBRID", label: t("fuelPluginHybrid", { defaultValue: "Plug-in Hybrid" }) },
    { value: "LPG", label: t("fuelLpg", { defaultValue: "LPG / Autogas" }) },
    { value: "HYDROGEN", label: t("fuelHydrogen", { defaultValue: "Hydrogen" }) },
    { value: "OTHER", label: t("fuelOther", { defaultValue: "Other" }) },
  ];

  const TRANSMISSION_OPTIONS = [
    { value: "", label: t("allTransmissions", { defaultValue: "All Transmissions" }) },
    { value: "AUTOMATIC", label: t("transmissionAutomatic", { defaultValue: "Automatic" }) },
    { value: "MANUAL", label: t("transmissionManual", { defaultValue: "Manual" }) },
    { value: "SEMI_AUTOMATIC", label: t("transmissionSemiAutomatic", { defaultValue: "Semi-Automatic" }) },
  ];

  const CONDITION_OPTIONS = [
    { value: "", label: t("allConditions", { defaultValue: "All Conditions" }) },
    { value: "NEW", label: t("conditionNew", { defaultValue: "New" }) },
    { value: "USED", label: t("conditionUsed", { defaultValue: "Used" }) },
  ];

  const CATEGORY_OPTIONS = [
    { value: "", label: t("allCategories", { defaultValue: "All Categories" }) },
    { value: "SEDAN", label: t("catSedan", { defaultValue: "Sedan" }) },
    { value: "SUV", label: t("catSuv", { defaultValue: "SUV / Off-road" }) },
    { value: "COUPE", label: t("catCoupe", { defaultValue: "Coupe" }) },
    { value: "CONVERTIBLE", label: t("catConvertible", { defaultValue: "Convertible" }) },
    { value: "WAGON", label: t("catWagon", { defaultValue: "Station Wagon" }) },
    { value: "HATCHBACK", label: t("catHatchback", { defaultValue: "Hatchback" }) },
    { value: "VAN", label: t("catVan", { defaultValue: "Van" }) },
    { value: "TRUCK", label: t("catTruck", { defaultValue: "Commercial / Truck" }) },
    { value: "MOTORCYCLE", label: t("catMotorcycle", { defaultValue: "Motorcycle" }) },
    { value: "OTHER", label: t("catOther", { defaultValue: "Other" }) },
  ];

  const SORT_OPTIONS = [
    { value: "newest", label: t("sortNewest", { defaultValue: "Newest first" }) },
    { value: "oldest", label: t("sortOldest", { defaultValue: "Oldest first" }) },
    { value: "price_asc", label: t("sortPriceAsc", { defaultValue: "Price: Low → High" }) },
    { value: "price_desc", label: t("sortPriceDesc", { defaultValue: "Price: High → Low" }) },
    { value: "mileage_asc", label: t("sortMileageAsc", { defaultValue: "Mileage: Low → High" }) },
    { value: "mileage_desc", label: t("sortMileageDesc", { defaultValue: "Mileage: High → Low" }) },
    { value: "az", label: t("sortAz", { defaultValue: "Alphabetical: A → Z" }) },
    { value: "za", label: t("sortZa", { defaultValue: "Alphabetical: Z → A" }) },
  ];

  const handleFieldChange = (field, val) => {
    onChange?.({
      ...filters,
      [field]: val,
    });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.brand ||
    filters.fuel_type ||
    filters.transmission ||
    filters.condition ||
    filters.category ||
    (filters.status && filters.status !== "ALL") ||
    filters.is_featured ||
    filters.is_visible ||
    filters.min_price ||
    filters.max_price ||
    filters.max_mileage
  );

  const brandOptions = [
    { value: "", label: t("allBrands", { defaultValue: "All Brands" }) },
    ...availableBrands.map((b) => ({ value: b, label: b })),
  ];

  return (
    <div
      className={`car-filters-bar ${className}`.trim()}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
        padding: "var(--space-md) var(--space-lg)",
        backgroundColor: "var(--color-admin-card, #121418)",
        borderRadius: "var(--radius-md, 8px)",
        border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
        ...style,
      }}
    >
      {/* Top Primary Filter Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-sm)",
        }}
      >
        {/* Search */}
        <div style={{ flex: 2, minWidth: "220px" }}>
          <Input
            value={filters.search || ""}
            onChange={(e) => handleFieldChange("search", e.target.value)}
            placeholder={t("searchPlaceholder", { defaultValue: "Search make, model, or title..." })}
            startIcon="search"
            style={{ height: "38px" }}
          />
        </div>

        {/* Brand */}
        <div style={{ flex: 1, minWidth: "150px" }}>
          <Select
            value={filters.brand || ""}
            onChange={(e) => handleFieldChange("brand", e.target.value)}
            options={brandOptions}
            style={{ height: "38px" }}
          />
        </div>

        {/* Status */}
        <div style={{ flex: 1, minWidth: "140px" }}>
          <Select
            value={filters.status || "ALL"}
            onChange={(e) => handleFieldChange("status", e.target.value)}
            options={[
              { value: "ALL", label: t("allStatuses", { defaultValue: "All Statuses" }) },
              { value: "AVAILABLE", label: t("statusAvailable", { defaultValue: "Available" }) },
              { value: "RESERVED", label: t("statusReserved", { defaultValue: "Reserved" }) },
              { value: "SOLD", label: t("statusSold", { defaultValue: "Sold" }) },
              { value: "HIDDEN", label: t("statusHidden", { defaultValue: "Hidden" }) },
            ]}
            style={{ height: "38px" }}
          />
        </div>

        {/* Sort */}
        <div style={{ flex: 1, minWidth: "160px" }}>
          <Select
            value={filters.sort || "newest"}
            onChange={(e) => handleFieldChange("sort", e.target.value)}
            options={SORT_OPTIONS}
            style={{ height: "38px" }}
          />
        </div>

        {/* Toggle Advanced Filters Button */}
        <Button
          variant={showAdvanced ? "secondary" : "outline"}
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ height: "38px", padding: "0 14px", fontSize: "var(--font-size-xs)" }}
        >
          <Icon name="sliders" size={14} style={{ marginRight: "6px" }} />
          {showAdvanced ? t("lessFilters", { defaultValue: "Fewer Filters" }) : t("filters", { defaultValue: "Filters" })}
          {hasActiveFilters && (
            <span
              style={{
                marginLeft: "6px",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "var(--color-primary, var(--color-text))",
              }}
            />
          )}
        </Button>

        {/* Reset Filter Action */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            style={{ height: "38px", color: "var(--color-admin-muted)", fontSize: "var(--font-size-xs)" }}
          >
            {t("resetFilters", { defaultValue: "Reset Filters" })}
          </Button>
        )}
      </div>

      {/* Advanced Filter Drawer / Grid */}
      {showAdvanced && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "var(--space-sm)",
            paddingTop: "var(--space-sm)",
            borderTop: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.06))",
          }}
        >
          <div>
            <label style={{ fontSize: "11px", color: "var(--color-admin-muted)", marginBottom: "4px", display: "block" }}>
              {t("fuelType", { defaultValue: "Fuel Type" })}
            </label>
            <Select
              value={filters.fuel_type || ""}
              onChange={(e) => handleFieldChange("fuel_type", e.target.value)}
              options={FUEL_OPTIONS}
              style={{ height: "34px", fontSize: "12px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--color-admin-muted)", marginBottom: "4px", display: "block" }}>
              {t("transmission", { defaultValue: "Transmission" })}
            </label>
            <Select
              value={filters.transmission || ""}
              onChange={(e) => handleFieldChange("transmission", e.target.value)}
              options={TRANSMISSION_OPTIONS}
              style={{ height: "34px", fontSize: "12px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--color-admin-muted)", marginBottom: "4px", display: "block" }}>
              {t("condition", { defaultValue: "Condition" })}
            </label>
            <Select
              value={filters.condition || ""}
              onChange={(e) => handleFieldChange("condition", e.target.value)}
              options={CONDITION_OPTIONS}
              style={{ height: "34px", fontSize: "12px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--color-admin-muted)", marginBottom: "4px", display: "block" }}>
              {t("category", { defaultValue: "Vehicle Category" })}
            </label>
            <Select
              value={filters.category || ""}
              onChange={(e) => handleFieldChange("category", e.target.value)}
              options={CATEGORY_OPTIONS}
              style={{ height: "34px", fontSize: "12px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--color-admin-muted)", marginBottom: "4px", display: "block" }}>
              {t("featured", { defaultValue: "Featured" })}
            </label>
            <Select
              value={filters.is_featured || ""}
              onChange={(e) => handleFieldChange("is_featured", e.target.value)}
              options={[
                { value: "", label: t("all", { defaultValue: "All" }) },
                { value: "true", label: t("featuredOnly", { defaultValue: "Featured Only" }) },
                { value: "false", label: t("standardOnly", { defaultValue: "Standard Only" }) },
              ]}
              style={{ height: "34px", fontSize: "12px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--color-admin-muted)", marginBottom: "4px", display: "block" }}>
              {t("visibility", { defaultValue: "Visibility" })}
            </label>
            <Select
              value={filters.is_visible || ""}
              onChange={(e) => handleFieldChange("is_visible", e.target.value)}
              options={[
                { value: "", label: t("all", { defaultValue: "All" }) },
                { value: "true", label: t("visibleOnly", { defaultValue: "Visible Only" }) },
                { value: "false", label: t("hiddenOnly", { defaultValue: "Hidden Only" }) },
              ]}
              style={{ height: "34px", fontSize: "12px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--color-admin-muted)", marginBottom: "4px", display: "block" }}>
              {t("filterMinPrice", { defaultValue: "Min. Price (€)" })}
            </label>
            <Input
              type="number"
              value={filters.min_price || ""}
              onChange={(e) => handleFieldChange("min_price", e.target.value)}
              placeholder="0"
              style={{ height: "34px", fontSize: "12px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--color-admin-muted)", marginBottom: "4px", display: "block" }}>
              {t("filterMaxPrice", { defaultValue: "Max. Price (€)" })}
            </label>
            <Input
              type="number"
              value={filters.max_price || ""}
              onChange={(e) => handleFieldChange("max_price", e.target.value)}
              placeholder="500000"
              style={{ height: "34px", fontSize: "12px" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default CarFiltersBar;
