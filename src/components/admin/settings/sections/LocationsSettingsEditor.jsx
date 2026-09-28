import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SettingsSection from "../SettingsSection";
import SortableList from "../SortableList";
import SettingsField from "../SettingsField";
import SettingsToggle from "../SettingsToggle";
import Input from "../../../forms/Input";
import Button from "../../../ui/Button";
import Badge from "../../../ui/Badge";
import Modal from "../../../ui/Modal";

export function LocationsSettingsEditor({
  data = [],
  onChange,
  onReset,
  resetLoading,
  _errors = {},
}) {
  const { t } = useTranslation(["admin", "common"]);
  const locations = Array.isArray(data) ? data : [];

  const [editingIndex, setEditingIndex] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [draftLocation, setDraftLocation] = useState({});

  const handleOpenAdd = () => {
    setDraftLocation({
      name: "",
      address: "",
      postal_code: "",
      city: "",
      phone: "",
      email: "",
      latitude: "",
      longitude: "",
      map_url: "",
      is_primary: locations.length === 0,
    });
    setEditingIndex(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (index) => {
    setDraftLocation({ ...locations[index] });
    setEditingIndex(index);
    setModalOpen(true);
  };

  const handleSaveModal = () => {
    let nextLocations = [...locations];
    const cleanedLocation = {
      ...draftLocation,
      latitude: draftLocation.latitude !== "" && draftLocation.latitude !== null && draftLocation.latitude !== undefined
        ? Number(draftLocation.latitude)
        : null,
      longitude: draftLocation.longitude !== "" && draftLocation.longitude !== null && draftLocation.longitude !== undefined
        ? Number(draftLocation.longitude)
        : null,
    };

    // If marked as primary, unmark others
    if (cleanedLocation.is_primary) {
      nextLocations = nextLocations.map((loc) => ({ ...loc, is_primary: false }));
    }

    if (editingIndex !== null) {
      nextLocations[editingIndex] = cleanedLocation;
    } else {
      nextLocations.push(cleanedLocation);
    }

    onChange?.(nextLocations);
    setModalOpen(false);
  };

  const handleRemove = (index) => {
    const next = locations.filter((_, idx) => idx !== index);
    onChange?.(next);
  };

  return (
    <SettingsSection
      title={t("settingsSections.locations", { defaultValue: "Standorte & Showrooms" })}
      subtitle={t("locationsSubtitle", {
        defaultValue: "Verwalten Sie Ihre Standorte, Adressen, Koordinaten und Routenplaner-Verknüpfungen.",
      })}
      sectionKey="locations"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/about"
    >
      <SortableList
        items={locations}
        onReorder={(newItems) => onChange?.(newItems)}
        onAdd={handleOpenAdd}
        onRemove={handleRemove}
        addLabel={t("addLocation", { defaultValue: "Neuen Standort anlegen" })}
        emptyMessage={t("noLocationsConfigured", { defaultValue: "Bisher wurden keine Standorte hinterlegt." })}
        renderItem={(item, index) => (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-md)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                <h4 style={{ margin: 0, fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-admin-text, #ffffff)" }}>
                  {item.name || `Standort #${index + 1}`}
                </h4>
                {item.is_primary && (
                  <Badge variant="secondary" size="sm">
                    Hauptstandort
                  </Badge>
                )}
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-admin-muted, var(--color-text-muted))" }}>
                {[item.address, item.postal_code, item.city].filter(Boolean).join(", ") || "Keine Adresse angegeben"}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenEdit(index)}
              style={{ fontSize: "var(--font-size-xs)", padding: "4px 12px" }}
            >
              {t("edit", { defaultValue: "Bearbeiten" })}
            </Button>
          </div>
        )}
      />

      {/* Location Edit/Add Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingIndex !== null ? "Standort bearbeiten" : "Neuen Standort anlegen"}
        size="md"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
          <SettingsField label="Standort-Name" required>
            <Input
              value={draftLocation.name || ""}
              onChange={(e) => setDraftLocation({ ...draftLocation, name: e.target.value })}
              placeholder="z. B. Showroom München"
            />
          </SettingsField>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-sm)" }}>
            <SettingsField label="Straße & Hausnummer">
              <Input
                value={draftLocation.address || ""}
                onChange={(e) => setDraftLocation({ ...draftLocation, address: e.target.value })}
                placeholder="Maximilianstraße 1"
              />
            </SettingsField>
            <SettingsField label="PLZ">
              <Input
                value={draftLocation.postal_code || ""}
                onChange={(e) => setDraftLocation({ ...draftLocation, postal_code: e.target.value })}
                placeholder="80539"
              />
            </SettingsField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
            <SettingsField label="Stadt">
              <Input
                value={draftLocation.city || ""}
                onChange={(e) => setDraftLocation({ ...draftLocation, city: e.target.value })}
                placeholder="München"
              />
            </SettingsField>
            <SettingsField label="Telefon">
              <Input
                value={draftLocation.phone || ""}
                onChange={(e) => setDraftLocation({ ...draftLocation, phone: e.target.value })}
                placeholder="+49 89 ..."
              />
            </SettingsField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
            <SettingsField label="E-Mail">
              <Input
                type="email"
                value={draftLocation.email || ""}
                onChange={(e) => setDraftLocation({ ...draftLocation, email: e.target.value })}
                placeholder="muenchen@example.de"
              />
            </SettingsField>
            <SettingsField label="Google Maps Link">
              <Input
                value={draftLocation.map_url || ""}
                onChange={(e) => setDraftLocation({ ...draftLocation, map_url: e.target.value })}
                placeholder="https://maps.google.com/..."
              />
            </SettingsField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
            <SettingsField label="Breitengrad (Latitude)" helper="-90 bis 90">
              <Input
                type="number"
                step="any"
                value={draftLocation.latitude ?? ""}
                onChange={(e) => setDraftLocation({ ...draftLocation, latitude: e.target.value })}
                placeholder="48.137154"
              />
            </SettingsField>
            <SettingsField label="Längengrad (Longitude)" helper="-180 bis 180">
              <Input
                type="number"
                step="any"
                value={draftLocation.longitude ?? ""}
                onChange={(e) => setDraftLocation({ ...draftLocation, longitude: e.target.value })}
                placeholder="11.576124"
              />
            </SettingsField>
          </div>

          <SettingsToggle
            label="Als Hauptstandort markieren"
            description="Wird bevorzugt im Header, Footer und auf der Kontaktseite hervorgehoben."
            checked={Boolean(draftLocation.is_primary)}
            onChange={(checked) => setDraftLocation({ ...draftLocation, is_primary: checked })}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-sm)", marginTop: "var(--space-md)" }}>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveModal}>
              Standort übernehmen
            </Button>
          </div>
        </div>
      </Modal>
    </SettingsSection>
  );
}

export default LocationsSettingsEditor;
