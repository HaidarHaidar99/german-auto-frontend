import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import carsService from "../../services/cars/cars.service";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminLoadingState from "../../components/admin/AdminLoadingState";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import ErrorState from "../../components/ui/ErrorState";
import Button from "../../components/ui/Button";
import Icon from "../../components/common/Icon";
import { useGsapContext } from "../../hooks/useAnimation";
import { gsap, isReducedMotion } from "../../utils/animation";

// Car Admin Components
import CarInventorySummary from "../../components/admin/cars/CarInventorySummary";
import CarFiltersBar from "../../components/admin/cars/CarFiltersBar";
import CarTable from "../../components/admin/cars/CarTable";
import CarEditorModal from "../../components/admin/cars/CarEditorModal";
import CarDeleteModal from "../../components/admin/cars/CarDeleteModal";
import CarDetailDrawer from "../../components/admin/cars/CarDetailDrawer";

const DEFAULT_FILTERS = {
  search: "",
  brand: "",
  fuel_type: "",
  transmission: "",
  condition: "",
  category: "",
  status: "ALL",
  is_featured: "",
  is_visible: "",
  min_price: "",
  max_price: "",
  max_mileage: "",
  sort: "newest",
};

export function AdminCarsPage() {
  const { t } = useTranslation(["admin", "cars", "common"]);
  const pageContainerRef = useRef(null);

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Modals & Drawers state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null); // null = create, object = edit
  const [editorSaving, setEditorSaving] = useState(false);
  const [editorErrors, setEditorErrors] = useState({});

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);
  const [carToPreview, setCarToPreview] = useState(null);

  const [feedbackMessage, setFeedbackMessage] = useState(null);

  useEffect(() => {
    document.title = `${t("inventory")} | ADMINCORE`;
  }, [t]);

  const showFeedback = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const fetchCars = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      // Fetch admin inventory with large limit to allow client-side fast searching/sorting
      const res = await carsService.adminGetCars({ limit: 100 });
      setCars(res?.data?.cars || []);
    } catch (err) {
      setError(err?.message || "Fehler beim Laden des Fahrzeugbestands.");
      setCars([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  useGsapContext(pageContainerRef, () => {
    if (isReducedMotion()) return;
    gsap.from(".admin-cars-content", {
      opacity: 0,
      y: 16,
      duration: 0.5,
      ease: "power2.out",
    });
  });

  // Extract unique brands for filter dropdown
  const availableBrands = useMemo(() => {
    const set = new Set();
    cars.forEach((c) => {
      if (c.brand) set.add(c.brand.trim());
    });
    return Array.from(set).sort();
  }, [cars]);

  // Client-side filtering and sorting
  const filteredCars = useMemo(() => {
    let result = [...cars];

    // Search query
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter((c) => {
        const titleMatch = (c.title || "").toLowerCase().includes(q);
        const brandMatch = (c.brand || "").toLowerCase().includes(q);
        const modelMatch = (c.model || "").toLowerCase().includes(q);
        const slugMatch = (c.slug || "").toLowerCase().includes(q);
        return titleMatch || brandMatch || modelMatch || slugMatch;
      });
    }

    // Brand
    if (filters.brand) {
      result = result.filter((c) => (c.brand || "").toLowerCase() === filters.brand.toLowerCase());
    }

    // Status
    if (filters.status && filters.status !== "ALL") {
      result = result.filter((c) => c.status === filters.status);
    }

    // Fuel Type
    if (filters.fuel_type) {
      result = result.filter((c) => c.fuel_type === filters.fuel_type);
    }

    // Transmission
    if (filters.transmission) {
      result = result.filter((c) => c.transmission === filters.transmission);
    }

    // Condition
    if (filters.condition) {
      result = result.filter((c) => c.condition === filters.condition);
    }

    // Category
    if (filters.category) {
      result = result.filter((c) => c.category === filters.category);
    }

    // Featured
    if (filters.is_featured === "true") {
      result = result.filter((c) => c.is_featured === true);
    } else if (filters.is_featured === "false") {
      result = result.filter((c) => !c.is_featured);
    }

    // Visibility
    if (filters.is_visible === "true") {
      result = result.filter((c) => c.is_visible !== false);
    } else if (filters.is_visible === "false") {
      result = result.filter((c) => c.is_visible === false);
    }

    // Price bounds
    if (filters.min_price) {
      const minP = Number(filters.min_price);
      result = result.filter((c) => c.price != null && c.price >= minP);
    }
    if (filters.max_price) {
      const maxP = Number(filters.max_price);
      result = result.filter((c) => c.price != null && c.price <= maxP);
    }

    // Mileage max
    if (filters.max_mileage) {
      const maxM = Number(filters.max_mileage);
      result = result.filter((c) => c.mileage_km != null && c.mileage_km <= maxM);
    }

    // Sorting
    result.sort((a, b) => {
      switch (filters.sort) {
        case "oldest":
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        case "price_asc":
          return (a.price || 0) - (b.price || 0);
        case "price_desc":
          return (b.price || 0) - (a.price || 0);
        case "mileage_asc":
          return (a.mileage_km || 0) - (b.mileage_km || 0);
        case "mileage_desc":
          return (b.mileage_km || 0) - (a.mileage_km || 0);
        case "title_asc":
          return (a.title || "").localeCompare(b.title || "");
        case "title_desc":
          return (b.title || "").localeCompare(a.title || "");
        case "newest":
        default:
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
    });

    return result;
  }, [cars, filters]);

  // Actions
  const handleOpenCreate = () => {
    setEditingCar(null);
    setEditorErrors({});
    setEditorOpen(true);
  };

  const handleOpenEdit = async (car) => {
    try {
      // Fetch full detail for editing to ensure all JSON fields are fresh
      const res = await carsService.adminGetCar(car.id);
      setEditingCar(res?.data?.car || car);
    } catch {
      setEditingCar(car);
    }
    setEditorErrors({});
    setEditorOpen(true);
  };

  const handleOpenDelete = (car) => {
    setCarToDelete(car);
    setDeleteModalOpen(true);
  };

  const handleOpenPreview = async (car) => {
    try {
      const res = await carsService.adminGetCar(car.id);
      setCarToPreview(res?.data?.car || car);
    } catch {
      setCarToPreview(car);
    }
    setPreviewDrawerOpen(true);
  };

  // Save handler (Create / Update)
  const handleSaveVehicle = async (payload) => {
    try {
      setEditorSaving(true);
      setEditorErrors({});

      if (editingCar) {
        await carsService.adminUpdateCar(editingCar.id, payload);
        showFeedback(t("vehicleUpdated", { defaultValue: "Fahrzeug erfolgreich aktualisiert." }));
      } else {
        await carsService.adminCreateCar(payload);
        showFeedback(t("vehicleCreated", { defaultValue: "Fahrzeug erfolgreich erstellt." }));
      }

      setEditorOpen(false);
      fetchCars(true);
    } catch (err) {
      if (err?.errors && typeof err.errors === "object") {
        setEditorErrors(err.errors);
      }
      alert(err?.message || "Fehler beim Speichern des Fahrzeugs.");
    } finally {
      setEditorSaving(false);
    }
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!carToDelete) return;
    try {
      setDeleteLoading(true);
      await carsService.adminDeleteCar(carToDelete.id);
      showFeedback(t("vehicleDeleted", { defaultValue: "Fahrzeug erfolgreich gelöscht." }));
      setDeleteModalOpen(false);
      setCarToDelete(null);
      fetchCars(true);
    } catch (err) {
      alert(err?.message || "Fehler beim Löschen des Fahrzeugs.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Quick toggles
  const handleToggleFeatured = async (carId, nextFeatured) => {
    try {
      await carsService.adminToggleFeatured(carId, nextFeatured);
      setCars((prev) =>
        prev.map((c) => (c.id === carId ? { ...c, is_featured: nextFeatured } : c))
      );
    } catch (err) {
      alert(err?.message || "Fehler beim Aktualisieren des Featured-Status.");
    }
  };

  const handleToggleVisibility = async (carId, nextVisible) => {
    try {
      await carsService.adminSetVisibility(carId, nextVisible);
      setCars((prev) =>
        prev.map((c) => (c.id === carId ? { ...c, is_visible: nextVisible } : c))
      );
    } catch (err) {
      alert(err?.message || "Fehler beim Aktualisieren der Sichtbarkeit.");
    }
  };

  const handleChangeStatus = async (carId, nextStatus) => {
    try {
      await carsService.adminSetStatus(carId, nextStatus);
      setCars((prev) =>
        prev.map((c) => (c.id === carId ? { ...c, status: nextStatus } : c))
      );
    } catch (err) {
      alert(err?.message || "Fehler beim Ändern des Status.");
    }
  };

  return (
    <div ref={pageContainerRef} className="admin-cars-page">
      <AdminPageHeader
        title={t("inventory")}
        subtitle="Verwaltung aller aktiven, reservierten und verkauften Fahrzeuge im System"
        badge={
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-admin-muted)" }}>
            {cars.length} {t("statTotalVehicles", { defaultValue: "Fahrzeuge" })}
          </span>
        }
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
            <Button
              variant="outline"
              size="sm"
              loading={refreshing}
              onClick={() => fetchCars(true)}
              style={{ fontSize: "var(--font-size-xs)" }}
            >
              <Icon name="refresh-cw" size={14} style={{ marginRight: "6px" }} />
              Aktualisieren
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              style={{ fontSize: "var(--font-size-xs)" }}
            >
              <Icon name="plus" size={14} style={{ marginRight: "6px" }} />
              {t("addVehicle", { defaultValue: "Fahrzeug anlegen" })}
            </Button>
          </div>
        }
      />

      {feedbackMessage && (
        <div
          role="status"
          style={{
            padding: "var(--space-sm) var(--space-md)",
            backgroundColor: "rgba(34, 197, 94, 0.12)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "var(--radius-sm, 6px)",
            color: "#22c55e",
            fontSize: "var(--font-size-xs)",
            fontWeight: 500,
            marginBottom: "var(--space-md)",
          }}
        >
          {feedbackMessage}
        </div>
      )}

      {loading ? (
        <AdminLoadingState message="Lade Fahrzeugbestand aus der Datenbank..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchCars()} />
      ) : (
        <div className="admin-cars-content" style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          {/* Inventory Summary Pills */}
          <CarInventorySummary
            cars={cars}
            activeStatusFilter={filters.status}
            onSelectStatusFilter={(st) => setFilters((prev) => ({ ...prev, status: st }))}
          />

          {/* Search, Filter & Sort Controls */}
          <CarFiltersBar
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(DEFAULT_FILTERS)}
            availableBrands={availableBrands}
          />

          {/* Cars Listing */}
          {cars.length === 0 ? (
            <AdminEmptyState
              icon="car"
              title="Keine Fahrzeuge im Bestand"
              description="Es sind derzeit keine Fahrzeuge in der Datenbank angelegt. Erstellen Sie das erste Fahrzeug mit dem Button oben."
              actionLabel="Jetzt Fahrzeug anlegen"
              onAction={handleOpenCreate}
            />
          ) : filteredCars.length === 0 ? (
            <div
              style={{
                padding: "var(--space-2xl) var(--space-md)",
                textAlign: "center",
                backgroundColor: "var(--color-admin-card, #121418)",
                borderRadius: "var(--radius-md, 8px)",
                border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
              }}
            >
              <Icon name="search" size={32} style={{ color: "var(--color-admin-muted)", marginBottom: "var(--space-sm)" }} />
              <h3 style={{ margin: "0 0 6px", fontSize: "var(--font-size-md)", color: "var(--color-admin-text, #ffffff)" }}>
                Keine passenden Fahrzeuge gefunden
              </h3>
              <p style={{ margin: "0 0 var(--space-md)", fontSize: "var(--font-size-xs)", color: "var(--color-admin-muted)" }}>
                Kein Fahrzeug entspricht den ausgewählten Filterkriterien.
              </p>
              <Button variant="outline" size="sm" onClick={() => setFilters(DEFAULT_FILTERS)}>
                Filter zurücksetzen
              </Button>
            </div>
          ) : (
            <CarTable
              cars={filteredCars}
              onPreview={handleOpenPreview}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onToggleFeatured={handleToggleFeatured}
              onToggleVisibility={handleToggleVisibility}
              onChangeStatus={handleChangeStatus}
            />
          )}
        </div>
      )}

      {/* Car Editor Modal (Create / Edit) */}
      <CarEditorModal
        isOpen={editorOpen}
        car={editingCar}
        saving={editorSaving}
        errors={editorErrors}
        onSave={handleSaveVehicle}
        onClose={() => setEditorOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <CarDeleteModal
        isOpen={deleteModalOpen}
        car={carToDelete}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalOpen(false)}
      />

      {/* Vehicle Detail Preview Drawer */}
      <CarDetailDrawer
        isOpen={previewDrawerOpen}
        car={carToPreview}
        onClose={() => setPreviewDrawerOpen(false)}
        onEdit={(car) => {
          setPreviewDrawerOpen(false);
          handleOpenEdit(car);
        }}
      />
    </div>
  );
}

export default AdminCarsPage;
