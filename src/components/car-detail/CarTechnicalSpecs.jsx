import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "../common/Icon";

/**
 * Formats a registration date string into MM/YYYY or YYYY
 */
function formatRegistrationDate(val) {
  if (!val) return null;
  const str = String(val).trim();
  if (/^\d{4}$/.test(str)) return str;
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${year}`;
}

/**
 * German Auto — CarTechnicalSpecs Component
 * Highlights key engineering indicators in luxury cards, followed by an organized technical data table.
 * Only presents fields that contain real data from the API.
 */
export function CarTechnicalSpecs({ car, className = "", style = {} }) {
  const { t, i18n } = useTranslation(["cars", "common"]);
  const locale = i18n.language === "de" ? "de-DE" : "en-US";
  const numFmt = new Intl.NumberFormat(locale);

  if (!car) return null;

  // Six core specifications displayed prominently at the beginning, one underneath another
  const sixSpecs = [];

  // 1. Mileage in km
  const rawMileage = car.mileage_km !== undefined && car.mileage_km !== null ? car.mileage_km : car.mileage;
  if (rawMileage !== undefined && rawMileage !== null && rawMileage !== "") {
    sixSpecs.push({
      id: "mileage",
      icon: "activity",
      label: t("filterMileage", { defaultValue: "Kilometerstand" }),
      value:
        typeof rawMileage === "number" || !isNaN(Number(rawMileage))
          ? `${numFmt.format(Number(rawMileage))} km`
          : String(rawMileage).includes("km")
          ? String(rawMileage)
          : `${rawMileage} km`,
    });
  }

  // 2. Performance/power in kW and/or PS, with accurate units
  const rawPower = car.performance_hp !== undefined && car.performance_hp !== null ? car.performance_hp : car.power;
  if (rawPower !== undefined && rawPower !== null && rawPower !== "") {
    if (typeof rawPower === "number" || !isNaN(Number(rawPower))) {
      const hp = Number(rawPower);
      if (hp > 0) {
        const kw = Math.round(hp * 0.735499);
        sixSpecs.push({
          id: "performance",
          icon: "zap",
          label: t("performance", { defaultValue: "Leistung" }),
          value: `${numFmt.format(hp)} PS (${numFmt.format(kw)} kW)`,
        });
      }
    } else {
      sixSpecs.push({
        id: "performance",
        icon: "zap",
        label: t("performance", { defaultValue: "Leistung" }),
        value: String(rawPower),
      });
    }
  }

  // 3. Transmission: automatic or manual
  if (car.transmission) {
    sixSpecs.push({
      id: "transmission",
      icon: "settings",
      label: t("filterTransmission", { defaultValue: "Getriebe" }),
      value: t(`trans_${car.transmission}`, { defaultValue: car.transmission }),
    });
  }

  // 4. Fuel type
  const rawFuel = car.fuel_type || car.fuel;
  if (rawFuel) {
    sixSpecs.push({
      id: "fuel",
      icon: "fuel",
      label: t("filterFuel", { defaultValue: "Kraftstoffart" }),
      value: t(`fuel_${rawFuel}`, { defaultValue: rawFuel }),
    });
  }

  // 5. First registration
  const rawReg = car.first_registration || car.registration_year;
  if (rawReg) {
    sixSpecs.push({
      id: "first_reg",
      icon: "calendar",
      label: t("firstRegistration", { defaultValue: "Erstzulassung" }),
      value: formatRegistrationDate(rawReg),
    });
  }

  // 6. Condition: used or new
  if (car.condition) {
    sixSpecs.push({
      id: "condition",
      icon: "award",
      label: t("filterCondition", { defaultValue: "Fahrzeugzustand" }),
      value: t(`cond_${car.condition}`, { defaultValue: car.condition }),
    });
  }

  // Detailed technical rows (all other vehicle specifications kept intact)
  const detailRows = [];

  if (car.engine_displacement_cc) {
    detailRows.push({
      label: t("engineDisplacement"),
      value: `${numFmt.format(car.engine_displacement_cc)} cm³`,
    });
  }

  if (car.category) {
    detailRows.push({
      label: t("filterCategory"),
      value: t(`cat_${car.category}`, { defaultValue: car.category }),
    });
  }

  if (car.vehicle_condition) {
    detailRows.push({
      label: t("vehicleConditionLabel"),
      value: String(car.vehicle_condition),
    });
  }

  if (car.vehicle_owners !== undefined && car.vehicle_owners !== null) {
    detailRows.push({
      label: t("vehicleOwnersCount"),
      value: String(car.vehicle_owners),
    });
  }

  if (car.seats !== undefined && car.seats !== null) {
    detailRows.push({
      label: t("seatsCount"),
      value: String(car.seats),
    });
  }

  if (car.air_conditioning) {
    detailRows.push({
      label: t("airConditioning"),
      value: String(car.air_conditioning),
    });
  }

  if (car.camera) {
    detailRows.push({
      label: t("cameraLabel"),
      value: String(car.camera),
    });
  }

  if (car.interior_design) {
    detailRows.push({
      label: t("interiorDesign"),
      value: t(`interior_${car.interior_design}`, { defaultValue: car.interior_design }),
    });
  }

  if (car.interior_color) {
    detailRows.push({
      label: t("interiorColor"),
      value: String(car.interior_color),
    });
  }

  // Custom fields if any
  const customEntries =
    car.custom_fields && typeof car.custom_fields === "object"
      ? Object.entries(car.custom_fields).filter(([_k, v]) => v !== null && v !== undefined && v !== "")
      : [];

  return (
    <div className={`car-technical-specs ${className}`.trim()} style={{ ...style }}>
      {/* 6 Specifications prominently displayed at the beginning, one underneath another */}
      {sixSpecs.length > 0 && (
        <section
          aria-label={t("keySpecifications", { defaultValue: "Wichtigste Fahrzeugdaten" })}
          className="specs-prominent-stack"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginBottom: "var(--space-xl)",
          }}
        >
          {sixSpecs.map((spec) => (
            <div
              key={spec.id}
              className="spec-prominent-row"
              style={{
                backgroundColor: "var(--color-surface)",
                padding: "14px 20px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--space-md)",
                transition: "border-color var(--duration-fast) var(--ease-smooth)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--color-secondary)" }}>
                <Icon name={spec.icon} size={18} color="#D4AF37" />
                <span
                  style={{
                    fontSize: "var(--font-size-xs)",
                    textTransform: "uppercase",
                    letterSpacing: "var(--tracking-wider)",
                    color: "var(--color-text-subtle)",
                    fontWeight: 600,
                  }}
                >
                  {spec.label}
                </span>
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-base)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--color-text)",
                  fontVariantNumeric: "tabular-nums",
                  textAlign: "right",
                }}
              >
                {spec.value}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Comprehensive Technical Table */}
      {detailRows.length > 0 && (
        <div
          className="technical-data-section"
          style={{
            backgroundColor: "var(--color-card)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            padding: "var(--space-lg) var(--space-xl)",
            marginBottom: "var(--space-xl)",
          }}
        >
          <h3
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
            <Icon name="sliders" size={20} color="var(--color-secondary)" />
            <span>{t("technicalData")}</span>
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              columnGap: "var(--space-2xl)",
              rowGap: "var(--space-xs)",
            }}
          >
            {detailRows.map((row, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "var(--space-sm) 0",
                  borderBottom: "1px solid var(--color-border-subtle)",
                  fontSize: "var(--font-size-sm)",
                }}
              >
                <span style={{ color: "var(--color-text-muted)" }}>{row.label}</span>
                <span
                  style={{
                    color: "var(--color-text)",
                    fontWeight: "var(--font-weight-medium)",
                    textAlign: "right",
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optional Custom Fields Table */}
      {customEntries.length > 0 && (
        <div
          className="custom-fields-section"
          style={{
            backgroundColor: "var(--color-card)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            padding: "var(--space-lg) var(--space-xl)",
            marginBottom: "var(--space-xl)",
          }}
        >
          <h3
            style={{
              fontSize: "var(--font-size-base)",
              fontWeight: "var(--font-weight-semibold)",
              letterSpacing: "var(--tracking-tight)",
              marginBottom: "var(--space-md)",
              color: "var(--color-text)",
            }}
          >
            {t("customFieldsTitle")}
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              columnGap: "var(--space-2xl)",
              rowGap: "var(--space-xs)",
            }}
          >
            {customEntries.map(([key, val], idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "var(--space-sm) 0",
                  borderBottom: "1px solid var(--color-border-subtle)",
                  fontSize: "var(--font-size-sm)",
                }}
              >
                <span style={{ color: "var(--color-text-muted)" }}>{key}</span>
                <span style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-medium)" }}>
                  {typeof val === "boolean" ? (val ? t("yes") : t("no")) : String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CarTechnicalSpecs;
