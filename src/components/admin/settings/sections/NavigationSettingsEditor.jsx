import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SettingsSection from "../SettingsSection";
import SortableList from "../SortableList";
import SettingsField from "../SettingsField";
import SettingsToggle from "../SettingsToggle";
import Input from "../../../forms/Input";
import Button from "../../../ui/Button";
import Modal from "../../../ui/Modal";

export function NavigationSettingsEditor({
  data = {},
  onChange,
  onReset,
  resetLoading,
  _errors = {},
}) {
  const { t } = useTranslation(["admin", "common"]);
  const mainNav = Array.isArray(data.main) ? data.main : [];
  const headerCta = data.header_cta || { enabled: false, label_de: "", label_en: "", route: "" };

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [draftNav, setDraftNav] = useState({});

  const handleOpenAdd = () => {
    setDraftNav({
      label_de: "",
      label_en: "",
      route: "/",
      enabled: true,
      order: mainNav.length + 1,
    });
    setEditingIndex(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (index) => {
    setDraftNav({ ...mainNav[index] });
    setEditingIndex(index);
    setModalOpen(true);
  };

  const handleSaveModal = () => {
    const nextMain = [...mainNav];
    if (editingIndex !== null) {
      nextMain[editingIndex] = draftNav;
    } else {
      nextMain.push(draftNav);
    }
    onChange?.({
      ...data,
      main: nextMain,
    });
    setModalOpen(false);
  };

  const handleRemove = (index) => {
    const nextMain = mainNav.filter((_, idx) => idx !== index);
    onChange?.({
      ...data,
      main: nextMain,
    });
  };

  const handleCtaChange = (patch) => {
    onChange?.({
      ...data,
      header_cta: {
        ...headerCta,
        ...patch,
      },
    });
  };

  return (
    <SettingsSection
      title={t("settingsSections.navigation", { defaultValue: "Hauptnavigation" })}
      subtitle={t("navigationSubtitle", {
        defaultValue: "Konfigurieren Sie Navigationslinks, Reihenfolge und den Header Call-to-Action-Button.",
      })}
      sectionKey="navigation"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/"
    >
      <h3
        style={{
          margin: "0 0 var(--space-md)",
          fontSize: "var(--font-size-md)",
          fontWeight: 600,
          color: "var(--color-admin-text, #0f172a)",
        }}
      >
        {t("mainNavLinks", { defaultValue: "Main Menu Links" })}
      </h3>

      <SortableList
        items={mainNav}
        onReorder={(newItems) => onChange?.({ ...data, main: newItems })}
        onAdd={handleOpenAdd}
        onRemove={handleRemove}
        addLabel={t("addNavLink", { defaultValue: "Add menu item" })}
        emptyMessage={t("noNavLinksConfigured", { defaultValue: "No menu items configured." })}
        renderItem={(item, index) => (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-md)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--color-admin-text, #0f172a)" }}>
                  {item.label_de || item.label_en || `Link #${index + 1}`}
                </span>
                {item.label_en && item.label_de && (
                  <span style={{ fontSize: "11px", color: "var(--color-admin-muted)" }}>
                    ({item.label_en})
                  </span>
                )}
                {!item.enabled && (
                  <span style={{ fontSize: "10px", color: "var(--color-error)", backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "1px 6px", borderRadius: "3px" }}>
                    {t("disabled", { defaultValue: "Disabled" })}
                  </span>
                )}
              </div>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-primary, var(--color-text))", fontFamily: "monospace" }}>
                {item.route}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenEdit(index)}
              style={{ fontSize: "var(--font-size-xs)", padding: "4px 12px" }}
            >
              {t("edit", { defaultValue: "Edit" })}
            </Button>
          </div>
        )}
      />

      {/* Header CTA Button Configuration */}
      <div
        style={{
          marginTop: "var(--space-xl)",
          paddingTop: "var(--space-lg)",
          borderTop: "1px solid var(--color-admin-border, rgba(0, 0, 0, 0.08))",
        }}
      >
        <h3
          style={{
            margin: "0 0 var(--space-xs)",
            fontSize: "var(--font-size-md)",
            fontWeight: 600,
            color: "var(--color-admin-text, #0f172a)",
          }}
        >
          {t("headerCtaButton", { defaultValue: "Header Call-to-Action Button" })}
        </h3>
        <p
          style={{
            margin: "0 0 var(--space-md)",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-admin-muted)",
          }}
        >
          {t("headerCtaDesc", { defaultValue: "Prominent button in the right side of desktop and mobile navigation." })}
        </p>

        <SettingsToggle
          label={t("enableCtaButton", { defaultValue: "Enable CTA Button" })}
          checked={Boolean(headerCta.enabled)}
          onChange={(checked) => handleCtaChange({ enabled: checked })}
        />

        {headerCta.enabled && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-md)", marginTop: "var(--space-sm)" }}>
            <SettingsField label={`${t("buttonLabel", { defaultValue: "Button Label" })} (DE)`} locale="de">
              <Input
                value={headerCta.label_de || ""}
                onChange={(e) => handleCtaChange({ label_de: e.target.value })}
                placeholder="Fahrzeug anfragen"
              />
            </SettingsField>

            <SettingsField label={`${t("buttonLabel", { defaultValue: "Button Label" })} (EN)`} locale="en">
              <Input
                value={headerCta.label_en || ""}
                onChange={(e) => handleCtaChange({ label_en: e.target.value })}
                placeholder="Inquire Vehicle"
              />
            </SettingsField>

            <SettingsField label={t("targetRouteOrUrl", { defaultValue: "Target Route or URL" })}>
              <Input
                value={headerCta.route || ""}
                onChange={(e) => handleCtaChange({ route: e.target.value })}
                placeholder="/contact"
              />
            </SettingsField>
          </div>
        )}
      </div>

      {/* Modal for Add / Edit Nav Item */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingIndex !== null ? t("editNavItem", { defaultValue: "Edit Menu Item" }) : t("addNavItem", { defaultValue: "Add Menu Item" })}
        size="md"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
          <SettingsField label={`${t("label", { defaultValue: "Label" })} (DE)`} locale="de" required>
            <Input
              value={draftNav.label_de || ""}
              onChange={(e) => setDraftNav({ ...draftNav, label_de: e.target.value })}
              placeholder="z. B. Fahrzeuge"
            />
          </SettingsField>

          <SettingsField label={`${t("label", { defaultValue: "Label" })} (EN)`} locale="en">
            <Input
              value={draftNav.label_en || ""}
              onChange={(e) => setDraftNav({ ...draftNav, label_en: e.target.value })}
              placeholder="e.g. Inventory"
            />
          </SettingsField>

          <SettingsField label={t("targetRoute", { defaultValue: "Target Route" })} helper={t("targetRouteHelper", { defaultValue: "Relative route (e.g. /cars) or external URL" })} required>
            <Input
              value={draftNav.route || ""}
              onChange={(e) => setDraftNav({ ...draftNav, route: e.target.value })}
              placeholder="/cars"
            />
          </SettingsField>

          <SettingsToggle
            label={t("navItemVisible", { defaultValue: "Menu item visible" })}
            checked={draftNav.enabled !== false}
            onChange={(checked) => setDraftNav({ ...draftNav, enabled: checked })}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-sm)", marginTop: "var(--space-md)" }}>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              {t("cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveModal}>
              {t("apply", { defaultValue: "Apply" })}
            </Button>
          </div>
        </div>
      </Modal>
    </SettingsSection>
  );
}

export default NavigationSettingsEditor;
