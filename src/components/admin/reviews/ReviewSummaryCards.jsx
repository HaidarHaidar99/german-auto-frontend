import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "../../common/Icon";

export function ReviewSummaryCards({
  reviews = [],
  activeStatusFilter = "ALL",
  onSelectStatusFilter,
  className = "",
  style = {},
}) {
  const { t } = useTranslation(["admin", "common"]);

  const stats = React.useMemo(() => {
    let total = reviews.length;
    let countPending = 0;
    let countPublished = 0;
    let countHidden = 0;
    let countDeleted = 0;
    let sumRating = 0;
    let countRated = 0;

    for (const r of reviews) {
      if (r.status === "PENDING") countPending++;
      else if (r.status === "PUBLISHED") countPublished++;
      else if (r.status === "HIDDEN") countHidden++;
      else if (r.status === "DELETED") countDeleted++;

      // Compute average on non-deleted reviews that have a numeric rating
      if (r.status !== "DELETED" && Number.isFinite(Number(r.rating)) && Number(r.rating) > 0) {
        sumRating += Number(r.rating);
        countRated++;
      }
    }

    const avgRating = countRated > 0 ? (sumRating / countRated).toFixed(1) : "—";

    return {
      total,
      pending: countPending,
      published: countPublished,
      hidden: countHidden,
      deleted: countDeleted,
      avgRating,
      countRated,
    };
  }, [reviews]);

  const cards = [
    {
      id: "total",
      label: t("statTotalReviews", { defaultValue: "Gesamte Rezensionen" }),
      count: stats.total,
      icon: "message-square",
      color: "var(--color-primary, #C5A059)",
      isActive: activeStatusFilter === "ALL",
      onClick: () => onSelectStatusFilter?.("ALL"),
    },
    {
      id: "pending",
      label: t("statusPending", { defaultValue: "Ausstehend" }),
      count: stats.pending,
      icon: "clock",
      color: "#eab308",
      isActive: activeStatusFilter === "PENDING",
      onClick: () =>
        onSelectStatusFilter?.(activeStatusFilter === "PENDING" ? "ALL" : "PENDING"),
    },
    {
      id: "published",
      label: t("statusPublished", { defaultValue: "Veröffentlicht" }),
      count: stats.published,
      icon: "check-circle",
      color: "#22c55e",
      isActive: activeStatusFilter === "PUBLISHED",
      onClick: () =>
        onSelectStatusFilter?.(activeStatusFilter === "PUBLISHED" ? "ALL" : "PUBLISHED"),
    },
    {
      id: "hidden",
      label: t("statusHidden", { defaultValue: "Ausgeblendet" }),
      count: stats.hidden,
      icon: "eye-off",
      color: "#06b6d4",
      isActive: activeStatusFilter === "HIDDEN",
      onClick: () =>
        onSelectStatusFilter?.(activeStatusFilter === "HIDDEN" ? "ALL" : "HIDDEN"),
    },
    {
      id: "deleted",
      label: t("statusDeleted", { defaultValue: "Gelöscht" }),
      count: stats.deleted,
      icon: "trash",
      color: "var(--color-admin-muted, #94a3b8)",
      isActive: activeStatusFilter === "DELETED",
      onClick: () =>
        onSelectStatusFilter?.(activeStatusFilter === "DELETED" ? "ALL" : "DELETED"),
    },
    {
      id: "avgRating",
      label: t("statAverageRating", { defaultValue: "Ø Bewertung" }),
      count: stats.avgRating !== "—" ? `${stats.avgRating} ★` : "—",
      icon: "star",
      color: "#f59e0b",
      isActive: false,
      onClick: () => onSelectStatusFilter?.("PUBLISHED"),
    },
  ];

  return (
    <div
      className={`review-summary-grid ${className}`.trim()}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        gap: "var(--space-sm, 12px)",
        ...style,
      }}
    >
      {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={card.onClick}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "12px 14px",
            backgroundColor: card.isActive
              ? "rgba(197, 160, 89, 0.12)"
              : "var(--color-admin-card, #121418)",
            borderRadius: "var(--radius-md, 8px)",
            border: card.isActive
              ? "1px solid var(--color-primary, #C5A059)"
              : "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.2s ease",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: card.isActive
                  ? "var(--color-primary, #C5A059)"
                  : "var(--color-admin-muted, #94a3b8)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {card.label}
            </span>
            <Icon name={card.icon} size={15} style={{ color: card.color, opacity: 0.9 }} />
          </div>

          <div
            style={{
              fontSize: "var(--font-size-xl, 22px)",
              fontWeight: 700,
              color: card.isActive ? "var(--color-primary, #C5A059)" : "#ffffff",
              lineHeight: 1,
            }}
          >
            {card.count}
          </div>
        </button>
      ))}
    </div>
  );
}

export default ReviewSummaryCards;
