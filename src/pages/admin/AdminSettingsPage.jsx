import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import settingsService from "../../services/settings/settings.service";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminLoadingState from "../../components/admin/AdminLoadingState";
import SettingsSaveBar from "../../components/admin/settings/SettingsSaveBar";
import Badge from "../../components/ui/Badge";
import Icon from "../../components/common/Icon";
import ErrorState from "../../components/ui/ErrorState";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { useGsapContext } from "../../hooks/useAnimation";
import { gsap, isReducedMotion } from "../../utils/animation";

// Section Editors
import SiteSettingsEditor from "../../components/admin/settings/sections/SiteSettingsEditor";
import BrandingSettingsEditor from "../../components/admin/settings/sections/BrandingSettingsEditor";
import ThemeSettingsEditor from "../../components/admin/settings/sections/ThemeSettingsEditor";
import LanguagesSettingsEditor from "../../components/admin/settings/sections/LanguagesSettingsEditor";
import ContactSettingsEditor from "../../components/admin/settings/sections/ContactSettingsEditor";
import HoursSettingsEditor from "../../components/admin/settings/sections/HoursSettingsEditor";
import LocationsSettingsEditor from "../../components/admin/settings/sections/LocationsSettingsEditor";
import SocialSettingsEditor from "../../components/admin/settings/sections/SocialSettingsEditor";
import NavigationSettingsEditor from "../../components/admin/settings/sections/NavigationSettingsEditor";
import FooterSettingsEditor from "../../components/admin/settings/sections/FooterSettingsEditor";
import HomepageSettingsEditor from "../../components/admin/settings/sections/HomepageSettingsEditor";
import HeroSettingsEditor from "../../components/admin/settings/sections/HeroSettingsEditor";
import OffersSettingsEditor from "../../components/admin/settings/sections/OffersSettingsEditor";
import SellCarSettingsEditor from "../../components/admin/settings/sections/SellCarSettingsEditor";
import ContactFormSettingsEditor from "../../components/admin/settings/sections/ContactFormSettingsEditor";
import GoogleReviewsSettingsEditor from "../../components/admin/settings/sections/GoogleReviewsSettingsEditor";

const SECTIONS = [
  { key: "site", labelKey: "general", icon: "globe" },
  { key: "branding", labelKey: "branding", icon: "image" },
  { key: "theme", labelKey: "theme", icon: "sun" },
  { key: "languages", labelKey: "languages", icon: "globe" },
  { key: "contact", labelKey: "contact", icon: "phone" },
  { key: "hours", labelKey: "hours", icon: "clock" },
  { key: "locations", labelKey: "locations", icon: "map-pin" },
  { key: "social", labelKey: "social", icon: "share-2" },
  { key: "navigation", labelKey: "navigation", icon: "menu" },
  { key: "footer", labelKey: "footer", icon: "layout" },
  { key: "homepage", labelKey: "homepage", icon: "grid" },
  { key: "hero", labelKey: "hero", icon: "film" },
  { key: "offers", labelKey: "offers", icon: "tag" },
  { key: "sell_car", labelKey: "sellCar", icon: "dollar-sign" },
  { key: "contact_form", labelKey: "contactForm", icon: "mail" },
  { key: "google_reviews", labelKey: "googleReviews", icon: "star" },
];

export function AdminSettingsPage() {
  const { t } = useTranslation(["admin", "common"]);
  const pageContainerRef = useRef(null);

  const [serverSettings, setServerSettings] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("site");

  // Save & Reset States
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [resetLoading, setResetLoading] = useState(false);

  // Unsaved changes confirmation modal
  const [pendingSection, setPendingSection] = useState(null);
  const [unsavedModalOpen, setUnsavedModalOpen] = useState(false);

  useEffect(() => {
    document.title = `${t("settings")} | ADMINCORE`;
  }, [t]);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await settingsService.adminGetSettings();
      const rawSettings = res?.data?.settings || res?.data || {};
      setServerSettings(rawSettings);
      setFormData(JSON.parse(JSON.stringify(rawSettings)));
      setValidationErrors({});
    } catch (err) {
      setError(err?.message || "Fehler beim Laden der CMS-Einstellungen.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useGsapContext(pageContainerRef, () => {
    if (isReducedMotion()) return;
    gsap.from(".admin-settings-layout", {
      opacity: 0,
      y: 16,
      duration: 0.5,
      ease: "power2.out",
    });
  });

  // Check if current active section has unsaved edits
  const isSectionDirty = (secKey) => {
    if (!serverSettings) return false;
    const serverVal = serverSettings[secKey];
    const draftVal = formData[secKey];
    return JSON.stringify(serverVal) !== JSON.stringify(draftVal);
  };

  const activeSectionDirty = isSectionDirty(activeSection);

  // Handle section switching with unsaved changes prompt
  const handleSelectSection = (nextKey) => {
    if (nextKey === activeSection) return;
    if (activeSectionDirty) {
      setPendingSection(nextKey);
      setUnsavedModalOpen(true);
    } else {
      setActiveSection(nextKey);
      setSaveSuccess(false);
      setValidationErrors({});
    }
  };

  const handleConfirmSwitch = () => {
    // Revert current section draft to server state
    if (serverSettings && activeSection) {
      setFormData((prev) => ({
        ...prev,
        [activeSection]: JSON.parse(JSON.stringify(serverSettings[activeSection] || {})),
      }));
    }
    if (pendingSection) {
      setActiveSection(pendingSection);
      setPendingSection(null);
    }
    setUnsavedModalOpen(false);
    setSaveSuccess(false);
    setValidationErrors({});
  };

  // Section draft update handler
  const handleSectionDataChange = (updatedSectionData) => {
    setFormData((prev) => ({
      ...prev,
      [activeSection]: updatedSectionData,
    }));
    setSaveSuccess(false);
  };

  // Save current active section
  const handleSave = async () => {
    if (saving || !activeSectionDirty) return;

    try {
      setSaving(true);
      setValidationErrors({});
      setSaveSuccess(false);

      const payload = {
        [activeSection]: formData[activeSection],
      };

      const res = await settingsService.adminUpdateSettings(payload);
      const updatedFromServer = res?.data?.settings || res?.data || {};

      // Sync serverSettings with latest persisted values
      setServerSettings((prev) => ({
        ...prev,
        [activeSection]: updatedFromServer[activeSection] || formData[activeSection],
      }));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      const errs = err?.errors || {};
      if (typeof errs === "object" && errs !== null) {
        setValidationErrors(errs);
      }
      setError(err?.message || "Fehler beim Speichern der Einstellungen.");
    } finally {
      setSaving(false);
    }
  };

  // Discard current active section changes
  const handleDiscard = () => {
    if (!serverSettings) return;
    setFormData((prev) => ({
      ...prev,
      [activeSection]: JSON.parse(JSON.stringify(serverSettings[activeSection] || {})),
    }));
    setValidationErrors({});
    setSaveSuccess(false);
  };

  // Reset section back to system default
  const handleResetSection = async () => {
    try {
      setResetLoading(true);
      const res = await settingsService.adminResetSection(activeSection);
      const updatedFromServer = res?.data?.settings || res?.data || {};

      const resetValue = updatedFromServer[activeSection] || {};
      setServerSettings((prev) => ({
        ...prev,
        [activeSection]: resetValue,
      }));
      setFormData((prev) => ({
        ...prev,
        [activeSection]: JSON.parse(JSON.stringify(resetValue)),
      }));

      setSaveSuccess(true);
      setValidationErrors({});
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setError(err?.message || "Fehler beim Zurücksetzen des Bereichs.");
    } finally {
      setResetLoading(false);
    }
  };

  // Render the appropriate section editor component
  const renderActiveEditor = () => {
    const sectionData = formData[activeSection] || {};
    const commonProps = {
      data: sectionData,
      onChange: handleSectionDataChange,
      onReset: handleResetSection,
      resetLoading,
      errors: validationErrors,
    };

    switch (activeSection) {
      case "site":
        return <SiteSettingsEditor {...commonProps} />;
      case "branding":
        return <BrandingSettingsEditor {...commonProps} />;
      case "theme":
        return <ThemeSettingsEditor {...commonProps} />;
      case "languages":
        return <LanguagesSettingsEditor {...commonProps} />;
      case "contact":
        return <ContactSettingsEditor {...commonProps} />;
      case "hours":
        return <HoursSettingsEditor {...commonProps} />;
      case "locations":
        return <LocationsSettingsEditor {...commonProps} />;
      case "social":
        return <SocialSettingsEditor {...commonProps} />;
      case "navigation":
        return <NavigationSettingsEditor {...commonProps} />;
      case "footer":
        return <FooterSettingsEditor {...commonProps} />;
      case "homepage":
        return <HomepageSettingsEditor {...commonProps} />;
      case "hero":
        return <HeroSettingsEditor {...commonProps} />;
      case "offers":
        return <OffersSettingsEditor {...commonProps} />;
      case "sell_car":
        return <SellCarSettingsEditor {...commonProps} />;
      case "contact_form":
        return <ContactFormSettingsEditor {...commonProps} />;
      case "google_reviews":
        return <GoogleReviewsSettingsEditor {...commonProps} />;
      default:
        return <div>{t("selectSectionToEdit", "Wählen Sie einen Bereich zur Bearbeitung aus.")}</div>;
    }
  };

  return (
    <div ref={pageContainerRef} className="admin-settings-page">
      <AdminPageHeader
        title={t("settings")}
        subtitle={t("settingsSubtitle", "Zentrales Content-Management-System & Konfiguration aller 16 Website-Bereiche")}
        badge={
          <Badge variant="secondary" size="sm">
            CMS Core
          </Badge>
        }
      />

      {loading ? (
        <AdminLoadingState message="Lade CMS-Einstellungen aus der Datenbank..." />
      ) : error && !serverSettings ? (
        <ErrorState message={error} onRetry={fetchSettings} />
      ) : (
        <div className="admin-settings-layout">
          {/* Mobile Section Selector (< 1024px) */}
          <div
            className="admin-settings-mobile-nav"
            style={{
              display: "none",
              marginBottom: "var(--space-md)",
            }}
          >
            <label
              htmlFor="mobile-section-select"
              style={{
                display: "block",
                fontSize: "var(--font-size-xs)",
                color: "var(--color-admin-muted)",
                marginBottom: "var(--space-xs)",
              }}
            >
              Bereich auswählen:
            </label>
            <select
              id="mobile-section-select"
              value={activeSection}
              onChange={(e) => handleSelectSection(e.target.value)}
              style={{
                width: "100%",
                padding: "var(--space-sm) var(--space-md)",
                backgroundColor: "var(--color-admin-card, #121418)",
                color: "var(--color-admin-text, #ffffff)",
                border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.15))",
                borderRadius: "var(--radius-sm, 6px)",
                fontSize: "var(--font-size-sm)",
                outline: "none",
              }}
            >
              {SECTIONS.map((sec) => (
                <option key={sec.key} value={sec.key}>
                  {t(`settingsSections.${sec.labelKey}`)} {isSectionDirty(sec.key) ? "(*)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Dual-Pane Layout: Left Sidebar + Right Editor */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "280px minmax(0, 1fr)",
              gap: "var(--space-xl)",
              alignItems: "start",
            }}
            className="admin-settings-grid"
          >
            {/* Left Sections Nav */}
            <aside
              className="admin-settings-sidebar"
              style={{
                position: "sticky",
                top: "calc(var(--admin-header-height, 70px) + var(--space-md))",
                backgroundColor: "var(--color-admin-card, #121418)",
                border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
                borderRadius: "var(--radius-md, 8px)",
                padding: "var(--space-sm)",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                maxHeight: "calc(100vh - 120px)",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  padding: "var(--space-xs) var(--space-sm)",
                  marginBottom: "var(--space-xs)",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--color-admin-muted)",
                }}
              >
                CMS Sektionen (16)
              </div>

              {SECTIONS.map((sec) => {
                const isActive = activeSection === sec.key;
                const isDirty = isSectionDirty(sec.key);

                return (
                  <button
                    key={sec.key}
                    type="button"
                    onClick={() => handleSelectSection(sec.key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "var(--space-sm)",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm, 6px)",
                      backgroundColor: isActive
                        ? "rgba(197, 160, 89, 0.12)"
                        : "transparent",
                      border: isActive
                        ? "1px solid rgba(197, 160, 89, 0.3)"
                        : "1px solid transparent",
                      color: isActive
                        ? "var(--color-primary, #C5A059)"
                        : "var(--color-admin-text, #ffffff)",
                      fontSize: "var(--font-size-xs)",
                      fontWeight: isActive ? 600 : 400,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                      outline: "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Icon
                        name={sec.icon}
                        size={15}
                        style={{
                          color: isActive
                            ? "var(--color-primary, #C5A059)"
                            : "var(--color-admin-muted)",
                        }}
                      />
                      <span>{t(`settingsSections.${sec.labelKey}`)}</span>
                    </div>

                    {isDirty && (
                      <span
                        title="Ungespeicherte Änderungen"
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: "var(--color-primary, #C5A059)",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </aside>

            {/* Right Editor Area */}
            <main style={{ minWidth: 0, position: "relative" }}>
              {renderActiveEditor()}

              {/* Persistent Bottom Save Bar */}
              <SettingsSaveBar
                hasChanges={activeSectionDirty}
                saving={saving}
                onSave={handleSave}
                onDiscard={handleDiscard}
                saveSuccess={saveSuccess}
                error={error}
              />
            </main>
          </div>
        </div>
      )}

      {/* Unsaved Changes Confirmation Modal */}
      <Modal
        isOpen={unsavedModalOpen}
        onClose={() => setUnsavedModalOpen(false)}
        title={t("warning", { defaultValue: "Ungespeicherte Änderungen" })}
        size="sm"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <p
            style={{
              margin: 0,
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-muted)",
              lineHeight: 1.6,
            }}
          >
            {t("switchSectionConfirm", {
              defaultValue:
                "Sie haben ungespeicherte Änderungen im aktuellen Bereich. Möchten Sie diesen Bereich wirklich verlassen und die Änderungen verwerfen?",
            })}
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "var(--space-sm)",
              marginTop: "var(--space-sm)",
            }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUnsavedModalOpen(false)}
            >
              {t("cancel", { defaultValue: "Abbrechen" })}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmSwitch}
              style={{
                backgroundColor: "var(--color-error, #ef4444)",
                borderColor: "var(--color-error, #ef4444)",
                color: "#ffffff",
              }}
            >
              {t("discardChanges", { defaultValue: "Verwerfen & Wechseln" })}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Responsive Style Overrides */}
      <style>{`
        @media (max-width: 1024px) {
          .admin-settings-mobile-nav {
            display: block !important;
          }
          .admin-settings-sidebar {
            display: none !important;
          }
          .admin-settings-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminSettingsPage;
