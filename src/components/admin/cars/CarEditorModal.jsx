import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Input from "../../forms/Input";
import Select from "../../forms/Select";
import Textarea from "../../forms/Textarea";
import SettingsToggle from "../settings/SettingsToggle";
import SettingsField from "../settings/SettingsField";
import Icon from "../../common/Icon";
import carsService from "../../../services/cars/cars.service";

const CATEGORIES = [
  { value: "SEDAN", label: "Sedan (SEDAN)" },
  { value: "SUV", label: "SUV / Off-road (SUV)" },
  { value: "COUPE", label: "Coupe (COUPE)" },
  { value: "CONVERTIBLE", label: "Convertible (CONVERTIBLE)" },
  { value: "WAGON", label: "Station Wagon (WAGON)" },
  { value: "HATCHBACK", label: "Hatchback (HATCHBACK)" },
  { value: "VAN", label: "Van (VAN)" },
  { value: "TRUCK", label: "Commercial / Truck (TRUCK)" },
  { value: "MOTORCYCLE", label: "Motorcycle (MOTORCYCLE)" },
  { value: "OTHER", label: "Other (OTHER)" },
];

const CONDITIONS = [
  { value: "USED", label: "Used (USED)" },
  { value: "NEW", label: "New (NEW)" },
];

const STATUSES = [
  { value: "AVAILABLE", label: "Available (AVAILABLE)" },
  { value: "RESERVED", label: "Reserved (RESERVED)" },
  { value: "SOLD", label: "Sold (SOLD)" },
  { value: "HIDDEN", label: "Hidden (HIDDEN)" },
];

const FUELS = [
  { value: "PETROL", label: "Petrol (PETROL)" },
  { value: "DIESEL", label: "Diesel (DIESEL)" },
  { value: "ELECTRIC", label: "Electric (ELECTRIC)" },
  { value: "HYBRID", label: "Hybrid (HYBRID)" },
  { value: "PLUGIN_HYBRID", label: "Plug-in Hybrid (PLUGIN_HYBRID)" },
  { value: "LPG", label: "LPG (LPG)" },
  { value: "HYDROGEN", label: "Hydrogen (HYDROGEN)" },
  { value: "OTHER", label: "Other (OTHER)" },
];

const TRANSMISSIONS = [
  { value: "AUTOMATIC", label: "Automatic (AUTOMATIC)" },
  { value: "MANUAL", label: "Manual (MANUAL)" },
  { value: "SEMI_AUTOMATIC", label: "Semi-Automatic (SEMI_AUTOMATIC)" },
];

const INTERIORS = [
  { value: "LEATHER", label: "Full Leather (LEATHER)" },
  { value: "ALCANTARA", label: "Alcantara (ALCANTARA)" },
  { value: "FABRIC", label: "Fabric (FABRIC)" },
  { value: "MIXED", label: "Part Leather / Mixed (MIXED)" },
  { value: "OTHER", label: "Other (OTHER)" },
];

const INITIAL_FORM = {
  brand: "",
  model: "",
  title: "",
  slug: "",
  category: "SEDAN",
  condition: "USED",
  status: "AVAILABLE",
  price: "",
  old_price: "",
  description_de: "",
  description_en: "",
  fuel_type: "PETROL",
  transmission: "AUTOMATIC",
  mileage_km: "",
  first_registration: "",
  engine_displacement_cc: "",
  performance_hp: "",
  seats: "5",
  vehicle_owners: "1",
  vehicle_condition: "",
  air_conditioning: true,
  camera: true,
  interior_design: "LEATHER",
  interior_color: "",
  equipment: [],
  custom_fields: {},
  media: {
    thumbnail: "",
    gallery: [],
  },
  is_featured: false,
  is_visible: true,
};

export function CarEditorModal({
  isOpen,
  car = null,
  saving = false,
  errors: serverErrors = {},
  onSave,
  onClose,
}) {
  const { t } = useTranslation(["admin", "cars", "common"]);

  const [form, setForm] = useState(INITIAL_FORM);
  const [activeTab, setActiveTab] = useState("core");
  const [formErrors, setFormErrors] = useState({});
  const [newEquipmentItem, setNewEquipmentItem] = useState("");
  const [newCustomKey, setNewCustomKey] = useState("");
  const [newCustomVal, setNewCustomVal] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [mediaError, setMediaError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize form draft on modal open or car change
  useEffect(() => {
    if (car) {
      // Determine gallery and thumbnail cleanly
      const initialGallery = Array.isArray(car.media?.gallery)
        ? [...car.media.gallery]
        : Array.isArray(car.images)
        ? [...car.images]
        : [];

      const initialThumbnail = car.media?.thumbnail || car.image_url || initialGallery[0] || "";

      // Ensure thumbnail is present in gallery if gallery was empty
      if (initialThumbnail && !initialGallery.includes(initialThumbnail)) {
        initialGallery.unshift(initialThumbnail);
      }

      setForm({
        ...INITIAL_FORM,
        ...car,
        price: car.price != null ? String(car.price) : "",
        old_price: car.old_price != null ? String(car.old_price) : "",
        mileage_km: car.mileage_km != null ? String(car.mileage_km) : "",
        engine_displacement_cc: car.engine_displacement_cc != null ? String(car.engine_displacement_cc) : "",
        performance_hp: car.performance_hp != null ? String(car.performance_hp) : "",
        seats: car.seats != null ? String(car.seats) : "5",
        vehicle_owners: car.vehicle_owners != null ? String(car.vehicle_owners) : "1",
        first_registration: car.first_registration ? car.first_registration.substring(0, 10) : "",
        equipment: Array.isArray(car.equipment) ? [...car.equipment] : [],
        custom_fields: typeof car.custom_fields === "object" && car.custom_fields !== null ? { ...car.custom_fields } : {},
        media: {
          thumbnail: initialThumbnail,
          gallery: initialGallery.slice(0, 20),
        },
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setActiveTab("core");
    setFormErrors({});
    setMediaError(null);
  }, [car, isOpen]);

  // Merge server validation errors if any
  useEffect(() => {
    if (serverErrors && Object.keys(serverErrors).length > 0) {
      setFormErrors((prev) => ({ ...prev, ...serverErrors }));
    }
  }, [serverErrors]);

  const handleChange = (field, val) => {
    setForm((prev) => ({
      ...prev,
      [field]: val,
    }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // ── Image Upload & Device Selection ──────────────────────────────────────────

  const processFiles = async (filesList) => {
    const rawFiles = Array.from(filesList || []);
    if (rawFiles.length === 0) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/jpg"];
    const validFiles = rawFiles.filter((f) => allowedTypes.includes(f.type));

    if (validFiles.length === 0) {
      setMediaError(t("onlyImagesAllowed", { defaultValue: "Only image files (JPG, PNG, WEBP, AVIF) are allowed." }));
      return;
    }

    const currentGallery = form.media.gallery || [];
    const availableSlots = 20 - currentGallery.length;

    if (availableSlots <= 0) {
      setMediaError(t("maxGalleryImagesError", { defaultValue: "Maximum 20 gallery images allowed." }));
      return;
    }

    const filesToUpload = validFiles.slice(0, availableSlots);
    setIsUploading(true);
    setMediaError(null);

    try {
      // 1. Try uploading to backend / Supabase storage
      const formData = new FormData();
      filesToUpload.forEach((file) => {
        formData.append("images", file);
      });

      const res = await carsService.adminUploadMedia(formData);
      const uploadedUrls = res?.data?.urls || res?.urls || res?.data?.data?.urls || (Array.isArray(res) ? res : []);

      if (uploadedUrls.length > 0) {
        const nextGallery = [...currentGallery, ...uploadedUrls].slice(0, 20);
        const nextThumbnail = form.media.thumbnail || nextGallery[0] || "";

        setForm((prev) => ({
          ...prev,
          media: {
            ...prev.media,
            gallery: nextGallery,
            thumbnail: nextThumbnail,
          },
        }));

        setFormErrors((prev) => {
          const next = { ...prev };
          delete next.media;
          return next;
        });
        return;
      }
      throw new Error("No URLs returned from upload endpoint");
    } catch (uploadErr) {
      console.warn("[CarEditorModal] Upload endpoint fallback to base64 Data URLs:", uploadErr);
      // 2. Resilient fallback: Convert to Data URLs so the admin NEVER loses work
      try {
        const dataUrls = await Promise.all(
          filesToUpload.map(
            (file) =>
              new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
              })
          )
        );

        const nextGallery = [...currentGallery, ...dataUrls].slice(0, 20);
        const nextThumbnail = form.media.thumbnail || nextGallery[0] || "";

        setForm((prev) => ({
          ...prev,
          media: {
            ...prev.media,
            gallery: nextGallery,
            thumbnail: nextThumbnail,
          },
        }));

        setFormErrors((prev) => {
          const next = { ...prev };
          delete next.media;
          return next;
        });
      } catch (readErr) {
        setMediaError(t("errorProcessingImages", { defaultValue: "Error processing image files." }));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    processFiles(e.target.files);
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleSetCover = (imgUrl) => {
    setForm((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        thumbnail: imgUrl,
      },
    }));
  };

  const handleRemoveImage = (index) => {
    const currentGallery = form.media.gallery || [];
    const removedUrl = currentGallery[index];
    const nextGallery = currentGallery.filter((_, idx) => idx !== index);
    let nextThumbnail = form.media.thumbnail;

    if (nextThumbnail === removedUrl) {
      nextThumbnail = nextGallery[0] || "";
    }

    setForm((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        gallery: nextGallery,
        thumbnail: nextThumbnail,
      },
    }));
  };

  const handleMoveImage = (index, direction) => {
    const currentGallery = [...(form.media.gallery || [])];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= currentGallery.length) return;

    const temp = currentGallery[index];
    currentGallery[index] = currentGallery[targetIdx];
    currentGallery[targetIdx] = temp;

    setForm((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        gallery: currentGallery,
      },
    }));
  };

  // ── Equipment actions ────────────────────────────────────────────────────────

  const handleAddEquipment = () => {
    const trimmed = newEquipmentItem.trim();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      equipment: [...prev.equipment, trimmed],
    }));
    setNewEquipmentItem("");
  };

  const handleRemoveEquipment = (index) => {
    setForm((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((_, idx) => idx !== index),
    }));
  };

  // ── Custom fields actions ────────────────────────────────────────────────────

  const handleAddCustomField = () => {
    const k = newCustomKey.trim();
    const v = newCustomVal.trim();
    if (!k) return;
    setForm((prev) => ({
      ...prev,
      custom_fields: {
        ...prev.custom_fields,
        [k]: v,
      },
    }));
    setNewCustomKey("");
    setNewCustomVal("");
  };

  const handleRemoveCustomField = (keyToRemove) => {
    setForm((prev) => {
      const next = { ...prev.custom_fields };
      delete next[keyToRemove];
      return { ...prev, custom_fields: next };
    });
  };

  // ── Validation and Submit ────────────────────────────────────────────────────

  const validate = () => {
    const errors = {};

    // 1. Company Name / Brand
    if (!form.brand?.trim()) {
      errors.brand = t("errorBrandRequired", { defaultValue: "Make / Manufacturer is required." });
    }

    // 2. Car Name / Title (vehicle identity uses Brand and Name)
    if (!form.title?.trim()) {
      errors.title = t("errorTitleRequired", { defaultValue: "Vehicle title / model is required." });
    }

    // 3. Condition (Used or New)
    if (!form.condition) {
      errors.condition = t("errorConditionRequired", { defaultValue: "Vehicle condition is required." });
    }

    // 4. Price
    if (form.price === "" || form.price === null || isNaN(Number(form.price)) || Number(form.price) < 0) {
      errors.price = t("errorPriceRequired", { defaultValue: "Valid purchase price (€) is required." });
    }

    // 5. Mileage (km)
    if (form.mileage_km === "" || form.mileage_km === null || isNaN(Number(form.mileage_km)) || Number(form.mileage_km) < 0) {
      errors.mileage_km = t("errorMileageRequired", { defaultValue: "Mileage (km) is required." });
    }

    // 6. Power (PS)
    if (form.performance_hp === "" || form.performance_hp === null || isNaN(Number(form.performance_hp)) || Number(form.performance_hp) <= 0) {
      errors.performance_hp = t("errorPerformanceRequired", { defaultValue: "Engine power (HP) is required." });
    }

    // 7. First Registration
    if (!form.first_registration?.trim()) {
      errors.first_registration = t("errorFirstRegRequired", { defaultValue: "First registration date is required." });
    }

    // 8. Fuel Type
    if (!form.fuel_type) {
      errors.fuel_type = t("errorFuelRequired", { defaultValue: "Fuel type is required." });
    }

    // 9. Transmission
    if (!form.transmission) {
      errors.transmission = t("errorTransmissionRequired", { defaultValue: "Transmission is required." });
    }

    // 10. At least 1 image
    const imagesCount = (form.media?.gallery?.length || 0) + (form.media?.thumbnail ? 1 : 0);
    if (imagesCount === 0) {
      errors.media = t("errorMediaRequired", { defaultValue: "At least 1 vehicle image is required." });
    }

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errorsFound = validate();
    if (Object.keys(errorsFound).length > 0) {
      setFormErrors(errorsFound);

      // Auto-switch to tab containing the first error
      if (
        errorsFound.brand ||
        errorsFound.title ||
        errorsFound.price ||
        errorsFound.condition ||
        errorsFound.mileage_km ||
        errorsFound.performance_hp ||
        errorsFound.first_registration ||
        errorsFound.fuel_type ||
        errorsFound.transmission
      ) {
        setActiveTab("core");
      } else if (errorsFound.media) {
        setActiveTab("media");
      }
      return;
    }

    const currentGallery = form.media?.gallery || [];
    const currentThumbnail = form.media?.thumbnail || currentGallery[0] || null;

    const payload = {
      brand: form.brand.trim(),
      model: (form.model || form.title || form.brand || "").trim(),
      title: form.title.trim(),
      category: form.category,
      condition: form.condition,
      status: form.status,
      price: Number(form.price),
      old_price: form.old_price !== "" && form.old_price != null ? Number(form.old_price) : null,
      description_de: form.description_de?.trim() || null,
      description_en: form.description_en?.trim() || null,
      fuel_type: form.fuel_type,
      transmission: form.transmission,
      mileage_km: Number(form.mileage_km),
      first_registration: form.first_registration,
      engine_displacement_cc: form.engine_displacement_cc !== "" && form.engine_displacement_cc != null ? Number(form.engine_displacement_cc) : null,
      performance_hp: Number(form.performance_hp),
      seats: form.seats !== "" && form.seats != null ? Number(form.seats) : 5,
      vehicle_owners: form.vehicle_owners !== "" && form.vehicle_owners != null ? Number(form.vehicle_owners) : 1,
      vehicle_condition: form.vehicle_condition?.trim() || null,
      air_conditioning: Boolean(form.air_conditioning),
      camera: Boolean(form.camera),
      interior_design: form.interior_design,
      interior_color: form.interior_color?.trim() || null,
      equipment: form.equipment,
      custom_fields: form.custom_fields,
      media: {
        thumbnail: currentThumbnail,
        gallery: currentGallery.slice(0, 20),
      },
      is_featured: Boolean(form.is_featured),
      is_visible: Boolean(form.is_visible),
    };

    if (form.slug?.trim()) {
      payload.slug = form.slug.trim();
    }

    onSave?.(payload);
  };

  const galleryImages = form.media?.gallery || [];
  const currentCover = form.media?.thumbnail || galleryImages[0] || "";

  const categoryOptions = useMemo(() => [
    { value: "SEDAN", label: `${t("catSedan", { defaultValue: "Sedan" })} (SEDAN)` },
    { value: "SUV", label: `${t("catSuv", { defaultValue: "SUV / Off-road" })} (SUV)` },
    { value: "COUPE", label: `${t("catCoupe", { defaultValue: "Coupe" })} (COUPE)` },
    { value: "CONVERTIBLE", label: `${t("catConvertible", { defaultValue: "Convertible" })} (CONVERTIBLE)` },
    { value: "WAGON", label: `${t("catWagon", { defaultValue: "Station Wagon" })} (WAGON)` },
    { value: "HATCHBACK", label: `${t("catHatchback", { defaultValue: "Hatchback" })} (HATCHBACK)` },
    { value: "VAN", label: `${t("catVan", { defaultValue: "Van" })} (VAN)` },
    { value: "TRUCK", label: `${t("catTruck", { defaultValue: "Commercial / Truck" })} (TRUCK)` },
    { value: "MOTORCYCLE", label: `${t("catMotorcycle", { defaultValue: "Motorcycle" })} (MOTORCYCLE)` },
    { value: "OTHER", label: `${t("catOther", { defaultValue: "Other" })} (OTHER)` },
  ], [t]);

  const conditionOptions = useMemo(() => [
    { value: "USED", label: `${t("conditionUsed", { defaultValue: "Used" })} (USED)` },
    { value: "NEW", label: `${t("conditionNew", { defaultValue: "New" })} (NEW)` },
  ], [t]);

  const statusOptions = useMemo(() => [
    { value: "AVAILABLE", label: `${t("statusAvailable", { defaultValue: "Available" })} (AVAILABLE)` },
    { value: "RESERVED", label: `${t("statusReserved", { defaultValue: "Reserved" })} (RESERVED)` },
    { value: "SOLD", label: `${t("statusSold", { defaultValue: "Sold" })} (SOLD)` },
    { value: "HIDDEN", label: `${t("statusHidden", { defaultValue: "Hidden" })} (HIDDEN)` },
  ], [t]);

  const fuelOptions = useMemo(() => [
    { value: "PETROL", label: `${t("fuelPetrol", { defaultValue: "Petrol" })} (PETROL)` },
    { value: "DIESEL", label: `${t("fuelDiesel", { defaultValue: "Diesel" })} (DIESEL)` },
    { value: "ELECTRIC", label: `${t("fuelElectric", { defaultValue: "Electric" })} (ELECTRIC)` },
    { value: "HYBRID", label: `${t("fuelHybrid", { defaultValue: "Hybrid" })} (HYBRID)` },
    { value: "PLUGIN_HYBRID", label: `${t("fuelPluginHybrid", { defaultValue: "Plug-in Hybrid" })} (PLUGIN_HYBRID)` },
    { value: "LPG", label: `${t("fuelLpg", { defaultValue: "LPG / Autogas" })} (LPG)` },
    { value: "HYDROGEN", label: `${t("fuelHydrogen", { defaultValue: "Hydrogen" })} (HYDROGEN)` },
    { value: "OTHER", label: `${t("catOther", { defaultValue: "Other" })} (OTHER)` },
  ], [t]);

  const transmissionOptions = useMemo(() => [
    { value: "AUTOMATIC", label: `${t("transmissionAutomatic", { defaultValue: "Automatic" })} (AUTOMATIC)` },
    { value: "MANUAL", label: `${t("transmissionManual", { defaultValue: "Manual" })} (MANUAL)` },
    { value: "SEMI_AUTOMATIC", label: `${t("transmissionSemiAutomatic", { defaultValue: "Semi-Automatic" })} (SEMI_AUTOMATIC)` },
  ], [t]);

  const interiorOptions = useMemo(() => [
    { value: "LEATHER", label: `${t("interLeather", { defaultValue: "Full Leather" })} (LEATHER)` },
    { value: "ALCANTARA", label: `${t("interAlcantara", { defaultValue: "Alcantara" })} (ALCANTARA)` },
    { value: "FABRIC", label: `${t("interFabric", { defaultValue: "Fabric" })} (FABRIC)` },
    { value: "MIXED", label: `${t("interMixed", { defaultValue: "Part Leather / Mixed" })} (MIXED)` },
    { value: "OTHER", label: `${t("catOther", { defaultValue: "Other" })} (OTHER)` },
  ], [t]);

  const tabs = [
    { key: "core", label: t("coreDataTab", { defaultValue: "Core Data & Required Fields *" }) },
    { key: "specs", label: t("specsTab", { defaultValue: "Specifications & Details" }) },
    { key: "equipment", label: `${t("equipmentTab", { defaultValue: "Equipment & Features" })} (${form.equipment.length})` },
    { key: "media", label: `${t("mediaTab", { defaultValue: "Images" })} (${galleryImages.length}/20) *` },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !saving && onClose?.()}
      title={car ? `${t("editVehicle", { defaultValue: "Edit Vehicle" })}: ${car.title || car.model}` : t("createNewVehicle", { defaultValue: "Add New Vehicle" })}
      size="xl"
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        {/* Navigation Tabs */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-xs)",
            borderBottom: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
            paddingBottom: "var(--space-xs)",
            overflowX: "auto",
          }}
        >
          {tabs.map((tItem) => (
            <button
              key={tItem.key}
              type="button"
              onClick={() => setActiveTab(tItem.key)}
              style={{
                padding: "8px 14px",
                fontSize: "var(--font-size-xs)",
                fontWeight: 600,
                borderRadius: "var(--radius-sm, 6px)",
                border: "none",
                backgroundColor: activeTab === tItem.key ? "var(--color-admin-accent, #0284c7)" : "transparent",
                color: activeTab === tItem.key ? "#ffffff" : "var(--color-admin-muted, #64748b)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              {tItem.label}
            </button>
          ))}
        </div>

        {/* Global Error Notice if required fields are missing */}
        {Object.keys(formErrors).length > 0 && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "var(--radius-md, 8px)",
              color: "#f87171",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Icon name="alert-triangle" size={16} />
            <span>{t("fillRequiredFields", { defaultValue: "Please fill in all required fields (marked in red)." })}</span>
          </div>
        )}

        {/* ── Tab 1: Core Data & Required Fields ───────────────────────────── */}
        {activeTab === "core" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            {/* Row 1: Brand, Title */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--space-sm)" }}>
              <SettingsField label={t("brandManufacturer", { defaultValue: "Make / Manufacturer" })} required error={formErrors.brand}>
                <Input
                  value={form.brand}
                  onChange={(e) => handleChange("brand", e.target.value)}
                  placeholder="e.g. Porsche, BMW, Mercedes"
                  required
                />
              </SettingsField>

              <SettingsField label={t("carTitle", { defaultValue: "Vehicle Title / Name" })} required error={formErrors.title}>
                <Input
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="e.g. Porsche 911 GT3 RS Weissach"
                  required
                />
              </SettingsField>
            </div>

            {/* Row 2: Price, Condition, Category */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-sm)" }}>
              <SettingsField label={t("purchasePrice", { defaultValue: "Price (€)" })} required error={formErrors.price}>
                <Input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="e.g. 89900"
                  required
                />
              </SettingsField>

              <SettingsField label={t("condition", { defaultValue: "Condition" })} required error={formErrors.condition}>
                <Select
                  value={form.condition}
                  onChange={(e) => handleChange("condition", e.target.value)}
                  options={conditionOptions}
                  required
                />
              </SettingsField>

              <SettingsField label={t("category", { defaultValue: "Vehicle Category" })} error={formErrors.category}>
                <Select
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  options={categoryOptions}
                />
              </SettingsField>
            </div>

            {/* Row 3: Mileage, Power, First Registration */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-sm)" }}>
              <SettingsField label={t("mileageKm", { defaultValue: "Mileage (km)" })} required error={formErrors.mileage_km}>
                <Input
                  type="number"
                  min="0"
                  value={form.mileage_km}
                  onChange={(e) => handleChange("mileage_km", e.target.value)}
                  placeholder="e.g. 25000"
                  required
                />
              </SettingsField>

              <SettingsField label={t("performanceHp", { defaultValue: "Power (HP)" })} required error={formErrors.performance_hp}>
                <Input
                  type="number"
                  min="1"
                  value={form.performance_hp}
                  onChange={(e) => handleChange("performance_hp", e.target.value)}
                  placeholder="e.g. 510"
                  required
                />
              </SettingsField>

              <SettingsField label={t("firstRegistrationDate", { defaultValue: "First Registration Date" })} required error={formErrors.first_registration}>
                <Input
                  type="date"
                  value={form.first_registration}
                  onChange={(e) => handleChange("first_registration", e.target.value)}
                  required
                />
              </SettingsField>
            </div>

            {/* Row 4: Fuel Type, Transmission, Status */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-sm)" }}>
              <SettingsField label={t("fuelType", { defaultValue: "Fuel Type" })} required error={formErrors.fuel_type}>
                <Select
                  value={form.fuel_type}
                  onChange={(e) => handleChange("fuel_type", e.target.value)}
                  options={fuelOptions}
                  required
                />
              </SettingsField>

              <SettingsField label={t("transmission", { defaultValue: "Transmission" })} required error={formErrors.transmission}>
                <Select
                  value={form.transmission}
                  onChange={(e) => handleChange("transmission", e.target.value)}
                  options={transmissionOptions}
                  required
                />
              </SettingsField>

              <SettingsField label={t("inventoryStatus", { defaultValue: "Inventory Status" })} error={formErrors.status}>
                <Select
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  options={statusOptions}
                />
              </SettingsField>
            </div>

            {/* Row 5: Old Price, Slug */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-sm)" }}>
              <SettingsField label={t("originalPrice", { defaultValue: "Original / Comparison Price (€)" })} helper={t("originalPriceHelper", { defaultValue: "Optional (for strikethrough discount display)" })} error={formErrors.old_price}>
                <Input
                  type="number"
                  min="0"
                  value={form.old_price}
                  onChange={(e) => handleChange("old_price", e.target.value)}
                  placeholder="e.g. 95000"
                />
              </SettingsField>

              <SettingsField label={t("urlSlug", { defaultValue: "URL Slug" })} helper={t("urlSlugHelper", { defaultValue: "Optional (auto-generated if empty)" })} error={formErrors.slug}>
                <Input
                  value={form.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="e.g. porsche-911-gt3-rs"
                />
              </SettingsField>
            </div>

            {/* Row 6: Toggles */}
            <div style={{ display: "flex", gap: "var(--space-xl)", marginTop: "var(--space-xs)" }}>
              <SettingsToggle
                label={t("featuredHome", { defaultValue: "Featured on Homepage" })}
                checked={form.is_featured}
                onChange={(checked) => handleChange("is_featured", checked)}
              />

              <SettingsToggle
                label={t("publiclyVisible", { defaultValue: "Publicly Visible" })}
                checked={form.is_visible}
                onChange={(checked) => handleChange("is_visible", checked)}
              />
            </div>
          </div>
        )}

        {/* ── Tab 2: Weitere Details & Beschreibung ──────────────────────── */}
        {activeTab === "specs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-sm)" }}>
              <SettingsField label={t("descriptionDe", { defaultValue: "Description (German)" })} locale="de" error={formErrors.description_de}>
                <Textarea
                  value={form.description_de}
                  onChange={(e) => handleChange("description_de", e.target.value)}
                  placeholder="Ausführliche Fahrzeugbeschreibung in deutscher Sprache..."
                  rows={4}
                />
              </SettingsField>

              <SettingsField label={t("descriptionEn", { defaultValue: "Description (English)" })} locale="en" error={formErrors.description_en}>
                <Textarea
                  value={form.description_en}
                  onChange={(e) => handleChange("description_en", e.target.value)}
                  placeholder="Comprehensive vehicle specification and history in English..."
                  rows={4}
                />
              </SettingsField>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-sm)" }}>
              <SettingsField label={t("displacementCc", { defaultValue: "Displacement (ccm)" })} error={formErrors.engine_displacement_cc}>
                <Input
                  type="number"
                  min="0"
                  value={form.engine_displacement_cc}
                  onChange={(e) => handleChange("engine_displacement_cc", e.target.value)}
                  placeholder="e.g. 3996"
                />
              </SettingsField>

              <SettingsField label={t("seats", { defaultValue: "Seats" })} error={formErrors.seats}>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={form.seats}
                  onChange={(e) => handleChange("seats", e.target.value)}
                />
              </SettingsField>

              <SettingsField label={t("previousOwners", { defaultValue: "Previous Owners" })} error={formErrors.vehicle_owners}>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.vehicle_owners}
                  onChange={(e) => handleChange("vehicle_owners", e.target.value)}
                />
              </SettingsField>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-sm)" }}>
              <SettingsField label={t("interiorDesign", { defaultValue: "Interior Material" })} error={formErrors.interior_design}>
                <Select
                  value={form.interior_design}
                  onChange={(e) => handleChange("interior_design", e.target.value)}
                  options={interiorOptions}
                />
              </SettingsField>

              <SettingsField label={t("interiorColor", { defaultValue: "Interior Color" })} error={formErrors.interior_color}>
                <Input
                  value={form.interior_color}
                  onChange={(e) => handleChange("interior_color", e.target.value)}
                  placeholder="Black / Contrast stitching"
                />
              </SettingsField>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-sm)" }}>
              <SettingsField label={t("conditionNotes", { defaultValue: "Condition Notes (e.g. Accident-free)" })} error={formErrors.vehicle_condition}>
                <Input
                  value={form.vehicle_condition}
                  onChange={(e) => handleChange("vehicle_condition", e.target.value)}
                  placeholder="Accident-free, full dealer service history"
                />
              </SettingsField>
            </div>

            <div style={{ display: "flex", gap: "var(--space-xl)", marginTop: "var(--space-xs)" }}>
              <SettingsToggle
                label={t("acAvailable", { defaultValue: "Air Conditioning / Climate Control" })}
                checked={form.air_conditioning}
                onChange={(checked) => handleChange("air_conditioning", checked)}
              />

              <SettingsToggle
                label={t("cameraAvailable", { defaultValue: "Reversing / 360° Camera" })}
                checked={form.camera}
                onChange={(checked) => handleChange("camera", checked)}
              />
            </div>

            {/* Custom Attributes / Fields */}
            <div style={{ borderTop: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))", paddingTop: "var(--space-sm)" }}>
              <label style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, color: "var(--color-admin-text, #0f172a)", display: "block", marginBottom: "8px" }}>
                {t("customAttributes", { defaultValue: "Custom Attributes (Key-Value)" })}
              </label>

              <div style={{ display: "flex", gap: "var(--space-xs)", marginBottom: "var(--space-xs)" }}>
                <Input
                  value={newCustomKey}
                  onChange={(e) => setNewCustomKey(e.target.value)}
                  placeholder={t("attributeKeyPlaceholder", { defaultValue: "Attribute Name (e.g. Warranty)" })}
                  style={{ flex: 1 }}
                />
                <Input
                  value={newCustomVal}
                  onChange={(e) => setNewCustomVal(e.target.value)}
                  placeholder={t("attributeValPlaceholder", { defaultValue: "Value (e.g. 24 Months Warranty)" })}
                  style={{ flex: 2 }}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddCustomField}>
                  <Icon name="plus" size={14} style={{ marginRight: "4px" }} />
                  {t("add", { defaultValue: "Add" })}
                </Button>
              </div>

              {Object.entries(form.custom_fields).length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "160px", overflowY: "auto" }}>
                  {Object.entries(form.custom_fields).map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 10px",
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.06))",
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                    >
                      <span><strong>{k}:</strong> {v}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomField(k)}
                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "2px" }}
                        title={t("remove", { defaultValue: "Remove" })}
                      >
                        <Icon name="trash" size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab 3: Equipment ─────────────────────────────── */}
        {activeTab === "equipment" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <div style={{ display: "flex", gap: "var(--space-xs)" }}>
              <Input
                value={newEquipmentItem}
                onChange={(e) => setNewEquipmentItem(e.target.value)}
                placeholder={t("addEquipmentPlaceholder", { defaultValue: "Add equipment feature (e.g. Ceramic Brakes, Panoramic Roof)..." })}
                style={{ flex: 1 }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddEquipment();
                  }
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddEquipment}>
                <Icon name="plus" size={14} style={{ marginRight: "4px" }} />
                {t("add", { defaultValue: "Add" })}
              </Button>
            </div>

            {form.equipment.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "var(--space-xs)",
                  maxHeight: "320px",
                  overflowY: "auto",
                  padding: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
                }}
              >
                {form.equipment.map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 10px",
                      borderRadius: "9999px",
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      fontSize: "12px",
                      color: "var(--color-admin-text, #0f172a)",
                    }}
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveEquipment(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--color-admin-muted, rgba(255, 255, 255, 0.6))",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        padding: 0,
                      }}
                      title={t("remove", { defaultValue: "Remove" })}
                    >
                      <Icon name="close" size={12} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: "var(--space-xl)",
                  textAlign: "center",
                  border: "1px dashed var(--color-admin-border, rgba(255, 255, 255, 0.12))",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-admin-muted)",
                  fontSize: "var(--font-size-xs)",
                }}
              >
                {t("noEquipmentAdded", { defaultValue: "No equipment features added yet. Enter features above and press Enter." })}
              </div>
            )}
          </div>
        )}

        {/* ── Tab 4: Fahrzeugbilder (Device Upload Only & Cover Designation) ── */}
        {activeTab === "media" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            {/* Header info */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--color-admin-text, #0f172a)" }}>
                  {t("vehicleMediaTitle", { count: galleryImages.length, defaultValue: `Vehicle Images (${galleryImages.length} of max. 20)` })}
                </h4>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--color-admin-muted)" }}>
                  {t("vehicleMediaDesc", { defaultValue: "Upload up to 20 images directly from your device. The first image is automatically used as the cover, but you can set any image as the cover." })}
                </p>
              </div>

              {galleryImages.length < 20 && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Icon name="upload" size={14} style={{ marginRight: "6px" }} />
                  {t("uploadFromDevice", { defaultValue: "Upload Images from Device" })}
                </Button>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              style={{ display: "none" }}
              onChange={handleFileInputChange}
            />

            {/* Upload Area / Drag & Drop Dropzone */}
            {galleryImages.length < 20 && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: isDragOver ? "2px dashed #D4AF37" : "2px dashed rgba(255, 255, 255, 0.2)",
                  borderRadius: "var(--radius-lg, 12px)",
                  padding: "24px 16px",
                  textAlign: "center",
                  backgroundColor: isDragOver ? "rgba(212, 175, 55, 0.08)" : "rgba(255, 255, 255, 0.02)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#D4AF37",
                  }}
                >
                  <Icon name="upload" size={22} />
                </div>
                <div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-admin-text, #0f172a)" }}>
                    {t("dragImagesOrBrowse", { defaultValue: "Drag images here or browse" })}
                  </span>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--color-admin-muted)", marginTop: "2px" }}>
                    {t("imageFormatsAllowed", { defaultValue: "JPG, PNG, WEBP or AVIF (max. 15 MB per image)" })}
                  </span>
                </div>
              </div>
            )}

            {/* Uploading progress indicator */}
            {isUploading && (
              <div
                style={{
                  padding: "10px 14px",
                  backgroundColor: "rgba(212, 175, 55, 0.1)",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#D4AF37",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: "14px",
                    height: "14px",
                    border: "2px solid #D4AF37",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "btn-spin 0.6s linear infinite",
                  }}
                />
                <span>{t("uploadingImagesWait", { defaultValue: "Uploading images... Please wait." })}</span>
              </div>
            )}

            {/* Media Error Notice */}
            {(mediaError || formErrors.media) && (
              <div
                style={{
                  padding: "8px 12px",
                  backgroundColor: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "6px",
                  color: "#f87171",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Icon name="alert-triangle" size={14} />
                <span>{mediaError || formErrors.media}</span>
              </div>
            )}

            {/* Cover Image Spotlight Preview (if a cover is selected) */}
            {currentCover && (
              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "center",
                  padding: "12px 16px",
                  backgroundColor: "rgba(212, 175, 55, 0.05)",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  borderRadius: "var(--radius-md, 8px)",
                }}
              >
                <div
                  style={{
                    width: "110px",
                    height: "70px",
                    borderRadius: "6px",
                    overflow: "hidden",
                    border: "2px solid #D4AF37",
                    flexShrink: 0,
                    backgroundColor: "#000",
                  }}
                >
                  <img
                    src={currentCover}
                    alt={t("coverPreview", { defaultValue: "Cover preview" })}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                      backgroundColor: "#D4AF37",
                      color: "#000000",
                      fontSize: "10px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      marginBottom: "4px",
                    }}
                  >
                    ⭐ {t("currentCoverImage", { defaultValue: "Current Cover Image" })}
                  </span>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--color-admin-muted)" }}>
                    {t("coverImageDescription", { defaultValue: "This image is used as the primary display in all inventory lists and showroom cards." })}
                  </p>
                </div>
              </div>
            )}

            {/* Gallery Images Grid */}
            {galleryImages.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: "var(--space-sm)",
                  maxHeight: "360px",
                  overflowY: "auto",
                  padding: "4px",
                }}
              >
                {galleryImages.map((imgUrl, idx) => {
                  const isCover = imgUrl === currentCover;

                  return (
                    <div
                      key={idx}
                      style={{
                        position: "relative",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: isCover ? "2px solid #D4AF37" : "1px solid rgba(255, 255, 255, 0.12)",
                        backgroundColor: "#0d0e11",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {/* Image Thumbnail */}
                      <div style={{ height: "95px", position: "relative" }}>
                        <img
                          src={imgUrl}
                          alt={t("vehicleImageNum", { count: idx + 1, defaultValue: `Vehicle Image ${idx + 1}` })}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />

                        {/* Cover Badge Overlay */}
                        {isCover && (
                          <div
                            style={{
                              position: "absolute",
                              top: "4px",
                              left: "4px",
                              backgroundColor: "#D4AF37",
                              color: "#000000",
                              fontSize: "9px",
                              fontWeight: 800,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                            }}
                          >
                            ⭐ {t("coverBadge", { defaultValue: "Cover" })}
                          </div>
                        )}
                      </div>

                      {/* Card Actions Footer */}
                      <div
                        style={{
                          padding: "6px 8px",
                          backgroundColor: "rgba(18, 20, 24, 0.95)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        {/* Set as Cover button if not already cover */}
                        {!isCover ? (
                          <button
                            type="button"
                            onClick={() => handleSetCover(imgUrl)}
                            style={{
                              width: "100%",
                              padding: "4px 6px",
                              backgroundColor: "rgba(212, 175, 55, 0.15)",
                              color: "#D4AF37",
                              border: "1px solid rgba(212, 175, 55, 0.35)",
                              borderRadius: "4px",
                              fontSize: "10px",
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {t("setAsCover", { defaultValue: "Set as cover" })}
                          </button>
                        ) : (
                          <div
                            style={{
                              textAlign: "center",
                              fontSize: "10px",
                              fontWeight: 700,
                              color: "#D4AF37",
                              padding: "4px 0",
                            }}
                          >
                            {t("mainImage", { defaultValue: "Main Cover" })}
                          </div>
                        )}

                        {/* Reorder and Delete Row */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "2px" }}>
                          <div style={{ display: "flex", gap: "2px" }}>
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveImage(idx, -1)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#ffffff",
                                cursor: idx === 0 ? "default" : "pointer",
                                opacity: idx === 0 ? 0.2 : 0.8,
                                padding: "2px 4px",
                                fontSize: "12px",
                              }}
                              title={t("moveLeft", { defaultValue: "Move left" })}
                            >
                              &larr;
                            </button>
                            <button
                              type="button"
                              disabled={idx === galleryImages.length - 1}
                              onClick={() => handleMoveImage(idx, 1)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#ffffff",
                                cursor: idx === galleryImages.length - 1 ? "default" : "pointer",
                                opacity: idx === galleryImages.length - 1 ? 0.2 : 0.8,
                                padding: "2px 4px",
                                fontSize: "12px",
                              }}
                              title={t("moveRight", { defaultValue: "Move right" })}
                            >
                              &rarr;
                            </button>
                          </div>

                          <span style={{ fontSize: "10px", color: "var(--color-admin-muted)" }}>
                            #{idx + 1}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              padding: "2px",
                              display: "flex",
                              alignItems: "center",
                            }}
                            title={t("removeImage", { defaultValue: "Remove image" })}
                          >
                            <Icon name="trash" size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  padding: "var(--space-xl)",
                  textAlign: "center",
                  border: "1px dashed var(--color-admin-border, rgba(255, 255, 255, 0.12))",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-admin-muted)",
                  fontSize: "var(--font-size-xs)",
                }}
              >
                {t("noImagesUploaded", { defaultValue: "No images uploaded yet. Click \"Upload Images from Device\" above to add vehicle photos." })}
              </div>
            )}
          </div>
        )}

        {/* ── Bottom Save & Cancel Bar ───────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "var(--space-sm)",
            marginTop: "var(--space-md)",
            paddingTop: "var(--space-md)",
            borderTop: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
          }}
        >
          <Button variant="outline" size="sm" type="button" disabled={saving || isUploading} onClick={onClose}>
            <Icon name="close" size={14} style={{ marginRight: "6px" }} />
            {t("cancel", { defaultValue: "Cancel" })}
          </Button>

          <Button variant="primary" size="sm" type="submit" loading={saving} disabled={isUploading}>
            <Icon name="save" size={14} style={{ marginRight: "6px" }} />
            {car ? t("saveChanges", { defaultValue: "Save Changes" }) : t("createVehicle", { defaultValue: "Create Vehicle" })}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CarEditorModal;
