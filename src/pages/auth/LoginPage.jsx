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

  // SEO Title
  useEffect(() => {
    document.title = `${t("loginTitle")} | German Auto`;
  }, [t]);

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
      await login(email.trim().toLowerCase(), password);
      // Determine return URL
      const fromPath = location.state?.from?.pathname;
      const redirectTarget = fromPath && fromPath !== "/login" ? fromPath : "/account";
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
        {/* Subtle ambient luxury light accent */}
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
            {t("loginTitle")}
          </h1>
        </div>

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
              backgroundColor: "rgba(197, 160, 89, 0.1)",
              border: "1px solid rgba(197, 160, 89, 0.3)",
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

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Link
              to="/forgot-password"
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-secondary)",
                textDecoration: "none",
                transition: "color var(--transition-fast)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-secondary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
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
            style={{ marginTop: "var(--space-xs)" }}
          >
            {loading ? t("loggingIn") : t("loginTitle")}
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
          {t("noAccount")}{" "}
          <Link
            to="/signup"
            style={{
              color: "var(--color-secondary)",
              fontWeight: "var(--font-weight-semibold)",
              textDecoration: "none",
            }}
          >
            {t("signupTitle")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
