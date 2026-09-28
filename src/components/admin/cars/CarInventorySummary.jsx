import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "../../common/Icon";

/**
 * CarInventorySummary — Displays live counts calculated from real vehicle data.
 */
export function CarInventorySummary({
  cars = [],
  summaryCounts = null,
  activeStatusFilter = "ALL",
  onSelectStatusFilter,
  className = "",
  style = {},
}) {
  const { t } = useTranslation(["admin", "cars", "common"]);

  const total = summaryCounts?.total != null ? summaryCounts.total : cars.length;
  const available = summaryCounts?.available != null
    ? summaryCounts.available
    : cars.filter((c) => c.status === "AVAILABLE" && c.is_visible !== false).length;
  const reserved = summaryCounts?.reserved != null
    ? summaryCounts.reserved
    : cars.filter((c) => c.status === "RESERVED").length;
  const sold = summaryCounts?.sold != null
    ? summaryCounts.sold
    : cars.filter((c) => c.status === "SOLD").length;
  const featured = summaryCounts?.featured != null
    ? summaryCounts.featured
    : cars.filter((c) => c.is_featured === true).length;
  const hidden = summaryCounts?.hidden != null
    ? summaryCounts.hidden
    : cars.filter((c) => c.is_visible === false || c.status === "HIDDEN").length;

  const stats = [
    {
      key: "ALL",
      label: t("statTotalVehicles", { defaultValue: "Gesamtbestand" }),
      count: total,
      icon: "car",
      color: "var(--color-admin-text, #ffffff)",
    },
    {
      key: "AVAILABLE",
      label: t("statAvailable", { defaultValue: "Verfügbar" }),
      count: available,
      icon: "check",
      color: "#22c55e",
    },
    {
      key: "RESERVED",
      label: t("statReserved", { defaultValue: "Reserviert" }),
      count: reserved,
      icon: "clock",
      color: "#eab308",
    },
    {
      key: "SOLD",
      label: t("statSold", { defaultValue: "Verkauft" }),
      count: sold,
      icon: "tag",
      color: "#64748b",
    },
    {
      key: "FEATURED",
      label: t("statFeatured", { defaultValue: "Hervorgehoben" }),
      count: featured,
      icon: "star",
      color: "var(--color-primary, #C5A059)",
    },
    {
      key: "HIDDEN",
      label: t("statHidden", { defaultValue: "Ausgeblendet" }),
      count: hidden,
      icon: "eye",
      color: "#ef4444",
    },
  ];

  return (
    <div
      className={`car-inventory-summary ${className}`.trim()}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: "var(--space-sm)",
        ...style,
      }}
    >
      {stats.map((s) => {
        const isSelected = activeStatusFilter === s.key;

        return (
          <button
            key={s.key}
            type="button"
            onClick={() => onSelectStatusFilter?.(s.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-sm)",
              padding: "var(--space-sm) var(--space-md)",
              backgroundColor: isSelected
                ? "rgba(197, 160, 89, 0.12)"
                : "var(--color-admin-card, #121418)",
              border: `1px solid ${
                isSelected
                  ? "var(--color-primary, #C5A059)"
                  : "var(--color-admin-border, rgba(255, 255, 255, 0.08))"
              }`,
              borderRadius: "var(--radius-md, 8px)",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s ease",
              outline: "none",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-sm, 6px)",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: s.color,
                flexShrink: 0,
              }}
            >
              <Icon name={s.icon} size={16} />
            </div>

            <div style={{ minWidth: 0 }}>
              <span
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-admin-muted, var(--color-text-muted))",
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {s.label}
              </span>
              <strong
                style={{
                  fontSize: "var(--font-size-md)",
                  fontWeight: 600,
                  color: "var(--color-admin-text, #ffffff)",
                }}
              >
                {s.count}
              </strong>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default CarInventorySummary;
