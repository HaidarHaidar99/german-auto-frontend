import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import authService from "../../services/auth/auth.service";
import Input from "../../components/forms/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Icon from "../../components/common/Icon";
import { useGsapContext } from "../../hooks/useAnimation";
import { gsap, isReducedMotion } from "../../utils/animation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignupPage() {
  const { t } = useTranslation(["auth", "common"]);
  const pageContainerRef = useRef(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    document.title = `${t("signupTitle")} | German Auto`;
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

  const validate = () => {
    const errs = {};
    if (!fullName || fullName.trim().length < 2) {
      errs.fullName = t("validationNameMin");
    }
    if (!email || !EMAIL_REGEX.test(email.trim())) {
      errs.email = t("validationEmailValid");
    }
    if (!password || password.length < 8) {
      errs.password = t("validationPasswordMin");
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = t("validationPasswordMatch");
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setResendSuccess(false);

    if (!validate()) return;

    setLoading(true);
    try {
      await authService.signup({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirm_password: confirmPassword,
      });
      setIsSuccess(true);
    } catch (err) {
      setServerError(err?.message || "Registrierung fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendSuccess(false);
    try {
      await authService.resendVerification(email.trim().toLowerCase());
      setResendSuccess(true);
      setServerError("");
    } catch (err) {
      setServerError(err?.message || "Fehler beim erneuten Senden.");
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

        {isSuccess ? (
          /* Polished Verification-Required State */
          <div style={{ textAlign: "center", padding: "var(--space-md) 0" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "rgba(197, 160, 89, 0.15)",
                color: "var(--color-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto var(--space-md)",
              }}
            >
              <Icon name="mail" size={28} />
            </div>

            <h2
              style={{
                fontSize: "var(--font-size-xl)",
                fontWeight: "var(--font-weight-bold)",
                letterSpacing: "var(--tracking-tight)",
                margin: "0 0 var(--space-xs) 0",
                color: "var(--color-text)",
              }}
            >
              {t("signupSuccessTitle")}
            </h2>

            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "var(--font-size-sm)",
                lineHeight: 1.6,
                margin: "0 0 var(--space-xl) 0",
              }}
            >
              {t("signupSuccessMessage")}
              <br />
              <strong style={{ color: "var(--color-text)" }}>{email}</strong>
            </p>

            {resendSuccess && (
              <div
                role="status"
                style={{
                  padding: "var(--space-sm) var(--space-md)",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-success)",
                  fontSize: "var(--font-size-xs)",
                  marginBottom: "var(--space-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "var(--space-xs)",
                }}
              >
                <Icon name="check" size={14} />
                <span>{t("resendSuccess")}</span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
              <Button
                as={Link}
                to="/login"
                variant="primary"
                size="md"
                fullWidth
              >
                {t("goToLogin")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={resending}
                onClick={handleResend}
                fullWidth
              >
                {t("resendVerification")}
              </Button>
            </div>
          </div>
        ) : (
          /* Signup Form */
          <>
            <div style={{ textAlign: "center", marginBottom: "var(--space-xl)" }}>
              <div style={{ display: "inline-block", marginBottom: "var(--space-xs)" }}>
                <Badge variant="outline" size="sm">
                  German Auto
                </Badge>
              </div>
              <h1
                style={{
                  fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                  fontWeight: "var(--font-weight-bold)",
                  letterSpacing: "var(--tracking-tight)",
                  margin: "var(--space-2xs) 0 0 0",
                  color: "var(--color-text)",
                }}
              >
                {t("signupTitle")}
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

            {/* Continue with Google (CUSTOMER ONLY) */}
            <div style={{ marginBottom: "var(--space-md)" }}>
              <button
                type="button"
                id="btn-google-auth-signup"
                onClick={() => {
                  const apiBaseUrl =
                    import.meta.env.VITE_API_BASE_URL ||
                    (typeof window !== "undefined" && window.location.hostname.includes("vercel.app")
                      ? "https://german-auto-backend.vercel.app/api"
                      : "http://localhost:5000/api");
                  window.location.href = `${apiBaseUrl}/auth/google`;
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  color: "var(--color-text)",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-semibold)",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.borderColor = "var(--color-secondary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                  e.currentTarget.style.borderColor = "var(--color-border)";
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{t("continueWithGoogle")}</span>
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                  margin: "var(--space-md) 0",
                }}
              >
                <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border-subtle)" }} />
                <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
                  {t("orContinueWithEmail")}
                </span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border-subtle)" }} />
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              <Input
                id="signup-name"
                name="full_name"
                type="text"
                label={t("fullName")}
                placeholder={t("fullNamePlaceholder")}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
                autoComplete="name"
                required
                disabled={loading}
              />

              <Input
                id="signup-email"
                name="email"
                type="email"
                label={t("email")}
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                autoComplete="email"
                required
                disabled={loading}
              />

              <div style={{ position: "relative" }}>
                <Input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  label={t("password")}
                  placeholder={t("passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "36px",
                    background: "none",
                    border: "none",
                    color: "var(--color-text-subtle)",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name={showPassword ? "eye-off" : "eye"} size={16} />
                </button>
              </div>

              <Input
                id="signup-confirm-password"
                name="confirm_password"
                type={showPassword ? "text" : "password"}
                label={t("confirmPassword")}
                placeholder={t("passwordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                autoComplete="new-password"
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
                {loading ? t("signingUp") : t("signupTitle")}
              </Button>
            </form>

            <div
              style={{
                marginTop: "var(--space-xl)",
                paddingTop: "var(--space-lg)",
                borderTop: "1px solid var(--color-border-subtle)",
                textAlign: "center",
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-secondary)",
              }}
            >
              {t("alreadyAccount")}{" "}
              <Link
                to="/login"
                style={{
                  color: "var(--color-secondary)",
                  fontWeight: "var(--font-weight-semibold)",
                  textDecoration: "none",
                }}
              >
                {t("loginTitle")}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SignupPage;
