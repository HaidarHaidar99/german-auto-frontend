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

export function ResetPasswordPage() {
  const { t } = useTranslation(["auth", "common"]);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const isAdminTarget = Boolean(searchParams.get("target") === "admin");
  const pageContainerRef = useRef(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    document.title = `${t("resetPassword")} | German Auto`;
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

    if (!token) {
      setServerError("Kein gültiger Token übergeben. Bitte fordern Sie einen neuen Link an.");
      return;
    }

    if (!validate()) return;

    setLoading(true);
    try {
      await authService.resetPassword({
        token,
        password,
        confirm_password: confirmPassword,
      });
      setIsSuccess(true);
    } catch (err) {
      setServerError(err?.message || "Fehler beim Zurücksetzen des Passworts.");
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
          <div style={{ display: "inline-block", marginBottom: "var(--space-xs)" }}>
            <Badge variant={isAdminTarget ? "primary" : "outline"} size="sm">
              {isAdminTarget ? "ADMIN CORE" : "German Auto"}
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
            {t("resetPassword")}
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
            <h2 style={{ fontSize: "var(--font-size-lg)", margin: "0 0 var(--space-xs) 0" }}>
              {t("resetSuccessTitle")}
            </h2>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "var(--font-size-sm)",
                lineHeight: 1.6,
                margin: "0 0 var(--space-xl) 0",
              }}
            >
              {t("resetSuccessMessage")}
            </p>
            <Button as={Link} to={isAdminTarget ? "/admin/login" : "/login"} variant="primary" size="md" fullWidth>
              {t("goToLogin")}
            </Button>
          </div>
        ) : !token ? (
          <div style={{ textAlign: "center", padding: "var(--space-md) 0" }}>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)", marginBottom: "var(--space-lg)" }}>
              Es wurde kein gültiger Token übergeben. Bitte fordern Sie einen neuen Link zum Zurücksetzen an.
            </p>
            <Button as={Link} to="/forgot-password" variant="outline" size="md" fullWidth>
              {t("forgotPassword")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <div style={{ position: "relative" }}>
              <Input
                id="reset-password"
                name="password"
                type={showPassword ? "text" : "password"}
                label={t("newPassword")}
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
              id="reset-confirm-password"
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
              {loading ? t("resetting") : t("resetPassword")}
            </Button>

            <div style={{ textAlign: "center", marginTop: "var(--space-md)" }}>
              <Link
                to={isAdminTarget ? "/admin/login" : "/login"}
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-secondary)",
                  textDecoration: "none",
                }}
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

export default ResetPasswordPage;
