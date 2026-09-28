import React from "react";
import { useTranslation } from "react-i18next";
import SettingsSection from "../SettingsSection";
import SettingsToggle from "../SettingsToggle";
import Input from "../../../forms/Input";

const DAYS = [
  { key: "monday", label: "Montag" },
  { key: "tuesday", label: "Dienstag" },
  { key: "wednesday", label: "Mittwoch" },
  { key: "thursday", label: "Donnerstag" },
  { key: "friday", label: "Freitag" },
  { key: "saturday", label: "Samstag" },
  { key: "sunday", label: "Sonntag" },
];

export function HoursSettingsEditor({
  data = {},
  onChange,
  onReset,
  resetLoading,
  errors = {},
}) {
  const { t } = useTranslation(["admin", "common"]);

  const handleDayChange = (dayKey, patch) => {
    const currentDay = data[dayKey] || { enabled: false, open: null, close: null };
    onChange?.({
      ...data,
      [dayKey]: {
        ...currentDay,
        ...patch,
      },
    });
  };

  return (
    <SettingsSection
      title={t("settingsSections.hours", { defaultValue: "Öffnungszeiten" })}
      subtitle={t("hoursSubtitle", {
        defaultValue: "Legen Sie Ihre täglichen Showroom- und Werkstatt-Öffnungszeiten im 24h-Format (HH:MM) fest.",
      })}
      sectionKey="hours"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/contact"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
        {DAYS.map(({ key, label }) => {
          const dayConfig = data[key] || { enabled: false, open: "", close: "" };
          const openError = errors[`hours.${key}.open`];
          const closeError = errors[`hours.${key}.close`];

          return (
            <div
              key={key}
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr 1fr",
                alignItems: "center",
                gap: "var(--space-md)",
                padding: "var(--space-sm) var(--space-md)",
                backgroundColor: dayConfig.enabled
                  ? "rgba(255, 255, 255, 0.03)"
                  : "rgba(255, 255, 255, 0.01)",
                border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
                borderRadius: "var(--radius-sm, 6px)",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "var(--font-size-sm)",
                    fontWeight: 500,
                    color: dayConfig.enabled
                      ? "var(--color-admin-text, #ffffff)"
                      : "var(--color-admin-muted, var(--color-text-muted))",
                    display: "block",
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: dayConfig.enabled ? "#22c55e" : "var(--color-admin-muted)",
                  }}
                >
                  {dayConfig.enabled ? "Geöffnet" : "Geschlossen"}
                </span>
              </div>

              <div>
                <SettingsToggle
                  label=""
                  checked={Boolean(dayConfig.enabled)}
                  onChange={(checked) => handleDayChange(key, { enabled: checked })}
                  style={{ padding: 0 }}
                />
              </div>

              {dayConfig.enabled ? (
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
                  <Input
                    type="time"
                    value={dayConfig.open || ""}
                    onChange={(e) => handleDayChange(key, { open: e.target.value })}
                    error={openError}
                    style={{ minWidth: "100px" }}
                  />
                  <span style={{ color: "var(--color-admin-muted)", fontSize: "var(--font-size-xs)" }}>bis</span>
                  <Input
                    type="time"
                    value={dayConfig.close || ""}
                    onChange={(e) => handleDayChange(key, { close: e.target.value })}
                    error={closeError}
                    style={{ minWidth: "100px" }}
                  />
                </div>
              ) : (
                <div style={{ color: "var(--color-admin-muted)", fontSize: "var(--font-size-xs)", fontStyle: "italic" }}>
                  Geschlossen / Nach Vereinbarung
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SettingsSection>
  );
}

export default HoursSettingsEditor;
