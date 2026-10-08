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
      label: t("statTotalReviews", { defaultValue: "Total Reviews" }),
      count: stats.total,
      icon: "message-square",
      iconBg: "#2563eb",
      isActive: activeStatusFilter === "ALL",
      onClick: () => onSelectStatusFilter?.("ALL"),
    },
    {
      id: "published",
      label: t("statusPublished", { defaultValue: "Published" }),
      count: stats.published,
      icon: "check-circle",
      iconBg: "#10b981",
      isActive: activeStatusFilter === "PUBLISHED",
      onClick: () =>
        onSelectStatusFilter?.(activeStatusFilter === "PUBLISHED" ? "ALL" : "PUBLISHED"),
    },
    {
      id: "hidden",
      label: t("statusHidden", { defaultValue: "Hidden" }),
      count: stats.hidden,
      icon: "eye-off",
      iconBg: "#06b6d4",
      isActive: activeStatusFilter === "HIDDEN",
      onClick: () =>
        onSelectStatusFilter?.(activeStatusFilter === "HIDDEN" ? "ALL" : "HIDDEN"),
    },
    {
      id: "deleted",
      label: t("statusDeleted", { defaultValue: "Deleted" }),
      count: stats.deleted,
      icon: "trash",
      iconBg: "#ef4444",
      isActive: activeStatusFilter === "DELETED",
      onClick: () =>
        onSelectStatusFilter?.(activeStatusFilter === "DELETED" ? "ALL" : "DELETED"),
    },
    {
      id: "avgRating",
      label: t("statAverageRating", { defaultValue: "Average Rating" }),
      count: stats.avgRating !== "—" ? `${stats.avgRating} ★` : "—",
      icon: "star",
      iconBg: "#8b5cf6",
      isActive: false,
      onClick: () => onSelectStatusFilter?.("PUBLISHED"),
    },
  ];

  return (
    <div
      className={`review-summary-grid ${className}`.trim()}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "20px",
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
            alignItems: "center",
            gap: "16px",
            padding: "18px 20px",
            backgroundColor: card.isActive
              ? "var(--color-admin-accent-subtle)"
              : "var(--color-admin-card)",
            borderRadius: "16px",
            border: card.isActive
              ? "2px solid var(--color-admin-accent)"
              : "1px solid var(--color-admin-border)",
            boxShadow: card.isActive
              ? "0 4px 12px rgba(37, 99, 235, 0.12)"
              : "0 1px 3px rgba(0, 0, 0, 0.04)",
            cursor: "pointer",
            textAlign: "left",
            transition: "transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
            outline: "none",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            if (!card.isActive) {
              e.currentTarget.style.borderColor = "var(--color-admin-accent)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.06)";
            }
          }}
          onMouseLeave={(e) => {
            if (!card.isActive) {
              e.currentTarget.style.borderColor = "var(--color-admin-border)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.04)";
            }
          }}
        >
          {/* Left Squircle Icon Container */}
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              backgroundColor: card.iconBg,
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.12)",
            }}
          >
            <Icon name={card.icon} size={22} strokeWidth={2} />
          </div>

          {/* Right Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0, flex: 1 }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                color: card.isActive ? "var(--color-admin-accent)" : "var(--color-admin-muted)",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {card.label}
            </span>
            <span
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                color: "var(--color-admin-text)",
                lineHeight: 1.1,
              }}
            >
              {card.count}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

export default ReviewSummaryCards;
