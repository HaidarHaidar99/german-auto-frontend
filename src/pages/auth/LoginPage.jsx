import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import authService from "../../services/auth/auth.service";
import Input from "../../components/forms/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Icon from "../../components/common/Icon";
import { useGsapContext } from "../../hooks/useAnimation";
import { gsap, isReducedMotion } from "../../utils/animation";
import { getBaseUrl } from "../../services/api/client";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const { t } = useTranslation(["auth", "common"]);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pageContainerRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isUnverified, setIsUnverified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Check if destination is the admin portal
  const isAdminTarget = Boolean(
    location.pathname === "/admin/login" ||
    location.pathname === "/admin" ||
    location.pathname.startsWith("/admin/") ||
    location.state?.from?.pathname?.startsWith("/admincoresecure") ||
    (typeof location.state?.from === "string" && location.state.from.startsWith("/admincoresecure")) ||
    new URLSearchParams(location.search).get("target") === "admin"
  );

  // SEO Title
  useEffect(() => {
    document.title = isAdminTarget
      ? `${t("adminPortalTitle")} | German Auto`
      : `${t("loginTitle")} | German Auto`;
  }, [t, isAdminTarget]);

  // Handle Google OAuth redirect errors
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get("error");
    if (errorParam === "google_not_configured") {
      setServerError(t("googleNotConfigured"));
    } else if (errorParam) {
      setServerError(decodeURIComponent(errorParam));
    }
  }, [location.search, t]);

  const handleGoogleSignIn = () => {
    const apiBaseUrl = getBaseUrl();
    window.location.href = `${apiBaseUrl}/auth/google`;
  };

  // Entrance animations
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
    if (!email || !EMAIL_REGEX.test(email.trim())) {
      errs.email = t("validationEmailValid");
    }
    if (!password) {
      errs.password = t("validationPasswordMin");
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setIsUnverified(false);
    setResendSuccess(false);

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await login(email.trim().toLowerCase(), password);
      // Wipe password from component state immediately after authentication
      setPassword("");

      // Determine return URL
      const userRole = res?.data?.user?.role;
      const isAdminRole = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
      const from = location.state?.from;

      let fromPath = null;
      if (typeof from === "string") {
        fromPath = from;
      } else if (from?.pathname) {
        fromPath = from.pathname + (from.search || "");
      }

      const redirectTarget = fromPath && fromPath !== "/login" ? fromPath : (isAdminRole ? "/admincoresecure" : "/account");
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      const msg = err?.message || "Anmeldung fehlgeschlagen.";
      setServerError(msg);
      if (err?.statusCode === 403 || msg.toLowerCase().includes("verify")) {
        setIsUnverified(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email || !EMAIL_REGEX.test(email.trim())) {
      setErrors((prev) => ({ ...prev, email: t("validationEmailValid") }));
      return;
    }
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
      className="auth-page-split"
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--color-background)",
      }}
    >
      {/* Left side: Cinematic Imagery */}
      <div
        className="hide-mobile"
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "var(--space-2xl)",
          color: "#fff",
          background: "url('https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80') center/cover no-repeat",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 100%)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, maxWidth: "500px" }}>
          <h2 style={{ fontFamily: "var(--font-family-display)", fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.1, marginBottom: "var(--space-sm)" }}>
            {t("heroTitle", { ns: "common", defaultValue: "Uncompromising Performance." })}
          </h2>
          <p style={{ fontSize: "var(--font-size-lg)", color: "rgba(255,255,255,0.7)" }}>
            {t("heroSubtitle", { ns: "common", defaultValue: "Enter the world of premium automotive excellence." })}
          </p>
        </div>
      </div>

      {/* Right side: Auth Form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(var(--space-2xl), 6vw, var(--space-4xl)) var(--space-md)",
          position: "relative",
        }}
      >
        <div
          className="auth-card"
          style={{
            width: "100%",
            maxWidth: "420px",
          }}
        >
          <div style={{ marginBottom: "var(--space-2xl)" }}>
            <h1
              style={{
                fontFamily: "var(--font-family-display)",
                fontSize: "clamp(2rem, 3vw, 2.5rem)",
                lineHeight: 1.1,
                margin: "0 0 var(--space-xs) 0",
                color: "var(--color-text)",
              }}
            >
              {isAdminTarget ? t("adminPortalTitle") : t("loginTitle")}
            </h1>
            <p
              style={{
                fontSize: "var(--font-size-base)",
                color: "var(--color-text-secondary)",
                margin: 0,
              }}
            >
              {isAdminTarget ? t("adminLoginSubtitle") : t("loginSubtitle", { defaultValue: "Welcome back. Please enter your details." })}
            </p>
          </div>

          {/* Session Expired Notice */}
          {location.state?.reason === "session_expired" && !serverError && (
            <div
              role="status"
              style={{
                padding: "var(--space-sm) var(--space-md)",
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "var(--radius-md)",
                color: "#fbbf24",
                fontSize: "var(--font-size-sm)",
                marginBottom: "var(--space-md)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Icon name="alert-circle" size={16} style={{ flexShrink: 0 }} />
              <span>
                {t("sessionExpiredNotice", {
                  defaultValue: "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
                })}
              </span>
            </div>
          )}

          {/* Server Error Message */}
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

          {/* Unverified account resend prompt */}
          {isUnverified && (
            <div
              style={{
                padding: "var(--space-md)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "var(--radius-md)",
                marginBottom: "var(--space-md)",
              }}
            >
              <p
                style={{
                  margin: "0 0 var(--space-sm) 0",
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                {t("unverifiedAccount")}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={resending}
                onClick={handleResendVerification}
                fullWidth
              >
                {t("resendVerification")}
              </Button>
            </div>
          )}

          {/* Resend Success Message */}
          {resendSuccess && (
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
                gap: "var(--space-xs)",
              }}
            >
              <Icon name="check" size={16} />
              <span>{t("resendSuccess")}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <Input
              id="login-email"
              name="email"
              type="email"
              label={t("email")}
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  document.getElementById("login-password")?.focus();
                }
              }}
              error={errors.email}
              autoComplete="email"
              required
              disabled={loading}
            />

            <div style={{ position: "relative" }}>
              <Input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                label={t("password")}
                placeholder={t("passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                autoComplete="current-password"
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

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-8px" }}>
              <Link
                to={isAdminTarget ? "/forgot-password?target=admin" : "/forgot-password"}
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 500,
                  color: "var(--color-text)",
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                  transition: "color var(--transition-fast)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text)")}
              >
                {t("forgotPassword")}
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              fullWidth
              style={{ marginTop: "var(--space-sm)", borderRadius: "0px" }}
            >
              {loading ? t("loggingIn") : t("loginTitle")}
            </Button>

            {!isAdminTarget && (
              <div
                style={{
                  marginTop: "var(--space-md)",
                  textAlign: "center",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {t("noAccount")}{" "}
                <Link
                  to="/signup"
                  style={{
                    color: "var(--color-text)",
                    fontWeight: "var(--font-weight-bold)",
                    textDecoration: "underline",
                    textUnderlineOffset: "4px",
                  }}
                >
                  {t("signupTitle")}
                </Link>
              </div>
            )}
          </form>

          {/* Continue with Google (CUSTOMER ONLY) */}
          {!isAdminTarget && (
            <div style={{ marginTop: "var(--space-md)" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                  margin: "var(--space-lg) 0",
                }}
              >
                <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border-subtle)" }} />
                <span style={{ fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "var(--color-text-secondary)" }}>
                  {t("orContinueWithEmail", { defaultValue: "Or" })}
                </span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border-subtle)" }} />
              </div>

              <button
                type="button"
                id="btn-google-auth-login"
                onClick={handleGoogleSignIn}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  backgroundColor: "#000000",
                  border: "1px solid #ffffff",
                  borderRadius: "0px",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontFamily: "var(--font-family-sans)",
                  fontWeight: "700",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.color = "#000000";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#000000";
                  e.currentTarget.style.color = "#ffffff";
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>{t("continueWithGoogle")}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
