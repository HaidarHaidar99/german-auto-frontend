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

  const getFieldError = (field) => {
    if (editingIndex === null) return null;
    return errors[`hero.items[${editingIndex}].${field}`] || null;
  };

  const hasSlideErrors = (index) => {
    return Object.keys(errors).some((key) => key.startsWith(`hero.items[${index}]`));
  };

  const handleUploadHeroMedia = async (file, mode = "dark") => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await settingsService.adminUploadHeroMedia(formData);
    const uploadedUrl = res?.data?.url;
    const mediaType = res?.data?.type || (file.type.startsWith("video/") ? "VIDEO" : "IMAGE");
    if (uploadedUrl) {
      if (mode === "light") {
        setDraftSlide((prev) => ({
          ...prev,
          media_light_url: uploadedUrl,
          type_light: mediaType,
        }));
      } else {
        setDraftSlide((prev) => ({
          ...prev,
          media_url: uploadedUrl,
          type: mediaType,
        }));
      }
    }
    return res;
  };

  const handleOpenAdd = () => {
    setDraftSlide({
      title_de: "",
      title_en: "",
      subtitle_de: "",
      subtitle_en: "",
      cta_text_de: "Fahrzeuge entdecken",
      cta_text_en: "Explore Inventory",
      button_link: "/cars",
      button_link_de: "/cars",
      button_link_en: "/cars",
      secondary_cta_text_de: "Fahrzeugbestand",
      secondary_cta_text_en: "Inventory",
      secondary_button_link: "/cars",
      secondary_button_link_de: "/cars",
      secondary_button_link_en: "/cars",
      type: "IMAGE",
      media_url: "",
      type_light: "IMAGE",
      media_light_url: "",
      poster_url: "",
      poster_light_url: "",
      enabled: true,
      order: items.length + 1,
    });
    setEditingIndex(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (index) => {
    const item = items[index] || {};
    const inferredType = (item.type || (item.media_url?.match(/\.(mp4|webm)$/i) ? "VIDEO" : "IMAGE")).toUpperCase();
    const inferredLightType = (item.type_light || (item.media_light_url?.match(/\.(mp4|webm)$/i) ? "VIDEO" : inferredType)).toUpperCase();
    setDraftSlide({
      ...item,
      type: inferredType,
      type_light: inferredLightType,
      cta_text_de: item.cta_text_de ?? "",
      cta_text_en: item.cta_text_en ?? "",
      button_link: item.button_link || item.cta_link || "/cars",
      button_link_de: item.button_link_de || item.button_link || item.cta_link || "/cars",
      button_link_en: item.button_link_en || item.button_link || item.cta_link || "/cars",
      secondary_cta_text_de: item.secondary_cta_text_de ?? "Fahrzeugbestand",
      secondary_cta_text_en: item.secondary_cta_text_en ?? "Inventory",
      secondary_button_link: item.secondary_button_link ?? "/cars",
      secondary_button_link_de: item.secondary_button_link_de ?? (item.secondary_button_link || "/cars"),
      secondary_button_link_en: item.secondary_button_link_en ?? (item.secondary_button_link || "/cars"),
    });
    setEditingIndex(index);
    setModalOpen(true);
  };

  const handleSaveModal = () => {
    const normalizeInput = (val) => {
      if (typeof val !== "string") return val;
      const trimmed = val.trim();
      if (
        trimmed.length > 0 &&
        !trimmed.startsWith("/") &&
        !trimmed.startsWith("#") &&
        !trimmed.startsWith("http://") &&
        !trimmed.startsWith("https://") &&
        !trimmed.startsWith("tel:") &&
        !trimmed.startsWith("mailto:")
      ) {
        return `/${trimmed}`;
      }
      return trimmed;
    };

    const cleanedSlide = {
      ...draftSlide,
      type: (draftSlide.type || "IMAGE").toUpperCase(),
      type_light: (draftSlide.type_light || draftSlide.type || "IMAGE").toUpperCase(),
      button_link: normalizeInput(draftSlide.button_link),
      button_link_de: normalizeInput(draftSlide.button_link_de || draftSlide.button_link),
      button_link_en: normalizeInput(draftSlide.button_link_en || draftSlide.button_link),
      secondary_button_link: normalizeInput(draftSlide.secondary_button_link),
      secondary_button_link_de: normalizeInput(draftSlide.secondary_button_link_de || draftSlide.secondary_button_link),
      secondary_button_link_en: normalizeInput(draftSlide.secondary_button_link_en || draftSlide.secondary_button_link),
    };

    const nextItems = [...items];
    if (editingIndex !== null) {
      nextItems[editingIndex] = cleanedSlide;
    } else {
      nextItems.push(cleanedSlide);
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

      {Object.keys(errors).some((k) => k.startsWith("hero.items[")) && (
        <div
          role="alert"
          style={{
            padding: "var(--space-sm) var(--space-md)",
            backgroundColor: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            borderRadius: "var(--radius-sm)",
            marginBottom: "var(--space-md)",
          }}
        >
          <p style={{ margin: 0, fontSize: "var(--font-size-xs)", fontWeight: 600, color: "#ef4444" }}>
            {t("heroValidationErrorsPresent", { defaultValue: "Einige Hero-Elemente enthalten Validierungsfehler. Bitte überprüfen Sie die markierten Slides:" })}
          </p>
          <ul style={{ margin: "6px 0 0", paddingLeft: "18px", fontSize: "var(--font-size-xs)", color: "#ef4444" }}>
            {Object.entries(errors)
              .filter(([k]) => k.startsWith("hero.items["))
              .map(([k, msg]) => (
                <li key={k}>
                  <strong>{k}</strong>: {msg}
                </li>
              ))}
          </ul>
        </div>
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
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", flexWrap: "wrap" }}>
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
                      color: "var(--color-primary, var(--color-text))",
                    }}
                  >
                    🌙 {item.type || "IMAGE"}
                  </span>
                  {item.media_light_url && (
                    <span
                      style={{
                        fontSize: "10px",
                        textTransform: "uppercase",
                        padding: "1px 6px",
                        borderRadius: "3px",
                        backgroundColor: "rgba(212, 175, 55, 0.15)",
                        color: "#D4AF37",
                        border: "1px solid rgba(212, 175, 55, 0.3)",
                      }}
                    >
                      ☀️ Light
                    </span>
                  )}
                  {hasSlideErrors(index) && (
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        padding: "1px 6px",
                        borderRadius: "3px",
                        backgroundColor: "rgba(239, 68, 68, 0.15)",
                        color: "#ef4444",
                        border: "1px solid rgba(239, 68, 68, 0.35)",
                      }}
                    >
                      ⚠️ Fehler
                    </span>
                  )}
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
            <SettingsField label="Haupttitel (DE)" locale="de" required error={getFieldError("title_de")}>
              <Input
                value={draftSlide.title_de || ""}
                onChange={(e) => setDraftSlide({ ...draftSlide, title_de: e.target.value })}
                placeholder="Exklusive deutsche Automobile"
                error={Boolean(getFieldError("title_de"))}
              />
            </SettingsField>

            <SettingsField label="Haupttitel (EN)" locale="en" error={getFieldError("title_en")}>
              <Input
                value={draftSlide.title_en || ""}
                onChange={(e) => setDraftSlide({ ...draftSlide, title_en: e.target.value })}
                placeholder="Exclusive German Automobiles"
                error={Boolean(getFieldError("title_en"))}
              />
            </SettingsField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
            <SettingsField label="Untertitel (DE)" locale="de" error={getFieldError("subtitle_de")}>
              <Input
                value={draftSlide.subtitle_de || ""}
                onChange={(e) => setDraftSlide({ ...draftSlide, subtitle_de: e.target.value })}
                placeholder="Handverlesenes Portfolio für Kenner"
                error={Boolean(getFieldError("subtitle_de"))}
              />
            </SettingsField>

            <SettingsField label="Untertitel (EN)" locale="en" error={getFieldError("subtitle_en")}>
              <Input
                value={draftSlide.subtitle_en || ""}
                onChange={(e) => setDraftSlide({ ...draftSlide, subtitle_en: e.target.value })}
                placeholder="Curated high-performance inventory"
                error={Boolean(getFieldError("subtitle_en"))}
              />
            </SettingsField>
          </div>

          {/* Action Button Controls (First Button & Second Button side-by-side on desktop, stacking on mobile) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "var(--space-md)",
              padding: "var(--space-xs) 0",
            }}
          >
            {/* First Button (Primary) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-xs)",
                padding: "var(--space-sm)",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-secondary, #D4AF37)", marginBottom: "2px" }}>
                {t("heroPrimaryButton", { defaultValue: "Erster Button (Primär)" })}
              </span>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-xs)" }}>
                <SettingsField label="Button-Text (DE)" locale="de" error={getFieldError("cta_text_de")}>
                  <Input
                    value={draftSlide.cta_text_de || ""}
                    onChange={(e) => setDraftSlide({ ...draftSlide, cta_text_de: e.target.value })}
                    placeholder="Fahrzeuge entdecken"
                    error={Boolean(getFieldError("cta_text_de"))}
                  />
                </SettingsField>

                <SettingsField label="Button-Text (EN)" locale="en" error={getFieldError("cta_text_en")}>
                  <Input
                    value={draftSlide.cta_text_en || ""}
                    onChange={(e) => setDraftSlide({ ...draftSlide, cta_text_en: e.target.value })}
                    placeholder="Explore Inventory"
                    error={Boolean(getFieldError("cta_text_en"))}
                  />
                </SettingsField>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-xs)" }}>
                <SettingsField label="Zielroute / Link (DE)" locale="de" error={getFieldError("button_link_de") || getFieldError("button_link")}>
                  <Input
                    value={draftSlide.button_link_de ?? draftSlide.button_link ?? ""}
                    onChange={(e) => setDraftSlide({ ...draftSlide, button_link_de: e.target.value, button_link: e.target.value })}
                    placeholder="/cars"
                    error={Boolean(getFieldError("button_link_de") || getFieldError("button_link"))}
                  />
                </SettingsField>

                <SettingsField label="Zielroute / Link (EN)" locale="en" error={getFieldError("button_link_en")}>
                  <Input
                    value={draftSlide.button_link_en ?? draftSlide.button_link ?? ""}
                    onChange={(e) => setDraftSlide({ ...draftSlide, button_link_en: e.target.value })}
                    placeholder="/cars"
                    error={Boolean(getFieldError("button_link_en"))}
                  />
                </SettingsField>
              </div>
            </div>

            {/* Second Button (Secondary) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-xs)",
                padding: "var(--space-sm)",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-secondary, #D4AF37)", marginBottom: "2px" }}>
                {t("heroSecondaryButton", { defaultValue: "Zweiter Button (Sekundär)" })}
              </span>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-xs)" }}>
                <SettingsField label="Button-Text (DE)" locale="de" error={getFieldError("secondary_cta_text_de")}>
                  <Input
                    value={draftSlide.secondary_cta_text_de || ""}
                    onChange={(e) => setDraftSlide({ ...draftSlide, secondary_cta_text_de: e.target.value })}
                    placeholder="Fahrzeugbestand"
                    error={Boolean(getFieldError("secondary_cta_text_de"))}
                  />
                </SettingsField>

                <SettingsField label="Button-Text (EN)" locale="en" error={getFieldError("secondary_cta_text_en")}>
                  <Input
                    value={draftSlide.secondary_cta_text_en || ""}
                    onChange={(e) => setDraftSlide({ ...draftSlide, secondary_cta_text_en: e.target.value })}
                    placeholder="Inventory"
                    error={Boolean(getFieldError("secondary_cta_text_en"))}
                  />
                </SettingsField>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-xs)" }}>
                <SettingsField label="Zielroute / Link (DE)" locale="de" error={getFieldError("secondary_button_link_de") || getFieldError("secondary_button_link")}>
                  <Input
                    value={draftSlide.secondary_button_link_de ?? draftSlide.secondary_button_link ?? ""}
                    onChange={(e) => setDraftSlide({ ...draftSlide, secondary_button_link_de: e.target.value, secondary_button_link: e.target.value })}
                    placeholder="/cars"
                    error={Boolean(getFieldError("secondary_button_link_de") || getFieldError("secondary_button_link"))}
                  />
                </SettingsField>

                <SettingsField label="Zielroute / Link (EN)" locale="en" error={getFieldError("secondary_button_link_en")}>
                  <Input
                    value={draftSlide.secondary_button_link_en ?? draftSlide.secondary_button_link ?? ""}
                    onChange={(e) => setDraftSlide({ ...draftSlide, secondary_button_link_en: e.target.value })}
                    placeholder="/cars"
                    error={Boolean(getFieldError("secondary_button_link_en"))}
                  />
                </SettingsField>
              </div>
            </div>
          </div>

          {/* Media Configurations: Dark Mode (Default) and Light Mode (Optional) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-md)",
              borderTop: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.1))",
              paddingTop: "var(--space-md)",
              marginTop: "var(--space-xs)",
            }}
          >
            {/* 1. Dark Mode Media (Standard / Default) */}
            <div
              style={{
                padding: "var(--space-md)",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "var(--space-sm)",
                  flexWrap: "wrap",
                  gap: "var(--space-xs)",
                }}
              >
                <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-admin-text, #ffffff)" }}>
                  🌙 {t("heroDarkMedia", { defaultValue: "Dark-Mode Medium (Standard)" })}
                </span>
                <div style={{ width: "170px" }}>
                  <Select
                    value={draftSlide.type || "IMAGE"}
                    onChange={(e) => setDraftSlide({ ...draftSlide, type: e.target.value })}
                    options={[
                      { value: "IMAGE", label: "Bild (Image)" },
                      { value: "VIDEO", label: "Video (MP4 / WebM)" },
                    ]}
                  />
                </div>
              </div>

              {(getFieldError("media_url") || getFieldError("type")) && (
                <p role="alert" style={{ color: "var(--color-error, #ef4444)", fontSize: "var(--font-size-xs)", margin: "0 0 var(--space-xs)" }}>
                  {getFieldError("media_url") || getFieldError("type")}
                </p>
              )}

              <MediaUploadField
                label=""
                value={draftSlide.media_url || ""}
                accept={draftSlide.type === "VIDEO" ? "video/mp4, video/webm" : "image/jpeg, image/png, image/webp"}
                mediaType={draftSlide.type || "IMAGE"}
                maxSizeMB={draftSlide.type === "VIDEO" ? 50 : 10}
                onChange={(url) => setDraftSlide({ ...draftSlide, media_url: url || "" })}
                onUpload={(file) => handleUploadHeroMedia(file, "dark")}
                helper={t("heroDarkMediaHelper", {
                  defaultValue: "Standard-Medium für das dunkle Design. Video: max. 50 MB • Bild: max. 10 MB",
                })}
              />
            </div>

            {/* 2. Light Mode Media (Optional Upload) */}
            <div
              style={{
                padding: "var(--space-md)",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "var(--space-sm)",
                  flexWrap: "wrap",
                  gap: "var(--space-xs)",
                }}
              >
                <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-admin-text, #ffffff)" }}>
                  ☀️ {t("heroLightMedia", { defaultValue: "Light-Mode Medium (Optional)" })}
                </span>
                <div style={{ width: "170px" }}>
                  <Select
                    value={draftSlide.type_light || draftSlide.type || "IMAGE"}
                    onChange={(e) => setDraftSlide({ ...draftSlide, type_light: e.target.value })}
                    options={[
                      { value: "IMAGE", label: "Bild (Image)" },
                      { value: "VIDEO", label: "Video (MP4 / WebM)" },
                    ]}
                  />
                </div>
              </div>

              {(getFieldError("media_light_url") || getFieldError("type_light")) && (
                <p role="alert" style={{ color: "var(--color-error, #ef4444)", fontSize: "var(--font-size-xs)", margin: "0 0 var(--space-xs)" }}>
                  {getFieldError("media_light_url") || getFieldError("type_light")}
                </p>
              )}

              <MediaUploadField
                label=""
                value={draftSlide.media_light_url || ""}
                accept={(draftSlide.type_light || draftSlide.type) === "VIDEO" ? "video/mp4, video/webm" : "image/jpeg, image/png, image/webp"}
                mediaType={draftSlide.type_light || draftSlide.type || "IMAGE"}
                maxSizeMB={(draftSlide.type_light || draftSlide.type) === "VIDEO" ? 50 : 10}
                onChange={(url) => setDraftSlide({ ...draftSlide, media_light_url: url || "" })}
                onUpload={(file) => handleUploadHeroMedia(file, "light")}
                helper={t("heroLightMediaHelper", {
                  defaultValue: "Optionales Bild oder Video für das helle Design. Fällt auf das Dark-Mode-Medium zurück, wenn nicht hochgeladen.",
                })}
              />
            </div>
          </div>

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
