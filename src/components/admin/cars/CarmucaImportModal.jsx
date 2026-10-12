import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import Icon from "../../common/Icon";
import carsService from "../../../services/cars/cars.service";

export function CarmucaImportModal({
  isOpen,
  onClose,
  onImportSuccess,
  onOpenEditor,
}) {
  const { t } = useTranslation(["admin", "cars", "common"]);

  const [vehicleId, setVehicleId] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);

  const resetState = () => {
    setVehicleId("");
    setPreviewLoading(false);
    setImportLoading(false);
    setPreviewData(null);
    setImportResult(null);
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handlePreview = async (idToPreview) => {
    const targetId = (idToPreview || vehicleId).trim();
    if (!targetId) {
      setError("Please enter a Carmuca Vehicle ID or Stock Number.");
      return;
    }

    setPreviewLoading(true);
    setError(null);
    setImportResult(null);

    try {
      const res = await carsService.adminPreviewCarmucaImport(targetId);
      setPreviewData(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to generate preview.");
      setPreviewData(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleExecuteImport = async () => {
    const targetId = (previewData?.source?.externalId || vehicleId).trim();
    if (!targetId) return;

    setImportLoading(true);
    setError(null);

    try {
      const res = await carsService.adminExecuteImport(targetId);
      setImportResult(res.data);
      if (onImportSuccess) {
        onImportSuccess(res.data?.car);
      }
    } catch (err) {
      // Check if API client uses adminExecuteCarmucaImport
      setError(err?.response?.data?.message || err?.message || "Import failed.");
    } finally {
      setImportLoading(false);
    }
  };

  // Safe wrapper for execute
  const runImport = async () => {
    const targetId = (previewData?.source?.externalId || vehicleId).trim();
    if (!targetId) return;

    setImportLoading(true);
    setError(null);

    try {
      const res = await carsService.adminExecuteCarmucaImport(targetId);
      setImportResult(res.data);
      if (onImportSuccess) {
        onImportSuccess(res.data?.car);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Import failed.");
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Carmuca Vehicle Importer"
      size="xl"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Subtitle / Source info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "rgba(99, 102, 241, 0.08)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            borderRadius: "8px",
            fontSize: "13px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Icon name="link" size={16} style={{ color: "#6366f1" }} />
            <span>
              Source: <strong>Carmuca Public Catalog</strong> (Dealership:{" "}
              <code>koenigautomobilerheinberg</code>)
            </span>
          </div>
          <Badge variant="secondary" size="sm">Controlled 1-Vehicle Import</Badge>
        </div>

        {/* Input & Action section */}
        {!importResult && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-admin-text)" }}>
              Carmuca Vehicle UUID or Stock Number:
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                placeholder="e.g. 9649fe16-d4cd-46ab-b504-44204af14eac or FZ-1069"
                disabled={previewLoading || importLoading}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-admin-border, #cbd5e1)",
                  background: "var(--color-admin-surface, #ffffff)",
                  color: "var(--color-admin-text, #0f172a)",
                  fontSize: "14px",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePreview();
                }}
              />
              <Button
                variant="primary"
                onClick={() => handlePreview()}
                loading={previewLoading}
                disabled={!vehicleId.trim() || importLoading}
              >
                <Icon name="search" size={14} style={{ marginRight: "6px" }} />
                Preview (Dry Run)
              </Button>
            </div>

            {/* Quick probe helper */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--color-admin-muted, #64748b)" }}>
              <span>Quick test:</span>
              <button
                type="button"
                onClick={() => {
                  setVehicleId("9649fe16-d4cd-46ab-b504-44204af14eac");
                  handlePreview("9649fe16-d4cd-46ab-b504-44204af14eac");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#3b82f6",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                  fontSize: "12px",
                }}
              >
                Opel Astra (9649fe16... / FZ-1069)
              </button>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div
            role="alert"
            style={{
              padding: "12px 16px",
              borderRadius: "8px",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#dc2626",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Icon name="alert-circle" size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Success / Result View */}
        {importResult && (
          <div
            style={{
              padding: "20px",
              borderRadius: "10px",
              backgroundColor: importResult.already_imported ? "rgba(245, 158, 11, 0.08)" : "rgba(34, 197, 94, 0.08)",
              border: `1px solid ${importResult.already_imported ? "rgba(245, 158, 11, 0.3)" : "rgba(34, 197, 94, 0.3)"}`,
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Icon
                name={importResult.already_imported ? "alert-triangle" : "check-circle"}
                size={24}
                style={{ color: importResult.already_imported ? "#f59e0b" : "#22c55e" }}
              />
              <div>
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
                  {importResult.already_imported ? "Vehicle Already In Inventory" : "Import Successful"}
                </h4>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--color-admin-muted)" }}>
                  {importResult.message}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
                padding: "12px",
                background: "var(--color-admin-surface, #fff)",
                borderRadius: "8px",
                border: "1px solid var(--color-admin-border, #e2e8f0)",
                fontSize: "13px",
              }}
            >
              <div>
                <span style={{ color: "var(--color-admin-muted)" }}>Local Car ID:</span>
                <div style={{ fontWeight: 600, fontFamily: "monospace" }}>{importResult.car?.id}</div>
              </div>
              <div>
                <span style={{ color: "var(--color-admin-muted)" }}>Vehicle Title:</span>
                <div style={{ fontWeight: 600 }}>{importResult.car?.brand} {importResult.car?.title}</div>
              </div>
              <div>
                <span style={{ color: "var(--color-admin-muted)" }}>Draft Status:</span>
                <div>
                  <Badge variant="warning" size="sm">
                    {importResult.car?.status || "HIDDEN"} (Unpublished Draft)
                  </Badge>
                </div>
              </div>
              <div>
                <span style={{ color: "var(--color-admin-muted)" }}>Photos in Durable Storage:</span>
                <div style={{ fontWeight: 600 }}>
                  {Array.isArray(importResult.car?.media?.gallery) ? importResult.car.media.gallery.length : importResult.image_count || 0} photos
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <Button variant="secondary" onClick={handleClose}>
                Done
              </Button>
              {onOpenEditor && importResult.car && (
                <Button
                  variant="primary"
                  onClick={() => {
                    const carToEdit = importResult.car;
                    handleClose();
                    onOpenEditor(carToEdit);
                  }}
                >
                  <Icon name="edit" size={14} style={{ marginRight: "6px" }} />
                  Open in Car Editor
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Dry-Run Preview Panel */}
        {previewData && !importResult && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              border: "1px solid var(--color-admin-border, #e2e8f0)",
              borderRadius: "10px",
              padding: "18px",
              background: "var(--color-admin-surface, #f8fafc)",
            }}
          >
            {/* Dry Run banner */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "rgba(14, 165, 233, 0.1)",
                borderRadius: "6px",
                border: "1px solid rgba(14, 165, 233, 0.3)",
                fontSize: "12px",
                color: "#0369a1",
                fontWeight: 500,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Icon name="shield" size={14} />
                <span>DRY-RUN PREVIEW — Zero writes to database or media storage.</span>
              </div>
              {previewData.alreadyImported && (
                <Badge variant="warning" size="sm">Already Imported</Badge>
              )}
            </div>

            {/* Vehicle Header Card */}
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
              {previewData.sampleImageUrl && (
                <img
                  src={previewData.sampleImageUrl}
                  alt="Vehicle cover preview"
                  style={{
                    width: "140px",
                    height: "95px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Badge variant="secondary" size="sm">{previewData.proposedMapping?.brand}</Badge>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700 }}>
                    {previewData.proposedMapping?.title}
                  </h3>
                </div>

                <div style={{ marginTop: "6px", fontSize: "16px", fontWeight: 700, color: "var(--color-admin-text)" }}>
                  € {previewData.proposedMapping?.price ? Number(previewData.proposedMapping.price).toLocaleString("de-DE") : "N/A"}
                  <span style={{ fontSize: "12px", fontWeight: 400, marginLeft: "8px", color: "var(--color-admin-muted)" }}>
                    {previewData.metadataPreview?.vat_eligible === true ? "19% MwSt. ausweisbar" : "MwSt. nicht ausweisbar (Differenzbesteuerung)"}
                  </span>
                </div>

                <div style={{ marginTop: "6px", display: "flex", gap: "8px", alignItems: "center" }}>
                  <Badge variant="neutral" size="sm">
                    Draft Status: HIDDEN (excluded from public listings)
                  </Badge>
                  <Badge variant="secondary" size="sm">
                    {previewData.imageCount} photos will be copied
                  </Badge>
                </div>
              </div>
            </div>

            {/* Field Mapping Grid */}
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-admin-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
                Proposed Field Mapping
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: "8px",
                  fontSize: "12px",
                }}
              >
                <div style={{ padding: "6px 10px", background: "#fff", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <span style={{ color: "#64748b" }}>Condition: </span>
                  <strong>{previewData.proposedMapping?.condition || "N/A"}</strong>
                </div>
                <div style={{ padding: "6px 10px", background: "#fff", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <span style={{ color: "#64748b" }}>Fuel: </span>
                  <strong>{previewData.proposedMapping?.fuel_type || "N/A"}</strong>
                </div>
                <div style={{ padding: "6px 10px", background: "#fff", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <span style={{ color: "#64748b" }}>Transmission: </span>
                  <strong>{previewData.proposedMapping?.transmission || "N/A"}</strong>
                </div>
                <div style={{ padding: "6px 10px", background: "#fff", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <span style={{ color: "#64748b" }}>Mileage: </span>
                  <strong>{previewData.proposedMapping?.mileage_km ? `${previewData.proposedMapping.mileage_km.toLocaleString()} km` : "N/A"}</strong>
                </div>
                <div style={{ padding: "6px 10px", background: "#fff", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <span style={{ color: "#64748b" }}>Power: </span>
                  <strong>{previewData.proposedMapping?.performance_hp ? `${previewData.proposedMapping.performance_hp} HP` : "N/A"}</strong>
                </div>
                <div style={{ padding: "6px 10px", background: "#fff", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <span style={{ color: "#64748b" }}>Displacement: </span>
                  <strong>{previewData.proposedMapping?.engine_displacement_cc ? `${previewData.proposedMapping.engine_displacement_cc} ccm` : "N/A"}</strong>
                </div>
                <div style={{ padding: "6px 10px", background: "#fff", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <span style={{ color: "#64748b" }}>Registration: </span>
                  <strong>{previewData.proposedMapping?.first_registration || "N/A"}</strong>
                </div>
                <div style={{ padding: "6px 10px", background: "#fff", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <span style={{ color: "#64748b" }}>Owners: </span>
                  <strong>{previewData.proposedMapping?.vehicle_owners ?? "N/A"}</strong>
                </div>
              </div>
            </div>

            {/* Equipment Preview */}
            {Array.isArray(previewData.proposedMapping?.equipment) && previewData.proposedMapping.equipment.length > 0 && (
              <div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-admin-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                  Extracted Equipment ({previewData.proposedMapping.equipment.length} items)
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {previewData.proposedMapping.equipment.map((item, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        backgroundColor: "rgba(99, 102, 241, 0.08)",
                        border: "1px solid rgba(99, 102, 241, 0.2)",
                        fontSize: "11px",
                        color: "#4f46e5",
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Fields list (No fabricated specs) */}
            {Array.isArray(previewData.missingFields) && previewData.missingFields.length > 0 && (
              <div style={{ padding: "8px 12px", background: "#fff", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "12px" }}>
                <span style={{ color: "var(--color-admin-muted)" }}>Missing in source data (will not be fabricated): </span>
                <span style={{ color: "#64748b" }}>
                  {previewData.missingFields.join(", ")}
                </span>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
              <Button variant="secondary" onClick={handleClose} disabled={importLoading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={runImport}
                loading={importLoading}
                disabled={previewLoading}
              >
                <Icon name="download" size={14} style={{ marginRight: "6px" }} />
                {previewData.alreadyImported ? "Confirm (Safe Duplicate Check)" : "Import Vehicle Now"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default CarmucaImportModal;
