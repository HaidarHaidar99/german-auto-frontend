import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "../common/Icon";

/**
 * German Auto — Vehicle Key Specifications Chips
 * Automatically formats mileage numbers, dates (MM/YYYY), and enums (fuel, transmission, condition).
 */

export function VehicleSpecs({
  mileage,
  mileage_km,
  power,
  performance_hp,
  transmission,
  fuel,
  fuel_type,
  registration,
  first_registration,
  condition,
  className = "",
  style = {},
}) {
  const { t, i18n } = useTranslation(["cars"]);
  const locale = i18n?.language === "de" ? "de-DE" : "en-US";
  const numFmt = new Intl.NumberFormat(locale);

  // 1. Mileage in km
  const rawMileage = mileage !== undefined && mileage !== null ? mileage : mileage_km;
  const formattedMileage =
    rawMileage !== undefined && rawMileage !== null && rawMileage !== ""
      ? typeof rawMileage === "number" || !isNaN(Number(rawMileage))
        ? `${numFmt.format(Number(rawMileage))} km`
        : String(rawMileage).includes("km")
        ? String(rawMileage)
        : `${rawMileage} km`
      : null;

  // 2. Performance/power in kW and/or PS, with accurate units
  const rawPower = power !== undefined && power !== null ? power : performance_hp;
  let formattedPower = null;
  if (rawPower !== undefined && rawPower !== null && rawPower !== "") {
    if (typeof rawPower === "number" || !isNaN(Number(rawPower))) {
      const hp = Number(rawPower);
      if (hp > 0) {
        const kw = Math.round(hp * 0.735499);
        formattedPower = `${numFmt.format(hp)} PS (${numFmt.format(kw)} kW)`;
      }
    } else {
      formattedPower = String(rawPower);
    }
  }

  // 3. Transmission: automatic or manual
  const rawTrans = transmission;
  const localizedTransmission = rawTrans ? t(`trans_${rawTrans}`, { defaultValue: rawTrans }) : null;

  // 4. Fuel type
  const rawFuel = fuel || fuel_type;
  const localizedFuel = rawFuel ? t(`fuel_${rawFuel}`, { defaultValue: rawFuel }) : null;

  // 5. First registration
  const rawReg = registration || first_registration;
  let formattedRegistration = null;
  if (rawReg) {
    const str = String(rawReg).trim();
    if (/^\d{4}$/.test(str)) {
      formattedRegistration = str;
    } else if (str.includes("-")) {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        const month = String(d.getMonth() + 1).padStart(2, "0");
        formattedRegistration = `${month}/${d.getFullYear()}`;
      } else {
        formattedRegistration = str;
      }
    } else {
      formattedRegistration = str;
    }
  }

  // 6. Condition: used or new
  const localizedCondition = condition ? t(`cond_${condition}`, { defaultValue: condition }) : null;

  return (
    <div
      className={`vehicle-specs-grid ${className}`.trim()}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "6px 8px",
        width: "100%",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {/* Row 1, Col 1: Mileage */}
      <span className="spec-chip" title={formattedMileage || "—"}>
        <span className="spec-chip-icon"><Icon name="speedometer" size={13} /></span>
        <span>{formattedMileage || "—"}</span>
      </span>

      {/* Row 1, Col 2: Power / Performance */}
      <span className="spec-chip" title={formattedPower || "—"}>
        <span className="spec-chip-icon"><Icon name="zap" size={13} /></span>
        <span>{formattedPower || "—"}</span>
      </span>

      {/* Row 1, Col 3: Transmission */}
      <span className="spec-chip" title={localizedTransmission || "—"}>
        <span className="spec-chip-icon"><Icon name="settings" size={13} /></span>
        <span>{localizedTransmission || "—"}</span>
      </span>

      {/* Row 2, Col 1: Fuel type */}
      <span className="spec-chip" title={localizedFuel || "—"}>
        <span className="spec-chip-icon"><Icon name="fuel" size={13} /></span>
        <span>{localizedFuel || "—"}</span>
      </span>

      {/* Row 2, Col 2: First registration */}
      <span className="spec-chip" title={formattedRegistration || "—"}>
        <span className="spec-chip-icon"><Icon name="calendar" size={13} /></span>
        <span>{formattedRegistration || "—"}</span>
      </span>

      {/* Row 2, Col 3: Condition */}
      <span className="spec-chip" title={localizedCondition || "—"}>
        <span className="spec-chip-icon"><Icon name="award" size={13} /></span>
        <span>{localizedCondition || "—"}</span>
      </span>
    </div>
  );
}

export default VehicleSpecs;
