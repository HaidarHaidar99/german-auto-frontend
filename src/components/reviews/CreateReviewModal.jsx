import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Icon from "../common/Icon";
import reviewsService from "../../services/reviews/reviews.service";

/**
 * German Auto — Create Review Modal
 * Allows verified customers to submit a review with rating, text, and optional photo.
 * If user is not authenticated, presents clear login/signup guidance.
 */
export function CreateReviewModal({ isOpen, onClose, onSuccess }) {
  const { t } = useTranslation(["common", "navigation"]);
  const { isAuthenticated, user } = useAuth();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const resetForm = () => {
    setRating(5);
    setHoverRating(0);
    setText("");
    setErrorMessage("");
    setIsSuccess(false);
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 5) {
      setErrorMessage(t("reviews.textTooShort", "Der Text muss mindestens 5 Zeichen enthalten."));
      return;
    }
    if (trimmed.length > 300) {
      setErrorMessage(t("reviews.textTooLong", "Der Text darf maximal 300 Zeichen lang sein."));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await reviewsService.submitReview({
        rating,
        text: trimmed,
      });

      setIsSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const msg = err.errors?.text || err.errors?.rating || err.message || t("reviews.submitError", "Fehler beim Absenden der Bewertung.");
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const starLabels = {
    5: "5 Sterne — Ausgezeichnet",
    4: "4 Sterne — Sehr gut",
    3: "3 Sterne — Gut",
    2: "2 Sterne — Befriedigend",
    1: "1 Stern — Ungenügend",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={isSuccess ? t("reviews.successTitle", "Vielen Dank!") : t("reviews.modalTitle", "Bewertung abgeben")}
      size="md"
    >
      {/* ── Case 1: Unauthenticated State ───────────────────────────── */}
      {!isAuthenticated && !isSuccess && (
        <div style={{ textAlign: "center", padding: "var(--space-md) var(--space-xs)" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "rgba(212, 175, 55, 0.15)",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              color: "#D4AF37",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto var(--space-md)",
            }}
          >
            <Icon name="user" size={24} />
          </div>

          <h4 style={{ margin: "0 0 var(--space-xs)", fontSize: "1.25rem", color: "var(--color-text)", fontWeight: 700 }}>
            {t("reviews.loginRequiredTitle", "Anmeldung erforderlich")}
          </h4>
          <p style={{ margin: "0 auto var(--space-xl)", color: "var(--color-text-muted)", fontSize: "0.925rem", maxWidth: "400px", lineHeight: 1.5 }}>
            {t(
              "reviews.loginRequiredDesc",
              "Um echte und verifizierte Kundenstimmen zu gewährleisten, melden Sie sich bitte an, um Ihre Bewertung abzugeben."
            )}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", maxWidth: "300px", margin: "0 auto" }}>
            <Button
              as={Link}
              to="/login?redirect=/reviews"
              variant="secondary"
              size="md"
              onClick={handleModalClose}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {t("navigation:login", "Anmelden")}
            </Button>
            <Button
              as={Link}
              to="/signup?redirect=/reviews"
              variant="outline"
              size="md"
              onClick={handleModalClose}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {t("navigation:signup", "Registrieren")}
            </Button>
          </div>
        </div>
      )}

      {/* ── Case 2: Success State ───────────────────────────────────── */}
      {isSuccess && (
        <div style={{ textAlign: "center", padding: "var(--space-lg) var(--space-xs)" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "rgba(34, 197, 94, 0.15)",
              border: "1px solid rgba(34, 197, 94, 0.4)",
              color: "#22c55e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto var(--space-md)",
            }}
          >
            <Icon name="check" size={28} />
          </div>

          <h4 style={{ margin: "0 0 var(--space-xs)", fontSize: "1.3rem", color: "var(--color-text)", fontWeight: 700 }}>
            {t("reviews.successHeader", "Bewertung erfolgreich veröffentlicht!")}
          </h4>
          <p style={{ margin: "0 auto var(--space-xl)", color: "var(--color-text-muted)", fontSize: "0.925rem", maxWidth: "420px", lineHeight: 1.6 }}>
            {t(
              "reviews.successSubtext",
              "Vielen Dank für Ihre Rückmeldung. Ihre Bewertung ist nun direkt auf der Website veröffentlicht."
            )}
          </p>

          <Button variant="secondary" size="md" onClick={handleModalClose} style={{ minWidth: "160px" }}>
            {t("common:close", "Schließen")}
          </Button>
        </div>
      )}

      {/* ── Case 3: Authenticated Review Form ───────────────────────── */}
      {isAuthenticated && !isSuccess && (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          {/* User profile banner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-sm)",
              padding: "var(--space-sm) var(--space-md)",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border-subtle)",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#D4AF37",
                color: "#000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.875rem",
              }}
            >
              {(user?.full_name || user?.email || "U")[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#ffffff" }}>
                {user?.full_name || user?.email}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#D4AF37" }}>
                ✓ {t("reviews.verifiedBuyer", "Verifizierter Kunde")}
              </div>
            </div>
          </div>

          {/* Star Rating Selector */}
          <div>
            <label style={{ display: "block", marginBottom: "var(--space-xs)", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>
              {t("reviews.yourRating", "Ihre Bewertung")} *
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`${star} Sterne`}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "4px",
                      cursor: "pointer",
                      fontSize: "2rem",
                      lineHeight: 1,
                      color: active ? "#D4AF37" : "rgba(255, 255, 255, 0.2)",
                      transition: "transform 0.15s ease, color 0.15s ease",
                      transform: active ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    ★
                  </button>
                );
              })}
              <span style={{ marginLeft: "var(--space-sm)", fontSize: "0.875rem", color: "#D4AF37", fontWeight: 600 }}>
                {starLabels[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* Text Area */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-xs)" }}>
              <label htmlFor="review-text" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>
                {t("reviews.yourReview", "Ihre Rezension")} *
              </label>
              <span style={{ fontSize: "0.75rem", color: text.length > 300 ? "#ef4444" : "var(--color-text-muted)" }}>
                {text.length} / 300
              </span>
            </div>
            <textarea
              id="review-text"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t(
                "reviews.placeholder",
                "Beschreiben Sie Ihre Erfahrung mit unserem Service, der Kaufabwicklung und Ihrem Fahrzeug..."
              )}
              required
              minLength={5}
              maxLength={300}
              style={{
                width: "100%",
                padding: "var(--space-md)",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                color: "#ffffff",
                fontSize: "0.925rem",
                lineHeight: 1.5,
                resize: "none",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#D4AF37")}
              onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              style={{
                padding: "var(--space-sm) var(--space-md)",
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                borderRadius: "var(--radius-sm)",
                color: "#ef4444",
                fontSize: "0.875rem",
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* Footer Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-md)", marginTop: "var(--space-xs)" }}>
            <Button type="button" variant="ghost" size="md" onClick={handleModalClose} disabled={isSubmitting}>
              {t("common:cancel", "Abbrechen")}
            </Button>
            <Button
              type="submit"
              variant="secondary"
              size="md"
              disabled={isSubmitting || text.trim().length < 5}
              style={{ minWidth: "150px" }}
            >
              {isSubmitting ? t("common:submitting", "Wird gesendet...") : t("reviews.submitButton", "Bewertung absenden")}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default CreateReviewModal;
