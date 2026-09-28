import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SettingsSection from "../SettingsSection";
import SortableList from "../SortableList";
import SettingsField from "../SettingsField";
import SettingsToggle from "../SettingsToggle";
import Input from "../../../forms/Input";
import Button from "../../../ui/Button";
import Modal from "../../../ui/Modal";

export function OffersSettingsEditor({
  data = {},
  onChange,
  onReset,
  resetLoading,
  _errors = {},
}) {
  const { t } = useTranslation(["admin", "common"]);
  const isEnabled = data.enabled !== false;
  const items = Array.isArray(data.items) ? data.items : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [draftOffer, setDraftOffer] = useState({});

  const handleOpenAdd = () => {
    setDraftOffer({
      text_de: "",
      text_en: "",
      link: "/cars",
      duration: 5,
      enabled: true,
      order: items.length + 1,
      start_at: null,
      end_at: null,
    });
    setEditingIndex(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (index) => {
    setDraftOffer({ ...items[index] });
    setEditingIndex(index);
    setModalOpen(true);
  };

  const handleSaveModal = () => {
    const nextItems = [...items];
    const cleaned = {
      ...draftOffer,
      duration: draftOffer.duration ? Number(draftOffer.duration) : 5,
      start_at: draftOffer.start_at || null,
      end_at: draftOffer.end_at || null,
    };
    if (editingIndex !== null) {
      nextItems[editingIndex] = cleaned;
    } else {
      nextItems.push(cleaned);
    }
    onChange?.({
      ...data,
      items: nextItems,
    });
    setModalOpen(false);
  };

  const handleRemove = (index) => {
    const nextItems = items.filter((_, idx) => idx !== index);
    onChange?.({
      ...data,
      items: nextItems,
    });
  };

  return (
    <SettingsSection
      title={t("settingsSections.offers", { defaultValue: "Angebote & Aktionen" })}
      subtitle={t("offersSubtitle", {
        defaultValue: "Verwalten Sie die Top-Ankündigungsleiste und wechselnde Aktionsbanner.",
      })}
      sectionKey="offers"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/"
    >
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <SettingsToggle
          label="Angebotsleiste aktivieren"
          description="Zeigt das rotierende Aktionsbanner oberhalb der Navigation an."
          checked={isEnabled}
          onChange={(checked) => onChange?.({ ...data, enabled: checked })}
        />
      </div>

      <SortableList
        items={items}
        onReorder={(newItems) => onChange?.({ ...data, items: newItems })}
        onAdd={handleOpenAdd}
        onRemove={handleRemove}
        addLabel={t("addOffer", { defaultValue: "Neues Aktionsangebot hinzufügen" })}
        emptyMessage={t("noOffersConfigured", { defaultValue: "Keine Aktionen hinterlegt." })}
        renderItem={(item, index) => (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-md)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--color-admin-text, #ffffff)" }}>
                  {item.text_de || item.text_en || `Angebot #${index + 1}`}
                </span>
                <span style={{ fontSize: "11px", color: "var(--color-admin-muted)" }}>
                  ({item.duration || 5}s Anzeigedauer)
                </span>
                {!item.enabled && (
                  <span style={{ fontSize: "10px", color: "var(--color-error)", backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "1px 6px", borderRadius: "3px" }}>
                    Inaktiv
                  </span>
                )}
              </div>
              {item.link && (
                <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-primary, #C5A059)", fontFamily: "monospace" }}>
                  Link: {item.link}
                </span>
              )}
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

      {/* Offer Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingIndex !== null ? "Angebot bearbeiten" : "Neues Angebot anlegen"}
        size="md"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
          <SettingsField label="Aktionstext (DE)" locale="de" required>
            <Input
              value={draftOffer.text_de || ""}
              onChange={(e) => setDraftOffer({ ...draftOffer, text_de: e.target.value })}
              placeholder="z. B. Frühjahrs-Inspektion inklusive für alle Neuzugänge"
            />
          </SettingsField>

          <SettingsField label="Aktionstext (EN)" locale="en">
            <Input
              value={draftOffer.text_en || ""}
              onChange={(e) => setDraftOffer({ ...draftOffer, text_en: e.target.value })}
              placeholder="e.g. Complimentary spring inspection on all newly arrived vehicles"
            />
          </SettingsField>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-sm)" }}>
            <SettingsField label="Ziel-Verlinkung">
              <Input
                value={draftOffer.link || ""}
                onChange={(e) => setDraftOffer({ ...draftOffer, link: e.target.value })}
                placeholder="/cars"
              />
            </SettingsField>

            <SettingsField label="Dauer (Sekunden)">
              <Input
                type="number"
                min="1"
                value={draftOffer.duration || 5}
                onChange={(e) => setDraftOffer({ ...draftOffer, duration: e.target.value })}
              />
            </SettingsField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
            <SettingsField label="Gültig ab (ISO / Datum)" helper="Optional">
              <Input
                type="date"
                value={draftOffer.start_at ? draftOffer.start_at.substring(0, 10) : ""}
                onChange={(e) => setDraftOffer({ ...draftOffer, start_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
              />
            </SettingsField>

            <SettingsField label="Gültig bis (ISO / Datum)" helper="Optional">
              <Input
                type="date"
                value={draftOffer.end_at ? draftOffer.end_at.substring(0, 10) : ""}
                onChange={(e) => setDraftOffer({ ...draftOffer, end_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
              />
            </SettingsField>
          </div>

          <SettingsToggle
            label="Angebot aktiv"
            checked={draftOffer.enabled !== false}
            onChange={(checked) => setDraftOffer({ ...draftOffer, enabled: checked })}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-sm)", marginTop: "var(--space-md)" }}>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveModal}>
              Angebot übernehmen
            </Button>
          </div>
        </div>
      </Modal>
    </SettingsSection>
  );
}

export default OffersSettingsEditor;
