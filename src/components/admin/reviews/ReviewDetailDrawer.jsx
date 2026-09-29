import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Drawer from "../../ui/Drawer";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import Icon from "../../common/Icon";
import ReviewImageModal from "./ReviewImageModal";

export function ReviewDetailDrawer({
  isOpen,
  review = null,
  onClose,
  onPublish,
  onHide,
  onDelete,
  updatingId = null,
}) {
  const { t, i18n } = useTranslation(["admin", "common"]);
  const currentLang = i18n.language || "de";

  const [previewImage, setPreviewImage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!review) return null;

  const isUpdating = updatingId === review.id;
  const isPublished = review.status === "PUBLISHED";
  const isHidden = review.status === "HIDDEN";
  const isDeleted = review.status === "DELETED";

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString(currentLang === "de" ? "de-DE" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PUBLISHED":
        return {
          label: t("statusPublished", { defaultValue: "Veröffentlicht" }),
          variant: "success",
          icon: "check-circle",
          color: "#4ade80",
          bg: "rgba(34, 197, 94, 0.12)",
          border: "rgba(34, 197, 94, 0.3)",
        };
      case "PENDING":
        return {
          label: t("statusPending", { defaultValue: "Ausstehend" }),
          variant: "warning",
          icon: "clock",
          color: "#fbbf24",
          bg: "rgba(245, 158, 11, 0.12)",
          border: "rgba(245, 158, 11, 0.3)",
        };
      case "HIDDEN":
        return {
          label: t("statusHidden", { defaultValue: "Ausgeblendet" }),
          variant: "secondary",
          icon: "eye-off",
          color: "#22d3ee",
          bg: "rgba(6, 182, 212, 0.12)",
          border: "rgba(6, 182, 212, 0.3)",
        };
      case "DELETED":
        return {
          label: t("statusDeleted", { defaultValue: "Gelöscht" }),
          variant: "outline",
          icon: "trash",
          color: "#94a3b8",
          bg: "rgba(148, 163, 184, 0.12)",
          border: "rgba(148, 163, 184, 0.3)",
        };
      default:
        return {
          label: status,
          variant: "neutral",
          icon: "info",
          color: "#e2e8f0",
          bg: "rgba(255, 255, 255, 0.08)",
          border: "rgba(255, 255, 255, 0.15)",
        };
    }
  };

  const statusCfg = getStatusBadge(review.status);

  const renderStars = (rating) => {
    const stars = [];
    const r = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          style={{
            color: i <= r ? "var(--color-primary, var(--color-text))" : "rgba(255, 255, 255, 0.15)",
            fontSize: "18px",
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const handlePublishClick = async () => {
    if (isUpdating) return;
    await onPublish?.(review.id);
  };

  const handleHideClick = async () => {
    if (isUpdating) return;
    await onHide?.(review.id);
  };

  const handleDeleteClick = async () => {
    if (isUpdating) return;
    await onDelete?.(review);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={t("reviewDetails", { defaultValue: "Rezensionsdetails" })}
        size="md"
        footer={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              flexWrap: "wrap",
              gap: "var(--space-sm, 12px)",
            }}
          >
            {/* Soft Delete Trigger */}
            {!isDeleted && (
              <div>
                {!showDeleteConfirm ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isUpdating}
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                      color: "var(--color-error, #ef4444)",
                      fontSize: "12px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Icon name="trash" size={14} />
                    <span>{t("deleteReview", { defaultValue: "Löschen" })}</span>
                  </Button>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isUpdating}
                      onClick={handleDeleteClick}
                      style={{
                        backgroundColor: "var(--color-error, #ef4444)",
                        borderColor: "var(--color-error, #ef4444)",
                        fontSize: "11px",
                      }}
                    >
                      {t("confirmReset", { defaultValue: "Endgültig löschen" })}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      style={{ fontSize: "11px" }}
                    >
                      {t("cancel", { defaultValue: "Abbrechen" })}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Moderation Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
              {!isPublished && !isDeleted && (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isUpdating}
                  onClick={handlePublishClick}
                  style={{
                    backgroundColor: "rgba(34, 197, 94, 0.9)",
                    borderColor: "rgba(34, 197, 94, 1)",
                    color: "#ffffff",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                  }}
                >
                  <Icon name="check" size={14} />
                  <span>{t("publishReview", { defaultValue: "Veröffentlichen" })}</span>
                </Button>
              )}

              {isPublished && (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isUpdating}
                  onClick={handleHideClick}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                  }}
                >
                  <Icon name="eye-off" size={14} />
                  <span>{t("hideReview", { defaultValue: "Ausblenden" })}</span>
                </Button>
              )}

              {isHidden && (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isUpdating}
                  onClick={handlePublishClick}
                  style={{
                    backgroundColor: "rgba(34, 197, 94, 0.9)",
                    borderColor: "rgba(34, 197, 94, 1)",
                    color: "#ffffff",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                  }}
                >
                  <Icon name="check" size={14} />
                  <span>{t("publishReview", { defaultValue: "Wieder veröffentlichen" })}</span>
                </Button>
              )}

              <Button variant="secondary" size="sm" onClick={onClose} style={{ fontSize: "12px" }}>
                {t("close", { defaultValue: "Schließen" })}
              </Button>
            </div>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg, 20px)" }}>
          {/* Header Card: Status & Visibility Banner */}
          <div
            style={{
              padding: "14px 16px",
              backgroundColor: statusCfg.bg,
              border: `1px solid ${statusCfg.border}`,
              borderRadius: "var(--radius-md, 8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon name={statusCfg.icon} size={18} style={{ color: statusCfg.color }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: "13px", color: statusCfg.color }}>
                  {statusCfg.label}
                </div>
                <div style={{ fontSize: "11px", color: "var(--color-admin-muted, #94a3b8)", marginTop: "1px" }}>
                  {isPublished
                    ? t("publicVisibilityActive", { defaultValue: "Öffentlich auf der Website sichtbar" })
                    : t("publicVisibilityInactive", { defaultValue: "Nicht öffentlich sichtbar" })}
                </div>
              </div>
            </div>

            <Badge variant={statusCfg.variant} size="sm">
              {review.status}
            </Badge>
          </div>

          {/* Author & Rating Card */}
          <div
            style={{
              padding: "16px",
              backgroundColor: "var(--color-admin-card, #121418)",
              border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
              borderRadius: "var(--radius-md, 8px)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--color-admin-muted, #94a3b8)",
                  }}
                >
                  {t("columns.author", { defaultValue: "Verfasser" })}
                </span>
                <div
                  style={{
                    fontSize: "var(--font-size-base, 16px)",
                    fontWeight: 700,
                    color: "var(--color-admin-text, #ffffff)",
                    marginTop: "2px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>{review.name || "—"}</span>
                  {review.user_id && (
                    <span
                      title={t("userAccount", { defaultValue: "Verknüpftes Kundenkonto" })}
                      style={{
                        fontSize: "10px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        color: "var(--color-primary, var(--color-text))",
                        fontWeight: 600,
                      }}
                    >
                      Kundenkonto
                    </span>
                  )}
                </div>
              </div>

              {/* Stars & numeric rating */}
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--color-admin-muted, #94a3b8)",
                  }}
                >
                  {t("columns.rating", { defaultValue: "Bewertung" })}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                  <div>{renderStars(review.rating)}</div>
                  <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-primary, var(--color-text))" }}>
                    ({review.rating}/5)
                  </span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div
              style={{
                display: "flex",
                gap: "16px",
                fontSize: "11px",
                color: "var(--color-admin-muted, #94a3b8)",
                paddingTop: "10px",
                borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                flexWrap: "wrap",
              }}
            >
              <div>
                <span>{t("columns.date", { defaultValue: "Eingangsdatum" })}: </span>
                <span style={{ color: "#ffffff" }}>{formatDate(review.created_at)}</span>
              </div>
              {review.updated_at && review.updated_at !== review.created_at && (
                <div>
                  <span>{t("updatedShort", { defaultValue: "Aktualisiert" })}: </span>
                  <span style={{ color: "#ffffff" }}>{formatDate(review.updated_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Review Text Card */}
          <div
            style={{
              padding: "16px",
              backgroundColor: "var(--color-admin-card, #121418)",
              border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
              borderRadius: "var(--radius-md, 8px)",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--color-admin-muted, #94a3b8)",
                display: "block",
                marginBottom: "8px",
              }}
            >
              {t("reviewText", { defaultValue: "Erfahrungsbericht" })}
            </span>
            <p
              style={{
                margin: 0,
                fontSize: "var(--font-size-sm, 14px)",
                color: "var(--color-admin-text, #e2e8f0)",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}
            >
              {review.text || "—"}
            </p>
          </div>

          {/* Attached Photo Section */}
          <div
            style={{
              padding: "16px",
              backgroundColor: "var(--color-admin-card, #121418)",
              border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
              borderRadius: "var(--radius-md, 8px)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--color-admin-muted, #94a3b8)",
                }}
              >
                {t("attachedPhoto", { defaultValue: "Eingereichtes Foto" })}
              </span>

              {review.image_url && (
                <a
                  href={review.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "11px",
                    color: "var(--color-primary, var(--color-text))",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Icon name="external-link" size={12} />
                  <span>{t("openInNewTab", { defaultValue: "In neuem Tab öffnen" })}</span>
                </a>
              )}
            </div>

            {review.image_url ? (
              <div
                style={{
                  position: "relative",
                  borderRadius: "var(--radius-sm, 6px)",
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backgroundColor: "#000000",
                  cursor: "pointer",
                  maxHeight: "260px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => setPreviewImage(true)}
              >
                <img
                  src={review.image_url}
                  alt={review.name || "Customer review"}
                  style={{
                    width: "100%",
                    maxHeight: "260px",
                    objectFit: "contain",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.02)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "8px",
                    padding: "4px 8px",
                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                    backdropFilter: "blur(4px)",
                    borderRadius: "4px",
                    fontSize: "11px",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Icon name="maximize" size={12} />
                  <span>{t("clickToEnlarge", { defaultValue: "Klicken zum Vergrößern" })}</span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "16px",
                  textAlign: "center",
                  fontSize: "12px",
                  color: "var(--color-admin-muted, #94a3b8)",
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  borderRadius: "var(--radius-sm, 4px)",
                }}
              >
                {t("noPhotoAttached", { defaultValue: "Kein Foto zu dieser Rezension hinterlegt" })}
              </div>
            )}
          </div>
        </div>
      </Drawer>

      {/* Image Lightbox Modal */}
      {review.image_url && (
        <ReviewImageModal
          isOpen={previewImage}
          imageUrl={review.image_url}
          reviewerName={review.name}
          onClose={() => setPreviewImage(false)}
        />
      )}
    </>
  );
}

export default ReviewDetailDrawer;
