import React, { useState, useEffect, useRef } from "react";
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
  { value: "SEDAN", label: "Limousine (SEDAN)" },
  { value: "SUV", label: "SUV / Geländewagen (SUV)" },
  { value: "COUPE", label: "Coupé (COUPE)" },
  { value: "CONVERTIBLE", label: "Cabriolet (CONVERTIBLE)" },
  { value: "WAGON", label: "Kombi (WAGON)" },
  { value: "HATCHBACK", label: "Schrägheck (HATCHBACK)" },
  { value: "VAN", label: "Van / Kleinbus (VAN)" },
  { value: "TRUCK", label: "Nutzfahrzeug (TRUCK)" },
  { value: "MOTORCYCLE", label: "Motorrad (MOTORCYCLE)" },
  { value: "OTHER", label: "Sonstige (OTHER)" },
];

const CONDITIONS = [
  { value: "USED", label: "Gebrauchtfahrzeug (USED)" },
  { value: "NEW", label: "Neufahrzeug (NEW)" },
];

const STATUSES = [
  { value: "AVAILABLE", label: "Verfügbar (AVAILABLE)" },
  { value: "RESERVED", label: "Reserviert (RESERVED)" },
  { value: "SOLD", label: "Verkauft (SOLD)" },
  { value: "HIDDEN", label: "Ausgeblendet (HIDDEN)" },
];

const FUELS = [
  { value: "PETROL", label: "Benzin (PETROL)" },
  { value: "DIESEL", label: "Diesel (DIESEL)" },
  { value: "ELECTRIC", label: "Elektro (ELECTRIC)" },
  { value: "HYBRID", label: "Hybrid (HYBRID)" },
  { value: "PLUGIN_HYBRID", label: "Plug-in Hybrid (PLUGIN_HYBRID)" },
  { value: "LPG", label: "Autogas (LPG)" },
  { value: "HYDROGEN", label: "Wasserstoff (HYDROGEN)" },
  { value: "OTHER", label: "Sonstige (OTHER)" },
];

const TRANSMISSIONS = [
  { value: "AUTOMATIC", label: "Automatik (AUTOMATIC)" },
  { value: "MANUAL", label: "Schaltgetriebe (MANUAL)" },
  { value: "SEMI_AUTOMATIC", label: "Halbautomatik (SEMI_AUTOMATIC)" },
];

const INTERIORS = [
  { value: "LEATHER", label: "Vollleder (LEATHER)" },
  { value: "ALCANTARA", label: "Alcantara (ALCANTARA)" },
  { value: "FABRIC", label: "Stoff (FABRIC)" },
  { value: "MIXED", label: "Teilleder / Mix (MIXED)" },
  { value: "OTHER", label: "Sonstige (OTHER)" },
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
      setMediaError("Nur Bilddateien (JPG, PNG, WEBP, AVIF) sind erlaubt.");
      return;
    }

    const currentGallery = form.media.gallery || [];
    const availableSlots = 20 - currentGallery.length;

    if (availableSlots <= 0) {
      setMediaError("Maximal 20 Galeriebilder erlaubt.");
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
        setMediaError("Fehler beim Verarbeiten der Bilddateien.");
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
      errors.brand = "Marke / Hersteller ist ein Pflichtfeld.";
    }

    // 2. Model
    if (!form.model?.trim()) {
      errors.model = "Modell ist ein Pflichtfeld.";
    }

    // 3. Car Name / Title
    if (!form.title?.trim()) {
      errors.title = "Fahrzeugname / Titel ist ein Pflichtfeld.";
    }

    // 4. Condition (Used or New)
    if (!form.condition) {
      errors.condition = "Fahrzeugzustand (Neu / Gebraucht) ist ein Pflichtfeld.";
    }

    // 5. Price
    if (form.price === "" || form.price === null || isNaN(Number(form.price)) || Number(form.price) < 0) {
      errors.price = "Gültiger Kaufpreis (€) ist ein Pflichtfeld.";
    }

    // 6. Mileage (km)
    if (form.mileage_km === "" || form.mileage_km === null || isNaN(Number(form.mileage_km)) || Number(form.mileage_km) < 0) {
      errors.mileage_km = "Kilometerstand (km) ist ein Pflichtfeld.";
    }

    // 7. Power (PS)
    if (form.performance_hp === "" || form.performance_hp === null || isNaN(Number(form.performance_hp)) || Number(form.performance_hp) <= 0) {
      errors.performance_hp = "Leistung (PS) ist ein Pflichtfeld.";
    }

    // 8. First Registration
    if (!form.first_registration?.trim()) {
      errors.first_registration = "Erstzulassung ist ein Pflichtfeld.";
    }

    // 9. Fuel Type
    if (!form.fuel_type) {
      errors.fuel_type = "Kraftstoffart ist ein Pflichtfeld.";
    }

    // 10. Transmission
    if (!form.transmission) {
      errors.transmission = "Getriebe ist ein Pflichtfeld.";
    }

    // 11. At least 1 image
    const imagesCount = (form.media?.gallery?.length || 0) + (form.media?.thumbnail ? 1 : 0);
    if (imagesCount === 0) {
      errors.media = "Mindestens 1 Fahrzeugbild ist erforderlich.";
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
        errorsFound.model ||
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
      model: form.model.trim(),
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

  const tabs = [
    { key: "core", label: t("coreDataTab", { defaultValue: "Grunddaten & Pflichtfelder *" }) },
    { key: "specs", label: t("specsTab", { defaultValue: "Weitere Details" }) },
    { key: "equipment", label: `${t("equipmentTab", { defaultValue: "Ausstattung" })} (${form.equipment.length})` },
    { key: "media", label: `${t("mediaTab", { defaultValue: "Bilder" })} (${galleryImages.length}/20) *` },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !saving && onClose?.()}
      title={car ? `${t("editVehicle", { defaultValue: "Fahrzeug bearbeiten" })}: ${car.title || car.model}` : t("createNewVehicle", { defaultValue: "Neues Fahrzeug anlegen" })}
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
            <span>Bitte füllen Sie alle erforderlichen Pflichtfelder aus (siehe rot markierte Felder).</span>
          </div>
        )}

        {/* ── Tab 1: Grunddaten & Pflichtfelder ───────────────────────────── */}
        {activeTab === "core" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            {/* Row 1: Marke, Modell, Fahrzeugname/Titel */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-sm)" }}>
              <SettingsField label="Marke / Hersteller" required error={formErrors.brand}>
                <Input
                  value={form.brand}
                  onChange={(e) => handleChange("brand", e.target.value)}
                  placeholder="z. B. Porsche, BMW, Mercedes"
                  required
                />
              </SettingsField>

              <SettingsField label="Modell" required error={formErrors.model}>
                <Input
                  value={form.model}
                  onChange={(e) => handleChange("model", e.target.value)}
                  placeholder="z. B. 911 GT3 RS, M3"
                  required
                />
              </SettingsField>

              <SettingsField label="Fahrzeugname / Titel" required error={formErrors.title}>
                <Input
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="z. B. Porsche 911 GT3 RS Weissach"
                  required
                />
              </SettingsField>
            </div>

            {/* Row 2: Kaufpreis, Zustand (Neu/Gebraucht), Fahrzeugklasse */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-sm)" }}>
              <SettingsField label="Kaufpreis (€)" required error={formErrors.price}>
                <Input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="z. B. 89900"
                  required
                />
              </SettingsField>

              <SettingsField label="Fahrzeugzustand (Neu / Gebraucht)" required error={formErrors.condition}>
                <Select
                  value={form.condition}
                  onChange={(e) => handleChange("condition", e.target.value)}
                  options={CONDITIONS}
                  required
                />
              </SettingsField>

              <SettingsField label="Fahrzeugklasse" error={formErrors.category}>
                <Select
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  options={CATEGORIES}
                />
              </SettingsField>
            </div>

            {/* Row 3: Kilometerstand, Leistung, Erstzulassung */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-sm)" }}>
              <SettingsField label="Kilometerstand (km)" required error={formErrors.mileage_km}>
                <Input
                  type="number"
                  min="0"
                  value={form.mileage_km}
                  onChange={(e) => handleChange("mileage_km", e.target.value)}
                  placeholder="z. B. 25000"
                  required
                />
              </SettingsField>

              <SettingsField label="Leistung (PS)" required error={formErrors.performance_hp}>
                <Input
                  type="number"
                  min="1"
                  value={form.performance_hp}
                  onChange={(e) => handleChange("performance_hp", e.target.value)}
                  placeholder="z. B. 510"
                  required
                />
              </SettingsField>

              <SettingsField label="Erstzulassung (Datum/Jahr)" required error={formErrors.first_registration}>
                <Input
                  type="date"
                  value={form.first_registration}
                  onChange={(e) => handleChange("first_registration", e.target.value)}
                  required
                />
              </SettingsField>
            </div>

            {/* Row 4: Kraftstoffart, Getriebe, Bestandsstatus */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-sm)" }}>
              <SettingsField label="Kraftstoffart" required error={formErrors.fuel_type}>
                <Select
                  value={form.fuel_type}
                  onChange={(e) => handleChange("fuel_type", e.target.value)}
                  options={FUELS}
                  required
                />
              </SettingsField>

              <SettingsField label="Getriebe" required error={formErrors.transmission}>
                <Select
                  value={form.transmission}
                  onChange={(e) => handleChange("transmission", e.target.value)}
                  options={TRANSMISSIONS}
                  required
                />
              </SettingsField>

              <SettingsField label="Bestands-Status" error={formErrors.status}>
                <Select
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  options={STATUSES}
                />
              </SettingsField>
            </div>

            {/* Row 5: Ursprünglicher Preis, URL-Slug */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-sm)" }}>
              <SettingsField label="Ursprünglicher Preis (€)" helper="Optional (für Rabattanzeige)" error={formErrors.old_price}>
                <Input
                  type="number"
                  min="0"
                  value={form.old_price}
                  onChange={(e) => handleChange("old_price", e.target.value)}
                  placeholder="z. B. 95000"
                />
              </SettingsField>

              <SettingsField label="URL-Slug" helper="Optional (wird sonst automatisch erzeugt)" error={formErrors.slug}>
                <Input
                  value={form.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="z. B. porsche-911-gt3-rs"
                />
              </SettingsField>
            </div>

            {/* Row 6: Toggles */}
            <div style={{ display: "flex", gap: "var(--space-xl)", marginTop: "var(--space-xs)" }}>
              <SettingsToggle
                label="Featured (Auf Startseite hervorheben)"
                checked={form.is_featured}
                onChange={(checked) => handleChange("is_featured", checked)}
              />

              <SettingsToggle
                label="Öffentlich sichtbar"
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
              <SettingsField label="Beschreibung (Deutsch)" locale="de" error={formErrors.description_de}>
                <Textarea
                  value={form.description_de}
                  onChange={(e) => handleChange("description_de", e.target.value)}
                  placeholder="Ausführliche Fahrzeugbeschreibung in deutscher Sprache..."
                  rows={4}
                />
              </SettingsField>

              <SettingsField label="Description (English)" locale="en" error={formErrors.description_en}>
                <Textarea
                  value={form.description_en}
                  onChange={(e) => handleChange("description_en", e.target.value)}
                  placeholder="Comprehensive vehicle specification and history in English..."
                  rows={4}
                />
              </SettingsField>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-sm)" }}>
              <SettingsField label="Hubraum (ccm)" error={formErrors.engine_displacement_cc}>
                <Input
                  type="number"
                  min="0"
                  value={form.engine_displacement_cc}
                  onChange={(e) => handleChange("engine_displacement_cc", e.target.value)}
                  placeholder="z. B. 3996"
                />
              </SettingsField>

              <SettingsField label="Sitze" error={formErrors.seats}>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={form.seats}
                  onChange={(e) => handleChange("seats", e.target.value)}
                />
              </SettingsField>

              <SettingsField label="Vorbesitzer (Fahrzeughalter)" error={formErrors.vehicle_owners}>
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
              <SettingsField label="Innenausstattung" error={formErrors.interior_design}>
                <Select
                  value={form.interior_design}
                  onChange={(e) => handleChange("interior_design", e.target.value)}
                  options={INTERIORS}
                />
              </SettingsField>

              <SettingsField label="Innenfarbe" error={formErrors.interior_color}>
                <Input
                  value={form.interior_color}
                  onChange={(e) => handleChange("interior_color", e.target.value)}
                  placeholder="Schwarz / Kontrastnaht"
                />
              </SettingsField>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-sm)" }}>
              <SettingsField label="Zustandsbeschreibung (z. B. Unfallfrei)" error={formErrors.vehicle_condition}>
                <Input
                  value={form.vehicle_condition}
                  onChange={(e) => handleChange("vehicle_condition", e.target.value)}
                  placeholder="Unfallfrei, scheckheftgepflegt bei Vertragswerkstatt"
                />
              </SettingsField>
            </div>

            <div style={{ display: "flex", gap: "var(--space-xl)", marginTop: "var(--space-xs)" }}>
              <SettingsToggle
                label="Klimaanlage / Klimaautomatik vorhanden"
                checked={form.air_conditioning}
                onChange={(checked) => handleChange("air_conditioning", checked)}
              />

              <SettingsToggle
                label="Rückfahrkamera / 360° Kamera vorhanden"
                checked={form.camera}
                onChange={(checked) => handleChange("camera", checked)}
              />
            </div>

            {/* Custom Attributes / Fields */}
            <div style={{ borderTop: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))", paddingTop: "var(--space-sm)" }}>
              <label style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, color: "var(--color-admin-text)", display: "block", marginBottom: "8px" }}>
                Benutzerdefinierte Merkmale (Key-Value)
              </label>

              <div style={{ display: "flex", gap: "var(--space-xs)", marginBottom: "var(--space-xs)" }}>
                <Input
                  value={newCustomKey}
                  onChange={(e) => setNewCustomKey(e.target.value)}
                  placeholder="Eigenschaft (z. B. Garantie)"
                  style={{ flex: 1 }}
                />
                <Input
                  value={newCustomVal}
                  onChange={(e) => setNewCustomVal(e.target.value)}
                  placeholder="Wert (z. B. 24 Monate Porsche Approved)"
                  style={{ flex: 2 }}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddCustomField}>
                  <Icon name="plus" size={14} style={{ marginRight: "4px" }} />
                  Hinzufügen
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
                        title="Entfernen"
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

        {/* ── Tab 3: Ausstattung (Equipment) ─────────────────────────────── */}
        {activeTab === "equipment" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <div style={{ display: "flex", gap: "var(--space-xs)" }}>
              <Input
                value={newEquipmentItem}
                onChange={(e) => setNewEquipmentItem(e.target.value)}
                placeholder="Ausstattungsmerkmal hinzufügen (z. B. Keramikbremsen, Panoramadach)..."
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
                Hinzufügen
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
                      color: "#ffffff",
                    }}
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveEquipment(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(255, 255, 255, 0.6)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        padding: 0,
                      }}
                      title="Entfernen"
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
                Noch keine Ausstattungsmerkmale hinzugefügt. Geben Sie oben Merkmale ein und drücken Sie Enter.
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
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
                  Fahrzeugbilder ({galleryImages.length} von max. 20)
                </h4>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--color-admin-muted)" }}>
                  Laden Sie bis zu 20 Bilder direkt von Ihrem Gerät hoch. Das erste Bild wird automatisch als Cover verwendet, Sie können aber jedes Bild als Cover festlegen.
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
                  Bilder vom Gerät hochladen
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
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                    Bilder hierher ziehen oder durchsuchen
                  </span>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--color-admin-muted)", marginTop: "2px" }}>
                    JPG, PNG, WEBP oder AVIF (max. 15 MB pro Bild)
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
                <span>Bilder werden hochgeladen... Bitte einen Moment warten.</span>
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
                    alt="Cover Vorschau"
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
                    ⭐ Aktuelles Coverbild
                  </span>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--color-admin-muted)" }}>
                    Dieses Bild wird als Hauptdarstellung in allen Listen, Fahrzeugkarten und im Showroom verwendet.
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
                          alt={`Fahrzeug Bild ${idx + 1}`}
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
                            ⭐ Cover
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
                            Als Cover setzen
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
                            Hauptbild
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
                              title="Nach links verschieben"
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
                              title="Nach rechts verschieben"
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
                            title="Bild entfernen"
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
                Noch keine Bilder hochgeladen. Klicken Sie oben auf "Bilder vom Gerät hochladen", um Fahrzeugbilder von Ihrem Computer oder Smartphone hinzuzufügen.
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
            {t("cancel", { defaultValue: "Abbrechen" })}
          </Button>

          <Button variant="primary" size="sm" type="submit" loading={saving} disabled={isUploading}>
            <Icon name="save" size={14} style={{ marginRight: "6px" }} />
            {car ? t("saveChanges", { defaultValue: "Änderungen speichern" }) : t("createVehicle", { defaultValue: "Fahrzeug erstellen" })}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CarEditorModal;
