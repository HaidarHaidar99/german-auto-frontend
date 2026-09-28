import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import settingsService from "../../../../services/settings/settings.service";
import SettingsSection from "../SettingsSection";
import SortableList from "../SortableList";
import SettingsField from "../SettingsField";
import SettingsToggle from "../SettingsToggle";
import MediaUploadField from "../MediaUploadField";
import Input from "../../../forms/Input";
import Select from "../../../forms/Select";
import Button from "../../../ui/Button";
import Modal from "../../../ui/Modal";

export function HeroSettingsEditor({
  data = {},
  onChange,
  onReset,
  resetLoading,
  errors = {},
}) {
  const { t } = useTranslation(["admin", "common"]);
  const isHeroEnabled = data.enabled !== false;
  const items = Array.isArray(data.items) ? data.items : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [draftSlide, setDraftSlide] = useState({});

  const handleUploadHeroMedia = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await settingsService.adminUploadHeroMedia(formData);
    const uploadedUrl = res?.data?.url;
    const mediaType = res?.data?.type || (file.type.startsWith("video/") ? "VIDEO" : "IMAGE");
    if (uploadedUrl) {
      setDraftSlide((prev) => ({
        ...prev,
        media_url: uploadedUrl,
        type: mediaType,
      }));
    }
    return res;
  };

  const handleOpenAdd = () => {
    setDraftSlide({
      title_de: "",
      title_en: "",
      subtitle_de: "",
      subtitle_en: "",
      cta_text_de: "",
      cta_text_en: "",
      button_link: "/cars",
      type: "IMAGE",
      media_url: "",
      poster_url: "",
      enabled: true,
      order: items.length + 1,
    });
    setEditingIndex(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (index) => {
    setDraftSlide({ ...items[index] });
    setEditingIndex(index);
    setModalOpen(true);
  };

  const handleSaveModal = () => {
    const nextItems = [...items];
    if (editingIndex !== null) {
      nextItems[editingIndex] = draftSlide;
    } else {
      nextItems.push(draftSlide);
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
      title={t("settingsSections.hero", { defaultValue: "Hero-Bühne & Medien" })}
      subtitle={t("heroSubtitle", {
        defaultValue: "Verwalten Sie bis zu 3 Video- oder Bild-Slides der filmreifen Hauptbühne.",
      })}
      sectionKey="hero"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/"
    >
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <SettingsToggle
          label={t("enableHero", { defaultValue: "Hero-Karussell auf der Startseite aktivieren" })}
          description={t("enableHeroDesc", {
            defaultValue: "Bei Deaktivierung wird das Karussell vollständig von der Startseite ausgeblendet.",
          })}
          checked={isHeroEnabled}
          onChange={(checked) => onChange?.({ ...data, enabled: checked })}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-md)" }}>
        <h3
          style={{
            margin: 0,
            fontSize: "var(--font-size-md)",
            fontWeight: 600,
            color: "var(--color-admin-text, #ffffff)",
          }}
        >
          {t("heroSlides", { defaultValue: "Bühnen-Elemente (Max. 3)" })}
        </h3>
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-admin-muted)" }}>
          {items.length} / 3 konfiguriert
        </span>
      </div>

      {errors["hero.items"] && (
        <p role="alert" style={{ color: "var(--color-error, #ef4444)", fontSize: "var(--font-size-xs)", marginBottom: "var(--space-sm)" }}>
          {errors["hero.items"]}
        </p>
      )}

      <SortableList
        items={items}
        maxItems={3}
        onReorder={(newItems) => onChange?.({ ...data, items: newItems })}
        onAdd={handleOpenAdd}
        onRemove={handleRemove}
        addLabel={t("addHeroSlide", { defaultValue: "Neues Hero-Element hinzufügen" })}
        emptyMessage={t("noHeroSlidesConfigured", { defaultValue: "Keine Hero-Slides hinterlegt. Die Startseite nutzt die elegante Typografie-Bühne." })}
        renderItem={(item, index) => (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-md)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
              {item.media_url ? (
                <div
                  style={{
                    width: "60px",
                    height: "40px",
                    borderRadius: "4px",
                    backgroundColor: "#000",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {item.type === "VIDEO" ? (
                    <video src={item.media_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <img src={item.media_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </div>
              ) : null}

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
                  <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--color-admin-text, #ffffff)" }}>
                    {item.title_de || item.title_en || `Slide #${index + 1}`}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      textTransform: "uppercase",
                      padding: "1px 6px",
                      borderRadius: "3px",
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      color: "var(--color-primary, #C5A059)",
                    }}
                  >
                    {item.type || "IMAGE"}
                  </span>
                </div>
                <p style={{ margin: "2px 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-admin-muted)" }}>
                  {item.subtitle_de || item.subtitle_en || "Keine Unterzeile"}
                </p>
              </div>
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

      {/* Hero Slide Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingIndex !== null ? "Hero-Slide bearbeiten" : "Neuen Hero-Slide anlegen"}
        size="md"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
            <SettingsField label="Haupttitel (DE)" locale="de" required>
              <Input
                value={draftSlide.title_de || ""}
                onChange={(e) => setDraftSlide({ ...draftSlide, title_de: e.target.value })}
                placeholder="Exklusive deutsche Automobile"
              />
            </SettingsField>

            <SettingsField label="Haupttitel (EN)" locale="en">
              <Input
                value={draftSlide.title_en || ""}
                onChange={(e) => setDraftSlide({ ...draftSlide, title_en: e.target.value })}
                placeholder="Exclusive German Automobiles"
              />
            </SettingsField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
            <SettingsField label="Untertitel (DE)" locale="de">
              <Input
                value={draftSlide.subtitle_de || ""}
                onChange={(e) => setDraftSlide({ ...draftSlide, subtitle_de: e.target.value })}
                placeholder="Handverlesenes Portfolio für Kenner"
              />
            </SettingsField>

            <SettingsField label="Untertitel (EN)" locale="en">
              <Input
                value={draftSlide.subtitle_en || ""}
                onChange={(e) => setDraftSlide({ ...draftSlide, subtitle_en: e.target.value })}
                placeholder="Curated high-performance inventory"
              />
            </SettingsField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
            <SettingsField label="Button-Text (DE)" locale="de">
              <Input
                value={draftSlide.cta_text_de || ""}
                onChange={(e) => setDraftSlide({ ...draftSlide, cta_text_de: e.target.value })}
                placeholder="Fahrzeuge entdecken"
              />
            </SettingsField>

            <SettingsField label="Button-Text (EN)" locale="en">
              <Input
                value={draftSlide.cta_text_en || ""}
                onChange={(e) => setDraftSlide({ ...draftSlide, cta_text_en: e.target.value })}
                placeholder="Explore Inventory"
              />
            </SettingsField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
            <SettingsField label="Button-Link">
              <Input
                value={draftSlide.button_link || ""}
                onChange={(e) => setDraftSlide({ ...draftSlide, button_link: e.target.value })}
                placeholder="/cars"
              />
            </SettingsField>

            <SettingsField label="Medientyp">
              <Select
                value={draftSlide.type || "IMAGE"}
                onChange={(e) => setDraftSlide({ ...draftSlide, type: e.target.value })}
                options={[
                  { value: "IMAGE", label: "Bild (Image)" },
                  { value: "VIDEO", label: "Video (MP4 / WebM)" },
                ]}
              />
            </SettingsField>
          </div>

          {/* Media Upload using existing endpoint */}
          <MediaUploadField
            label="Hero-Medium hochladen"
            value={draftSlide.media_url || ""}
            accept={draftSlide.type === "VIDEO" ? "video/mp4, video/webm" : "image/jpeg, image/png, image/webp"}
            mediaType={draftSlide.type}
            maxSizeMB={draftSlide.type === "VIDEO" ? 50 : 10}
            onChange={(url) => setDraftSlide({ ...draftSlide, media_url: url || "" })}
            onUpload={handleUploadHeroMedia}
            helper="Video: max. 50 MB (MP4, WebM) • Bild: max. 10 MB (JPEG, PNG, WEBP)"
          />

          <SettingsToggle
            label="Slide aktiv"
            checked={draftSlide.enabled !== false}
            onChange={(checked) => setDraftSlide({ ...draftSlide, enabled: checked })}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-sm)", marginTop: "var(--space-md)" }}>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveModal}>
              Slide übernehmen
            </Button>
          </div>
        </div>
      </Modal>
    </SettingsSection>
  );
}

export default HeroSettingsEditor;
