import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Badge from "../../ui/Badge";
import IconButton from "../../ui/IconButton";
import Icon from "../../common/Icon";
import Button from "../../ui/Button";
import ReviewImageModal from "./ReviewImageModal";

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
  const currentLang = i18n.language || "de";

  const [activeModalImage, setActiveModalImage] = useState(null);

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
          color: "#4ade80",
          bg: "rgba(34, 197, 94, 0.12)",
          border: "rgba(34, 197, 94, 0.3)",
          label: t("statusPublished", { defaultValue: "Veröffentlicht" }),
        };
      case "PENDING":
        return {
          color: "#fbbf24",
          bg: "rgba(245, 158, 11, 0.12)",
          border: "rgba(245, 158, 11, 0.3)",
          label: t("statusPending", { defaultValue: "Ausstehend" }),
        };
      case "HIDDEN":
        return {
          color: "#22d3ee",
          bg: "rgba(6, 182, 212, 0.12)",
          border: "rgba(6, 182, 212, 0.3)",
          label: t("statusHidden", { defaultValue: "Ausgeblendet" }),
        };
      case "DELETED":
        return {
          color: "#94a3b8",
          bg: "rgba(148, 163, 184, 0.12)",
          border: "rgba(148, 163, 184, 0.3)",
          label: t("statusDeleted", { defaultValue: "Gelöscht" }),
        };
      default:
        return {
          color: "#e2e8f0",
          bg: "rgba(255, 255, 255, 0.08)",
          border: "rgba(255, 255, 255, 0.15)",
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
              color: i <= r ? "var(--color-primary, var(--color-text))" : "rgba(255, 255, 255, 0.15)",
              fontSize: "13px",
            }}
          >
            ★
          </span>
        ))}
        <span style={{ fontSize: "11px", color: "var(--color-admin-muted, #94a3b8)", marginLeft: "4px" }}>
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
          backgroundColor: "var(--color-admin-card, #121418)",
          borderRadius: "var(--radius-md, 8px)",
          border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
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
                borderBottom: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                color: "var(--color-admin-muted, #94a3b8)",
                textTransform: "uppercase",
                fontSize: "11px",
                letterSpacing: "0.06em",
              }}
            >
              <th style={{ padding: "12px 16px", minWidth: "160px" }}>{t("columns.author", { defaultValue: "Verfasser" })}</th>
              <th style={{ padding: "12px 16px", width: "140px" }}>{t("columns.rating", { defaultValue: "Bewertung" })}</th>
              <th style={{ padding: "12px 16px", minWidth: "260px" }}>{t("reviewText", { defaultValue: "Erfahrungsbericht" })}</th>
              <th style={{ padding: "12px 16px", width: "110px", textAlign: "center" }}>Foto</th>
              <th style={{ padding: "12px 16px", width: "160px" }}>{t("columns.status", { defaultValue: "Status" })}</th>
              <th style={{ padding: "12px 16px", width: "150px" }}>{t("columns.date", { defaultValue: "Eingangsdatum" })}</th>
              <th style={{ padding: "12px 16px", textAlign: "right", width: "150px" }}>{t("actions", { defaultValue: "Aktionen" })}</th>
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
                    borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
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
                        color: "var(--color-admin-text, #ffffff)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      title={t("viewFullReview", { defaultValue: "Rezension prüfen" })}
                    >
                      <span>{rev.name || "—"}</span>
                      {rev.user_id && (
                        <span
                          title={t("userAccount", { defaultValue: "Verknüpftes Kundenkonto" })}
                          style={{
                            fontSize: "10px",
                            padding: "1px 4px",
                            borderRadius: "3px",
                            backgroundColor: "rgba(255, 255, 255, 0.15)",
                            color: "var(--color-primary, var(--color-text))",
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
                        color: "var(--color-admin-muted, #cbd5e1)",
                        fontSize: "12px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "320px",
                        cursor: "pointer",
                      }}
                      onClick={() => onViewDetail?.(rev)}
                      title={rev.text || ""}
                    >
                      {rev.text || "—"}
                    </p>
                  </td>

                  {/* Attached Image */}
                  <td style={{ padding: "12px 16px", verticalAlign: "middle", textAlign: "center" }}>
                    {rev.image_url ? (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveModalImage({
                            url: rev.image_url,
                            name: rev.name,
                          })
                        }
                        title={t("clickToEnlarge", { defaultValue: "Klicken zum Vergrößern" })}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "var(--radius-xs, 4px)",
                            overflow: "hidden",
                            border: "1px solid rgba(255, 255, 255, 0.4)",
                            backgroundColor: "#000",
                          }}
                        >
                          <img
                            src={rev.image_url}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                      </button>
                    ) : (
                      <span style={{ fontSize: "11px", color: "var(--color-admin-muted, #64748b)" }}>
                        —
                      </span>
                    )}
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
                        <span style={{ fontSize: "10px", color: "#4ade80", opacity: 0.85 }}>
                          ● {t("publicVisibilityActive", { defaultValue: "Öffentlich sichtbar" })}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Date */}
                  <td style={{ padding: "12px 16px", verticalAlign: "middle", color: "var(--color-admin-muted, #94a3b8)" }}>
                    <div>{formatDate(rev.created_at)}</div>
                    {rev.updated_at && rev.updated_at !== rev.created_at && (
                      <div style={{ fontSize: "10px", opacity: 0.65, marginTop: "2px" }}>
                        {t("updatedShort", { defaultValue: "Aktualisiert" })}: {formatDate(rev.updated_at)}
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
                          ariaLabel={t("publishReview", { defaultValue: "Veröffentlichen" })}
                          title={t("publishReview", { defaultValue: "Veröffentlichen" })}
                          onClick={() => onPublish?.(rev.id)}
                          style={{
                            color: "#4ade80",
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
                          ariaLabel={t("hideReview", { defaultValue: "Ausblenden" })}
                          title={t("hideReview", { defaultValue: "Ausblenden" })}
                          onClick={() => onHide?.(rev.id)}
                          style={{
                            color: "#22d3ee",
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
                          ariaLabel={t("publishReview", { defaultValue: "Veröffentlichen" })}
                          title={t("publishReview", { defaultValue: "Veröffentlichen" })}
                          onClick={() => onPublish?.(rev.id)}
                          style={{
                            color: "#4ade80",
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
                        ariaLabel={t("viewFullReview", { defaultValue: "Rezension prüfen" })}
                        title={t("viewFullReview", { defaultValue: "Rezension prüfen" })}
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
                          ariaLabel={t("deleteReview", { defaultValue: "Löschen" })}
                          title={t("deleteReview", { defaultValue: "Löschen" })}
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
                backgroundColor: "var(--color-admin-card, #121418)",
                borderRadius: "var(--radius-md, 8px)",
                border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
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
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--color-admin-text, #ffffff)" }}>
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
                  color: "var(--color-admin-text, #e2e8f0)",
                  lineHeight: 1.5,
                }}
              >
                {rev.text || "—"}
              </p>

              {/* Optional Photo Attachment */}
              {rev.image_url && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 8px",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    borderRadius: "var(--radius-xs, 4px)",
                    cursor: "pointer",
                    width: "fit-content",
                  }}
                  onClick={() =>
                    setActiveModalImage({
                      url: rev.image_url,
                      name: rev.name,
                    })
                  }
                >
                  <img
                    src={rev.image_url}
                    alt=""
                    style={{ width: "28px", height: "28px", objectFit: "cover", borderRadius: "3px" }}
                  />
                  <span style={{ fontSize: "11px", color: "var(--color-primary, var(--color-text))", fontWeight: 600 }}>
                    {t("attachedPhoto", { defaultValue: "Foto ansehen" })}
                  </span>
                </div>
              )}

              {/* Footer: Date & Moderation Buttons */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "var(--space-xs, 8px)",
                  borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "11px", color: "var(--color-admin-muted, #94a3b8)" }}>
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
                      <Icon name="check" size={12} /> {t("publishReview", { defaultValue: "Freigeben" })}
                    </Button>
                  )}

                  {isHidden && (
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
                      <Icon name="check" size={12} /> {t("publishReview", { defaultValue: "Freigeben" })}
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
                      <Icon name="eye-off" size={12} /> {t("hideReview", { defaultValue: "Ausblenden" })}
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetail?.(rev)}
                    style={{ fontSize: "11px", padding: "4px 8px" }}
                  >
                    <Icon name="eye" size={12} /> {t("viewDetails", { defaultValue: "Details" })}
                  </Button>

                  {!isDeleted && (
                    <IconButton
                      icon="trash"
                      size="sm"
                      variant="ghost"
                      disabled={isUpdatingThis}
                      ariaLabel={t("deleteReview", { defaultValue: "Löschen" })}
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

      {/* Lightbox Modal */}
      {activeModalImage && (
        <ReviewImageModal
          isOpen={Boolean(activeModalImage)}
          imageUrl={activeModalImage.url}
          reviewerName={activeModalImage.name}
          onClose={() => setActiveModalImage(null)}
        />
      )}

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
