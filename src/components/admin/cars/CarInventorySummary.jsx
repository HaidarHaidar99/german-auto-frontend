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
      label: t("statTotalVehicles", { defaultValue: "Total Vehicles" }),
      count: total,
      icon: "layers",
      iconBg: "#2563eb",
    },
    {
      key: "AVAILABLE",
      label: t("statAvailable", { defaultValue: "Available Vehicles" }),
      count: available,
      icon: "check-circle",
      iconBg: "#10b981",
    },
    {
      key: "RESERVED",
      label: t("statReserved", { defaultValue: "Reserved" }),
      count: reserved,
      icon: "clock",
      iconBg: "#f59e0b",
    },
    {
      key: "SOLD",
      label: t("statSold", { defaultValue: "Sold Vehicles" }),
      count: sold,
      icon: "tag",
      iconBg: "#64748b",
    },
    {
      key: "FEATURED",
      label: t("statFeatured", { defaultValue: "Featured" }),
      count: featured,
      icon: "star",
      iconBg: "#8b5cf6",
    },
    {
      key: "HIDDEN",
      label: t("statHidden", { defaultValue: "Hidden" }),
      count: hidden,
      icon: "eye-off",
      iconBg: "#ef4444",
    },
  ];

  return (
    <div
      className={`car-inventory-summary ${className}`.trim()}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "20px",
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
              gap: "16px",
              padding: "18px 20px",
              backgroundColor: isSelected
                ? "var(--color-admin-accent-subtle)"
                : "var(--color-admin-card)",
              borderRadius: "16px",
              border: isSelected
                ? "2px solid var(--color-admin-accent)"
                : "1px solid var(--color-admin-border)",
              boxShadow: isSelected
                ? "0 4px 12px rgba(37, 99, 235, 0.12)"
                : "0 1px 3px rgba(0, 0, 0, 0.04)",
              cursor: "pointer",
              textAlign: "left",
              transition: "transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
              outline: "none",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = "var(--color-admin-accent)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.06)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = "var(--color-admin-border)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.04)";
              }
            }}
          >
            {/* Left Squircle Icon Container */}
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: s.iconBg,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.12)",
              }}
            >
              <Icon name={s.icon} size={22} strokeWidth={2} />
            </div>

            {/* Right Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0, flex: 1 }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                  color: isSelected ? "var(--color-admin-accent)" : "var(--color-admin-muted)",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {s.label}
              </span>
              <span
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  color: "var(--color-admin-text)",
                  lineHeight: 1.1,
                }}
              >
                {s.count}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default CarInventorySummary;
