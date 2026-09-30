import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, Section, Grid } from "../../components/ui/Layout";
import Skeleton from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import CarCardBase from "../../components/automotive/CarCardBase";
import ScrollReveal from "../../components/motion/ScrollReveal";
import CarsHeader from "../../components/cars/CarsHeader";
import CarsFilterBar from "../../components/cars/CarsFilterBar";
import CarsPagination from "../../components/cars/CarsPagination";
import Icon from "../../components/common/Icon";
import Button from "../../components/ui/Button";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import carsService from "../../services/cars/cars.service";

/**
 * German Auto — Production Cars / Inventory Page
 * Connects exclusively to real inventory via GET /api/cars.
 * Features server-side search, multi-attribute filtering, sorting, and pagination.
 */

const ITEMS_PER_PAGE = 12;

export function CarsPage() {
  const { t } = useTranslation(["cars", "common"]);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, isCarFavorite, toggleFavorite } = useAuth();
  const { settings } = useSettings();

  const inventoryTopRef = useRef(null);
  const carsScrollRef = useRef(null);
  const [viewMode, setViewMode] = useState("scroll"); // 'scroll' | 'grid'

  const handleScrollCars = (direction) => {
    if (carsScrollRef.current) {
      const scrollAmount = direction === "right" ? 380 : -380;
      carsScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Parse filters from URL search parameters
  const [filters, setFilters] = useState(() => ({
    page: parseInt(searchParams.get("page"), 10) || 1,
    limit: ITEMS_PER_PAGE,
    brand: searchParams.get("brand") || undefined,
    model: searchParams.get("model") || undefined,
    fuel_type: searchParams.get("fuel_type") || undefined,
    transmission: searchParams.get("transmission") || undefined,
    condition: searchParams.get("condition") || undefined,
    category: searchParams.get("category") || undefined,
    min_price: searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined,
    max_price: searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined,
    max_mileage: searchParams.get("max_mileage") ? Number(searchParams.get("max_mileage")) : undefined,
    sort: searchParams.get("sort") || "newest",
  }));

  const [cars, setCars] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: ITEMS_PER_PAGE, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state changes to URL query string
  const updateUrlParams = useCallback((newFilters) => {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(newFilters)) {
      if (val !== undefined && val !== null && val !== "" && val !== "newest") {
        if (key === "page" && val === 1) continue; // Keep clean URLs on page 1
        if (key === "limit") continue;
        params.set(key, String(val));
      }
    }
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Fetch cars from real backend API
  const fetchCars = useCallback(async (currentFilters) => {
    try {
      setLoading(true);
      setError(null);

      const query = {
        page: currentFilters.page || 1,
        limit: ITEMS_PER_PAGE,
        sort: currentFilters.sort || "newest",
      };

      if (currentFilters.brand) query.brand = currentFilters.brand;
      if (currentFilters.model) query.model = currentFilters.model;
      if (currentFilters.fuel_type) query.fuel_type = currentFilters.fuel_type;
      if (currentFilters.transmission) query.transmission = currentFilters.transmission;
      if (currentFilters.condition) query.condition = currentFilters.condition;
      if (currentFilters.category) query.category = currentFilters.category;
      if (currentFilters.min_price) query.min_price = currentFilters.min_price;
      if (currentFilters.max_price) query.max_price = currentFilters.max_price;
      if (currentFilters.max_mileage) query.max_mileage = currentFilters.max_mileage;

      const res = await carsService.getCars(query);

      setCars(res?.data?.cars || []);
      setMeta(res?.meta || { total: res?.data?.cars?.length || 0, page: 1, limit: ITEMS_PER_PAGE, pages: 1 });
    } catch (err) {
      setError(err?.message || "Fehler beim Laden des Fahrzeugbestands.");
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch whenever filters change
  useEffect(() => {
    fetchCars(filters);
    updateUrlParams(filters);
  }, [filters, fetchCars, updateUrlParams]);

  // Set document title dynamically
  useEffect(() => {
    const siteName = settings?.site?.name || "German Auto";
    document.title = `${t("title", "Fahrzeugbestand")} | ${siteName}`;
  }, [settings, t]);

  const handleFilterChange = (partialUpdate) => {
    setFilters((prev) => ({
      ...prev,
      ...partialUpdate,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: ITEMS_PER_PAGE,
      brand: undefined,
      model: undefined,
      fuel_type: undefined,
      transmission: undefined,
      condition: undefined,
      category: undefined,
      min_price: undefined,
      max_price: undefined,
      max_mileage: undefined,
      sort: "newest",
    });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    if (inventoryTopRef.current) {
      inventoryTopRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFavoriteClick = async (carId) => {
    await toggleFavorite(carId);
  };

  return (
    <div className="cars-page" style={{ width: "100%", minHeight: "100vh" }}>
      {/* 1. Page Intro / Cinematic Header */}
      <CarsHeader totalCars={meta.total} />

      <div ref={inventoryTopRef} />

      {/* 2. Main Inventory Content Section */}
      <Section spacing="default" style={{ paddingTop: "var(--space-2xl)" }}>
        <Container size="default">
          {/* 3. Search & Filter Bar with Mobile Drawer */}
          <CarsFilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            totalResults={meta.total}
          />

          {/* 4. Loading Skeleton Grid */}
          {loading && (
            <Grid cols="responsive" gap="lg">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="surface-card"
                  style={{ padding: "var(--space-md)", borderRadius: "var(--radius-lg)" }}
                >
                  <Skeleton width="100%" height="220px" borderRadius="var(--radius-md)" style={{ marginBottom: "var(--space-md)" }} />
                  <Skeleton width="35%" height="14px" style={{ marginBottom: "var(--space-xs)" }} />
                  <Skeleton width="75%" height="22px" style={{ marginBottom: "var(--space-md)" }} />
                  <Skeleton width="45%" height="26px" style={{ marginBottom: "var(--space-md)" }} />
                  <div style={{ display: "flex", gap: "6px", marginBottom: "var(--space-lg)" }}>
                    <Skeleton width="60px" height="24px" />
                    <Skeleton width="60px" height="24px" />
                    <Skeleton width="60px" height="24px" />
                  </div>
                  <Skeleton width="100%" height="40px" borderRadius="var(--radius-md)" />
                </div>
              ))}
            </Grid>
          )}

          {/* 5. Error State with Retry Button */}
          {!loading && error && (
            <ErrorState
              title={t("error", "Ein Fehler ist aufgetreten")}
              message={error}
              onRetry={() => fetchCars(filters)}
            />
          )}

          {/* 6. Empty State with Reset Filters Action */}
          {!loading && !error && cars.length === 0 && (
            <EmptyState
              title={t("emptyTitle", "Keine passenden Fahrzeuge gefunden")}
              message={t("emptyMessage", "Zu Ihrer aktuellen Such- und Filterauswahl wurden keine Fahrzeuge im Bestand gefunden. Bitte passen Sie Ihre Kriterien an oder setzen Sie die Filter zurück.")}
              actionLabel={t("filterReset", "Filter zurücksetzen")}
              onAction={handleResetFilters}
            />
          )}

          {/* 7. Real Vehicle Inventory Showcase & Controls */}
          {!loading && !error && cars.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              {/* Showcase Navigation Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "var(--space-sm)",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-lg, 12px)",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#ffffff",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {cars.length} {t("carsCount", { defaultValue: "Fahrzeuge" })}
                  </span>

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "3px 10px",
                      borderRadius: "9999px",
                      backgroundColor: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      fontSize: "11px",
                      color: "#94a3b8",
                      fontWeight: 500,
                    }}
                  >
                    <Icon name="arrow-right" size={12} color="#ffffff" />
                    <span>{t("scrollRightHint", { defaultValue: "Nach rechts scrollen für mehr Fahrzeuge" })}</span>
                  </div>
                </div>

                {/* Controls (Arrows + Grid/Scroll Toggle) */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => handleScrollCars("left")}
                    aria-label="Scroll left"
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#ffffff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#ffffff";
                      e.currentTarget.style.color = "#000000";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                      e.currentTarget.style.color = "#ffffff";
                    }}
                  >
                    <Icon name="arrow-left" size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleScrollCars("right")}
                    aria-label="Scroll right"
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#ffffff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#ffffff";
                      e.currentTarget.style.color = "#000000";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                      e.currentTarget.style.color = "#ffffff";
                    }}
                  >
                    <Icon name="arrow-right" size={14} />
                  </button>

                  <div style={{ width: "1px", height: "20px", backgroundColor: "rgba(255, 255, 255, 0.15)", margin: "0 4px" }} />

                  <button
                    type="button"
                    onClick={() => setViewMode(viewMode === "scroll" ? "grid" : "scroll")}
                    title={viewMode === "scroll" ? "Rasteransicht" : "Scroll-Ansicht"}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#ffffff",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Icon name={viewMode === "scroll" ? "layers" : "sliders"} size={13} />
                    <span>{viewMode === "scroll" ? t("viewGrid", { defaultValue: "Raster" }) : t("viewScroll", { defaultValue: "Showcase" })}</span>
                  </button>
                </div>
              </div>

              {/* View Render: Scroll vs Grid */}
              {viewMode === "scroll" ? (
                <div
                  ref={carsScrollRef}
                  className="cars-horizontal-scroll-track"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "var(--space-lg)",
                    overflowX: "auto",
                    scrollSnapType: "x mandatory",
                    scrollBehavior: "smooth",
                    padding: "8px 2px 20px",
                    WebkitOverflowScrolling: "touch",
                    scrollbarWidth: "thin",
                  }}
                >
                  {cars.map((car) => {
                    const identifier = car.slug || car.id;
                    const isFav = isCarFavorite(car.id);
                    const primaryImage =
                      car.media?.thumbnail ||
                      car.media?.gallery?.[0] ||
                      car.images?.[0] ||
                      car.image_url;

                    return (
                      <div
                        key={car.id}
                        style={{
                          flex: "0 0 clamp(290px, 82vw, 360px)",
                          scrollSnapAlign: "start",
                        }}
                      >
                        <CarCardBase
                          brand={car.brand}
                          model={car.model || car.title}
                          price={car.price}
                          oldPrice={car.old_price}
                          status={car.status}
                          mileage={car.mileage_km || car.mileage}
                          fuel={car.fuel_type}
                          transmission={car.transmission}
                          registration={car.first_registration || car.registration_year}
                          condition={car.condition}
                          image={primaryImage}
                          isFavorite={isFav}
                          onFavoriteToggle={() => handleFavoriteClick(car.id)}
                          onSelect={() => navigate(`/cars/${identifier}`)}
                          ctaLabel={t("viewDetails", "Details anzeigen")}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <ScrollReveal stagger={0.06}>
                  <Grid cols="responsive" gap="lg">
                    {cars.map((car) => {
                      const identifier = car.slug || car.id;
                      const isFav = isCarFavorite(car.id);
                      const primaryImage =
                        car.media?.thumbnail ||
                        car.media?.gallery?.[0] ||
                        car.images?.[0] ||
                        car.image_url;

                      return (
                        <CarCardBase
                          key={car.id}
                          brand={car.brand}
                          model={car.model || car.title}
                          price={car.price}
                          oldPrice={car.old_price}
                          status={car.status}
                          mileage={car.mileage_km || car.mileage}
                          fuel={car.fuel_type}
                          transmission={car.transmission}
                          registration={car.first_registration || car.registration_year}
                          condition={car.condition}
                          image={primaryImage}
                          isFavorite={isFav}
                          onFavoriteToggle={() => handleFavoriteClick(car.id)}
                          onSelect={() => navigate(`/cars/${identifier}`)}
                          ctaLabel={t("viewDetails", "Details anzeigen")}
                        />
                      );
                    })}
                  </Grid>
                </ScrollReveal>
              )}
            </div>
          )}

          {/* 8. Pagination Mechanism */}
          {!loading && !error && meta.pages > 1 && (
            <CarsPagination
              currentPage={meta.page}
              totalPages={meta.pages}
              onPageChange={handlePageChange}
            />
          )}
        </Container>
      </Section>
    </div>
  );
}

export default CarsPage;
