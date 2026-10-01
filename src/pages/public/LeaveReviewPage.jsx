import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/ui/Button";
import Icon from "../../components/common/Icon";
import reviewsService from "../../services/reviews/reviews.service";

/**
 * German Auto — Dedicated Leave a Review Page
 * Uses the exact dark/black form input styling from the login screen.
 * Fully translated in German and English.
 */
export function LeaveReviewPage() {
  const { t, i18n } = useTranslation(["common", "navigation", "auth"]);
  const currentLang = i18n.language?.startsWith("en") ? "en" : "de";
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    document.title = currentLang === "en"
      ? "Leave a Review | German Auto"
      : "Bewertung abgeben | German Auto";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentLang]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(
        currentLang === "en"
          ? "The photo must not exceed 5 MB."
          : "Das Foto darf maximal 5 MB groß sein."
      );
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage(
        currentLang === "en"
          ? "Allowed formats: JPG, PNG, WEBP, AVIF."
          : "Erlaubte Formate: JPG, PNG, WEBP, AVIF."
      );
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrorMessage("");
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 5) {
      setErrorMessage(
        currentLang === "en"
          ? "Please provide at least 5 characters for your review."
          : "Bitte geben Sie mindestens 5 Zeichen für Ihre Bewertung ein."
      );
      return;
    }

    if (trimmed.length > 5000) {
      setErrorMessage(
        currentLang === "en"
          ? "Review text must not exceed 5,000 characters."
          : "Der Text darf maximal 5.000 Zeichen lang sein."
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("rating", String(rating));
        formData.append("text", trimmed);
        formData.append("image", imageFile);
        await reviewsService.submitReview(formData);
      } else {
        await reviewsService.submitReview({
          rating,
          text: trimmed,
        });
      }

      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const msg = err.errors?.text || err.errors?.rating || err.message || (
        currentLang === "en"
          ? "Failed to submit review. Please try again."
          : "Fehler beim Absenden der Bewertung. Bitte versuchen Sie es erneut."
      );
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const starLabels = currentLang === "en" ? {
    5: "5 Stars — Outstanding",
    4: "4 Stars — Very Good",
    3: "3 Stars — Good",
    2: "2 Stars — Fair",
    1: "1 Star — Poor",
  } : {
    5: "5 Sterne — Ausgezeichnet",
    4: "4 Sterne — Sehr gut",
    3: "3 Sterne — Gut",
    2: "2 Sterne — Befriedigend",
    1: "1 Stern — Ungenügend",
  };

  return (
    <div
      style={{
        backgroundColor: "#000000",
        minHeight: "85vh",
        padding: "clamp(var(--space-2xl), 6vw, var(--space-4xl)) var(--space-md)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "620px",
          backgroundColor: "#0a0a0a",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "var(--radius-lg)",
          padding: "clamp(var(--space-xl), 5vw, var(--space-3xl))",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8)",
        }}
      >
        {/* Back Link */}
        <Link
          to="/#reviews"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--color-text-muted)",
            fontSize: "0.875rem",
            textDecoration: "none",
            marginBottom: "var(--space-xl)",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#D4AF37")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
        >
          ← {currentLang === "en" ? "Back to Reviews" : "Zurück zu den Bewertungen"}
        </Link>

        {/* ── Case 1: Success State ───────────────────────────────── */}
        {isSuccess ? (
          <div style={{ textAlign: "center", padding: "var(--space-xl) 0" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "rgba(34, 197, 94, 0.15)",
                border: "1px solid rgba(34, 197, 94, 0.4)",
                color: "#22c55e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto var(--space-lg)",
              }}
            >
              <Icon name="check" size={32} />
            </div>

            <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#ffffff", margin: "0 0 var(--space-sm)" }}>
              {currentLang === "en" ? "Review Submitted Successfully!" : "Bewertung erfolgreich übermittelt!"}
            </h2>

            <p style={{ color: "var(--color-text-muted)", fontSize: "1rem", lineHeight: 1.6, margin: "0 auto var(--space-2xl)", maxWidth: "460px" }}>
              {currentLang === "en"
                ? "Thank you for sharing your experience. Your review will be published following short editorial verification."
                : "Vielen Dank für Ihre Rückmeldung. Ihre Bewertung wird nach kurzer redaktioneller Prüfung auf der Website freigeschaltet."}
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-md)", flexWrap: "wrap" }}>
              <Button as={Link} to="/#reviews" variant="secondary" size="lg" style={{ borderRadius: "0px" }}>
                {currentLang === "en" ? "View Reviews →" : "Zu den Bewertungen →"}
              </Button>
              {isAuthenticated && (
                <Button as={Link} to="/account/reviews" variant="outline" size="lg" style={{ borderRadius: "0px" }}>
                  {currentLang === "en" ? "My Reviews" : "Meine Bewertungen"}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{ marginBottom: "var(--space-2xl)" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#D4AF37",
                  fontWeight: 700,
                  display: "block",
                  marginBottom: "var(--space-2xs)",
                }}
              >
                {currentLang === "en" ? "Client Feedback" : "Kundenstimmen"}
              </span>
              <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "#ffffff", margin: "0 0 var(--space-xs)" }}>
                {currentLang === "en" ? "Share Your Experience" : "Ihre Bewertung abgeben"}
              </h1>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
                {currentLang === "en"
                  ? "We value your honest opinion regarding our vehicles, advisory services, and handover experience."
                  : "Teilen Sie Ihre ehrliche Meinung über unsere Fahrzeuge, die Beratung und die Kaufabwicklung."}
              </p>
            </div>

            {/* ── Case 2: Unauthenticated Warning ─────────────────── */}
            {!isAuthenticated ? (
              <div
                style={{
                  padding: "var(--space-xl)",
                  backgroundColor: "rgba(212, 175, 55, 0.06)",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  borderRadius: "var(--radius-md)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
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
                  <Icon name="user" size={22} />
                </div>

                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#ffffff", margin: "0 0 var(--space-xs)" }}>
                  {currentLang === "en" ? "Sign in to Leave a Review" : "Anmeldung erforderlich"}
                </h3>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.925rem", lineHeight: 1.5, margin: "0 auto var(--space-xl)", maxWidth: "420px" }}>
                  {currentLang === "en"
                    ? "To ensure genuine and verified client testimonials, please sign in or register an account before submitting your review."
                    : "Um echte und verifizierte Kundenstimmen zu garantieren, melden Sie sich bitte an oder erstellen Sie ein kostenloses Konto."}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", maxWidth: "280px", margin: "0 auto" }}>
                  <Button
                    as={Link}
                    to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                    variant="secondary"
                    size="md"
                    style={{ justifyContent: "center", borderRadius: "0px" }}
                  >
                    {currentLang === "en" ? "Sign In →" : "Jetzt Anmelden →"}
                  </Button>
                  <Button
                    as={Link}
                    to={`/signup?redirect=${encodeURIComponent(location.pathname)}`}
                    variant="outline"
                    size="md"
                    style={{ justifyContent: "center", borderRadius: "0px" }}
                  >
                    {currentLang === "en" ? "Create Account" : "Konto erstellen"}
                  </Button>
                </div>
              </div>
            ) : (
              /* ── Case 3: Authenticated Form ─────────────────────── */
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-xl)" }}>
                {/* Active User Identity */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-md)",
                    padding: "var(--space-md)",
                    backgroundColor: "#000000",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: "#D4AF37",
                      color: "#000000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "1rem",
                      flexShrink: 0,
                    }}
                  >
                    {(user?.full_name || user?.email || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff" }}>
                      {user?.full_name || user?.email}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#D4AF37", fontWeight: 600 }}>
                      ✓ {currentLang === "en" ? "Verified Customer" : "Verifizierter Kunde"}
                    </div>
                  </div>
                </div>

                {/* Rating Stars Selector */}
                <div>
                  <label style={{ display: "block", marginBottom: "var(--space-xs)", fontSize: "0.875rem", fontWeight: 600, color: "#ffffff" }}>
                    {currentLang === "en" ? "Overall Rating *" : "Gesamtbewertung *"}
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
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
                            padding: "6px",
                            cursor: "pointer",
                            fontSize: "2.2rem",
                            lineHeight: 1,
                            color: active ? "#D4AF37" : "rgba(255, 255, 255, 0.2)",
                            transition: "transform 0.15s ease, color 0.15s ease",
                            transform: active ? "scale(1.15)" : "scale(1)",
                          }}
                        >
                          ★
                        </button>
                      );
                    })}
                    <span style={{ marginLeft: "var(--space-sm)", fontSize: "0.9rem", color: "#D4AF37", fontWeight: 600 }}>
                      {starLabels[hoverRating || rating]}
                    </span>
                  </div>
                </div>

                {/* Review Text Area - Black Field matching Login */}
                <div className="form-field">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-xs)" }}>
                    <label htmlFor="leave-review-text" className="form-label" style={{ margin: 0, color: "#ffffff", fontWeight: 600 }}>
                      {currentLang === "en" ? "Your Review *" : "Ihre Rezension *"}
                    </label>
                    <span style={{ fontSize: "0.8rem", color: text.length > 5000 ? "#ef4444" : "var(--color-text-muted)" }}>
                      {text.length} / 5.000
                    </span>
                  </div>
                  <textarea
                    id="leave-review-text"
                    rows={6}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={
                      currentLang === "en"
                        ? "Describe your experience with our vehicle selection, advisory service, and overall transaction..."
                        : "Beschreiben Sie Ihre Erfahrung mit der Beratung, der Fahrzeugauswahl und dem Kaufprozess..."
                    }
                    required
                    minLength={5}
                    maxLength={5000}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      backgroundColor: "#000000",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "var(--radius-sm)",
                      color: "#ffffff",
                      fontSize: "0.95rem",
                      lineHeight: 1.6,
                      resize: "vertical",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s ease",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#D4AF37")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.2)")}
                  />
                </div>

                {/* Optional Photo Attachment */}
                <div>
                  <label style={{ display: "block", marginBottom: "var(--space-xs)", fontSize: "0.875rem", fontWeight: 600, color: "#ffffff" }}>
                    {currentLang === "en" ? "Attach Photo (Optional)" : "Foto beifügen (optional)"}
                  </label>

                  {imagePreview ? (
                    <div
                      style={{
                        position: "relative",
                        width: "160px",
                        height: "110px",
                        borderRadius: "var(--radius-sm)",
                        overflow: "hidden",
                        border: "1px solid #D4AF37",
                      }}
                    >
                      <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        title={currentLang === "en" ? "Remove" : "Entfernen"}
                        style={{
                          position: "absolute",
                          top: "6px",
                          right: "6px",
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          color: "#ffffff",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                        id="review-image-file"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ borderRadius: "0px" }}
                      >
                        📷 {currentLang === "en" ? "Choose Vehicle Photo" : "Fahrzeugfoto auswählen"}
                      </Button>
                      <div style={{ marginTop: "6px", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                        {currentLang === "en"
                          ? "Supported formats: JPG, PNG, WEBP up to 5 MB"
                          : "Unterstützte Formate: JPG, PNG, WEBP bis 5 MB"}
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div
                    style={{
                      padding: "var(--space-sm) var(--space-md)",
                      backgroundColor: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      borderRadius: "var(--radius-sm)",
                      color: "#f87171",
                      fontSize: "0.9rem",
                    }}
                  >
                    {errorMessage}
                  </div>
                )}

                {/* Submit Action */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-md)", marginTop: "var(--space-md)" }}>
                  <Button
                    type="submit"
                    variant="secondary"
                    size="lg"
                    disabled={isSubmitting || text.trim().length < 5}
                    style={{ width: "100%", justifyContent: "center", borderRadius: "0px" }}
                  >
                    {isSubmitting
                      ? (currentLang === "en" ? "Submitting..." : "Wird gesendet...")
                      : (currentLang === "en" ? "Submit Review →" : "Bewertung einreichen →")}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaveReviewPage;
