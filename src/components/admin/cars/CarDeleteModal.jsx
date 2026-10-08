import React from "react";
import { useTranslation } from "react-i18next";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";

/**
 * CarDeleteModal — Strong confirmation modal for vehicle deletion.
 */
export function CarDeleteModal({
  isOpen,
  car,
  loading = false,
  onConfirm,
  onClose,
}) {
  const { t } = useTranslation(["admin", "common"]);

  if (!car) return null;

  const vehicleName = car.title || `${car.brand || ""} ${car.model || ""}`.trim() || t("vehicle", { defaultValue: "Vehicle" });
  const formattedPrice = car.price != null
    ? new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(car.price)
    : "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !loading && onClose?.()}
      title={t("deleteVehicleConfirmTitle", { defaultValue: "Permanently delete vehicle?" })}
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
          {t("deleteVehicleConfirmMessage", {
            defaultValue: `Are you sure you want to delete vehicle "${vehicleName}"? This permanently removes the record and all associated data from the database.`,
            name: vehicleName,
          })}
        </p>

        {/* Selected Vehicle Summary Box */}
        <div
          style={{
            padding: "var(--space-sm) var(--space-md)",
            backgroundColor: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "var(--radius-sm, 6px)",
            fontSize: "var(--font-size-xs)",
          }}
        >
          <div style={{ fontWeight: 600, color: "var(--color-admin-text, #0f172a)", marginBottom: "2px" }}>
            {vehicleName}
          </div>
          <div style={{ color: "var(--color-admin-muted)" }}>
            {car.brand} • {car.model} {formattedPrice ? `• ${formattedPrice}` : ""}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "var(--space-sm)",
            marginTop: "var(--space-sm)",
          }}
        >
          <Button variant="outline" size="sm" disabled={loading} onClick={onClose}>
            {t("cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            loading={loading}
            onClick={onConfirm}
          >
            {t("deleteVehicle", { defaultValue: "Delete Vehicle" })}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default CarDeleteModal;
