import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "../common/Icon";

/**
 * German Auto — Vehicle Key Specifications Chips
 * Automatically formats mileage numbers, dates (MM/YYYY), and enums (fuel, transmission, condition).
 */

export function VehicleSpecs({
  mileage,
  fuel,
  transmission,
  registration,
  condition,
  className = "",
  style = {},
}) {
  const { t } = useTranslation(["cars"]);

  const formattedMileage = typeof mileage === "number"
    ? `${new Intl.NumberFormat("de-DE").format(mileage)} km`
    : mileage;

  // Format registration date if it's an ISO date or year
  let formattedRegistration = registration;
  if (registration && typeof registration === "string" && registration.includes("-")) {
    const d = new Date(registration);
    if (!isNaN(d.getTime())) {
      const month = String(d.getMonth() + 1).padStart(2, "0");
      formattedRegistration = `${month}/${d.getFullYear()}`;
    }
  }

  // Resolve localized enum labels
  const localizedFuel = fuel ? t(`fuel_${fuel}`, fuel) : null;
  const localizedTransmission = transmission ? t(`trans_${transmission}`, transmission) : null;
  const localizedCondition = condition ? t(`cond_${condition}`, condition) : null;

  return (
    <div
      className={`vehicle-specs-grid ${className}`.trim()}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--space-2xs)",
        ...style,
      }}
    >
      {formattedMileage && (
        <span className="spec-chip">
          <span className="spec-chip-icon"><Icon name="speedometer" size={13} /></span>
          <span>{formattedMileage}</span>
        </span>
      )}

      {localizedFuel && (
        <span className="spec-chip">
          <span className="spec-chip-icon"><Icon name="fuel" size={13} /></span>
          <span>{localizedFuel}</span>
        </span>
      )}

      {localizedTransmission && (
        <span className="spec-chip">
          <span className="spec-chip-icon"><Icon name="cog" size={13} /></span>
          <span>{localizedTransmission}</span>
        </span>
      )}

      {formattedRegistration && (
        <span className="spec-chip">
          <span className="spec-chip-icon"><Icon name="calendar" size={13} /></span>
          <span>{formattedRegistration}</span>
        </span>
      )}

      {localizedCondition && (
        <span className="spec-chip">
          <span className="spec-chip-icon"><Icon name="award" size={13} /></span>
          <span>{localizedCondition}</span>
        </span>
      )}
    </div>
  );
}

export default VehicleSpecs;
