import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import AccountHeader from "../../components/account/AccountHeader";
import AccountNav from "../../components/account/AccountNav";
import Input from "../../components/forms/Input";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Icon from "../../components/common/Icon";
import { useGsapContext } from "../../hooks/useAnimation";
import { gsap, isReducedMotion } from "../../utils/animation";

export function SecurityPage() {
  const { t } = useTranslation(["account", "auth", "common"]);
  const { user, changePassword, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const pageContainerRef = useRef(null);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Delete Account State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    document.title = `${t("securityPageTitle")} | German Auto`;
  }, [t]);

  useGsapContext(pageContainerRef, () => {
    if (isReducedMotion()) return;
    gsap.from(".account-header", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power2.out",
    });

    gsap.from(".account-nav", {
      opacity: 0,
      y: 15,
      duration: 0.5,
      ease: "power2.out",
      delay: 0.1,
    });

    gsap.from([".security-form-card", ".danger-zone-card"], {
      opacity: 0,
      y: 25,
      duration: 0.6,
      stagger: 0.12,
      ease: "power2.out",
      delay: 0.15,
    });
  });

  const validatePasswordForm = () => {
    const errs = {};
    if (!currentPassword) {
      errs.currentPassword = t("validationCurrentPassword", { ns: "auth" });
    }
    if (!newPassword || newPassword.length < 8) {
      errs.newPassword = t("validationPasswordMin", { ns: "auth" });
    }
    if (newPassword !== confirmNewPassword) {
      errs.confirmNewPassword = t("validationPasswordMatch", { ns: "auth" });
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (!validatePasswordForm()) return;

    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword, confirmNewPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setFormErrors({});
    } catch (err) {
      setPasswordError(err?.message || "Fehler beim Aktualisieren des Passworts.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    setDeleteLoading(true);
    try {
      await deleteAccount();
      setIsDeleteModalOpen(false);
      navigate("/", { replace: true });
    } catch (err) {
      setDeleteError(err?.message || "Fehler beim Löschen des Kontos.");
      setDeleteLoading(false);
    }
  };

  return (
    <main
      ref={pageContainerRef}
      className="security-page"
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "var(--space-xl) var(--space-md) var(--space-4xl)",
      }}
    >
      <AccountHeader user={user} />
      <AccountNav style={{ marginBottom: "var(--space-2xl)" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2xl)", maxWidth: "800px" }}>
        {/* ── Section 1: Change Password ────────────────────────────────────────── */}
        <section
          aria-labelledby="change-password-heading"
          className="security-form-card surface-card"
          style={{
            backgroundColor: "var(--color-card)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            padding: "clamp(var(--space-lg), 4vw, var(--space-xl))",
            boxShadow: "var(--shadow-elevation-1)",
          }}
        >
          <div style={{ marginBottom: "var(--space-lg)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", marginBottom: "4px" }}>
              <Icon name="lock" size={18} color="var(--color-secondary)" />
              <h2
                id="change-password-heading"
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--font-weight-bold)",
                  letterSpacing: "var(--tracking-tight)",
                  margin: 0,
                  color: "var(--color-text)",
                }}
              >
                {t("changePasswordTitle")}
              </h2>
            </div>
            <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>
              {t("changePasswordSubtitle")}
            </p>
          </div>

          {passwordSuccess && (
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
              <span>{t("passwordUpdatedSuccess")}</span>
            </div>
          )}

          {passwordError && (
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
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <Input
              id="security-current-password"
              name="current_password"
              type="password"
              label={t("currentPassword")}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={formErrors.currentPassword}
              autoComplete="current-password"
              required
              disabled={passwordLoading}
            />

            <div style={{ position: "relative" }}>
              <Input
                id="security-new-password"
                name="new_password"
                type={showPassword ? "text" : "password"}
                label={t("newPassword")}
                placeholder={t("passwordPlaceholder", { ns: "auth" })}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={formErrors.newPassword}
                autoComplete="new-password"
                required
                disabled={passwordLoading}
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
              id="security-confirm-new-password"
              name="confirm_new_password"
              type={showPassword ? "text" : "password"}
              label={t("confirmNewPassword")}
              placeholder={t("passwordPlaceholder", { ns: "auth" })}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              error={formErrors.confirmNewPassword}
              autoComplete="new-password"
              required
              disabled={passwordLoading}
            />

            <div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={passwordLoading}
              >
                {passwordLoading ? t("updatingPassword") : t("updatePasswordButton")}
              </Button>
            </div>
          </form>
        </section>

        {/* ── Section 2: Danger Zone / Delete Account ───────────────────────────── */}
        <section
          aria-labelledby="danger-zone-heading"
          className="danger-zone-card surface-card"
          style={{
            backgroundColor: "var(--color-card)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid rgba(220, 38, 38, 0.25)",
            padding: "clamp(var(--space-lg), 4vw, var(--space-xl))",
            boxShadow: "var(--shadow-elevation-1)",
          }}
        >
          <div style={{ marginBottom: "var(--space-md)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", marginBottom: "4px" }}>
              <Icon name="alert-triangle" size={18} color="var(--color-error)" />
              <h2
                id="danger-zone-heading"
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--font-weight-bold)",
                  letterSpacing: "var(--tracking-tight)",
                  margin: 0,
                  color: "var(--color-error)",
                }}
              >
                {t("dangerZoneTitle")}
              </h2>
            </div>
            <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)", lineHeight: 1.5 }}>
              {t("dangerZoneSubtitle")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            style={{
              padding: "10px 20px",
              backgroundColor: "rgba(220, 38, 38, 0.1)",
              border: "1px solid rgba(220, 38, 38, 0.4)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-error)",
              fontSize: "var(--font-size-sm)",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.2)";
              e.currentTarget.style.borderColor = "var(--color-error)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.1)";
              e.currentTarget.style.borderColor = "rgba(220, 38, 38, 0.4)";
            }}
          >
            {t("deleteAccountButton")}
          </button>
        </section>
      </div>

      {/* Confirmation Modal for Account Deletion */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !deleteLoading && setIsDeleteModalOpen(false)}
        title={t("deleteModalTitle")}
        size="sm"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)", lineHeight: 1.6 }}>
            {t("deleteModalMessage")}
          </p>

          {deleteError && (
            <div
              role="alert"
              style={{
                padding: "var(--space-xs) var(--space-sm)",
                backgroundColor: "rgba(220, 38, 38, 0.1)",
                border: "1px solid rgba(220, 38, 38, 0.3)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-error)",
                fontSize: "var(--font-size-xs)",
              }}
            >
              {deleteError}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-sm)" }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deleteLoading}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              {t("cancel")}
            </Button>
            <button
              type="button"
              disabled={deleteLoading}
              onClick={handleDeleteAccount}
              style={{
                padding: "8px 16px",
                backgroundColor: "var(--color-error)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-size-sm)",
                fontWeight: 600,
                cursor: deleteLoading ? "not-allowed" : "pointer",
                opacity: deleteLoading ? 0.7 : 1,
              }}
            >
              {deleteLoading ? t("deletingAccount") : t("deleteConfirmButton")}
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}

export default SecurityPage;
