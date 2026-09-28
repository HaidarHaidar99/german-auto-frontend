import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "../common/Icon";

/**
 * German Auto — CarEquipment Component
 * Displays real equipment features in an elegant, responsive automotive badge grid.
 * If equipment is empty, gracefully omits the section without inventing items.
 */
export function CarEquipment({ equipment, className = "", style = {} }) {
  const { t } = useTranslation(["cars", "common"]);

  const items = Array.isArray(equipment) ? equipment.filter(Boolean) : [];

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className={`car-equipment-section ${className}`.trim()}
      aria-labelledby="equipment-heading"
      style={{
        backgroundColor: "var(--color-card)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        padding: "var(--space-lg) var(--space-xl)",
        marginBottom: "var(--space-xl)",
        ...style,
      }}
    >
      <h3
        id="equipment-heading"
        style={{
          fontSize: "var(--font-size-lg)",
          fontWeight: "var(--font-weight-semibold)",
          letterSpacing: "var(--tracking-tight)",
          marginBottom: "var(--space-lg)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-xs)",
          color: "var(--color-text)",
        }}
      >
        <Icon name="check-circle" size={20} color="var(--color-secondary)" />
        <span>{t("equipmentTitle")}</span>
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-subtle)",
            fontWeight: "normal",
            marginLeft: "var(--space-2xs)",
          }}
        >
          ({items.length})
        </span>
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "var(--space-xs)",
        }}
      >
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-xs)",
              padding: "var(--space-xs) var(--space-sm)",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border-subtle)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text)",
            }}
          >
            <Icon name="check" size={14} color="var(--color-secondary)" style={{ flexShrink: 0 }} />
            <span style={{ lineHeight: 1.3 }}>{String(item)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CarEquipment;
