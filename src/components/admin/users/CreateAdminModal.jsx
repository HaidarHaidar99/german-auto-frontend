import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Icon from "../../common/Icon";
import adminUsersService from "../../../services/adminUsers/adminUsers.service";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CreateAdminModal({
  isOpen,
  onClose,
  onSuccess,
  className = "",
}) {
  const { t } = useTranslation(["admin", "common"]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("ADMIN");
    setShowPassword(false);
    setFieldErrors({});
    setServerError(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = () => {
    const errors = {};

    if (!fullName || fullName.trim().length < 2) {
      errors.fullName = t("errorFullNameRequired", { defaultValue: "Vollständiger Name erforderlich (mind. 2 Zeichen)." });
    }

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      errors.email = t("errorEmailInvalid", { defaultValue: "Bitte eine gültige E-Mail-Adresse eingeben." });
    }

    if (!password || password.length < 8) {
      errors.password = t("errorPasswordLength", { defaultValue: "Das Passwort muss mindestens 8 Zeichen lang sein." });
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = t("errorPasswordMismatch", { defaultValue: "Passwörter stimmen nicht überein." });
    }

    if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
      errors.role = t("errorRoleInvalid", { defaultValue: "Rolle muss ADMIN oder SUPER_ADMIN sein." });
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    try {
      setLoading(true);
      const res = await adminUsersService.createAdmin({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      const createdUser = res?.data?.user;
      resetForm();
      onSuccess(createdUser);
    } catch (err) {
      setServerError(
        err?.message ||
        t("errorCreateAdminFailed", { defaultValue: "Fehler beim Erstellen des Administrator-Kontos." })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t("createAdminTitle", { defaultValue: "Neuen Administrator anlegen" })}
      size="md"
      className={className}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        {/* Intro notice */}
        <p
          style={{
            margin: 0,
            fontSize: "var(--font-size-xs)",
            color: "var(--color-admin-muted)",
            lineHeight: 1.5,
          }}
        >
          {t("createAdminNotice", {
            defaultValue:
              "Erstellen Sie ein neues administratives Zugangskonto. Das Konto ist sofort aktiv und verifiziert.",
          })}
        </p>

        {serverError && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-error)",
              fontSize: "var(--font-size-xs)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Icon name="alert-circle" size={16} />
            <span>{serverError}</span>
          </div>
        )}

        {/* Full Name */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            htmlFor="create-admin-fullname"
            style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-admin-text)" }}
          >
            {t("fullName", { defaultValue: "Vollständiger Name" })} *
          </label>
          <input
            id="create-admin-fullname"
            type="text"
            required
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: null }));
            }}
            placeholder="z. B. Max Mustermann"
            style={{
              height: "40px",
              padding: "0 12px",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: `1px solid ${fieldErrors.fullName ? "var(--color-error)" : "var(--color-admin-border)"}`,
              borderRadius: "var(--radius-md)",
              color: "var(--color-admin-text)",
              fontSize: "var(--font-size-sm)",
              outline: "none",
            }}
          />
          {fieldErrors.fullName && (
            <span style={{ fontSize: "11px", color: "var(--color-error)" }}>{fieldErrors.fullName}</span>
          )}
        </div>

        {/* Email */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            htmlFor="create-admin-email"
            style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-admin-text)" }}
          >
            {t("email", { defaultValue: "E-Mail-Adresse" })} *
          </label>
          <input
            id="create-admin-email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
            }}
            placeholder="admin@germanauto.de"
            style={{
              height: "40px",
              padding: "0 12px",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: `1px solid ${fieldErrors.email ? "var(--color-error)" : "var(--color-admin-border)"}`,
              borderRadius: "var(--radius-md)",
              color: "var(--color-admin-text)",
              fontSize: "var(--font-size-sm)",
              outline: "none",
            }}
          />
          {fieldErrors.email && (
            <span style={{ fontSize: "11px", color: "var(--color-error)" }}>{fieldErrors.email}</span>
          )}
        </div>

        {/* Password with Show/Hide Toggle */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            htmlFor="create-admin-password"
            style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-admin-text)" }}
          >
            {t("password", { defaultValue: "Passwort" })} * (mind. 8 Zeichen)
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="create-admin-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
              }}
              placeholder="••••••••••••"
              style={{
                width: "100%",
                height: "40px",
                padding: "0 40px 0 12px",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: `1px solid ${fieldErrors.password ? "var(--color-error)" : "var(--color-admin-border)"}`,
                borderRadius: "var(--radius-md)",
                color: "var(--color-admin-text)",
                fontSize: "var(--font-size-sm)",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--color-admin-muted)",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Icon name={showPassword ? "eye-off" : "eye"} size={16} />
            </button>
          </div>
          {fieldErrors.password && (
            <span style={{ fontSize: "11px", color: "var(--color-error)" }}>{fieldErrors.password}</span>
          )}
        </div>

        {/* Confirm Password */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            htmlFor="create-admin-confirm-password"
            style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-admin-text)" }}
          >
            {t("confirmPassword", { defaultValue: "Passwort wiederholen" })} *
          </label>
          <input
            id="create-admin-confirm-password"
            type={showPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: null }));
            }}
            placeholder="••••••••••••"
            style={{
              height: "40px",
              padding: "0 12px",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: `1px solid ${fieldErrors.confirmPassword ? "var(--color-error)" : "var(--color-admin-border)"}`,
              borderRadius: "var(--radius-md)",
              color: "var(--color-admin-text)",
              fontSize: "var(--font-size-sm)",
              outline: "none",
            }}
          />
          {fieldErrors.confirmPassword && (
            <span style={{ fontSize: "11px", color: "var(--color-error)" }}>{fieldErrors.confirmPassword}</span>
          )}
        </div>

        {/* Role Selection */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
          <label style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-admin-text)" }}>
            {t("administrativeRole", { defaultValue: "Administrative Rolle" })} *
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
            {/* ADMIN */}
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${role === "ADMIN" ? "var(--color-admin-accent)" : "var(--color-admin-border)"}`,
                backgroundColor: role === "ADMIN" ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.02)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="radio"
                  name="adminRole"
                  value="ADMIN"
                  checked={role === "ADMIN"}
                  onChange={() => setRole("ADMIN")}
                />
                <span style={{ fontWeight: 700, fontSize: "var(--font-size-xs)", color: "var(--color-admin-text)" }}>
                  ADMIN
                </span>
              </div>
              <span style={{ fontSize: "11px", color: "var(--color-admin-muted)", paddingLeft: "24px" }}>
                Verwaltung von Fahrzeugen, Formularen und Rezensionen
              </span>
            </label>

            {/* SUPER_ADMIN */}
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${role === "SUPER_ADMIN" ? "var(--color-admin-accent)" : "var(--color-admin-border)"}`,
                backgroundColor: role === "SUPER_ADMIN" ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.02)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="radio"
                  name="adminRole"
                  value="SUPER_ADMIN"
                  checked={role === "SUPER_ADMIN"}
                  onChange={() => setRole("SUPER_ADMIN")}
                />
                <span style={{ fontWeight: 700, fontSize: "var(--font-size-xs)", color: "var(--color-admin-accent)" }}>
                  SUPER_ADMIN
                </span>
              </div>
              <span style={{ fontSize: "11px", color: "var(--color-admin-muted)", paddingLeft: "24px" }}>
                Vollzugriff inkl. Benutzerverwaltung und CMS-Konfiguration
              </span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "var(--space-sm)",
            marginTop: "var(--space-md)",
            borderTop: "1px solid var(--color-admin-border)",
            paddingTop: "var(--space-md)",
          }}
        >
          <Button type="button" variant="ghost" onClick={handleClose} disabled={loading}>
            {t("cancel", { defaultValue: "Abbrechen" })}
          </Button>

          <Button type="submit" variant="primary" disabled={loading}>
            {loading
              ? t("creating", { defaultValue: "Wird angelegt..." })
              : t("createAccountButton", { defaultValue: "Konto anlegen" })}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateAdminModal;
