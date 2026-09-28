import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import reviewsService from "../../services/reviews/reviews.service";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import ReviewSummaryCards from "../../components/admin/reviews/ReviewSummaryCards";
import ReviewFiltersBar from "../../components/admin/reviews/ReviewFiltersBar";
import ReviewTable from "../../components/admin/reviews/ReviewTable";
import ReviewDetailDrawer from "../../components/admin/reviews/ReviewDetailDrawer";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import AdminLoadingState from "../../components/admin/AdminLoadingState";
import ErrorState from "../../components/ui/ErrorState";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Icon from "../../components/common/Icon";
import { useGsapContext } from "../../hooks/useAnimation";
import { gsap, isReducedMotion } from "../../utils/animation";

export function AdminReviewsPage() {
  const { t } = useTranslation(["admin", "common"]);
  const pageContainerRef = useRef(null);

  // ─── State ──────────────────────────────────────────────────────────────────
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters: search, status, rating, sort, imageFilter
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
    rating: "ALL",
    sort: "newest",
    imageFilter: "ALL",
  });

  // Selected review for detail drawer
  const [selectedReview, setSelectedReview] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Moderation in-progress tracking
  const [updatingId, setUpdatingId] = useState(null);
  const [toastNotification, setToastNotification] = useState(null);

  const showToast = (type, text) => {
    setToastNotification({ type, text });
    setTimeout(() => {
      setToastNotification(null);
    }, 4000);
  };

  useEffect(() => {
    document.title = `${t("reviews", { defaultValue: "Bewertungsmoderation" })} | ADMINCORE`;
  }, [t]);

  // ─── Fetch Reviews ──────────────────────────────────────────────────────────
  const fetchReviews = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await reviewsService.adminGetReviews({
        limit: 100,
        sort: "newest",
      });
      const items = res?.data?.reviews || [];
      setReviews(items);
      setError(null);
    } catch (err) {
      setError(err?.message || "Fehler beim Laden der Kundenbewertungen.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // GSAP animation
  useGsapContext(pageContainerRef, () => {
    if (isReducedMotion()) return;
    gsap.from(".admin-reviews-animated-content", {
      opacity: 0,
      y: 18,
      duration: 0.5,
      ease: "power2.out",
    });
  });

  // ─── Moderation Handlers ────────────────────────────────────────────────────

  // Publish a review
  const handlePublish = useCallback(
    async (reviewId) => {
      if (!reviewId) return;
      try {
        setUpdatingId(reviewId);
        const res = await reviewsService.adminUpdateReview(reviewId, {
          status: "PUBLISHED",
        });
        const updated = res?.data?.review || { status: "PUBLISHED", updated_at: new Date().toISOString() };

        setReviews((prev) =>
          prev.map((item) =>
            item.id === reviewId ? { ...item, ...updated, status: "PUBLISHED" } : item
          )
        );

        setSelectedReview((prev) =>
          prev && prev.id === reviewId ? { ...prev, ...updated, status: "PUBLISHED" } : prev
        );

        showToast("success", t("reviewPublished", { defaultValue: "Rezension wurde erfolgreich veröffentlicht." }));
      } catch (err) {
        showToast("error", err?.message || "Fehler beim Veröffentlichen der Rezension.");
      } finally {
        setUpdatingId(null);
      }
    },
    [t]
  );

  // Hide a review
  const handleHide = useCallback(
    async (reviewId) => {
      if (!reviewId) return;
      try {
        setUpdatingId(reviewId);
        const res = await reviewsService.adminUpdateReview(reviewId, {
          status: "HIDDEN",
        });
        const updated = res?.data?.review || { status: "HIDDEN", updated_at: new Date().toISOString() };

        setReviews((prev) =>
          prev.map((item) =>
            item.id === reviewId ? { ...item, ...updated, status: "HIDDEN" } : item
          )
        );

        setSelectedReview((prev) =>
          prev && prev.id === reviewId ? { ...prev, ...updated, status: "HIDDEN" } : prev
        );

        showToast("success", t("reviewHidden", { defaultValue: "Rezension wurde ausgeblendet." }));
      } catch (err) {
        showToast("error", err?.message || "Fehler beim Ausblenden der Rezension.");
      } finally {
        setUpdatingId(null);
      }
    },
    [t]
  );

  // Soft-delete a review
  const handleDelete = useCallback(
    async (reviewItem) => {
      if (!reviewItem) return;
      const confirmed = window.confirm(
        t("deleteReviewConfirmMessage", {
          name: reviewItem.name || "diesem Kunden",
          defaultValue: `Möchten Sie diese Bewertung von "${reviewItem.name || "Kunde"}" wirklich löschen? Der Status wird auf GELÖSCHT gesetzt und ein eventuell hinterlegtes Bild wird entfernt.`,
        })
      );
      if (!confirmed) return;

      try {
        setUpdatingId(reviewItem.id);
        const res = await reviewsService.adminDeleteReview(reviewItem.id);
        const updated = res?.data?.review || {
          status: "DELETED",
          image_url: null,
          updated_at: new Date().toISOString(),
        };

        setReviews((prev) =>
          prev.map((item) =>
            item.id === reviewItem.id ? { ...item, ...updated, status: "DELETED", image_url: null } : item
          )
        );

        setSelectedReview((prev) =>
          prev && prev.id === reviewItem.id
            ? { ...prev, ...updated, status: "DELETED", image_url: null }
            : prev
        );

        showToast("success", t("reviewDeleted", { defaultValue: "Rezension wurde erfolgreich gelöscht." }));
      } catch (err) {
        showToast("error", err?.message || "Fehler beim Löschen der Rezension.");
      } finally {
        setUpdatingId(null);
      }
    },
    [t]
  );

  // Detail drawer triggers
  const handleOpenDetail = useCallback(async (reviewItem) => {
    setSelectedReview(reviewItem);
    setIsDrawerOpen(true);

    try {
      const freshRes = await reviewsService.adminGetReview(reviewItem.id);
      if (freshRes?.data?.review) {
        setSelectedReview(freshRes.data.review);
      }
    } catch {
      // Continue displaying list row item if single fetch fails
    }
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedReview(null);
  }, []);

  // ─── Filter & Search Logic ──────────────────────────────────────────────────
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // Status filter
    if (filters.status && filters.status !== "ALL") {
      result = result.filter((item) => item.status === filters.status);
    }

    // Rating filter
    if (filters.rating && filters.rating !== "ALL") {
      result = result.filter((item) => Number(item.rating) === Number(filters.rating));
    }

    // Image filter
    if (filters.imageFilter === "with_image") {
      result = result.filter((item) => Boolean(item.image_url));
    } else if (filters.imageFilter === "without_image") {
      result = result.filter((item) => !item.image_url);
    }

    // Search query (reviewer name or text)
    if (filters.search && filters.search.trim() !== "") {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (item) =>
          (item.name || "").toLowerCase().includes(q) ||
          (item.text || "").toLowerCase().includes(q)
      );
    }

    // Sort order
    result.sort((a, b) => {
      if (filters.sort === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (filters.sort === "rating_desc") {
        return Number(b.rating || 0) - Number(a.rating || 0);
      }
      if (filters.sort === "rating_asc") {
        return Number(a.rating || 0) - Number(b.rating || 0);
      }
      // default: newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [reviews, filters]);

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "ALL",
      rating: "ALL",
      sort: "newest",
      imageFilter: "ALL",
    });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.status !== "ALL" ||
    filters.rating !== "ALL" ||
    filters.sort !== "newest" ||
    filters.imageFilter !== "ALL"
  );

  return (
    <div ref={pageContainerRef} className="admin-reviews-page" style={{ position: "relative" }}>
      {/* Toast Feedback */}
      {toastNotification && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            padding: "12px 18px",
            borderRadius: "var(--radius-md, 8px)",
            backgroundColor:
              toastNotification.type === "success"
                ? "rgba(34, 197, 94, 0.95)"
                : "rgba(239, 68, 68, 0.95)",
            color: "#ffffff",
            fontSize: "var(--font-size-sm, 14px)",
            fontWeight: 600,
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backdropFilter: "blur(8px)",
          }}
        >
          <Icon
            name={toastNotification.type === "success" ? "check-circle" : "alert-circle"}
            size={18}
          />
          <span>{toastNotification.text}</span>
        </div>
      )}

      {/* Page Header */}
      <AdminPageHeader
        title={t("reviews", { defaultValue: "Bewertungsmoderation" })}
        subtitle={t("reviewsSubtitle", {
          defaultValue: "Moderation und Freigabe aller eingereichten Kundenstimmen und Erfahrungsberichte",
        })}
        badge={
          <Badge variant="secondary" size="sm">
            {reviews.length} {t("statTotalReviews", { defaultValue: "Rezensionen" })}
          </Badge>
        }
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchReviews(true)}
            disabled={loading || refreshing}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Icon
              name="refresh-cw"
              size={14}
              style={{
                animation: refreshing ? "btn-spin 0.8s linear infinite" : "none",
              }}
            />
            <span>{t("refresh", { defaultValue: "Aktualisieren" })}</span>
          </Button>
        }
      />

      <div
        className="admin-reviews-animated-content"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-lg, 24px)",
        }}
      >
        {/* Real Summary Cards */}
        <ReviewSummaryCards
          reviews={reviews}
          activeStatusFilter={filters.status}
          onSelectStatusFilter={(statusVal) =>
            setFilters((prev) => ({ ...prev, status: statusVal }))
          }
        />

        {/* Filters and Search Bar */}
        <ReviewFiltersBar
          filters={filters}
          onChange={(newFilters) => setFilters(newFilters)}
          onReset={handleResetFilters}
        />

        {/* Content States */}
        {loading ? (
          <AdminLoadingState message="Lade Rezensionen aus der Datenbank..." />
        ) : error ? (
          <ErrorState
            title="Fehler beim Laden"
            message={error}
            onRetry={() => fetchReviews(false)}
          />
        ) : reviews.length === 0 ? (
          <AdminEmptyState
            icon="star"
            title={t("noReviewsTitle", { defaultValue: "Keine Kundenbewertungen vorhanden" })}
            message={t("noReviewsDesc", {
              defaultValue: "Es sind derzeit keine Kundenstimmen in der Datenbank hinterlegt.",
            })}
            actionLabel={t("refresh", { defaultValue: "Aktualisieren" })}
            onAction={() => fetchReviews(true)}
          />
        ) : filteredReviews.length === 0 ? (
          <AdminEmptyState
            icon="search"
            title={t("noMatchingReviewsTitle", { defaultValue: "Keine passenden Rezensionen gefunden" })}
            message={t("noMatchingReviewsDesc", {
              defaultValue: "Zu den gewählten Filterkriterien liegen keine Bewertungen vor.",
            })}
            actionLabel={hasActiveFilters ? t("resetFilters", { defaultValue: "Filter zurücksetzen" }) : undefined}
            onAction={handleResetFilters}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm, 12px)" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 4px",
                fontSize: "12px",
                color: "var(--color-admin-muted, #94a3b8)",
              }}
            >
              <span>
                {filteredReviews.length} von {reviews.length} Bewertungen angezeigt
              </span>
            </div>

            <ReviewTable
              reviews={filteredReviews}
              onViewDetail={handleOpenDetail}
              onPublish={handlePublish}
              onHide={handleHide}
              onDelete={handleDelete}
              updatingId={updatingId}
            />
          </div>
        )}
      </div>

      {/* Review Detail & Moderation Drawer */}
      <ReviewDetailDrawer
        isOpen={isDrawerOpen}
        review={selectedReview}
        onClose={handleCloseDetail}
        onPublish={handlePublish}
        onHide={handleHide}
        onDelete={handleDelete}
        updatingId={updatingId}
      />
    </div>
  );
}

export default AdminReviewsPage;
