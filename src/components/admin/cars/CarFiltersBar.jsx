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
    { value: "", label: t("allFuels", { defaultValue: "Alle Kraftstoffe" }) },
    { value: "PETROL", label: t("fuelPetrol", { defaultValue: "Benzin" }) },
    { value: "DIESEL", label: t("fuelDiesel", { defaultValue: "Diesel" }) },
    { value: "ELECTRIC", label: t("fuelElectric", { defaultValue: "Elektro" }) },
    { value: "HYBRID", label: t("fuelHybrid", { defaultValue: "Hybrid" }) },
    { value: "PLUGIN_HYBRID", label: t("fuelPluginHybrid", { defaultValue: "Plug-in Hybrid" }) },
    { value: "LPG", label: t("fuelLpg", { defaultValue: "Autogas / LPG" }) },
    { value: "HYDROGEN", label: t("fuelHydrogen", { defaultValue: "Wasserstoff" }) },
    { value: "OTHER", label: t("fuelOther", { defaultValue: "Sonstige" }) },
  ];

  const TRANSMISSION_OPTIONS = [
    { value: "", label: t("allTransmissions", { defaultValue: "Alle Getriebe" }) },
    { value: "AUTOMATIC", label: t("transmissionAutomatic", { defaultValue: "Automatik" }) },
    { value: "MANUAL", label: t("transmissionManual", { defaultValue: "Schaltgetriebe" }) },
    { value: "SEMI_AUTOMATIC", label: t("transmissionSemiAutomatic", { defaultValue: "Halbautomatik" }) },
  ];

  const CONDITION_OPTIONS = [
    { value: "", label: t("allConditions", { defaultValue: "Alle Zustände" }) },
    { value: "NEW", label: t("conditionNew", { defaultValue: "Neufahrzeug" }) },
    { value: "USED", label: t("conditionUsed", { defaultValue: "Gebrauchtfahrzeug" }) },
  ];

  const CATEGORY_OPTIONS = [
    { value: "", label: t("allCategories", { defaultValue: "Alle Fahrzeugklassen" }) },
    { value: "SEDAN", label: t("catSedan", { defaultValue: "Limousine" }) },
    { value: "SUV", label: t("catSuv", { defaultValue: "SUV / Geländewagen" }) },
    { value: "COUPE", label: t("catCoupe", { defaultValue: "Coupé" }) },
    { value: "CONVERTIBLE", label: t("catConvertible", { defaultValue: "Cabriolet" }) },
    { value: "WAGON", label: t("catWagon", { defaultValue: "Kombi" }) },
    { value: "HATCHBACK", label: t("catHatchback", { defaultValue: "Schrägheck" }) },
    { value: "VAN", label: t("catVan", { defaultValue: "Van" }) },
    { value: "TRUCK", label: t("catTruck", { defaultValue: "Nutzfahrzeug" }) },
    { value: "MOTORCYCLE", label: t("catMotorcycle", { defaultValue: "Motorrad" }) },
    { value: "OTHER", label: t("catOther", { defaultValue: "Sonstige" }) },
  ];

  const SORT_OPTIONS = [
    { value: "newest", label: t("sortNewest", { defaultValue: "Neueste zuerst" }) },
    { value: "oldest", label: t("sortOldest", { defaultValue: "Älteste zuerst" }) },
    { value: "price_asc", label: t("sortPriceAsc", { defaultValue: "Preis: Niedrig → Hoch" }) },
    { value: "price_desc", label: t("sortPriceDesc", { defaultValue: "Preis: Hoch → Niedrig" }) },
    { value: "mileage_asc", label: t("sortMileageAsc", { defaultValue: "Kilometer: Niedrig → Hoch" }) },
    { value: "mileage_desc", label: t("sortMileageDesc", { defaultValue: "Kilometer: Hoch → Niedrig" }) },
    { value: "az", label: t("sortAz", { defaultValue: "Alphabetisch: A → Z" }) },
    { value: "za", label: t("sortZa", { defaultValue: "Alphabetisch: Z → A" }) },
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
    { value: "", label: t("allBrands", { defaultValue: "Alle Marken" }) },
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
            placeholder={t("searchPlaceholder", { defaultValue: "Marke, Modell oder Titel durchsuchen..." })}
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
              { value: "ALL", label: t("allStatuses", { defaultValue: "Alle Status" }) },
              { value: "AVAILABLE", label: t("statusAvailable", { defaultValue: "Verfügbar" }) },
              { value: "RESERVED", label: t("statusReserved", { defaultValue: "Reserviert" }) },
              { value: "SOLD", label: t("statusSold", { defaultValue: "Verkauft" }) },
              { value: "HIDDEN", label: t("statusHidden", { defaultValue: "Ausgeblendet" }) },
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
          {showAdvanced ? t("lessFilters", { defaultValue: "Weniger Filter" }) : t("filters", { defaultValue: "Filter" })}
          {hasActiveFilters && (
            <span
              style={{
                marginLeft: "6px",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "var(--color-primary, #C5A059)",
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
            {t("resetFilters", { defaultValue: "Zurücksetzen" })}
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
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div>
            <label style={{ fontSize: "11px", color: "var(--color-admin-muted)", marginBottom: "4px", display: "block" }}>
              {t("fuelType", { defaultValue: "Kraftstoffart" })}
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
              {t("transmission", { defaultValue: "Getriebe" })}
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
              {t("condition", { defaultValue: "Zustand" })}
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
              {t("category", { defaultValue: "Fahrzeugklasse" })}
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
              {t("featured", { defaultValue: "Hervorgehoben" })}
            </label>
            <Select
              value={filters.is_featured || ""}
              onChange={(e) => handleFieldChange("is_featured", e.target.value)}
              options={[
                { value: "", label: t("all", { defaultValue: "Alle" }) },
                { value: "true", label: t("featuredOnly", { defaultValue: "Nur Featured" }) },
                { value: "false", label: t("standardOnly", { defaultValue: "Nur Standard" }) },
              ]}
              style={{ height: "34px", fontSize: "12px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--color-admin-muted)", marginBottom: "4px", display: "block" }}>
              {t("visibility", { defaultValue: "Sichtbarkeit" })}
            </label>
            <Select
              value={filters.is_visible || ""}
              onChange={(e) => handleFieldChange("is_visible", e.target.value)}
              options={[
                { value: "", label: t("all", { defaultValue: "Alle" }) },
                { value: "true", label: t("visibleOnly", { defaultValue: "Nur Sichtbare" }) },
                { value: "false", label: t("hiddenOnly", { defaultValue: "Nur Ausgeblendete" }) },
              ]}
              style={{ height: "34px", fontSize: "12px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--color-admin-muted)", marginBottom: "4px", display: "block" }}>
              {t("filterMinPrice", { defaultValue: "Min. Preis (€)" })}
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
              {t("filterMaxPrice", { defaultValue: "Max. Preis (€)" })}
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
