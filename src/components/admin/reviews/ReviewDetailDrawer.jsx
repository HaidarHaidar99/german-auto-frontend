import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Drawer from "../../ui/Drawer";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import Icon from "../../common/Icon";

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
  const currentLang = i18n.language || "en";

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
          label: t("statusPublished", { defaultValue: "Published" }),
          variant: "success",
          icon: "check-circle",
          color: "#16a34a",
          bg: "rgba(34, 197, 94, 0.12)",
          border: "rgba(34, 197, 94, 0.3)",
        };
      case "PENDING":
        return {
          label: t("statusPending", { defaultValue: "Pending" }),
          variant: "warning",
          icon: "clock",
          color: "#d97706",
          bg: "rgba(245, 158, 11, 0.12)",
          border: "rgba(245, 158, 11, 0.3)",
        };
      case "HIDDEN":
        return {
          label: t("statusHidden", { defaultValue: "Hidden" }),
          variant: "secondary",
          icon: "eye-off",
          color: "#0891b2",
          bg: "rgba(6, 182, 212, 0.12)",
          border: "rgba(6, 182, 212, 0.3)",
        };
      case "DELETED":
        return {
          label: t("statusDeleted", { defaultValue: "Deleted" }),
          variant: "outline",
          icon: "trash",
          color: "#dc2626",
          bg: "rgba(239, 68, 68, 0.12)",
          border: "rgba(239, 68, 68, 0.3)",
        };
      default:
        return {
          label: status,
          variant: "neutral",
          icon: "info",
          color: "var(--color-admin-text, #0f172a)",
          bg: "var(--color-admin-accent-subtle, rgba(0, 0, 0, 0.04))",
          border: "var(--color-admin-border, #e2e8f0)",
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
            color: i <= r ? "#f59e0b" : "var(--color-admin-border, #cbd5e1)",
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
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={t("reviewDetails", { defaultValue: "Review Details" })}
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
          {/* Delete Trigger */}
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
                  <span>{t("deleteReview", { defaultValue: "Delete" })}</span>
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
                    {t("confirmDelete", { defaultValue: "Delete permanently" })}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    style={{ fontSize: "11px" }}
                  >
                    {t("cancel", { defaultValue: "Cancel" })}
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
                <span>{t("publishReview", { defaultValue: "Publish" })}</span>
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
                <span>{t("hideReview", { defaultValue: "Hide" })}</span>
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
                <span>{t("publishReview", { defaultValue: "Publish" })}</span>
              </Button>
            )}

            <Button variant="secondary" size="sm" onClick={onClose} style={{ fontSize: "12px" }}>
              {t("close", { defaultValue: "Close" })}
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
              <div style={{ fontSize: "11px", color: "var(--color-admin-muted, #64748b)", marginTop: "1px" }}>
                {isPublished
                  ? t("publicVisibilityActive", { defaultValue: "Publicly visible on website" })
                  : t("publicVisibilityInactive", { defaultValue: "Not publicly visible" })}
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
            backgroundColor: "var(--color-admin-card, #ffffff)",
            border: "1px solid var(--color-admin-border, #e2e8f0)",
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
                  color: "var(--color-admin-muted, #64748b)",
                }}
              >
                {t("columns.author", { defaultValue: "Author" })}
              </span>
              <div
                style={{
                  fontSize: "var(--font-size-base, 16px)",
                  fontWeight: 700,
                  color: "var(--color-admin-text, #0f172a)",
                  marginTop: "2px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>{review.name || "—"}</span>
                {review.user_id && (
                  <span
                    title={t("userAccount", { defaultValue: "Linked Customer Account" })}
                    style={{
                      fontSize: "10px",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      backgroundColor: "var(--color-admin-accent-subtle, #e0f2fe)",
                      color: "var(--color-admin-accent, #0284c7)",
                      fontWeight: 600,
                    }}
                  >
                    User
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
                  color: "var(--color-admin-muted, #64748b)",
                }}
              >
                {t("columns.rating", { defaultValue: "Rating" })}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                <div>{renderStars(review.rating)}</div>
                <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-admin-text, #0f172a)" }}>
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
              color: "var(--color-admin-muted, #64748b)",
              paddingTop: "10px",
              borderTop: "1px solid var(--color-admin-border, #e2e8f0)",
              flexWrap: "wrap",
            }}
          >
            <div>
              <span>{t("columns.date", { defaultValue: "Date" })}: </span>
              <span style={{ color: "var(--color-admin-text, #0f172a)", fontWeight: 500 }}>{formatDate(review.created_at)}</span>
            </div>
            {review.updated_at && review.updated_at !== review.created_at && (
              <div>
                <span>{t("updatedShort", { defaultValue: "Updated" })}: </span>
                <span style={{ color: "var(--color-admin-text, #0f172a)", fontWeight: 500 }}>{formatDate(review.updated_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Review Text Card */}
        <div
          style={{
            padding: "16px",
            backgroundColor: "var(--color-admin-card, #ffffff)",
            border: "1px solid var(--color-admin-border, #e2e8f0)",
            borderRadius: "var(--radius-md, 8px)",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--color-admin-muted, #64748b)",
              display: "block",
              marginBottom: "8px",
            }}
          >
            {t("reviewText", { defaultValue: "Review Content" })}
          </span>
          <p
            style={{
              margin: 0,
              fontSize: "var(--font-size-sm, 14px)",
              color: "var(--color-admin-text, #0f172a)",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {review.text || "—"}
          </p>
        </div>
      </div>
    </Drawer>
  );
}

export default ReviewDetailDrawer;
