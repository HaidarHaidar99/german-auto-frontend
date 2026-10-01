import React from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Icon from "../../common/Icon";

export function FormImageModal({
  isOpen,
  image = null, // { path, public_url, name, size } or string url
  onClose,
}) {
  if (!isOpen || !image) return null;

  const url = typeof image === "string" ? image : image.public_url || image.url || "";
  const name = typeof image === "object" && image.name ? image.name : "Fahrzeugfoto";
  const formattedSize = typeof image === "object" && image.size
    ? `${(image.size / (1024 * 1024)).toFixed(2)} MB`
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={name}
      size="xl"
      closeOnBackdropClick={true}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)", alignItems: "center" }}>
        <div
          style={{
            width: "100%",
            maxHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000",
            borderRadius: "var(--radius-md, 8px)",
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <img
            src={url}
            alt={name}
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: "var(--space-xs)",
          }}
        >
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-admin-muted)" }}>
            {name} {formattedSize ? `• ${formattedSize}` : ""}
          </div>

          <div style={{ display: "flex", gap: "var(--space-xs)" }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
            >
              <Icon name="external-link" size={14} style={{ marginRight: "6px" }} />
              In neuem Tab öffnen
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              Schließen
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default FormImageModal;
