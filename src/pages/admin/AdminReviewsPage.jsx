import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import reviewsService from "../../services/reviews/reviews.service";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import ReviewSummaryCards from "../../components/admin/reviews/ReviewSummaryCards";
import ReviewFiltersBar from "../../components/admin/reviews/ReviewFiltersBar";
import ReviewTable from "../../components/admin/reviews/ReviewTable";
import ReviewDetailDrawer from "../../components/admin/reviews/ReviewDetailDrawer";
import DeleteReviewModal from "../../components/admin/reviews/DeleteReviewModal";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import AdminLoadingState from "../../components/admin/AdminLoadingState";
import ErrorState from "../../components/ui/ErrorState";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Icon from "../../components/common/Icon";

export function AdminReviewsPage() {
  const { t } = useTranslation(["admin", "common"]);
  const pageContainerRef = useRef(null);

  // ─── State ──────────────────────────────────────────────────────────────────
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters: search, status, rating, sort
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
    rating: "ALL",
    sort: "newest",
  });

  // Selected review for detail drawer
  const [selectedReview, setSelectedReview] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Review delete confirmation modal state
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deletingReview, setDeletingReview] = useState(false);

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
    document.title = `${t("reviews", { defaultValue: "Review Moderation" })} | ADMINCORE`;
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
      setError(err?.message || t("errorLoadingReviews", { defaultValue: "Error loading customer reviews." }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Moderation Handlers

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

        showToast("success", t("reviewPublished", { defaultValue: "Review published successfully." }));
      } catch (err) {
        showToast("error", err?.message || t("errorPublishingReview", { defaultValue: "Error publishing review." }));
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

        showToast("success", t("reviewHidden", { defaultValue: "Review has been hidden." }));
      } catch (err) {
        showToast("error", err?.message || t("errorHidingReview", { defaultValue: "Error hiding review." }));
      } finally {
        setUpdatingId(null);
      }
    },
    [t]
  );

  // Trigger themed delete confirmation modal
  const handleDelete = useCallback((reviewItem) => {
    if (!reviewItem) return;
    setReviewToDelete(reviewItem);
  }, []);

  // Confirm permanent deletion from modal
  const confirmDeleteReview = useCallback(async () => {
    if (!reviewToDelete) return;
    try {
      setDeletingReview(true);
      await reviewsService.adminDeleteReview(reviewToDelete.id);

      // Immediately remove from state so it disappears
      setReviews((prev) => prev.filter((item) => item.id !== reviewToDelete.id));

      if (selectedReview?.id === reviewToDelete.id) {
        setIsDrawerOpen(false);
        setSelectedReview(null);
      }

      showToast("success", t("reviewDeleted", { defaultValue: "Review deleted successfully." }));
      setReviewToDelete(null);
    } catch (err) {
      showToast("error", err?.message || t("errorDeletingReview", { defaultValue: "Error deleting review." }));
    } finally {
      setDeletingReview(false);
    }
  }, [reviewToDelete, selectedReview, t]);

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
    } else {
      // Exclude DELETED reviews by default
      result = result.filter((item) => item.status !== "DELETED");
    }

    // Rating filter
    if (filters.rating && filters.rating !== "ALL") {
      result = result.filter((item) => Number(item.rating) === Number(filters.rating));
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
    });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.status !== "ALL" ||
    filters.rating !== "ALL" ||
    filters.sort !== "newest"
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
        title={t("reviews", { defaultValue: "Review Moderation" })}
        subtitle={t("reviewsSubtitle", {
          defaultValue: "Moderation and publishing of all submitted customer reviews and testimonials",
        })}
        badge={
          <Badge variant="secondary" size="sm">
            {reviews.length} {t("statTotalReviews", { defaultValue: "Reviews" })}
          </Badge>
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
          <AdminLoadingState message={t("loading", { defaultValue: "Loading..." })} />
        ) : error ? (
          <ErrorState
            title={t("errorLoading", { defaultValue: "Error loading" })}
            message={error}
            onRetry={() => fetchReviews(false)}
          />
        ) : reviews.length === 0 ? (
          <AdminEmptyState
            icon="star"
            title={t("noReviewsTitle", { defaultValue: "No customer reviews available" })}
            message={t("noReviewsDesc", {
              defaultValue: "There are currently no reviews stored in the database.",
            })}
          />
        ) : filteredReviews.length === 0 ? (
          <AdminEmptyState
            icon="search"
            title={t("noMatchingReviewsTitle", { defaultValue: "No matching reviews found" })}
            message={t("noMatchingReviewsDesc", {
              defaultValue: "No reviews match the selected filter criteria.",
            })}
            actionLabel={hasActiveFilters ? t("resetFilters", { defaultValue: "Reset filters" }) : undefined}
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
                {t("reviewsShownCount", {
                  count: filteredReviews.length,
                  total: reviews.length,
                  defaultValue: `${filteredReviews.length} of ${reviews.length} reviews displayed`,
                })}
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

      {/* Delete Review Confirmation Modal */}
      <DeleteReviewModal
        isOpen={Boolean(reviewToDelete)}
        review={reviewToDelete}
        loading={deletingReview}
        onConfirm={confirmDeleteReview}
        onClose={() => setReviewToDelete(null)}
      />
    </div>
  );
}

export default AdminReviewsPage;
