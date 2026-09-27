import React from "react";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button";

/**
 * German Auto — Accessible Inventory Pagination
 */

export function CarsPagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = "",
  style = {},
}) {
  const { t } = useTranslation(["cars"]);

  if (totalPages <= 1) {
    return null;
  }

  // Generate sensible page window
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
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
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <span className="hide-mobile">{t("nextPage", "Nächste")}</span>
      </Button>
    </nav>
  );
}

export default CarsPagination;
