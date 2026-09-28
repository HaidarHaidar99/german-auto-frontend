import React from "react";
import { useTranslation } from "react-i18next";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Icon from "../../common/Icon";

export function ReviewImageModal({
  isOpen,
  imageUrl,
  reviewerName,
  onClose,
}) {
  const { t } = useTranslation(["admin", "common"]);

  if (!isOpen || !imageUrl) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={reviewerName ? `${t("attachedPhoto", { defaultValue: "Eingereichtes Foto" })} — ${reviewerName}` : t("attachedPhoto", { defaultValue: "Eingereichtes Foto" })}
      size="lg"
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--color-primary, #C5A059)",
              fontSize: "var(--font-size-xs, 12px)",
              textDecoration: "none",
            }}
          >
            <Icon name="external-link" size={14} />
            <span>{t("openInNewTab", { defaultValue: "In neuem Tab öffnen" })}</span>
          </a>

          <Button variant="secondary" size="sm" onClick={onClose}>
            {t("close", { defaultValue: "Schließen" })}
          </Button>
        </div>
      }
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "300px",
          maxHeight: "75vh",
          backgroundColor: "#000000",
          borderRadius: "var(--radius-sm, 4px)",
          overflow: "hidden",
        }}
      >
        <img
          src={imageUrl}
          alt={reviewerName || "Review attachment"}
          style={{
            maxWidth: "100%",
            maxHeight: "70vh",
            objectFit: "contain",
          }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
    </Modal>
  );
}

export default ReviewImageModal;
