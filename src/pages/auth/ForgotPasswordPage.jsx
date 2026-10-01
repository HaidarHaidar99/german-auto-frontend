import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import authService from "../../services/auth/auth.service";
import Input from "../../components/forms/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Icon from "../../components/common/Icon";
import { useGsapContext } from "../../hooks/useAnimation";
import { gsap, isReducedMotion } from "../../utils/animation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordPage() {
  const { t } = useTranslation(["auth", "common"]);
  const location = useLocation();
  const pageContainerRef = useRef(null);

  const isAdminTarget = Boolean(
    new URLSearchParams(location.search).get("target") === "admin" ||
    location.state?.target === "admin" ||
    location.state?.isAdmin ||
    (typeof location.state?.from === "string" && location.state.from.includes("admin"))
  );

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    document.title = isAdminTarget
      ? `Admin Core | ${t("forgotPassword")} | König Automobile Rheinberg`
      : `${t("forgotPassword")} | König Automobile Rheinberg`;
  }, [t, isAdminTarget]);

  useGsapContext(pageContainerRef, () => {
    if (isReducedMotion()) return;
    gsap.from(".auth-card", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power2.out",
    });
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setServerError("");

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      setError(t("validationEmailValid"));
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setIsSuccess(true);
    } catch (err) {
      if (err?.statusCode === 429) {
        setServerError(err?.message || "Zu viele Anfragen. Bitte warten Sie einen Moment.");
      } else {
        // Generic safe response to prevent email enumeration
        setIsSuccess(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={pageContainerRef}
      className="auth-page-container"
      style={{
        padding: "clamp(var(--space-2xl), 6vw, var(--space-4xl)) var(--space-md)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "75vh",
      }}
    >
      <div
        className="auth-card surface-card"
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "var(--color-card)",
          borderRadius: "var(--radius-2xl)",
          border: "1px solid var(--color-border)",
          padding: "clamp(var(--space-xl), 5vw, var(--space-2xl))",
          boxShadow: "var(--shadow-elevation-2)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "200px",
            height: "2px",
            background: "linear-gradient(90deg, transparent, var(--color-secondary), transparent)",
          }}
        />

        <div style={{ textAlign: "center", marginBottom: "var(--space-xl)" }}>
          <h1
            style={{
              fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
              fontWeight: "var(--font-weight-bold)",
              letterSpacing: "var(--tracking-tight)",
              margin: 0,
              color: "var(--color-text)",
            }}
          >
            {t("forgotPassword")}
          </h1>
        </div>

        {serverError && (
          <div
            role="alert"
            style={{
              padding: "var(--space-sm) var(--space-md)",
              backgroundColor: "rgba(220, 38, 38, 0.1)",
              border: "1px solid rgba(220, 38, 38, 0.3)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-error)",
              fontSize: "var(--font-size-sm)",
              marginBottom: "var(--space-md)",
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-xs)",
            }}
          >
            <Icon name="alert-circle" size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>{serverError}</span>
          </div>
        )}

        {isSuccess ? (
          <div style={{ textAlign: "center", padding: "var(--space-md) 0" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                color: "var(--color-success)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto var(--space-md)",
              }}
            >
              <Icon name="check" size={28} />
            </div>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "var(--font-size-sm)",
                lineHeight: 1.6,
                margin: "0 0 var(--space-xl) 0",
              }}
            >
              {t("forgotSuccess")}
            </p>
            <Button as={Link} to={isAdminTarget ? "/admin/login" : "/login"} variant="primary" size="md" fullWidth>
              {t("backToLogin")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <Input
              id="forgot-email"
              name="email"
              type="email"
              label={t("email")}
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              autoComplete="email"
              required
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              fullWidth
              style={{ marginTop: "var(--space-xs)" }}
            >
              {t("sendResetLink")}
            </Button>

            <div style={{ textAlign: "center", marginTop: "var(--space-md)" }}>
              <Link
                to={isAdminTarget ? "/admin/login" : "/login"}
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "#D4AF37",
                  fontWeight: 600,
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                  transition: "color var(--transition-fast)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f3e198")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#D4AF37")}
              >
                ← {t("backToLogin")}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
