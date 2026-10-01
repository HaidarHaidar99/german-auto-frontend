import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import authService from "../../services/auth/auth.service";
import Input from "../../components/forms/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Icon from "../../components/common/Icon";
import { useGsapContext } from "../../hooks/useAnimation";
import { gsap, isReducedMotion } from "../../utils/animation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function VerifyEmailPage() {
  const { t } = useTranslation(["auth", "common"]);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const pageContainerRef = useRef(null);

  const [status, setStatus] = useState("idle"); // 'idle' | 'verifying' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    document.title = `${t("verifyEmailTitle")} | König Automobile Rheinberg`;
  }, [t]);

  useGsapContext(pageContainerRef, () => {
    if (isReducedMotion()) return;
    gsap.from(".auth-card", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power2.out",
    });
  });

  // Automatically trigger verification if token is present
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const verify = async () => {
      setStatus("verifying");
      try {
        await authService.verifyEmail(token);
        if (isMounted) {
          setStatus("success");
        }
      } catch (err) {
        if (isMounted) {
          setStatus("error");
          setErrorMessage(err?.message || t("verifyFailedMessage"));
        }
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [token, t]);

  const handleResend = async (e) => {
    e.preventDefault();
    setEmailError("");
    setResendSuccess(false);

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      setEmailError(t("validationEmailValid"));
      return;
    }

    setResending(true);
    try {
      await authService.resendVerification(email.trim().toLowerCase());
      setResendSuccess(true);
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(err?.message || "Fehler beim erneuten Senden.");
    } finally {
      setResending(false);
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
          maxWidth: "480px",
          backgroundColor: "var(--color-card)",
          borderRadius: "var(--radius-2xl)",
          border: "1px solid var(--color-border)",
          padding: "clamp(var(--space-xl), 5vw, var(--space-2xl))",
          boxShadow: "var(--shadow-elevation-2)",
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
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

        <div style={{ display: "inline-block", marginBottom: "var(--space-xs)" }}>
          <Badge variant="outline" size="sm">
            König Automobile Rheinberg
          </Badge>
        </div>

        {/* 1. Loading State */}
        {status === "verifying" && (
          <div style={{ padding: "var(--space-xl) 0" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "3px solid var(--color-border)",
                borderTopColor: "var(--color-secondary)",
                animation: "btn-spin 0.8s linear infinite",
                margin: "0 auto var(--space-md)",
              }}
            />
            <h1 style={{ fontSize: "var(--font-size-xl)", margin: "0 0 var(--space-2xs) 0" }}>
              {t("verifyEmailTitle")}
            </h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)", margin: 0 }}>
              {t("verifying")}
            </p>
          </div>
        )}

        {/* 2. Success State */}
        {status === "success" && (
          <div style={{ padding: "var(--space-md) 0" }}>
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
            <h1
              style={{
                fontSize: "var(--font-size-xl)",
                fontWeight: "var(--font-weight-bold)",
                margin: "0 0 var(--space-xs) 0",
              }}
            >
              {t("verifySuccessTitle")}
            </h1>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "var(--font-size-sm)",
                lineHeight: 1.6,
                margin: "0 0 var(--space-xl) 0",
              }}
            >
              {t("verifySuccessMessage")}
            </p>
            <Button as={Link} to="/login" variant="primary" size="lg" fullWidth>
              {t("goToLogin")}
            </Button>
          </div>
        )}

        {/* 3. Error State (or Direct Access without token) */}
        {(status === "error" || (status === "idle" && !token)) && (
          <div style={{ padding: "var(--space-md) 0" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "rgba(220, 38, 38, 0.12)",
                color: "var(--color-error)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto var(--space-md)",
              }}
            >
              <Icon name="alert-circle" size={28} />
            </div>

            <h1
              style={{
                fontSize: "var(--font-size-xl)",
                fontWeight: "var(--font-weight-bold)",
                margin: "0 0 var(--space-xs) 0",
              }}
            >
              {status === "error" ? t("verifyFailedTitle") : t("verifyEmailTitle")}
            </h1>

            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "var(--font-size-sm)",
                lineHeight: 1.6,
                margin: "0 0 var(--space-lg) 0",
              }}
            >
              {errorMessage || t("verifyFailedMessage")}
            </p>

            {resendSuccess ? (
              <div
                role="status"
                style={{
                  padding: "var(--space-sm) var(--space-md)",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-success)",
                  fontSize: "var(--font-size-sm)",
                  marginBottom: "var(--space-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "var(--space-xs)",
                }}
              >
                <Icon name="check" size={16} />
                <span>{t("resendSuccess")}</span>
              </div>
            ) : (
              <form onSubmit={handleResend} style={{ textAlign: "left", marginBottom: "var(--space-lg)" }}>
                <Input
                  id="resend-email"
                  name="email"
                  type="email"
                  label={t("email")}
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={emailError}
                  required
                  disabled={resending}
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="md"
                  loading={resending}
                  fullWidth
                  style={{ marginTop: "var(--space-sm)" }}
                >
                  {t("resendVerification")}
                </Button>
              </form>
            )}

            <div style={{ marginTop: "var(--space-md)" }}>
              <Link
                to="/login"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-secondary)",
                  textDecoration: "none",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                {t("backToLogin")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;
