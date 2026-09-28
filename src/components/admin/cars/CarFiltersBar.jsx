import React, { useState } from "react";
import Input from "../../forms/Input";
import Select from "../../forms/Select";
import Button from "../../ui/Button";
import Icon from "../../common/Icon";

const FUEL_OPTIONS = [
  { value: "", label: "Alle Kraftstoffe" },
  { value: "PETROL", label: "Benzin" },
  { value: "DIESEL", label: "Diesel" },
  { value: "ELECTRIC", label: "Elektro" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "PLUGIN_HYBRID", label: "Plug-in Hybrid" },
  { value: "LPG", label: "Autogas / LPG" },
  { value: "HYDROGEN", label: "Wasserstoff" },
  { value: "OTHER", label: "Sonstige" },
];

const TRANSMISSION_OPTIONS = [
  { value: "", label: "Alle Getriebe" },
  { value: "AUTOMATIC", label: "Automatik" },
  { value: "MANUAL", label: "Schaltgetriebe" },
  { value: "SEMI_AUTOMATIC", label: "Halbautomatik" },
];

const CONDITION_OPTIONS = [
  { value: "", label: "Alle Zustände" },
  { value: "NEW", label: "Neufahrzeug" },
  { value: "USED", label: "Gebrauchtfahrzeug" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "Alle Fahrzeugklassen" },
  { value: "SEDAN", label: "Limousine" },
  { value: "SUV", label: "SUV / Geländewagen" },
  { value: "COUPE", label: "Coupé" },
  { value: "CONVERTIBLE", label: "Cabriolet" },
  { value: "WAGON", label: "Kombi" },
  { value: "HATCHBACK", label: "Schrägheck" },
  { value: "VAN", label: "Van" },
  { value: "TRUCK", label: "Nutzfahrzeug" },
  { value: "MOTORCYCLE", label: "Motorrad" },
  { value: "OTHER", label: "Sonstige" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Neueste zuerst" },
  { value: "oldest", label: "Älteste zuerst" },
  { value: "price_asc", label: "Preis: Niedrig → Hoch" },
  { value: "price_desc", label: "Preis: Hoch → Niedrig" },
  { value: "mileage_asc", label: "Kilometer: Niedrig → Hoch" },
  { value: "mileage_desc", label: "Kilometer: Hoch → Niedrig" },
  { value: "title_asc", label: "Alphabetisch: A → Z" },
  { value: "title_desc", label: "Alphabetisch: Z → A" },
];

export function CarFiltersBar({
  filters = {},
  onChange,
  onReset,
  availableBrands = [],
  className = "",
  style = {},
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

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
    { value: "", label: "Alle Marken" },
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
            placeholder="Marke, Modell oder Titel durchsuchen..."
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
              { value: "ALL", label: "Alle Status" },
              { value: "AVAILABLE", label: "Verfügbar" },
              { value: "RESERVED", label: "Reserviert" },
              { value: "SOLD", label: "Verkauft" },
              { value: "HIDDEN", label: "Ausgeblendet" },
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
          {showAdvanced ? "Weniger Filter" : "Filter"}
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
            Zurücksetzen
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
              Kraftstoffart
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
              Getriebe
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
              Zustand
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
              Fahrzeugklasse
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
              Hervorgehoben
            </label>
            <Select
              value={filters.is_featured || ""}
              onChange={(e) => handleFieldChange("is_featured", e.target.value)}
              options={[
                { value: "", label: "Alle" },
                { value: "true", label: "Nur Featured" },
                { value: "false", label: "Nur Standard" },
              ]}
              style={{ height: "34px", fontSize: "12px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--color-admin-muted)", marginBottom: "4px", display: "block" }}>
              Sichtbarkeit
            </label>
            <Select
              value={filters.is_visible || ""}
              onChange={(e) => handleFieldChange("is_visible", e.target.value)}
              options={[
                { value: "", label: "Alle" },
                { value: "true", label: "Nur Sichtbare" },
                { value: "false", label: "Nur Ausgeblendete" },
              ]}
              style={{ height: "34px", fontSize: "12px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--color-admin-muted)", marginBottom: "4px", display: "block" }}>
              Min. Preis (€)
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
              Max. Preis (€)
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
