import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import carsService from "../../services/cars/cars.service";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminLoadingState from "../../components/admin/AdminLoadingState";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import ErrorState from "../../components/ui/ErrorState";
import Button from "../../components/ui/Button";
import Icon from "../../components/common/Icon";

// Car Admin Components
import CarInventorySummary from "../../components/admin/cars/CarInventorySummary";
import CarFiltersBar from "../../components/admin/cars/CarFiltersBar";
import CarTable from "../../components/admin/cars/CarTable";
import CarEditorModal from "../../components/admin/cars/CarEditorModal";
import CarDeleteModal from "../../components/admin/cars/CarDeleteModal";
import CarDetailDrawer from "../../components/admin/cars/CarDetailDrawer";
import CarStatusModal from "../../components/admin/cars/CarStatusModal";

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

  // Cars list & Pagination State
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });

  // Filters State
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimeoutRef = useRef(null);

  // Available brands cache for filter dropdown
  const [availableBrands, setAvailableBrands] = useState([]);

  // Summary counts across database
  const [summaryCounts, setSummaryCounts] = useState({
    total: 0,
    available: 0,
    reserved: 0,
    sold: 0,
    featured: 0,
    hidden: 0,
  });

  // Modals & Drawers state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [editorSaving, setEditorSaving] = useState(false);
  const [editorErrors, setEditorErrors] = useState({});

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);
  const [carToPreview, setCarToPreview] = useState(null);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [carForStatusModal, setCarForStatusModal] = useState(null);
  const [statusModalLoading, setStatusModalLoading] = useState(false);

  // Toast feedback state
  const [toastNotification, setToastNotification] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((type, text) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastNotification({ type, text });
    toastTimeoutRef.current = setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  }, []);

  useEffect(() => {
    document.title = `${t("inventory")} | ADMINCORE`;
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [t]);

  // Debounce search input (350ms)
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
      setPage(1); // Reset to page 1 on new search term
    }, 350);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [filters.search]);

  // Fetch summary counts across entire inventory
  const fetchSummaryCounts = useCallback(async () => {
    try {
      // Parallel lightweight queries for accurate counts
      const [allRes, availRes, resRes, soldRes, featRes, hiddenRes] = await Promise.all([
        carsService.adminGetCars({ limit: 1 }),
        carsService.adminGetCars({ status: "AVAILABLE", limit: 1 }),
        carsService.adminGetCars({ status: "RESERVED", limit: 1 }),
        carsService.adminGetCars({ status: "SOLD", limit: 1 }),
        carsService.adminGetCars({ is_featured: "true", limit: 1 }),
        carsService.adminGetCars({ is_visible: "false", limit: 1 }),
      ]);

      setSummaryCounts({
        total: allRes?.meta?.total ?? allRes?.data?.meta?.total ?? 0,
        available: availRes?.meta?.total ?? availRes?.data?.meta?.total ?? 0,
        reserved: resRes?.meta?.total ?? resRes?.data?.meta?.total ?? 0,
        sold: soldRes?.meta?.total ?? soldRes?.data?.meta?.total ?? 0,
        featured: featRes?.meta?.total ?? featRes?.data?.meta?.total ?? 0,
        hidden: hiddenRes?.meta?.total ?? hiddenRes?.data?.meta?.total ?? 0,
      });
    } catch {
      // Non-blocking fallback
    }
  }, []);

  // Fetch paginated cars from backend using server-side query parameters
  const fetchCars = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = {
        page,
        limit,
        search: debouncedSearch || undefined,
        brand: filters.brand || undefined,
        status: filters.status !== "ALL" ? filters.status : undefined,
        fuel_type: filters.fuel_type || undefined,
        transmission: filters.transmission || undefined,
        condition: filters.condition || undefined,
        category: filters.category || undefined,
        is_featured: filters.is_featured || undefined,
        is_visible: filters.is_visible || undefined,
        min_price: filters.min_price ? Number(filters.min_price) : undefined,
        max_price: filters.max_price ? Number(filters.max_price) : undefined,
        max_mileage: filters.max_mileage ? Number(filters.max_mileage) : undefined,
        sort: filters.sort || "newest",
      };

      const res = await carsService.adminGetCars(params);
      const fetchedCars = res?.data?.cars || [];
      const meta = res?.meta || res?.data?.meta || {
        page,
        limit,
        total: fetchedCars.length,
        pages: Math.max(1, Math.ceil(fetchedCars.length / limit)),
      };

      setCars(fetchedCars);
      setPagination(meta);

      if (fetchedCars.length > 0) {
        setSummaryCounts((prev) => ({
          ...prev,
          total: prev.total > 0 ? prev.total : (meta.total || fetchedCars.length),
        }));
      }

      // Extract brands from returned cars if not yet populated
      if (fetchedCars.length > 0) {
        setAvailableBrands((prev) => {
          const brandSet = new Set(prev);
          fetchedCars.forEach((c) => {
            if (c.brand) brandSet.add(c.brand.trim());
          });
          return Array.from(brandSet).sort();
        });
      }
    } catch (err) {
      setError(err?.message || t("fetchCarsError", { defaultValue: "Error loading vehicle inventory." }));
      setCars([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, limit, debouncedSearch, filters, t]);

  // Trigger query on page or filter changes
  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Trigger counts fetch on initial mount
  useEffect(() => {
    fetchSummaryCounts();
  }, [fetchSummaryCounts]);


  // Filter change handler — resets to page 1
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const handleSelectStatusPill = (statusKey) => {
    setFilters((prev) => ({
      ...prev,
      status: statusKey,
    }));
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Actions: Create & Edit
  const handleOpenCreate = () => {
    setEditingCar(null);
    setEditorErrors({});
    setEditorOpen(true);
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

  const handleOpenEdit = async (car) => {
    try {
      const res = await carsService.adminGetCar(car.id);
      setEditingCar(res?.data?.car || car);
    } catch {
      setEditingCar(car);
    }
    setEditorErrors({});
    setEditorOpen(true);
  };


  // Actions: Status Modal
  const handleOpenStatusModal = (carId, currentOrNextStatus) => {
    const targetCar = cars.find((c) => c.id === carId);
    if (targetCar) {
      setCarForStatusModal({ ...targetCar, targetStatus: currentOrNextStatus });
      setStatusModalOpen(true);
    }
  };

  const handleConfirmStatusChange = async (carId, nextStatus) => {
    try {
      setStatusModalLoading(true);
      await carsService.adminSetStatus(carId, nextStatus);
      showToast("success", t("statusUpdatedSuccess", { defaultValue: `Vehicle status updated to ${nextStatus}.` }));
      setStatusModalOpen(false);
      setCarForStatusModal(null);

      // Local update & background sync
      setCars((prev) =>
        prev.map((c) => (c.id === carId ? { ...c, status: nextStatus } : c))
      );
      fetchSummaryCounts();
    } catch (err) {
      showToast("error", err?.message || t("statusUpdateError", { defaultValue: "Error updating vehicle status." }));
    } finally {
      setStatusModalLoading(false);
    }
  };

  // Actions: Save Vehicle (Create / Update)
  const handleSaveVehicle = async (payload) => {
    try {
      setEditorSaving(true);
      setEditorErrors({});

      if (editingCar) {
        await carsService.adminUpdateCar(editingCar.id, payload);
        showToast("success", t("vehicleUpdatedSuccess", { defaultValue: "Vehicle updated successfully." }));
      } else {
        await carsService.adminCreateCar(payload);
        showToast("success", t("vehicleCreatedSuccess", { defaultValue: "Vehicle created successfully." }));
      }

      setEditorOpen(false);
      setEditingCar(null);
      fetchCars(true);
      fetchSummaryCounts();
    } catch (err) {
      if (err?.errors && typeof err.errors === "object") {
        setEditorErrors(err.errors);
      }
      showToast("error", err?.message || t("vehicleSaveError", { defaultValue: "Error saving vehicle." }));
    } finally {
      setEditorSaving(false);
    }
  };

  // Actions: Delete
  const handleOpenDelete = (car) => {
    setCarToDelete(car);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!carToDelete) return;
    try {
      setDeleteLoading(true);
      await carsService.adminDeleteCar(carToDelete.id);
      showToast("success", t("vehicleDeletedSuccess", { defaultValue: "Vehicle deleted successfully." }));
      setDeleteModalOpen(false);
      setCarToDelete(null);

      // Handle empty final page boundary
      if (cars.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchCars(true);
      }
      fetchSummaryCounts();
    } catch (err) {
      showToast("error", err?.message || t("vehicleDeleteError", { defaultValue: "Error deleting vehicle." }));
    } finally {
      setDeleteLoading(false);
    }
  };

  // Quick toggles: Featured & Visibility
  const handleToggleFeatured = async (carId, nextFeatured) => {
    try {
      await carsService.adminToggleFeatured(carId, nextFeatured);
      showToast(
        "success",
        nextFeatured
          ? t("featuredActivated", { defaultValue: "Vehicle is now featured on the homepage." })
          : t("featuredDeactivated", { defaultValue: "Vehicle featured highlight removed." })
      );
      setCars((prev) =>
        prev.map((c) => (c.id === carId ? { ...c, is_featured: nextFeatured } : c))
      );
      fetchSummaryCounts();
    } catch (err) {
      showToast("error", err?.message || t("featuredUpdateError", { defaultValue: "Error updating featured status." }));
    }
  };

  const handleToggleVisibility = async (carId, nextVisible) => {
    try {
      await carsService.adminSetVisibility(carId, nextVisible);
      showToast(
        "success",
        nextVisible
          ? t("visibilityVisible", { defaultValue: "Vehicle is now publicly visible." })
          : t("visibilityHidden", { defaultValue: "Vehicle has been hidden from visitors." })
      );
      setCars((prev) =>
        prev.map((c) => (c.id === carId ? { ...c, is_visible: nextVisible } : c))
      );
      fetchSummaryCounts();
    } catch (err) {
      showToast("error", err?.message || t("visibilityUpdateError", { defaultValue: "Error updating visibility." }));
    }
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

  return (
    <div ref={pageContainerRef} className="admin-cars-page" style={{ position: "relative" }}>
      {/* Toast Notification */}
      {toastNotification && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: "var(--space-xl)",
            right: "var(--space-xl)",
            zIndex: 1000,
            padding: "14px 20px",
            borderRadius: "var(--radius-lg, 12px)",
            backgroundColor:
              toastNotification.type === "error"
                ? "rgba(220, 38, 38, 0.95)"
                : "rgba(22, 101, 52, 0.95)",
            color: "#ffffff",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "var(--font-size-sm)",
            fontWeight: 500,
            backdropFilter: "blur(8px)",
          }}
        >
          <Icon name={toastNotification.type === "error" ? "alert-circle" : "check"} size={18} />
          <span>{toastNotification.text}</span>
        </div>
      )}

      {/* Page Header */}
      <AdminPageHeader
        title={t("inventory", { defaultValue: "Vehicle Inventory" })}
        subtitle={t("inventorySubtitle", { defaultValue: "Manage all active, reserved, and sold vehicles" })}
        badge={
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-admin-muted)" }}>
            {pagination.total} {t("statTotalVehicles", { defaultValue: "Vehicles" })}
          </span>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            style={{ fontSize: "var(--font-size-xs)" }}
          >
            <Icon name="plus" size={14} style={{ marginRight: "6px" }} />
            {t("addVehicle", { defaultValue: "Add Vehicle" })}
          </Button>
        }
      />

      {loading ? (
        <AdminLoadingState message={t("loading", { defaultValue: "Loading..." })} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchCars()} />
      ) : (
        <div className="admin-cars-content" style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          {/* Inventory Summary Pills */}
          <CarInventorySummary
            cars={cars}
            summaryCounts={summaryCounts}
            activeStatusFilter={filters.status}
            onSelectStatusFilter={handleSelectStatusPill}
          />

          {/* Search, Filter & Sort Controls */}
          <CarFiltersBar
            filters={filters}
            onChange={handleFiltersChange}
            onReset={handleResetFilters}
            availableBrands={availableBrands}
          />

          {/* Cars Listing */}
          {cars.length === 0 && !hasActiveFilters ? (
            <AdminEmptyState
              icon="car"
              title={t("emptyInventoryTitle", { defaultValue: "No vehicles in inventory" })}
              description={t("emptyInventoryDescription", {
                defaultValue: "There are currently no vehicles stored in the database. Add the first vehicle using the button above.",
              })}
              actionLabel={t("addFirstVehicle", { defaultValue: "Add vehicle now" })}
              onAction={handleOpenCreate}
            />
          ) : cars.length === 0 && hasActiveFilters ? (
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
              <h3 style={{ margin: "0 0 6px", fontSize: "var(--font-size-md)", color: "var(--color-admin-text, #0f172a)" }}>
                {t("noCarsMatchFiltersTitle", { defaultValue: "No matching vehicles found" })}
              </h3>
              <p style={{ margin: "0 0 var(--space-md)", fontSize: "var(--font-size-xs)", color: "var(--color-admin-muted)" }}>
                {t("noCarsMatchFiltersDesc", { defaultValue: "No vehicles match your selected filter criteria." })}
              </p>
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                {t("resetFilters", { defaultValue: "Reset Filters" })}
              </Button>
            </div>
          ) : (
            <CarTable
              cars={cars}
              loading={loading || refreshing}
              pagination={pagination}
              onPageChange={handlePageChange}
              onPreview={handleOpenPreview}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onToggleFeatured={handleToggleFeatured}
              onToggleVisibility={handleToggleVisibility}
              onChangeStatus={handleOpenStatusModal}
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
        onClose={() => {
          setEditorOpen(false);
          setEditingCar(null);
        }}
      />

      {/* Status Transition Workflow Modal */}
      <CarStatusModal
        isOpen={statusModalOpen}
        car={carForStatusModal}
        loading={statusModalLoading}
        onConfirm={handleConfirmStatusChange}
        onClose={() => {
          setStatusModalOpen(false);
          setCarForStatusModal(null);
        }}
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
