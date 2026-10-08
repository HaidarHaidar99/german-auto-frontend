import React from "react";
import { useTranslation } from "react-i18next";
import SettingsSection from "../SettingsSection";
import SettingsToggle from "../SettingsToggle";
import Input from "../../../forms/Input";

const DAYS = [
  { key: "monday", labelKey: "days.monday", defaultLabel: "Monday" },
  { key: "tuesday", labelKey: "days.tuesday", defaultLabel: "Tuesday" },
  { key: "wednesday", labelKey: "days.wednesday", defaultLabel: "Wednesday" },
  { key: "thursday", labelKey: "days.thursday", defaultLabel: "Thursday" },
  { key: "friday", labelKey: "days.friday", defaultLabel: "Friday" },
  { key: "saturday", labelKey: "days.saturday", defaultLabel: "Saturday" },
  { key: "sunday", labelKey: "days.sunday", defaultLabel: "Sunday" },
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
      title={t("settingsSections.hours", { defaultValue: "Opening Hours" })}
      subtitle={t("hoursSubtitle", {
        defaultValue: "Set your daily showroom and workshop opening hours in 24h format (HH:MM).",
      })}
      sectionKey="hours"
      onReset={onReset}
      resetLoading={resetLoading}
      previewUrl="/contact"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
        {DAYS.map(({ key, labelKey, defaultLabel }) => {
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
                  ? "var(--color-admin-card-inner, rgba(0, 0, 0, 0.02))"
                  : "transparent",
                border: "1px solid var(--color-admin-border, #cbd5e1)",
                borderRadius: "var(--radius-sm, 6px)",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "var(--font-size-sm)",
                    fontWeight: 500,
                    color: dayConfig.enabled
                      ? "var(--color-admin-text, #0f172a)"
                      : "var(--color-admin-muted, #64748b)",
                    display: "block",
                  }}
                >
                  {t(labelKey, { defaultValue: defaultLabel })}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: dayConfig.enabled ? "#22c55e" : "var(--color-admin-muted)",
                  }}
                >
                  {dayConfig.enabled ? t("open", { defaultValue: "Open" }) : t("closed", { defaultValue: "Closed" })}
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
                  <span style={{ color: "var(--color-admin-muted)", fontSize: "var(--font-size-xs)" }}>{t("to", { defaultValue: "to" })}</span>
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
                  {t("closedOrByAppointment", { defaultValue: "Closed / By appointment" })}
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
