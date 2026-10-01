import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import AccountHeader from "../../components/account/AccountHeader";
import AccountNav from "../../components/account/AccountNav";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Icon from "../../components/common/Icon";
import Modal from "../../components/ui/Modal";
import reviewsService from "../../services/reviews/reviews.service";

/**
 * German Auto — Account Reviews Page
 * Shows customer's own submitted reviews with moderation status and edit capabilities.
 */
export function AccountReviewsPage() {
  const { t, i18n } = useTranslation(["account", "common"]);
  const currentLang = i18n.language?.startsWith("en") ? "en" : "de";
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editText, setEditText] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccessMsg, setEditSuccessMsg] = useState("");

  const editFileInputRef = useRef(null);

  const fetchMyReviews = useCallback(() => {
    setLoading(true);
    reviewsService
      .getMyReviews()
      .then((res) => {
        setReviews(res?.data?.reviews || []);
      })
      .catch(() => {
        setReviews([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    document.title = currentLang === "en" ? "My Reviews | German Auto" : "Meine Bewertungen | German Auto";
    fetchMyReviews();
  }, [currentLang, fetchMyReviews]);

  const handleOpenEdit = (review) => {
    setEditingReview(review);
    setEditRating(review.rating || 5);
    setEditText(review.text || "");
    setEditImageFile(null);
    setEditImagePreview(review.image_url || null);
    setEditError("");
    setEditSuccessMsg("");
  };

  const handleCloseEdit = () => {
    setEditingReview(null);
    setEditImageFile(null);
    setEditImagePreview(null);
    setEditError("");
    setEditSuccessMsg("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setEditError(currentLang === "en" ? "Max 5 MB file size allowed." : "Maximal 5 MB erlaubt.");
      return;
    }

    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
    setEditError("");
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingReview) return;

    const trimmed = editText.trim();
    if (trimmed.length < 5) {
      setEditError(
        currentLang === "en"
          ? "Review text must be at least 5 characters long."
          : "Die Rezension muss mindestens 5 Zeichen enthalten."
      );
      return;
    }

    setIsUpdating(true);
    setEditError("");

    try {
      if (editImageFile) {
        const formData = new FormData();
        formData.append("rating", String(editRating));
        formData.append("text", trimmed);
        formData.append("image", editImageFile);
        await reviewsService.updateMyReview(editingReview.id, formData);
      } else {
        await reviewsService.updateMyReview(editingReview.id, {
          rating: editRating,
          text: trimmed,
        });
      }

      setEditSuccessMsg(
        currentLang === "en"
          ? "Review updated successfully and is pending approval."
          : "Bewertung erfolgreich aktualisiert und zur Prüfung eingereicht."
      );

      fetchMyReviews();
      setTimeout(() => {
        handleCloseEdit();
      }, 1400);
    } catch (err) {
      setEditError(err.message || (currentLang === "en" ? "Failed to update review." : "Fehler beim Aktualisieren der Bewertung."));
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDateDMY = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const statusBadges = {
    PUBLISHED: {
      label: currentLang === "en" ? "Published" : "Veröffentlicht",
      color: "#22c55e",
      bg: "rgba(34, 197, 94, 0.12)",
      border: "rgba(34, 197, 94, 0.3)",
    },
    PENDING: {
      label: currentLang === "en" ? "Under Review" : "In Prüfung",
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.12)",
      border: "rgba(245, 158, 11, 0.3)",
    },
    HIDDEN: {
      label: currentLang === "en" ? "Hidden" : "Nicht öffentlich",
      color: "#94a3b8",
      bg: "rgba(148, 163, 184, 0.12)",
      border: "rgba(148, 163, 184, 0.3)",
    },
  };

  return (
    <main
      className="account-page"
      style={{
        maxWidth: "920px",
        margin: "0 auto",
        padding: "var(--space-xl) clamp(var(--space-md), 5vw, var(--space-2xl)) var(--space-4xl)",
      }}
    >
      <AccountHeader user={user} />
      <AccountNav style={{ marginBottom: "var(--space-2xl)" }} />

      <div className="account-content-area" style={{ maxWidth: "860px", margin: "0 auto", width: "100%" }}>
        {/* Section Heading */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-xl)", flexWrap: "wrap", gap: "var(--space-md)" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ffffff", margin: "0 0 4px 0" }}>
              {currentLang === "en" ? "My Reviews" : "Meine Bewertungen"}
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", margin: 0 }}>
              {currentLang === "en"
                ? "Manage and edit your feedback regarding your vehicle and purchase experience."
                : "Verwalten und bearbeiten Sie Ihre Bewertungen zu Fahrzeugen und unserem Service."}
            </p>
          </div>

          <Button as={Link} to="/leave-review" variant="secondary" size="sm" style={{ borderRadius: "0px" }}>
            {currentLang === "en" ? "Write a Review →" : "Bewertung abgeben →"}
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: "var(--space-3xl) 0", color: "var(--color-text-muted)" }}>
            {t("common:loading", "Wird geladen...")}
          </div>
        )}

        {/* ── Empty State ────────────────────────────────────────── */}
        {!loading && reviews.length === 0 && (
          <div
            style={{
              padding: "var(--space-3xl) var(--space-xl)",
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              border: "1px dashed rgba(212, 175, 55, 0.3)",
              borderRadius: "var(--radius-lg)",
              textAlign: "center",
            }}
          >
            <div style={{ color: "#D4AF37", fontSize: "2rem", marginBottom: "var(--space-sm)" }}>
              ★★★★★
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#ffffff", margin: "0 0 var(--space-xs)" }}>
              {currentLang === "en" ? "No Reviews Yet" : "Noch keine Bewertungen abgegeben"}
            </h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", maxWidth: "420px", margin: "0 auto var(--space-xl)", lineHeight: 1.5 }}>
              {currentLang === "en"
                ? "You haven't submitted any reviews yet. Share your experience with our vehicles and team."
                : "Sie haben bisher noch keine Bewertung abgegeben. Teilen Sie Ihre Erfahrungen mit German Auto."}
            </p>
            <Button as={Link} to="/leave-review" variant="secondary" size="md" style={{ borderRadius: "0px" }}>
              {currentLang === "en" ? "Leave a Review Now →" : "Jetzt Bewertung abgeben →"}
            </Button>
          </div>
        )}

        {/* ── Review Cards List ──────────────────────────────────── */}
        {!loading && reviews.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
            {reviews.map((rev) => {
              const statusCfg = statusBadges[rev.status] || statusBadges.PENDING;
              return (
                <div
                  key={rev.id}
                  style={{
                    backgroundColor: "#0a0a0a",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-xl)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-md)",
                    transition: "border-color 0.2s ease",
                  }}
                >
                  {/* Top Bar: Name, Status Badge, Edit Button */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-sm)" }}>
                    <div>
                      {/* Name */}
                      <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#ffffff", marginBottom: "4px" }}>
                        {rev.name}
                      </div>
                      {/* Date d/m/y */}
                      <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                        {formatDateDMY(rev.created_at)}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                      {/* Status Badge */}
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          padding: "3px 10px",
                          borderRadius: "12px",
                          color: statusCfg.color,
                          backgroundColor: statusCfg.bg,
                          border: `1px solid ${statusCfg.border}`,
                        }}
                      >
                        {statusCfg.label}
                      </span>

                      {/* Edit Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(rev)}
                        style={{ borderRadius: "0px" }}
                      >
                        ✎ {currentLang === "en" ? "Edit" : "Bearbeiten"}
                      </Button>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div style={{ display: "flex", gap: "3px", color: "#D4AF37", fontSize: "1.2rem" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} style={{ opacity: i < (rev.rating || 5) ? 1 : 0.2 }}>
                        ★
                      </span>
                    ))}
                  </div>

                  {/* Review Text */}
                  <p style={{ margin: 0, color: "rgba(255, 255, 255, 0.9)", fontSize: "0.95rem", lineHeight: 1.6, fontStyle: "italic" }}>
                    "{rev.text}"
                  </p>

                  {/* Attached Image Thumbnail */}
                  {rev.image_url && (
                    <div style={{ marginTop: "var(--space-xs)" }}>
                      <img
                        src={rev.image_url}
                        alt="Vehicle attachment"
                        style={{
                          width: "100px",
                          height: "70px",
                          objectFit: "cover",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid rgba(212, 175, 55, 0.4)",
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Edit Review Modal ─────────────────────────────────────── */}
      {editingReview && (
        <Modal
          isOpen={Boolean(editingReview)}
          onClose={handleCloseEdit}
          title={currentLang === "en" ? "Edit Review" : "Bewertung bearbeiten"}
          size="md"
        >
          {editSuccessMsg ? (
            <div style={{ textAlign: "center", padding: "var(--space-lg) 0", color: "#22c55e" }}>
              <div style={{ fontSize: "2rem", marginBottom: "8px" }}>✓</div>
              <p style={{ margin: 0, fontWeight: 600 }}>{editSuccessMsg}</p>
            </div>
          ) : (
            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
              {/* Star Rating */}
              <div>
                <label style={{ display: "block", marginBottom: "var(--space-xs)", fontSize: "0.875rem", fontWeight: 600, color: "#ffffff" }}>
                  {currentLang === "en" ? "Rating" : "Bewertung"}
                </label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRating(star)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "2rem",
                        lineHeight: 1,
                        cursor: "pointer",
                        color: editRating >= star ? "#D4AF37" : "rgba(255, 255, 255, 0.2)",
                        transition: "transform 0.15s ease",
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label htmlFor="edit-review-text" style={{ display: "block", marginBottom: "var(--space-xs)", fontSize: "0.875rem", fontWeight: 600, color: "#ffffff" }}>
                  {currentLang === "en" ? "Review Text" : "Rezensionstext"}
                </label>
                <textarea
                  id="edit-review-text"
                  rows={5}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  required
                  minLength={5}
                  maxLength={5000}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    backgroundColor: "#000000",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "var(--radius-sm)",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    lineHeight: 1.5,
                    resize: "vertical",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#D4AF37")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.2)")}
                />
              </div>

              {/* Photo Attachment */}
              <div>
                <label style={{ display: "block", marginBottom: "var(--space-xs)", fontSize: "0.875rem", fontWeight: 600, color: "#ffffff" }}>
                  {currentLang === "en" ? "Photo Attachment" : "Foto anhängen"}
                </label>
                {editImagePreview ? (
                  <div style={{ position: "relative", width: "120px", height: "80px", borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid #D4AF37" }}>
                    <img src={editImagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => {
                        setEditImageFile(null);
                        setEditImagePreview(null);
                        if (editFileInputRef.current) editFileInputRef.current.value = "";
                      }}
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        color: "#ffffff",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      ref={editFileInputRef}
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => editFileInputRef.current?.click()}
                    >
                      📷 {currentLang === "en" ? "Change / Upload Photo" : "Foto ändern / hinzufügen"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {editError && (
                <div style={{ padding: "8px 12px", backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "4px", color: "#f87171", fontSize: "0.85rem" }}>
                  {editError}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-md)" }}>
                <Button type="button" variant="ghost" size="md" onClick={handleCloseEdit} disabled={isUpdating}>
                  {t("common:cancel", "Abbrechen")}
                </Button>
                <Button type="submit" variant="secondary" size="md" disabled={isUpdating || editText.trim().length < 5}>
                  {isUpdating ? (currentLang === "en" ? "Saving..." : "Wird gespeichert...") : (currentLang === "en" ? "Save Changes" : "Änderungen speichern")}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </main>
  );
}

export default AccountReviewsPage;
