import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import formsService from "../../services/forms/forms.service";
import Input from "../forms/Input";
import Select from "../forms/Select";
import Textarea from "../forms/Textarea";
import Checkbox from "../forms/Checkbox";
import Button from "../ui/Button";
import Icon from "../common/Icon";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;

/**
 * German Auto — ContactFormSection Component
 * Production contact form connected directly to POST /api/forms/contact.
 * Supports car query param prefilling, authenticated user auto-fill, inline validation,
 * rate limit handling, and bespoke success state.
 */
export function ContactFormSection({ contactFormConfig = {}, className = "", style = {} }) {
  const { t, i18n } = useTranslation(["forms", "common"]);
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const carQuery = searchParams.get("car") || "";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    regarding: carQuery ? `Fahrzeuganfrage: ${carQuery}` : "",
    message: carQuery
      ? `Guten Tag, ich interessiere mich für das Fahrzeug ${carQuery}. Bitte kontaktieren Sie mich bezüglich weiterer Details.`
      : "",
    privacy_consent: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Prepopulate contact details if user is logged in
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  // If car parameter updates dynamically
  useEffect(() => {
    if (carQuery && !form.regarding) {
      setForm((prev) => ({
        ...prev,
        regarding: `Fahrzeuganfrage: ${carQuery}`,
        message: prev.message || `Guten Tag, ich interessiere mich für das Fahrzeug ${carQuery}. Bitte kontaktieren Sie mich bezüglich weiterer Details.`,
      }));
    }
  }, [carQuery, form.regarding]);

  const isFormEnabled = contactFormConfig.enabled !== false;
  const currentLang = i18n.language || "de";
  const customSuccessMsg = contactFormConfig[`success_message_${currentLang}`] || null;

  if (!isFormEnabled) {
    return (
      <div
        className={`contact-form-disabled surface-card ${className}`.trim()}
        style={{
          backgroundColor: "var(--color-card)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
          padding: "clamp(16px, 4vw, 32px)",
          textAlign: "center",
          color: "var(--color-text-secondary)",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          overflow: "hidden",
          ...style,
        }}
      >
        <Icon name="message-square-off" size={40} color="var(--color-secondary)" style={{ marginBottom: "var(--space-sm)" }} />
        <p style={{ margin: 0 }}>{t("contactFormDisabled")}</p>
      </div>
    );
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (submitError) setSubmitError(null);
  };

  const handleClearCarQuery = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("car");
    setSearchParams(nextParams, { replace: true });
    setForm((prev) => ({
      ...prev,
      regarding: "",
      message: "",
    }));
  };

  const validateForm = () => {
    const errs = {};

    if (!form.name.trim() || form.name.trim().length < 2) {
      errs.name = t("errNameRequired");
    }

    if (!form.email.trim() || !EMAIL_RE.test(form.email.trim())) {
      errs.email = t("errEmailRequired");
    }

    if (form.phone.trim() && !PHONE_RE.test(form.phone.trim())) {
      errs.phone = t("errPhoneFormat");
    }

    if (!form.regarding.trim()) {
      errs.regarding = t("errRegardingRequired");
    }

    if (!form.message.trim() || form.message.trim().length < 10) {
      errs.message = t("errMessageTooShort");
    } else if (form.message.trim().length > 5000) {
      errs.message = t("errMessageTooLong");
    }

    if (!form.privacy_consent) {
      errs.privacy_consent = t("errPrivacyConsent");
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorId = Object.keys(validationErrors)[0];
      const el = document.getElementById(firstErrorId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || undefined,
        regarding: form.regarding.trim(),
        message: form.message.trim(),
        privacy_consent: true,
      };

      await formsService.submitContact(payload);
      setIsSuccess(true);
    } catch (err) {
      if (err?.statusCode === 429) {
        setSubmitError(t("errRateLimit"));
      } else if (err?.statusCode === 422 && err?.errors) {
        setErrors(err.errors);
        setSubmitError(t("errSubmissionFailed"));
      } else {
        setSubmitError(err?.message || t("errSubmissionFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      regarding: "",
      message: "",
      privacy_consent: false,
    });
    setErrors({});
    setSubmitError(null);
    setIsSuccess(false);
  };

  // ─── SUCCESS VIEW ──────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div
        className={`contact-form-success surface-card ${className}`.trim()}
        aria-live="polite"
        style={{
          backgroundColor: "var(--color-card)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
          padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-lg)",
          boxShadow: "var(--shadow-elevation-2)",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          overflow: "hidden",
          ...style,
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "rgba(16, 185, 129, 0.12)",
            border: "2px solid #10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#10b981",
          }}
        >
          <Icon name="check" size={32} />
        </div>

        <div>
          <h3
            style={{
              fontSize: "var(--font-size-2xl)",
              fontWeight: "var(--font-weight-bold)",
              letterSpacing: "var(--tracking-tight)",
              margin: "0 0 var(--space-xs) 0",
              color: "var(--color-text)",
            }}
          >
            {t("contactSuccessTitle")}
          </h3>
          <p
            style={{
              fontSize: "var(--font-size-base)",
              lineHeight: "var(--line-height-relaxed)",
              color: "var(--color-text-secondary)",
              maxWidth: "520px",
              margin: 0,
            }}
          >
            {customSuccessMsg || t("contactSuccessDesc")}
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-sm)", marginTop: "var(--space-md)" }}>
          <Button variant="primary" onClick={handleReset} iconLeft="send">
            {t("sendAnotherMessage")}
          </Button>
          <Button as={Link} to="/cars" variant="secondary" iconLeft="grid">
            {t("backToInventory", { defaultValue: "Fahrzeugbestand" })}
          </Button>
        </div>
      </div>
    );
  }

  const regardingOptions = [
    { value: t("regardingVehicleInquiry"), label: t("regardingVehicleInquiry") },
    { value: t("regardingPurchase"), label: t("regardingPurchase") },
    { value: t("regardingConsultation"), label: t("regardingConsultation") },
    { value: t("regardingGeneral"), label: t("regardingGeneral") },
    { value: t("regardingOther"), label: t("regardingOther") },
  ];

  return (
    <div
      className={`contact-form-wrap surface-card ${className}`.trim()}
      style={{
        backgroundColor: "var(--color-card)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--color-border)",
        padding: "clamp(16px, 4vw, 32px)",
        boxShadow: "var(--shadow-elevation-1)",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
        ...style,
      }}
    >
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <h2
          style={{
            fontSize: "clamp(1.15rem, 2.5vw, 1.4rem)",
            fontWeight: "var(--font-weight-semibold)",
            letterSpacing: "var(--tracking-tight)",
            margin: "0 0 var(--space-3xs) 0",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-xs)",
            color: "var(--color-text)",
          }}
        >
          <Icon name="mail" size={20} color="var(--color-secondary)" />
          <span>{contactFormConfig[`title_${currentLang}`] || t("contactFormHeading")}</span>
        </h2>
        <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-subtle)", lineHeight: 1.5 }}>
          {contactFormConfig[`description_${currentLang}`] || t("contactFormSubtitle")}
        </p>
      </div>

      {/* Contextual Car Inquiry Banner if ?car= was passed */}
      {carQuery && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "var(--space-xs)",
            padding: "var(--space-xs) var(--space-md)",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(255, 255, 255, 0.12)",
            border: "1px solid var(--color-secondary)",
            color: "var(--color-secondary)",
            fontSize: "var(--font-size-xs)",
            marginBottom: "var(--space-md)",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2xs)", minWidth: 0, flex: 1 }}>
            <Icon name="car" size={15} style={{ flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {t("inquiryRegardingCar")}: <strong>{carQuery}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleClearCarQuery}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text-subtle)",
              cursor: "pointer",
              fontSize: "var(--font-size-2xs)",
              textDecoration: "underline",
              padding: 0,
              flexShrink: 0,
            }}
          >
            {t("clearCarFilter")}
          </button>
        </div>
      )}

      {/* Global Error Notice */}
      {submitError && (
        <div
          role="alert"
          style={{
            padding: "var(--space-md) var(--space-lg)",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid var(--color-error)",
            color: "var(--color-error)",
            marginBottom: "var(--space-md)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-sm)",
            fontSize: "var(--font-size-sm)",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Icon name="alert-circle" size={18} style={{ flexShrink: 0 }} />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)", width: "100%", boxSizing: "border-box" }}>
        <div
          className="contact-form-grid-row"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "var(--space-md)",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Input
            id="name"
            name="name"
            label={t("name")}
            placeholder="Ihr vollständiger Name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={errors.name}
            required
            style={{ width: "100%", minWidth: 0, boxSizing: "border-box" }}
          />

          <Input
            id="email"
            name="email"
            type="email"
            label={t("email")}
            placeholder="ihre.adresse@beispiel.de"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={errors.email}
            startIcon="mail"
            required
            style={{ width: "100%", minWidth: 0, boxSizing: "border-box" }}
          />
        </div>

        <div
          className="contact-form-grid-row"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "var(--space-md)",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Input
            id="phone"
            name="phone"
            type="tel"
            label={t("phone", { defaultValue: "Telefonnummer (optional)" })}
            placeholder="z.B. +49 170 1234567"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            error={errors.phone}
            startIcon="phone"
            style={{ width: "100%", minWidth: 0, boxSizing: "border-box" }}
          />

          <Select
            id="regarding"
            name="regarding"
            label={t("regarding")}
            placeholder={t("regardingPlaceholder")}
            value={form.regarding.startsWith("Fahrzeuganfrage:") ? "" : form.regarding}
            onChange={(e) => handleChange("regarding", e.target.value)}
            error={errors.regarding}
            options={regardingOptions}
            required={!carQuery}
            style={{ width: "100%", minWidth: 0, boxSizing: "border-box" }}
          />
        </div>

        {/* If custom or car inquiry was prefilled, show input for regarding */}
        {(carQuery || (form.regarding && !regardingOptions.some((o) => o.value === form.regarding))) && (
          <Input
            id="regarding_custom"
            name="regarding_custom"
            label={t("regarding", { defaultValue: "Konkreter Betreff" })}
            value={form.regarding}
            onChange={(e) => handleChange("regarding", e.target.value)}
            error={errors.regarding}
            required
            style={{ width: "100%", minWidth: 0, boxSizing: "border-box" }}
          />
        )}

        <Textarea
          id="message"
          name="message"
          label={t("message")}
          placeholder={t("messagePlaceholder")}
          rows={5}
          value={form.message}
          maxLength={5000}
          onChange={(e) => handleChange("message", e.target.value)}
          error={errors.message}
          required
          style={{ width: "100%", minWidth: 0, boxSizing: "border-box" }}
        />

        <Checkbox
          id="privacy_consent"
          name="privacy_consent"
          label={t("privacyConsentLabel")}
          checked={form.privacy_consent}
          onChange={(e) => handleChange("privacy_consent", e.target.checked)}
          error={errors.privacy_consent}
        />

        <div style={{ marginTop: "var(--space-xs)", width: "100%", boxSizing: "border-box" }}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={loading}
            fullWidth
            iconLeft="send"
          >
            {loading ? t("submitting") : t("submit")}
          </Button>
        </div>
      </form>

      <style>{`
        @media (max-width: 639px) {
          .contact-form-grid-row {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default ContactFormSection;
