import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Input from "../../forms/Input";
import Select from "../../forms/Select";
import Textarea from "../../forms/Textarea";
import SettingsToggle from "../settings/SettingsToggle";
import SettingsField from "../settings/SettingsField";
import Icon from "../../common/Icon";

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
    video: "",
    images_360: [],
    model_3d: "",
  },
  is_featured: false,
  is_visible: true,
};

export function CarEditorModal({
  isOpen,
  car = null, // null for create mode, object for edit mode
  saving = false,
  errors = {},
  onSave,
  onClose,
}) {
  const { t } = useTranslation(["admin", "cars", "common"]);

  const [form, setForm] = useState(INITIAL_FORM);
  const [activeTab, setActiveTab] = useState("core"); // "core" | "specs" | "equipment" | "media"
  const [newEquipmentItem, setNewEquipmentItem] = useState("");
  const [newCustomKey, setNewCustomKey] = useState("");
  const [newCustomVal, setNewCustomVal] = useState("");
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [new360Url, setNew360Url] = useState("");
  const [mediaValidationError, setMediaValidationError] = useState(null);

  // Track created local object URLs to guarantee cleanup and prevent memory leaks
  const trackedBlobUrls = useRef(new Set());

  // Revoke tracked blob URLs on unmount
  useEffect(() => {
    const urls = trackedBlobUrls.current;
    return () => {
      urls.forEach((blobUrl) => {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch {
          // ignore
        }
      });
      urls.clear();
    };
  }, []);

  const createTrackedBlobUrl = (file) => {
    const blobUrl = URL.createObjectURL(file);
    trackedBlobUrls.current.add(blobUrl);
    return blobUrl;
  };

  const revokeTrackedBlobUrl = (url) => {
    if (url && typeof url === "string" && url.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
      trackedBlobUrls.current.delete(url);
    }
  };

  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB limit matching storage service

  const validateImageFile = (file) => {
    if (!file) return { valid: false, error: "Keine Datei ausgewählt." };
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Ungültiger Dateityp (${file.type || "unbekannt"}). Erlaubt sind JPG, PNG, WEBP und AVIF.`,
      };
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return {
        valid: false,
        error: `Dateigröße (${(file.size / (1024 * 1024)).toFixed(1)} MB) überschreitet das Limit von 10 MB.`,
      };
    }
    return { valid: true };
  };

  // Initialize draft on open
  useEffect(() => {
    if (car) {
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
          thumbnail: car.media?.thumbnail || "",
          gallery: Array.isArray(car.media?.gallery) ? [...car.media.gallery] : [],
          video: car.media?.video || "",
          images_360: Array.isArray(car.media?.images_360) ? [...car.media.images_360] : [],
          model_3d: car.media?.model_3d || "",
        },
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setActiveTab("core");
    setMediaValidationError(null);
  }, [car, isOpen]);

  const handleChange = (field, val) => {
    setForm((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleMediaChange = (mediaKey, val) => {
    setForm((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        [mediaKey]: val,
      },
    }));
  };

  // Thumbnail actions
  const handleThumbnailUrlChange = (val) => {
    if (form.media.thumbnail?.startsWith("blob:")) {
      revokeTrackedBlobUrl(form.media.thumbnail);
    }
    handleMediaChange("thumbnail", val);
    setMediaValidationError(null);
  };

  const handleThumbnailFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setMediaValidationError(validation.error);
      return;
    }
    setMediaValidationError(null);
    if (form.media.thumbnail?.startsWith("blob:")) {
      revokeTrackedBlobUrl(form.media.thumbnail);
    }
    const blobUrl = createTrackedBlobUrl(file);
    handleMediaChange("thumbnail", blobUrl);
  };

  const handleClearThumbnail = () => {
    if (form.media.thumbnail?.startsWith("blob:")) {
      revokeTrackedBlobUrl(form.media.thumbnail);
    }
    handleMediaChange("thumbnail", "");
    setMediaValidationError(null);
  };

  // Equipment actions
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

  // Custom field actions
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

  // Gallery actions
  const handleAddGalleryUrl = () => {
    const url = newGalleryUrl.trim();
    if (!url) return;
    if (form.media.gallery.length >= 20) {
      alert("Maximal 20 Galeriebilder erlaubt.");
      return;
    }
    setMediaValidationError(null);
    handleMediaChange("gallery", [...form.media.gallery, url]);
    setNewGalleryUrl("");
  };

  const handleGalleryFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    e.target.value = "";

    const availableSlots = 20 - form.media.gallery.length;
    if (availableSlots <= 0) {
      alert("Maximal 20 Galeriebilder erlaubt.");
      return;
    }

    const filesToProcess = files.slice(0, availableSlots);
    const newUrls = [];

    for (const file of filesToProcess) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setMediaValidationError(validation.error);
        return;
      }
      const blobUrl = createTrackedBlobUrl(file);
      newUrls.push(blobUrl);
    }

    setMediaValidationError(null);
    handleMediaChange("gallery", [...form.media.gallery, ...newUrls]);
  };

  const handleRemoveGalleryImage = (index) => {
    const targetUrl = form.media.gallery[index];
    revokeTrackedBlobUrl(targetUrl);
    handleMediaChange("gallery", form.media.gallery.filter((_, idx) => idx !== index));
  };

  const handleMoveGalleryImage = (index, direction) => {
    const newGallery = [...form.media.gallery];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newGallery.length) return;
    const temp = newGallery[index];
    newGallery[index] = newGallery[targetIdx];
    newGallery[targetIdx] = temp;
    handleMediaChange("gallery", newGallery);
  };

  // 360 images actions
  const handleAdd360Url = () => {
    const url = new360Url.trim();
    if (!url) return;
    setMediaValidationError(null);
    handleMediaChange("images_360", [...form.media.images_360, url]);
    setNew360Url("");
  };

  const handle360FileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setMediaValidationError(validation.error);
      return;
    }
    setMediaValidationError(null);
    const blobUrl = createTrackedBlobUrl(file);
    handleMediaChange("images_360", [...form.media.images_360, blobUrl]);
  };

  const handleRemove360Image = (index) => {
    const targetUrl = form.media.images_360[index];
    revokeTrackedBlobUrl(targetUrl);
    handleMediaChange("images_360", form.media.images_360.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if any media contains local temporary blob: URLs
    const hasBlobThumbnail = form.media?.thumbnail?.startsWith("blob:");
    const hasBlobGallery = Array.isArray(form.media?.gallery) && form.media.gallery.some((u) => u?.startsWith("blob:"));
    const hasBlob360 = Array.isArray(form.media?.images_360) && form.media.images_360.some((u) => u?.startsWith("blob:"));

    if (hasBlobThumbnail || hasBlobGallery || hasBlob360) {
      setActiveTab("media");
      setMediaValidationError(
        t("blobMediaNotPersisted", {
          defaultValue:
            "Lokale Dateiauswahl dient nur der temporären Vorschau. Bitte hinterlegen Sie permanente Medien-URLs (z. B. https://... aus dem CDN oder Storage-Bucket) für die dauerhafte Speicherung.",
        })
      );
      return;
    }

    // Clean payload for submission
    const cleanMedia = {
      thumbnail: form.media?.thumbnail?.trim() || null,
      gallery: Array.isArray(form.media?.gallery)
        ? form.media.gallery.filter((u) => u && !u.startsWith("blob:")).map((u) => u.trim())
        : [],
      video: form.media?.video?.trim() || null,
      images_360: Array.isArray(form.media?.images_360)
        ? form.media.images_360.filter((u) => u && !u.startsWith("blob:")).map((u) => u.trim())
        : [],
      model_3d: form.media?.model_3d?.trim() || null,
    };

    // Prepare payload matching car schema
    const payload = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      title: form.title.trim(),
      category: form.category,
      condition: form.condition,
      status: form.status,
      price: Number(form.price),
      old_price: form.old_price !== "" && form.old_price != null ? Number(form.old_price) : null,
      description_de: form.description_de || null,
      description_en: form.description_en || null,
      fuel_type: form.fuel_type,
      transmission: form.transmission,
      mileage_km: form.mileage_km !== "" && form.mileage_km != null ? Number(form.mileage_km) : null,
      first_registration: form.first_registration || null,
      engine_displacement_cc: form.engine_displacement_cc !== "" && form.engine_displacement_cc != null ? Number(form.engine_displacement_cc) : null,
      performance_hp: form.performance_hp !== "" && form.performance_hp != null ? Number(form.performance_hp) : null,
      seats: form.seats !== "" && form.seats != null ? Number(form.seats) : null,
      vehicle_owners: form.vehicle_owners !== "" && form.vehicle_owners != null ? Number(form.vehicle_owners) : null,
      vehicle_condition: form.vehicle_condition || null,
      air_conditioning: Boolean(form.air_conditioning),
      camera: Boolean(form.camera),
      interior_design: form.interior_design,
      interior_color: form.interior_color || null,
      equipment: form.equipment,
      custom_fields: form.custom_fields,
      media: cleanMedia,
      is_featured: Boolean(form.is_featured),
      is_visible: Boolean(form.is_visible),
    };

    if (form.slug?.trim()) {
      payload.slug = form.slug.trim();
    }

    onSave?.(payload);
  };

  const tabs = [
    { key: "core", label: "Grunddaten & Preis" },
    { key: "specs", label: "Technische Daten & Merkmale" },
    { key: "equipment", label: `Ausstattung (${form.equipment.length})` },
    { key: "media", label: `Medien (${form.media.gallery.length + (form.media.thumbnail ? 1 : 0) + (form.media.images_360?.length || 0)})` },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !saving && onClose?.()}
      title={car ? `Fahrzeug bearbeiten: ${car.title || car.model}` : "Neues Fahrzeug anlegen"}
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
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: "8px 14px",
                fontSize: "var(--font-size-xs)",
                fontWeight: 600,
                borderRadius: "var(--radius-sm, 6px)",
                border: "none",
                backgroundColor: activeTab === t.key ? "rgba(255, 255, 255, 0.15)" : "transparent",
                color: activeTab === t.key ? "var(--color-primary, var(--color-text))" : "var(--color-admin-muted)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Core Data & Pricing */}
        {activeTab === "core" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: "var(--space-sm)" }}>
              <SettingsField label="Marke" required error={errors.brand}>
                <Input
                  value={form.brand}
                  onChange={(e) => handleChange("brand", e.target.value)}
                  placeholder="z. B. Porsche"
                  required
                />
              </SettingsField>

              <SettingsField label="Modell" required error={errors.model}>
                <Input
                  value={form.model}
                  onChange={(e) => handleChange("model", e.target.value)}
                  placeholder="z. B. 911 GT3 RS"
                  required
                />
              </SettingsField>

              <SettingsField label="Titel (Überschrift)" required error={errors.title}>
                <Input
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Porsche 911 (992) GT3 RS Weissach"
                  required
                />
              </SettingsField>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-sm)" }}>
              <SettingsField label="Kaufpreis (€)" required error={errors.price}>
                <Input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="295000"
                  required
                />
              </SettingsField>

              <SettingsField label="Ursprünglicher Preis (€)" helper="Optional (für Rabattanzeige)" error={errors.old_price}>
                <Input
                  type="number"
                  min="0"
                  value={form.old_price}
                  onChange={(e) => handleChange("old_price", e.target.value)}
                  placeholder="315000"
                />
              </SettingsField>

              <SettingsField label="Fahrzeugklasse" error={errors.category}>
                <Select
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  options={CATEGORIES}
                />
              </SettingsField>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-sm)" }}>
              <SettingsField label="Fahrzeugzustand" error={errors.condition}>
                <Select
                  value={form.condition}
                  onChange={(e) => handleChange("condition", e.target.value)}
                  options={CONDITIONS}
                />
              </SettingsField>

              <SettingsField label="Bestands-Status" error={errors.status}>
                <Select
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  options={STATUSES}
                />
              </SettingsField>

              <SettingsField label="URL-Slug" helper="Optional (wird sonst automatisch erzeugt)" error={errors.slug}>
                <Input
                  value={form.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="porsche-911-gt3-rs-weissach"
                />
              </SettingsField>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
              <SettingsField label="Beschreibung (Deutsch)" locale="de" error={errors.description_de}>
                <Textarea
                  value={form.description_de}
                  onChange={(e) => handleChange("description_de", e.target.value)}
                  placeholder="Ausführliche Fahrzeugbeschreibung in deutscher Sprache..."
                  rows={4}
                />
              </SettingsField>

              <SettingsField label="Description (English)" locale="en" error={errors.description_en}>
                <Textarea
                  value={form.description_en}
                  onChange={(e) => handleChange("description_en", e.target.value)}
                  placeholder="Comprehensive vehicle specification and history in English..."
                  rows={4}
                />
              </SettingsField>
            </div>

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

        {/* Tab 2: Specs & Technical Data */}
        {activeTab === "specs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-sm)" }}>
              <SettingsField label="Kraftstoffart" error={errors.fuel_type}>
                <Select
                  value={form.fuel_type}
                  onChange={(e) => handleChange("fuel_type", e.target.value)}
                  options={FUELS}
                />
              </SettingsField>

              <SettingsField label="Getriebe" error={errors.transmission}>
                <Select
                  value={form.transmission}
                  onChange={(e) => handleChange("transmission", e.target.value)}
                  options={TRANSMISSIONS}
                />
              </SettingsField>

              <SettingsField label="Kilometerstand (km)" error={errors.mileage_km}>
                <Input
                  type="number"
                  min="0"
                  value={form.mileage_km}
                  onChange={(e) => handleChange("mileage_km", e.target.value)}
                  placeholder="12500"
                />
              </SettingsField>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-sm)" }}>
              <SettingsField label="Erstzulassung (Datum)" error={errors.first_registration}>
                <Input
                  type="date"
                  value={form.first_registration}
                  onChange={(e) => handleChange("first_registration", e.target.value)}
                />
              </SettingsField>

              <SettingsField label="Leistung (PS)" error={errors.performance_hp}>
                <Input
                  type="number"
                  min="0"
                  value={form.performance_hp}
                  onChange={(e) => handleChange("performance_hp", e.target.value)}
                  placeholder="525"
                />
              </SettingsField>

              <SettingsField label="Hubraum (ccm)" error={errors.engine_displacement_cc}>
                <Input
                  type="number"
                  min="0"
                  value={form.engine_displacement_cc}
                  onChange={(e) => handleChange("engine_displacement_cc", e.target.value)}
                  placeholder="3996"
                />
              </SettingsField>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-sm)" }}>
              <SettingsField label="Sitze (1–100)" error={errors.seats}>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={form.seats}
                  onChange={(e) => handleChange("seats", e.target.value)}
                />
              </SettingsField>

              <SettingsField label="Vorbesitzer (Fahrzeughalter)" error={errors.vehicle_owners}>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.vehicle_owners}
                  onChange={(e) => handleChange("vehicle_owners", e.target.value)}
                />
              </SettingsField>

              <SettingsField label="Zustandsbeschreibung (z. B. Unfallfrei)" error={errors.vehicle_condition}>
                <Input
                  value={form.vehicle_condition}
                  onChange={(e) => handleChange("vehicle_condition", e.target.value)}
                  placeholder="Unfallfrei, scheckheftgepflegt"
                />
              </SettingsField>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
              <SettingsField label="Innenausstattung" error={errors.interior_design}>
                <Select
                  value={form.interior_design}
                  onChange={(e) => handleChange("interior_design", e.target.value)}
                  options={INTERIORS}
                />
              </SettingsField>

              <SettingsField label="Innenfarbe" error={errors.interior_color}>
                <Input
                  value={form.interior_color}
                  onChange={(e) => handleChange("interior_color", e.target.value)}
                  placeholder="Schwarz / Kontrastnaht GT-Silber"
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
          </div>
        )}

        {/* Tab 3: Dynamic Equipment & Custom Fields */}
        {activeTab === "equipment" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
            {/* Equipment Array Editor */}
            <div>
              <h4 style={{ margin: "0 0 var(--space-xs)", fontSize: "var(--font-size-sm)", color: "var(--color-admin-text, #fff)" }}>
                Ausstattungsliste (Equipment)
              </h4>
              <p style={{ margin: "0 0 var(--space-sm)", fontSize: "var(--font-size-xs)", color: "var(--color-admin-muted)" }}>
                Fügen Sie Sonderausstattungen, Assistenzsysteme und Pakete einzeln hinzu.
              </p>

              <div style={{ display: "flex", gap: "var(--space-xs)", marginBottom: "var(--space-sm)" }}>
                <Input
                  value={newEquipmentItem}
                  onChange={(e) => setNewEquipmentItem(e.target.value)}
                  placeholder="z. B. Keramikbremse (PCCB), Liftsystem Vorderachse, Sportsitze Plus"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddEquipment();
                    }
                  }}
                  style={{ flex: 1 }}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddEquipment}>
                  <Icon name="plus" size={14} style={{ marginRight: "4px" }} />
                  Hinzufügen
                </Button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxHeight: "180px", overflowY: "auto", padding: "4px" }}>
                {form.equipment.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 10px",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "var(--radius-sm, 4px)",
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-admin-text, #ffffff)",
                    }}
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEquipment(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        color: "var(--color-admin-muted)",
                        fontSize: "14px",
                        lineHeight: 1,
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Fields Editor */}
            <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "var(--space-md)" }}>
              <h4 style={{ margin: "0 0 var(--space-xs)", fontSize: "var(--font-size-sm)", color: "var(--color-admin-text, #fff)" }}>
                Benutzerdefinierte Felder (Custom Fields)
              </h4>
              <p style={{ margin: "0 0 var(--space-sm)", fontSize: "var(--font-size-xs)", color: "var(--color-admin-muted)" }}>
                Beliebige Schlüssel-Wert-Paare für Spezialangaben (z. B. Fahrgestellnummer, Werksgarantie).
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "var(--space-xs)", marginBottom: "var(--space-sm)" }}>
                <Input
                  value={newCustomKey}
                  onChange={(e) => setNewCustomKey(e.target.value)}
                  placeholder="Schlüssel (z. B. VIN)"
                />
                <Input
                  value={newCustomVal}
                  onChange={(e) => setNewCustomVal(e.target.value)}
                  placeholder="Wert (z. B. WP0ZZZ99ZPS...)"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddCustomField}>
                  <Icon name="plus" size={14} style={{ marginRight: "4px" }} />
                  Feld anlegen
                </Button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {Object.entries(form.custom_fields).map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 12px",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      borderRadius: "4px",
                      fontSize: "var(--font-size-xs)",
                    }}
                  >
                    <div>
                      <strong style={{ color: "var(--color-primary, var(--color-text))" }}>{k}:</strong>{" "}
                      <span style={{ color: "var(--color-admin-text, #fff)" }}>{String(v)}</span>
                    </div>
                    <IconButton
                      icon="trash"
                      size="sm"
                      ariaLabel="Entfernen"
                      onClick={() => handleRemoveCustomField(k)}
                      style={{ color: "var(--color-error, #ef4444)" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Media Management */}
        {activeTab === "media" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            {/* Storage Architecture & Guidelines Banner */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--space-sm)",
                padding: "var(--space-sm) var(--space-md)",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "var(--radius-sm, 6px)",
                fontSize: "var(--font-size-xs)",
                color: "var(--color-admin-text, #ffffff)",
                lineHeight: 1.5,
              }}
            >
              <Icon name="info" size={16} style={{ color: "var(--color-primary, var(--color-text))", marginTop: "2px", flexShrink: 0 }} />
              <div>
                <strong style={{ color: "var(--color-primary, var(--color-text))" }}>Fahrzeugmedien-Architektur:</strong>{" "}
                Fahrzeugmedien werden über permanente URLs (z.&nbsp;B. im Supabase Storage Bucket <code>german-auto-media</code> oder CDN) im Datensatz gespeichert. Lokale Dateiauswahl dient ausschließlich der temporären Browser-Vorschau und Validierung. Für die dauerhafte Speicherung in der Datenbank ist eine permanente HTTPS-URL erforderlich.
              </div>
            </div>

            {/* Validation Error Alert */}
            {mediaValidationError && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  backgroundColor: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "var(--radius-sm, 6px)",
                  fontSize: "var(--font-size-xs)",
                  color: "#ef4444",
                }}
              >
                <span>{mediaValidationError}</span>
                <button
                  type="button"
                  onClick={() => setMediaValidationError(null)}
                  style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "14px" }}
                >
                  &times;
                </button>
              </div>
            )}

            {/* 1. Thumbnail */}
            <div>
              <SettingsField label="Haupt-Vorschaubild (Thumbnail URL)" helper="Wird in Listenansichten und als Startbild auf der Detailseite genutzt. Permanente URL erforderlich.">
                <div style={{ display: "flex", gap: "var(--space-xs)" }}>
                  <Input
                    value={form.media.thumbnail || ""}
                    onChange={(e) => handleThumbnailUrlChange(e.target.value)}
                    placeholder="https://..."
                    style={{ flex: 1 }}
                  />
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "0 12px",
                      borderRadius: "var(--radius-sm, 6px)",
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      cursor: "pointer",
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-admin-text, #fff)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Icon name="upload" size={14} style={{ marginRight: "6px" }} />
                    Lokale Datei (Vorschau)
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      style={{ display: "none" }}
                      onChange={handleThumbnailFileSelect}
                    />
                  </label>
                  {form.media.thumbnail && (
                    <Button type="button" variant="outline" size="sm" onClick={handleClearThumbnail} style={{ color: "var(--color-error, #ef4444)" }}>
                      Entfernen
                    </Button>
                  )}
                </div>
              </SettingsField>

              {form.media.thumbnail && (
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginTop: "6px" }}>
                  <div style={{ width: "120px", height: "80px", borderRadius: "6px", overflow: "hidden", backgroundColor: "#000", border: "1px solid rgba(255, 255, 255, 0.15)" }}>
                    <img src={form.media.thumbnail} alt={t("thumbnailPreview")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ fontSize: "11px" }}>
                    {form.media.thumbnail.startsWith("blob:") ? (
                      <span style={{ color: "#eab308", fontWeight: 600 }}>{t("localPreviewWarning")}</span>
                    ) : (
                      <span style={{ color: "#22c55e", fontWeight: 500 }}>{t("permanentUrlSaved")}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Gallery Images */}
            <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "var(--space-md)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-xs)" }}>
                <h4 style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-admin-text, #fff)" }}>
                  Fotogalerie ({form.media.gallery.length} / 20)
                </h4>
                <span style={{ fontSize: "11px", color: "var(--color-admin-muted)" }}>
                  Maximal 20 Bilder • Reihenfolge per Pfeiltasten anpassen
                </span>
              </div>

              <div style={{ display: "flex", gap: "var(--space-xs)", marginBottom: "var(--space-sm)" }}>
                <Input
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  placeholder="Bild-URL einfügen (https://...)"
                  style={{ flex: 1 }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddGalleryUrl();
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddGalleryUrl}>
                  <Icon name="plus" size={14} style={{ marginRight: "4px" }} />
                  URL hinzufügen
                </Button>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0 12px",
                    borderRadius: "var(--radius-sm, 6px)",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    cursor: "pointer",
                    fontSize: "var(--font-size-xs)",
                    color: "var(--color-admin-text, #fff)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Icon name="upload" size={14} style={{ marginRight: "6px" }} />
                  Lokale Bilder (Vorschau)
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    style={{ display: "none" }}
                    onChange={handleGalleryFileSelect}
                  />
                </label>
              </div>

              {/* Gallery Grid with Reorder / Delete */}
              {form.media.gallery.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                    gap: "var(--space-sm)",
                    maxHeight: "280px",
                    overflowY: "auto",
                    padding: "4px",
                  }}
                >
                  {form.media.gallery.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: "relative",
                        borderRadius: "6px",
                        overflow: "hidden",
                        border: imgUrl.startsWith("blob:")
                          ? "1px solid #eab308"
                          : "1px solid rgba(255, 255, 255, 0.12)",
                        backgroundColor: "#000",
                      }}
                    >
                      <div style={{ height: "90px" }}>
                        <img src={imgUrl} alt={`Galerie ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "2px 6px",
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          fontSize: "11px",
                        }}
                      >
                        <div style={{ display: "flex", gap: "2px" }}>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveGalleryImage(idx, -1)}
                            style={{ background: "none", border: "none", color: "#fff", cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.3 : 1 }}
                            title="Nach links verschieben"
                          >
                            &larr;
                          </button>
                          <button
                            type="button"
                            disabled={idx === form.media.gallery.length - 1}
                            onClick={() => handleMoveGalleryImage(idx, 1)}
                            style={{ background: "none", border: "none", color: "#fff", cursor: idx === form.media.gallery.length - 1 ? "default" : "pointer", opacity: idx === form.media.gallery.length - 1 ? 0.3 : 1 }}
                            title="Nach rechts verschieben"
                          >
                            &rarr;
                          </button>
                        </div>

                        <span style={{ color: imgUrl.startsWith("blob:") ? "#eab308" : "var(--color-admin-muted)", fontSize: "10px" }}>
                          {imgUrl.startsWith("blob:") ? "⚠️ Vorschau" : `#${idx + 1}`}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          style={{ background: "none", border: "none", color: "var(--color-error, #ef4444)", cursor: "pointer", padding: "2px" }}
                          title="Bild entfernen"
                        >
                          <Icon name="trash" size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "var(--space-md)", textAlign: "center", border: "1px dashed rgba(255, 255, 255, 0.1)", borderRadius: "6px", color: "var(--color-admin-muted)", fontSize: "var(--font-size-xs)" }}>
                  Noch keine Galeriebilder hinzugefügt. Geben Sie eine URL ein oder wählen Sie Bilddateien aus.
                </div>
              )}
            </div>

            {/* 3. 360° Images */}
            <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "var(--space-md)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-xs)" }}>
                <h4 style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-admin-text, #fff)" }}>
                  360°-Ansichten ({form.media.images_360?.length || 0})
                </h4>
                <span style={{ fontSize: "11px", color: "var(--color-admin-muted)" }}>
                  Panorama- oder Dreh-Bilder für interaktive 360°-Fahrzeugansicht
                </span>
              </div>

              <div style={{ display: "flex", gap: "var(--space-xs)", marginBottom: "var(--space-sm)" }}>
                <Input
                  value={new360Url}
                  onChange={(e) => setNew360Url(e.target.value)}
                  placeholder="360°-Bild-URL einfügen (https://...)"
                  style={{ flex: 1 }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAdd360Url();
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAdd360Url}>
                  <Icon name="plus" size={14} style={{ marginRight: "4px" }} />
                  URL hinzufügen
                </Button>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0 12px",
                    borderRadius: "var(--radius-sm, 6px)",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    cursor: "pointer",
                    fontSize: "var(--font-size-xs)",
                    color: "var(--color-admin-text, #fff)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Icon name="upload" size={14} style={{ marginRight: "6px" }} />
                  Datei wählen
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    style={{ display: "none" }}
                    onChange={handle360FileSelect}
                  />
                </label>
              </div>

              {form.media.images_360 && form.media.images_360.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                    gap: "var(--space-xs)",
                    maxHeight: "180px",
                    overflowY: "auto",
                    padding: "4px",
                  }}
                >
                  {form.media.images_360.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: "relative",
                        borderRadius: "4px",
                        overflow: "hidden",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        backgroundColor: "#000",
                      }}
                    >
                      <div style={{ height: "70px" }}>
                        <img src={imgUrl} alt={`360° ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 4px", backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
                        <span style={{ fontSize: "10px", color: "var(--color-admin-muted)" }}>360° #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemove360Image(idx)}
                          style={{ background: "none", border: "none", color: "var(--color-error, #ef4444)", cursor: "pointer", padding: 0 }}
                          title="Entfernen"
                        >
                          <Icon name="trash" size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Video & 3D Model Fields */}
            <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "var(--space-md)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
              <SettingsField label="Fahrzeugvideo (URL)" helper="MP4 / WebM oder Stream-URL">
                <Input
                  value={form.media.video || ""}
                  onChange={(e) => handleMediaChange("video", e.target.value)}
                  placeholder="https://..."
                />
              </SettingsField>

              <SettingsField label="3D-Modell (URL)" helper="GLB / GLTF Modellreferenz">
                <Input
                  value={form.media.model_3d || ""}
                  onChange={(e) => handleMediaChange("model_3d", e.target.value)}
                  placeholder="https://..."
                />
              </SettingsField>
            </div>
          </div>
        )}

        {/* Bottom Save & Cancel Bar */}
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
          <Button variant="outline" size="sm" type="button" disabled={saving} onClick={onClose}>
            <Icon name="close" size={14} style={{ marginRight: "6px" }} />
            {t("cancel", { defaultValue: "Abbrechen" })}
          </Button>

          <Button variant="primary" size="sm" type="submit" loading={saving}>
            <Icon name="save" size={14} style={{ marginRight: "6px" }} />
            {car ? "Änderungen speichern" : "Fahrzeug erstellen"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CarEditorModal;
