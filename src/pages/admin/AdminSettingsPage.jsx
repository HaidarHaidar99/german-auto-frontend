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
import { useSettings } from "../../contexts/SettingsContext";
import { useGsapContext } from "../../hooks/useAnimation";
import { gsap, isReducedMotion } from "../../utils/animation";

// Section Editors
import SiteSettingsEditor from "../../components/admin/settings/sections/SiteSettingsEditor";
import BrandingSettingsEditor from "../../components/admin/settings/sections/BrandingSettingsEditor";
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
import AboutSettingsEditor from "../../components/admin/settings/sections/AboutSettingsEditor";

const SECTIONS = [
  { key: "site", labelKey: "general", icon: "globe" },
  { key: "branding", labelKey: "branding", icon: "image" },
  { key: "languages", labelKey: "languages", icon: "globe" },
  { key: "about", labelKey: "aboutUs", icon: "info" },
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
  const { refreshSettings } = useSettings();
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
    setError(null);
  };

  // Save current active section
  const handleSave = async () => {
    if (saving || !activeSectionDirty) return;

    try {
      setSaving(true);
      setError(null);
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

      // Synchronize global SettingsContext so the homepage and public components update immediately
      if (typeof refreshSettings === "function") {
        try {
          await refreshSettings();
        } catch (_) {}
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      const errs = err?.errors || {};
      if (typeof errs === "object" && errs !== null && Object.keys(errs).length > 0) {
        setValidationErrors(errs);
        const details = Object.entries(errs)
          .map(([f, msg]) => `${f}: ${msg}`)
          .join(" • ");
        setError(`${err?.message || "Validierung fehlgeschlagen"} (${details})`);
      } else {
        setError(err?.message || "Fehler beim Speichern der Einstellungen.");
      }
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
    setError(null);
    setSaveSuccess(false);
  };

  // Reset section back to system default
  const handleResetSection = async () => {
    try {
      setResetLoading(true);
      setError(null);
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

      if (typeof refreshSettings === "function") {
        try {
          await refreshSettings();
        } catch (_) {}
      }

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
      case "about":
        return <AboutSettingsEditor {...commonProps} />;
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
          <span
            style={{
              display: "inline-block",
              padding: "3px 10px",
              borderRadius: "6px",
              backgroundColor: "var(--color-admin-accent-subtle)",
              color: "var(--color-admin-accent)",
              border: "1px solid var(--color-admin-accent)",
              fontWeight: 700,
              fontSize: "11px",
              letterSpacing: "0.5px",
            }}
          >
            CMS CORE
          </span>
        }
      />

      {loading ? (
        <AdminLoadingState message={t("loadingSettings", { defaultValue: "Lade CMS-Einstellungen aus der Datenbank..." })} />
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
              {t("selectSection", { defaultValue: "Bereich auswählen:" })}
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
                top: "20px",
                backgroundColor: "var(--color-admin-card)",
                border: "1px solid var(--color-admin-border)",
                borderRadius: "16px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                padding: "16px 12px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                maxHeight: "calc(100vh - 120px)",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  padding: "4px 8px 10px 8px",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--color-admin-muted)",
                  borderBottom: "1px solid var(--color-admin-border)",
                  marginBottom: "6px",
                }}
              >
                {t("cmsSections", { defaultValue: "CMS Sektionen" })} ({SECTIONS.length})
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
                      gap: "10px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      backgroundColor: isActive
                        ? "var(--color-admin-accent-subtle)"
                        : "transparent",
                      border: isActive
                        ? "1px solid var(--color-admin-accent)"
                        : "1px solid transparent",
                      color: isActive
                        ? "var(--color-admin-accent)"
                        : "var(--color-admin-text)",
                      fontSize: "13px",
                      fontWeight: isActive ? 700 : 500,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                      outline: "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Icon
                        name={sec.icon}
                        size={16}
                        style={{
                          color: isActive
                            ? "var(--color-admin-accent)"
                            : "var(--color-admin-muted)",
                        }}
                      />
                      <span>{t(`settingsSections.${sec.labelKey}`, { defaultValue: sec.labelKey })}</span>
                    </div>

                    {isDirty && (
                      <span
                        title={t("unsavedChangesPresent", { defaultValue: "Ungespeicherte Änderungen" })}
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          backgroundColor: "var(--color-admin-accent)",
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
