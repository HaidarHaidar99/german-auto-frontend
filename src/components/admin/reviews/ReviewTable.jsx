import React from "react";
import { useTranslation } from "react-i18next";
import Badge from "../../ui/Badge";
import IconButton from "../../ui/IconButton";
import Icon from "../../common/Icon";
import Button from "../../ui/Button";

export function ReviewTable({
  reviews = [],
  onViewDetail,
  onPublish,
  onHide,
  onDelete,
  updatingId = null,
  className = "",
  style = {},
}) {
  const { t, i18n } = useTranslation(["admin", "common"]);
  const currentLang = i18n.language || "en";

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

  const getStatusColor = (status) => {
    switch (status) {
      case "PUBLISHED":
        return {
          color: "#16a34a",
          bg: "rgba(34, 197, 94, 0.12)",
          border: "rgba(34, 197, 94, 0.3)",
          label: t("statusPublished", { defaultValue: "Published" }),
        };
      case "PENDING":
        return {
          color: "#d97706",
          bg: "rgba(245, 158, 11, 0.12)",
          border: "rgba(245, 158, 11, 0.3)",
          label: t("statusPending", { defaultValue: "Pending" }),
        };
      case "HIDDEN":
        return {
          color: "#0891b2",
          bg: "rgba(6, 182, 212, 0.12)",
          border: "rgba(6, 182, 212, 0.3)",
          label: t("statusHidden", { defaultValue: "Hidden" }),
        };
      case "DELETED":
        return {
          color: "#dc2626",
          bg: "rgba(239, 68, 68, 0.12)",
          border: "rgba(239, 68, 68, 0.3)",
          label: t("statusDeleted", { defaultValue: "Deleted" }),
        };
      default:
        return {
          color: "var(--color-admin-text, #0f172a)",
          bg: "var(--color-admin-accent-subtle, rgba(0, 0, 0, 0.04))",
          border: "var(--color-admin-border, #e2e8f0)",
          label: status,
        };
    }
  };

  const renderStars = (rating) => {
    const r = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            style={{
              color: i <= r ? "#f59e0b" : "var(--color-admin-border, #cbd5e1)",
              fontSize: "14px",
            }}
          >
            ★
          </span>
        ))}
        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-admin-text, #0f172a)", marginLeft: "4px" }}>
          ({r})
        </span>
      </div>
    );
  };

  return (
    <div className={`review-table-wrapper ${className}`.trim()} style={{ width: "100%", ...style }}>
      {/* Desktop Table View (>= 1024px) */}
      <div
        className="review-desktop-table-container"
        style={{
          width: "100%",
          overflowX: "auto",
          backgroundColor: "var(--color-admin-card, #ffffff)",
          borderRadius: "var(--radius-md, 8px)",
          border: "1px solid var(--color-admin-border, #e2e8f0)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "var(--font-size-xs, 12px)",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--color-admin-border, #e2e8f0)",
                backgroundColor: "var(--color-admin-border-subtle, #f8fafc)",
                color: "var(--color-admin-muted, #64748b)",
                textTransform: "uppercase",
                fontSize: "11px",
                letterSpacing: "0.06em",
              }}
            >
              <th style={{ padding: "12px 16px", minWidth: "160px" }}>{t("columns.author", { defaultValue: "Author" })}</th>
              <th style={{ padding: "12px 16px", width: "140px" }}>{t("columns.rating", { defaultValue: "Rating" })}</th>
              <th style={{ padding: "12px 16px", minWidth: "280px" }}>{t("reviewText", { defaultValue: "Review Content" })}</th>
              <th style={{ padding: "12px 16px", width: "160px" }}>{t("columns.status", { defaultValue: "Status" })}</th>
              <th style={{ padding: "12px 16px", width: "150px" }}>{t("columns.date", { defaultValue: "Date" })}</th>
              <th style={{ padding: "12px 16px", textAlign: "right", width: "150px" }}>{t("actions", { defaultValue: "Actions" })}</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((rev) => {
              const statusCfg = getStatusColor(rev.status);
              const isUpdatingThis = updatingId === rev.id;
              const isPublished = rev.status === "PUBLISHED";
              const isHidden = rev.status === "HIDDEN";
              const isDeleted = rev.status === "DELETED";

              return (
                <tr
                  key={rev.id}
                  style={{
                    borderBottom: "1px solid var(--color-admin-border, #e2e8f0)",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-admin-accent-subtle, #f1f5f9)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {/* Author Name */}
                  <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => onViewDetail?.(rev)}
                      onKeyDown={(e) => e.key === "Enter" && onViewDetail?.(rev)}
                      style={{
                        fontWeight: 600,
                        color: "var(--color-admin-text, #0f172a)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      title={t("viewFullReview", { defaultValue: "View Review Details" })}
                    >
                      <span>{rev.name || "—"}</span>
                      {rev.user_id && (
                        <span
                          title={t("userAccount", { defaultValue: "Linked Customer Account" })}
                          style={{
                            fontSize: "10px",
                            padding: "1px 4px",
                            borderRadius: "3px",
                            backgroundColor: "var(--color-admin-accent-subtle, #e0f2fe)",
                            color: "var(--color-admin-accent, #0284c7)",
                            fontWeight: 600,
                          }}
                        >
                          User
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Rating */}
                  <td style={{ padding: "12px 16px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                    {renderStars(rev.rating)}
                  </td>

                  {/* Text Preview */}
                  <td style={{ padding: "12px 16px", verticalAlign: "middle", maxWidth: "340px" }}>
                    <p
                      style={{
                        margin: 0,
                        color: "var(--color-admin-text, #334155)",
                        fontSize: "12px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "340px",
                        cursor: "pointer",
                      }}
                      onClick={() => onViewDetail?.(rev)}
                      title={rev.text || ""}
                    >
                      {rev.text || "—"}
                    </p>
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                    <div style={{ display: "inline-flex", flexDirection: "column", gap: "2px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "var(--radius-sm, 4px)",
                          backgroundColor: statusCfg.bg,
                          color: statusCfg.color,
                          border: `1px solid ${statusCfg.border}`,
                          display: "inline-block",
                          width: "fit-content",
                        }}
                      >
                        {statusCfg.label}
                      </span>
                      {isPublished && (
                        <span style={{ fontSize: "10px", color: "#16a34a", fontWeight: 500 }}>
                          ● {t("publicVisibilityActive", { defaultValue: "Publicly visible" })}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Date */}
                  <td style={{ padding: "12px 16px", verticalAlign: "middle", color: "var(--color-admin-muted, #64748b)" }}>
                    <div>{formatDate(rev.created_at)}</div>
                    {rev.updated_at && rev.updated_at !== rev.created_at && (
                      <div style={{ fontSize: "10px", opacity: 0.75, marginTop: "2px" }}>
                        {t("updatedShort", { defaultValue: "Updated" })}: {formatDate(rev.updated_at)}
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "12px 16px", textAlign: "right", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      {/* Publish / Hide Moderation Buttons */}
                      {!isPublished && !isDeleted && (
                        <IconButton
                          icon="check"
                          size="sm"
                          variant="secondary"
                          disabled={isUpdatingThis}
                          ariaLabel={t("publishReview", { defaultValue: "Publish" })}
                          title={t("publishReview", { defaultValue: "Publish" })}
                          onClick={() => onPublish?.(rev.id)}
                          style={{
                            color: "#16a34a",
                            backgroundColor: "rgba(34, 197, 94, 0.12)",
                            borderColor: "rgba(34, 197, 94, 0.3)",
                            width: "30px",
                            height: "30px",
                          }}
                        />
                      )}

                      {isPublished && (
                        <IconButton
                          icon="eye-off"
                          size="sm"
                          variant="secondary"
                          disabled={isUpdatingThis}
                          ariaLabel={t("hideReview", { defaultValue: "Hide" })}
                          title={t("hideReview", { defaultValue: "Hide" })}
                          onClick={() => onHide?.(rev.id)}
                          style={{
                            color: "#0891b2",
                            width: "30px",
                            height: "30px",
                          }}
                        />
                      )}

                      {isHidden && (
                        <IconButton
                          icon="check"
                          size="sm"
                          variant="secondary"
                          disabled={isUpdatingThis}
                          ariaLabel={t("publishReview", { defaultValue: "Publish" })}
                          title={t("publishReview", { defaultValue: "Publish" })}
                          onClick={() => onPublish?.(rev.id)}
                          style={{
                            color: "#16a34a",
                            width: "30px",
                            height: "30px",
                          }}
                        />
                      )}

                      {/* Detail Drawer */}
                      <IconButton
                        icon="eye"
                        size="sm"
                        variant="secondary"
                        ariaLabel={t("viewFullReview", { defaultValue: "View Review Details" })}
                        title={t("viewFullReview", { defaultValue: "View Review Details" })}
                        onClick={() => onViewDetail?.(rev)}
                        style={{ width: "30px", height: "30px" }}
                      />

                      {/* Delete */}
                      {!isDeleted && (
                        <IconButton
                          icon="trash"
                          size="sm"
                          variant="ghost"
                          disabled={isUpdatingThis}
                          ariaLabel={t("deleteReview", { defaultValue: "Delete" })}
                          title={t("deleteReview", { defaultValue: "Delete" })}
                          onClick={() => onDelete?.(rev)}
                          style={{
                            width: "30px",
                            height: "30px",
                            color: "var(--color-error, #ef4444)",
                          }}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile & Tablet Card List (< 1024px) */}
      <div
        className="review-mobile-card-list"
        style={{
          display: "none",
          flexDirection: "column",
          gap: "var(--space-md, 16px)",
        }}
      >
        {reviews.map((rev) => {
          const statusCfg = getStatusColor(rev.status);
          const isUpdatingThis = updatingId === rev.id;
          const isPublished = rev.status === "PUBLISHED";
          const isHidden = rev.status === "HIDDEN";
          const isDeleted = rev.status === "DELETED";

          return (
            <div
              key={rev.id}
              style={{
                backgroundColor: "var(--color-admin-card, #ffffff)",
                borderRadius: "var(--radius-md, 8px)",
                border: "1px solid var(--color-admin-border, #e2e8f0)",
                padding: "var(--space-md, 16px)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-sm, 12px)",
              }}
            >
              {/* Card Header: Author, Rating, Status */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--color-admin-text, #0f172a)" }}>
                    {rev.name || "—"}
                  </div>
                  <div style={{ marginTop: "2px" }}>{renderStars(rev.rating)}</div>
                </div>

                <Badge variant={rev.status === "PUBLISHED" ? "success" : rev.status === "PENDING" ? "warning" : "secondary"} size="sm">
                  {statusCfg.label}
                </Badge>
              </div>

              {/* Text Preview */}
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "var(--color-admin-text, #0f172a)",
                  lineHeight: 1.5,
                }}
              >
                {rev.text || "—"}
              </p>

              {/* Footer: Date & Moderation Buttons */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "var(--space-xs, 8px)",
                  borderTop: "1px solid var(--color-admin-border, #e2e8f0)",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "11px", color: "var(--color-admin-muted, #64748b)" }}>
                  {formatDate(rev.created_at)}
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {!isPublished && !isDeleted && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isUpdatingThis}
                      onClick={() => onPublish?.(rev.id)}
                      style={{
                        fontSize: "11px",
                        padding: "4px 8px",
                        backgroundColor: "rgba(34, 197, 94, 0.9)",
                        borderColor: "rgba(34, 197, 94, 1)",
                      }}
                    >
                      <Icon name="check" size={12} /> {t("publishReview", { defaultValue: "Publish" })}
                    </Button>
                  )}

                  {isPublished && (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={isUpdatingThis}
                      onClick={() => onHide?.(rev.id)}
                      style={{ fontSize: "11px", padding: "4px 8px" }}
                    >
                      <Icon name="eye-off" size={12} /> {t("hideReview", { defaultValue: "Hide" })}
                    </Button>
                  )}

                  {isHidden && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isUpdatingThis}
                      onClick={() => onPublish?.(rev.id)}
                      style={{ fontSize: "11px", padding: "4px 8px" }}
                    >
                      <Icon name="check" size={12} /> {t("publishReview", { defaultValue: "Publish" })}
                    </Button>
                  )}

                  <IconButton
                    icon="eye"
                    size="sm"
                    variant="secondary"
                    ariaLabel={t("viewFullReview", { defaultValue: "View Review Details" })}
                    onClick={() => onViewDetail?.(rev)}
                    style={{ width: "28px", height: "28px" }}
                  />

                  {!isDeleted && (
                    <IconButton
                      icon="trash"
                      size="sm"
                      variant="ghost"
                      disabled={isUpdatingThis}
                      ariaLabel={t("deleteReview", { defaultValue: "Delete" })}
                      onClick={() => onDelete?.(rev)}
                      style={{ width: "28px", height: "28px", color: "var(--color-error, #ef4444)" }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Responsive Breakpoint CSS */}
      <style>{`
        @media (max-width: 1024px) {
          .review-desktop-table-container {
            display: none !important;
          }
          .review-mobile-card-list {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}

export default ReviewTable;
