import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Input from "../forms/Input";
import Select from "../forms/Select";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import Badge from "../ui/Badge";
import Icon from "../common/Icon";

/**
 * German Auto — Cars Filter & Search Bar
 * Handles debounced search, server-side filters, sorting, and active filter chips.
 * Mobile opens an accessible Drawer; Desktop offers responsive inline/panel controls.
 */

export function CarsFilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults = 0,
}) {
  const { t } = useTranslation(["cars", "common"]);

  // Local state for debounced search
  const [searchValue, setSearchValue] = useState(filters.search || filters.brand || "");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(false);

  // Sync external filter changes to search input
  useEffect(() => {
    setSearchValue(filters.search || filters.brand || "");
  }, [filters.search, filters.brand]);

  // Debounce search update (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue !== (filters.search || filters.brand || "")) {
        onFilterChange({ brand: searchValue || undefined, page: 1 });
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [searchValue, filters.search, filters.brand, onFilterChange]);

  // Count active filters (excluding default sort and page)
  const activeFilterCount = [
    Boolean(searchValue),
    Boolean(filters.fuel_type),
    Boolean(filters.transmission),
    Boolean(filters.condition),
    Boolean(filters.category),
    Boolean(filters.min_price),
    Boolean(filters.max_price),
    Boolean(filters.max_mileage),
  ].filter(Boolean).length;

  const sortOptions = [
    { value: "newest", label: t("sortNewest", "Neueste zuerst") },
    { value: "price_asc", label: t("sortPriceAsc", "Preis aufsteigend") },
    { value: "price_desc", label: t("sortPriceDesc", "Preis absteigend") },
    { value: "mileage_asc", label: t("sortMileageAsc", "Kilometerstand aufsteigend") },
    { value: "mileage_desc", label: t("sortMileageDesc", "Kilometerstand absteigend") },
    { value: "az", label: t("sortAz", "Marke (A–Z)") },
    { value: "za", label: t("sortZa", "Marke (Z–A)") },
    { value: "oldest", label: t("sortOldest", "Älteste zuerst") },
  ];

  const fuelOptions = [
    { value: "", label: t("filterAllFuels", "Alle Kraftstoffarten") },
    { value: "PETROL", label: t("fuel_PETROL", "Benzin") },
    { value: "DIESEL", label: t("fuel_DIESEL", "Diesel") },
    { value: "ELECTRIC", label: t("fuel_ELECTRIC", "Elektro") },
    { value: "HYBRID", label: t("fuel_HYBRID", "Hybrid") },
    { value: "PLUGIN_HYBRID", label: t("fuel_PLUGIN_HYBRID", "Plug-in-Hybrid") },
  ];

  const transmissionOptions = [
    { value: "", label: t("filterAllTransmissions", "Alle Getriebe") },
    { value: "AUTOMATIC", label: t("trans_AUTOMATIC", "Automatik") },
    { value: "MANUAL", label: t("trans_MANUAL", "Schaltgetriebe") },
    { value: "SEMI_AUTOMATIC", label: t("trans_SEMI_AUTOMATIC", "Halbautomatik") },
  ];

  const conditionOptions = [
    { value: "", label: t("filterAllConditions", "Alle Zustände") },
    { value: "NEW", label: t("cond_NEW", "Neufahrzeug") },
    { value: "USED", label: t("cond_USED", "Gebrauchtfahrzeug") },
  ];

  const categoryOptions = [
    { value: "", label: t("filterAllCategories", "Alle Kategorien") },
    { value: "SEDAN", label: t("cat_SEDAN", "Limousine") },
    { value: "SUV", label: t("cat_SUV", "SUV / Geländewagen") },
    { value: "COUPE", label: t("cat_COUPE", "Coupé") },
    { value: "CONVERTIBLE", label: t("cat_CONVERTIBLE", "Cabriolet") },
    { value: "WAGON", label: t("cat_WAGON", "Kombi") },
    { value: "HATCHBACK", label: t("cat_HATCHBACK", "Kompaktwagen") },
  ];

  const handleClearSearch = () => {
    setSearchValue("");
    onFilterChange({ brand: undefined, page: 1 });
  };

  const handleFieldChange = (key, value) => {
    onFilterChange({ [key]: value || undefined, page: 1 });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
        marginBottom: "var(--space-xl)",
      }}
    >
      {/* Top Bar: Search Input, Filter Toggle, Sort Selector */}
      <div
        className="surface-card"
        style={{
          padding: "var(--space-md) var(--space-lg)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-md)",
        }}
      >
        {/* Search Field */}
        <div style={{ flex: "1 1 280px", maxWidth: "440px", position: "relative" }}>
          <Input
            placeholder={t("searchPlaceholder", "Nach Marke oder Modell suchen...")}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            startIcon="search"
            aria-label="Fahrzeugsuche"
            style={{ margin: 0 }}
          />
          {searchValue && (
            <button
              type="button"
              aria-label="Suchbegriff löschen"
              onClick={handleClearSearch}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--color-text-subtle)",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>

        {/* Action Controls Group: Filter Toggle & Sort Dropdown */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-sm)",
            flexWrap: "wrap",
          }}
        >
          {/* Mobile Filter Button */}
          <div className="hide-desktop">
            <Button
              variant={activeFilterCount > 0 ? "primary" : "secondary"}
              size="md"
              iconLeft="sliders"
              onClick={() => setMobileDrawerOpen(true)}
            >
              <span>{t("filterToggle", "Filter anpassen")}</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" size="sm" style={{ marginLeft: "4px" }}>
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Desktop Filter Toggle Button */}
          <div className="hide-mobile">
            <Button
              variant={desktopFiltersOpen || activeFilterCount > 0 ? "secondary" : "outline"}
              size="md"
              iconLeft="sliders"
              onClick={() => setDesktopFiltersOpen(!desktopFiltersOpen)}
            >
              <span>{t("filterToggle", "Filter anpassen")}</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" size="sm" style={{ marginLeft: "4px" }}>
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Sorting Dropdown */}
          <div style={{ minWidth: "180px" }}>
            <Select
              placeholder=""
              options={sortOptions}
              value={filters.sort || "newest"}
              onChange={(e) => handleFieldChange("sort", e.target.value)}
              aria-label={t("sortBy", "Sortierung")}
            />
          </div>

          {/* Reset All Filters Button */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="md"
              onClick={onResetFilters}
              style={{ color: "var(--color-error)" }}
            >
              {t("filterReset", "Filter zurücksetzen")}
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Collapsible Extended Filter Panel */}
      {desktopFiltersOpen && (
        <div
          className="surface-card hide-mobile"
          style={{
            padding: "var(--space-lg)",
            borderRadius: "var(--radius-lg)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-md)",
            border: "1px solid var(--color-border)",
            animation: "fadeInFilters 0.25s var(--ease-smooth)",
          }}
        >
          {/* Fuel Filter */}
          <Select
            label={t("filterFuel", "Kraftstoffart")}
            options={fuelOptions}
            value={filters.fuel_type || ""}
            onChange={(e) => handleFieldChange("fuel_type", e.target.value)}
          />

          {/* Transmission Filter */}
          <Select
            label={t("filterTransmission", "Getriebe")}
            options={transmissionOptions}
            value={filters.transmission || ""}
            onChange={(e) => handleFieldChange("transmission", e.target.value)}
          />

          {/* Condition Filter */}
          <Select
            label={t("filterCondition", "Fahrzeugzustand")}
            options={conditionOptions}
            value={filters.condition || ""}
            onChange={(e) => handleFieldChange("condition", e.target.value)}
          />

          {/* Category Filter */}
          <Select
            label={t("filterCategory", "Kategorie")}
            options={categoryOptions}
            value={filters.category || ""}
            onChange={(e) => handleFieldChange("category", e.target.value)}
          />

          {/* Min Price */}
          <Input
            label={t("minPrice", "Min. Preis (€)")}
            type="number"
            min="0"
            step="1000"
            placeholder="0"
            value={filters.min_price || ""}
            onChange={(e) => handleFieldChange("min_price", e.target.value)}
          />

          {/* Max Price */}
          <Input
            label={t("maxPrice", "Max. Preis (€)")}
            type="number"
            min="0"
            step="1000"
            placeholder="500.000"
            value={filters.max_price || ""}
            onChange={(e) => handleFieldChange("max_price", e.target.value)}
          />

          {/* Max Mileage */}
          <Input
            label={t("maxMileage", "Max. Kilometer (km)")}
            type="number"
            min="0"
            step="5000"
            placeholder="150.000"
            value={filters.max_mileage || ""}
            onChange={(e) => handleFieldChange("max_mileage", e.target.value)}
          />
        </div>
      )}

      {/* Active Filter Chips & Result Counter Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-sm)",
          padding: "0 var(--space-xs)",
        }}
      >
        {/* Results Counter */}
        <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", fontWeight: 500 }}>
          {totalResults === 1
            ? t("resultsCount_one", "{{count}} Fahrzeug gefunden", { count: 1 })
            : t("resultsCount_other", "{{count}} Fahrzeuge gefunden", { count: totalResults })}
        </div>

        {/* Active Filter Badges */}
        {activeFilterCount > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-xs)", alignItems: "center" }}>
            {searchValue && (
              <Badge variant="secondary" size="md">
                "{searchValue}"
                <button
                  type="button"
                  onClick={handleClearSearch}
                  style={{ background: "none", border: "none", cursor: "pointer", marginLeft: "4px", color: "inherit" }}
                >
                  ×
                </button>
              </Badge>
            )}

            {filters.fuel_type && (
              <Badge variant="secondary" size="md">
                {t(`fuel_${filters.fuel_type}`, filters.fuel_type)}
                <button
                  type="button"
                  onClick={() => handleFieldChange("fuel_type", undefined)}
                  style={{ background: "none", border: "none", cursor: "pointer", marginLeft: "4px", color: "inherit" }}
                >
                  ×
                </button>
              </Badge>
            )}

            {filters.transmission && (
              <Badge variant="secondary" size="md">
                {t(`trans_${filters.transmission}`, filters.transmission)}
                <button
                  type="button"
                  onClick={() => handleFieldChange("transmission", undefined)}
                  style={{ background: "none", border: "none", cursor: "pointer", marginLeft: "4px", color: "inherit" }}
                >
                  ×
                </button>
              </Badge>
            )}

            {filters.condition && (
              <Badge variant="secondary" size="md">
                {t(`cond_${filters.condition}`, filters.condition)}
                <button
                  type="button"
                  onClick={() => handleFieldChange("condition", undefined)}
                  style={{ background: "none", border: "none", cursor: "pointer", marginLeft: "4px", color: "inherit" }}
                >
                  ×
                </button>
              </Badge>
            )}

            {filters.max_price && (
              <Badge variant="secondary" size="md">
                ≤ {filters.max_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} €
                <button
                  type="button"
                  onClick={() => handleFieldChange("max_price", undefined)}
                  style={{ background: "none", border: "none", cursor: "pointer", marginLeft: "4px", color: "inherit" }}
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Mobile Filter Slide-Over Drawer */}
      <Drawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        title={t("filterToggle", "Filter anpassen")}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <Select
            label={t("filterFuel", "Kraftstoffart")}
            options={fuelOptions}
            value={filters.fuel_type || ""}
            onChange={(e) => handleFieldChange("fuel_type", e.target.value)}
          />

          <Select
            label={t("filterTransmission", "Getriebe")}
            options={transmissionOptions}
            value={filters.transmission || ""}
            onChange={(e) => handleFieldChange("transmission", e.target.value)}
          />

          <Select
            label={t("filterCondition", "Fahrzeugzustand")}
            options={conditionOptions}
            value={filters.condition || ""}
            onChange={(e) => handleFieldChange("condition", e.target.value)}
          />

          <Select
            label={t("filterCategory", "Kategorie")}
            options={categoryOptions}
            value={filters.category || ""}
            onChange={(e) => handleFieldChange("category", e.target.value)}
          />

          <Input
            label={t("minPrice", "Min. Preis (€)")}
            type="number"
            min="0"
            step="1000"
            placeholder="0"
            value={filters.min_price || ""}
            onChange={(e) => handleFieldChange("min_price", e.target.value)}
          />

          <Input
            label={t("maxPrice", "Max. Preis (€)")}
            type="number"
            min="0"
            step="1000"
            placeholder="500.000"
            value={filters.max_price || ""}
            onChange={(e) => handleFieldChange("max_price", e.target.value)}
          />

          <Input
            label={t("maxMileage", "Max. Kilometer (km)")}
            type="number"
            min="0"
            step="5000"
            placeholder="150.000"
            value={filters.max_mileage || ""}
            onChange={(e) => handleFieldChange("max_mileage", e.target.value)}
          />

          <div style={{ display: "flex", gap: "var(--space-sm)", marginTop: "var(--space-lg)" }}>
            <Button
              variant="outline"
              size="md"
              onClick={onResetFilters}
              style={{ flex: 1 }}
            >
              {t("filterReset", "Zurücksetzen")}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setMobileDrawerOpen(false)}
              style={{ flex: 1 }}
            >
              Anwenden
            </Button>
          </div>
        </div>
      </Drawer>

      <style>{`
        @keyframes fadeInFilters {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default CarsFilterBar;
