import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import Icon from "../../common/Icon";

const STATUS_CONFIG = {
  AVAILABLE: {
    labelKey: "statusAvailable",
    defaultLabel: "Available",
    badgeVariant: "success",
    color: "#22c55e",
    descriptionKey: "statusAvailableDesc",
    defaultDesc: "The vehicle is actively visible in the showroom and available for purchase.",
  },
  RESERVED: {
    labelKey: "statusReserved",
    defaultLabel: "Reserved",
    badgeVariant: "secondary",
    color: "var(--color-text)",
    descriptionKey: "statusReservedDesc",
    defaultDesc: "The vehicle is reserved for an interested customer.",
  },
  SOLD: {
    labelKey: "statusSold",
    defaultLabel: "Sold",
    badgeVariant: "neutral",
    color: "#94a3b8",
    descriptionKey: "statusSoldDesc",
    defaultDesc: "The vehicle has been successfully sold.",
  },
  HIDDEN: {
    labelKey: "statusHidden",
    defaultLabel: "Hidden",
    badgeVariant: "warning",
    color: "#ef4444",
    descriptionKey: "statusHiddenDesc",
    defaultDesc: "The vehicle is completely hidden from the public showroom and only visible to administrators.",
  },
};

export function CarStatusModal({
  isOpen,
  car,
  loading = false,
  onConfirm,
  onClose,
}) {
  const { t } = useTranslation(["admin", "common"]);
  const [selectedStatus, setSelectedStatus] = useState(car?.status || "AVAILABLE");
  const [prevCarId, setPrevCarId] = useState(car?.id);

  if (car?.id !== prevCarId) {
    setPrevCarId(car?.id);
    setSelectedStatus(car?.status || "AVAILABLE");
  }

  if (!car) return null;

  const vehicleName = car.title || `${car.brand || ""} ${car.model || ""}`.trim() || t("vehicle", { defaultValue: "Vehicle" });
  const currentStatus = car.status || "AVAILABLE";
  const isChanged = selectedStatus !== currentStatus;

  const handleConfirm = () => {
    if (isChanged && onConfirm) {
      onConfirm(car.id, selectedStatus);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !loading && onClose?.()}
      title={t("changeVehicleStatusTitle", { defaultValue: "Change Vehicle Status" })}
      size="md"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        {/* Vehicle Header */}
        <div
          style={{
            padding: "var(--space-sm) var(--space-md)",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            border: "1px solid var(--color-admin-border)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: "var(--font-size-sm)", color: "var(--color-admin-text, #0f172a)" }}>
              {vehicleName}
            </div>
            <div style={{ fontSize: "var(--font-size-2xs)", color: "var(--color-admin-muted)" }}>
              {car.brand} • {car.model}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "var(--font-size-2xs)", color: "var(--color-admin-muted)" }}>
              {t("currentStatus", { defaultValue: "Current" })}:
            </span>
            <Badge variant={STATUS_CONFIG[currentStatus]?.badgeVariant || "neutral"} size="sm">
              {t(STATUS_CONFIG[currentStatus]?.labelKey, { defaultValue: STATUS_CONFIG[currentStatus]?.defaultLabel || currentStatus })}
            </Badge>
          </div>
        </div>

        {/* Status Option Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
          {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => {
            const isSelected = selectedStatus === statusKey;
            const isCurrent = currentStatus === statusKey;

            return (
              <div
                key={statusKey}
                onClick={() => setSelectedStatus(statusKey)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "var(--space-sm)",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${isSelected ? "var(--color-admin-accent)" : "var(--color-admin-border)"}`,
                  backgroundColor: isSelected ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.015)",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
              >
                <input
                  type="radio"
                  name="car-status"
                  value={statusKey}
                  checked={isSelected}
                  onChange={() => setSelectedStatus(statusKey)}
                  style={{ marginTop: "3px", accentColor: "var(--color-admin-accent)" }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", marginBottom: "2px" }}>
                    <span style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: "var(--color-admin-text, #0f172a)" }}>
                      {t(config.labelKey, { defaultValue: config.defaultLabel })}
                    </span>
                    {isCurrent && (
                      <Badge variant="outline" size="sm" style={{ fontSize: "10px" }}>
                        {t("current", { defaultValue: "Current" })}
                      </Badge>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-admin-muted)", lineHeight: 1.4 }}>
                    {t(config.descriptionKey, { defaultValue: config.defaultDesc })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Warning if setting to HIDDEN or SOLD */}
        {(selectedStatus === "HIDDEN" || selectedStatus === "SOLD") && isChanged && (
          <div
            style={{
              padding: "var(--space-xs) var(--space-sm)",
              backgroundColor: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-xs)",
              fontSize: "var(--font-size-xs)",
              color: "#f59e0b",
            }}
          >
            <Icon name="alert-circle" size={16} />
            <span>
              {selectedStatus === "HIDDEN"
                ? t("statusHiddenWarning", { defaultValue: "Hidden vehicles are not visible in the public catalog." })
                : t("statusSoldWarning", { defaultValue: "Vehicles marked as sold may still appear in the archive." })}
            </span>
          </div>
        )}

        {/* Footer Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "var(--space-sm)",
            marginTop: "var(--space-xs)",
          }}
        >
          <Button variant="outline" size="sm" disabled={loading} onClick={onClose}>
            {t("cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={loading}
            disabled={!isChanged || loading}
            onClick={handleConfirm}
          >
            {t("saveStatus", { defaultValue: "Save Status" })}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default CarStatusModal;
