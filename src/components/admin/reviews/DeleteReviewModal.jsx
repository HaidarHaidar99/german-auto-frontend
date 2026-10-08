import React from "react";
import { useTranslation } from "react-i18next";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Icon from "../../common/Icon";

/**
 * DeleteReviewModal — Themed confirmation modal for permanent review deletion.
 */
export function DeleteReviewModal({
  isOpen,
  review,
  loading = false,
  onConfirm,
  onClose,
}) {
  const { t } = useTranslation(["admin", "common"]);

  if (!review) return null;

  const reviewerName = review.name || t("anonymousCustomer", { defaultValue: "Customer" });

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !loading && onClose?.()}
      title={t("deleteReviewConfirmTitle", { defaultValue: "Delete Review?" })}
      size="sm"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        <p
          style={{
            margin: 0,
            fontSize: "var(--font-size-sm)",
            color: "var(--color-admin-muted, #64748b)",
            lineHeight: 1.6,
          }}
        >
          {t("deleteReviewConfirmMessage", {
            defaultValue: `Are you sure you want to permanently delete this review from "${reviewerName}"? This action cannot be undone.`,
            name: reviewerName,
          })}
        </p>

        {/* Review snippet card */}
        <div
          style={{
            padding: "12px 14px",
            backgroundColor: "rgba(239, 68, 68, 0.06)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "var(--radius-md, 8px)",
            fontSize: "var(--font-size-xs)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontWeight: 700, color: "var(--color-admin-text, #0f172a)" }}>
              {reviewerName}
            </span>
            <span style={{ display: "flex", alignItems: "center", color: "#f59e0b", gap: "2px", fontWeight: 700 }}>
              <Icon name="star" size={13} fill="#f59e0b" />
              {review.rating || 5} / 5
            </span>
          </div>
          {review.text && (
            <p
              style={{
                margin: 0,
                color: "var(--color-admin-muted, #64748b)",
                fontStyle: "italic",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.5,
              }}
            >
              "{review.text}"
            </p>
          )}
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
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Icon name="trash-2" size={14} />
            <span>{t("deleteReview", { defaultValue: "Delete Review" })}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteReviewModal;
