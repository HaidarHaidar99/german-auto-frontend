import React from "react";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button";

/**
 * German Auto — Accessible Inventory Pagination
 */

export function CarsPagination({
  currentPage = 1,
  totalPages,
  hasMore = false,
  onPageChange,
  className = "",
  style = {},
}) {
  const { t } = useTranslation(["cars"]);

  // If there's only 1 page and no more items, omit pagination
  const canGoNext = hasMore || (typeof totalPages === "number" && currentPage < totalPages);
  const canGoPrev = currentPage > 1;

  if (!canGoNext && !canGoPrev) {
    return null;
  }

  // Generate page numbers without inventing a total count
  const getPageNumbers = () => {
    const pages = [];
    const maxPage = typeof totalPages === "number" && totalPages > 0
      ? totalPages
      : (hasMore ? currentPage + 1 : currentPage);

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(maxPage, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      role="navigation"
      aria-label="Seitennavigation"
      className={`cars-pagination ${className}`.trim()}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-xs)",
        marginTop: "var(--space-3xl)",
        flexWrap: "wrap",
        ...style,
      }}
    >
      {/* Prev Button */}
      <Button
        variant="outline"
        size="md"
        iconLeft="chevron-left"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <span className="hide-mobile">{t("prevPage", "Vorherige")}</span>
      </Button>

      {/* Numeric Page Buttons */}
      {pageNumbers.map((page) => {
        const isCurrent = page === currentPage;
        return (
          <button
            key={page}
            type="button"
            aria-label={`Seite ${page}`}
            aria-current={isCurrent ? "page" : undefined}
            onClick={() => onPageChange(page)}
            style={{
              minWidth: "var(--touch-target-min)",
              height: "var(--touch-target-min)",
              borderRadius: "var(--radius-md)",
              border: `1px solid ${isCurrent ? "var(--color-secondary)" : "var(--color-border)"}`,
              backgroundColor: isCurrent ? "var(--color-secondary)" : "var(--color-surface)",
              color: isCurrent ? "#090a0c" : "var(--color-text)",
              fontWeight: isCurrent ? 700 : 500,
              fontSize: "var(--font-size-sm)",
              cursor: isCurrent ? "default" : "pointer",
              transition: "all var(--duration-fast) var(--ease-smooth)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 8px",
            }}
          >
            {page}
          </button>
        );
      })}

      {/* Next Button */}
      <Button
        variant="outline"
        size="md"
        iconRight="chevron-right"
        disabled={!canGoNext}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <span className="hide-mobile">{t("nextPage", "Nächste")}</span>
      </Button>
    </nav>
  );
}

export default CarsPagination;
