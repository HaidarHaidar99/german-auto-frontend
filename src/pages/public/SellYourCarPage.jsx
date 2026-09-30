import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../contexts/SettingsContext";
import { useAuth } from "../../contexts/AuthContext";
import formsService from "../../services/forms/forms.service";
import SellCarProcessHeader from "../../components/sell-car/SellCarProcessHeader";
import SellCarSuccessView from "../../components/sell-car/SellCarSuccessView";
import Input from "../../components/forms/Input";
import Select from "../../components/forms/Select";
import Textarea from "../../components/forms/Textarea";
import Checkbox from "../../components/forms/Checkbox";
import FileUpload from "../../components/forms/FileUpload";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Icon from "../../components/common/Icon";
import { useGsapContext } from "../../hooks/useAnimation";
import { gsap, isReducedMotion } from "../../utils/animation";

// Validation Regexes matching backend validator
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;
const VIN_RE = /^[A-Z0-9]{17}$/i;
const POSTAL_RE = /^[A-Z0-9][A-Z0-9\s-]{1,8}[A-Z0-9]$/i;

const INITIAL_FORM = {
  brand: "",
  model: "",
  vin: "",
  first_registration: "",
  postal_code: "",
  mileage_km: "",
  accident_free: "",
  repainting: "",
  min_price: "",
  additional_info: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  preferred_contact: "EMAIL",
  privacy_consent: false,
};

/**
 * German Auto — Production Sell Your Car Page
 * Route: /sell-your-car
 * Connected directly to real POST /api/forms/sell-car multipart endpoint.
 */
export function SellYourCarPage() {
  const { t, i18n } = useTranslation(["forms", "common"]);
  const { settings } = useSettings();
  const { user } = useAuth();

  const [form, setForm] = useState(INITIAL_FORM);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [step, setStep] = useState(1);

  const pageContainerRef = useRef(null);
  const formRef = useRef(null);

  // Prepopulate contact details if user is authenticated
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        email: prev.email || user.email || "",
        first_name: prev.first_name || (user.name ? user.name.split(" ")[0] : ""),
        last_name: prev.last_name || (user.name && user.name.includes(" ") ? user.name.split(" ").slice(1).join(" ") : ""),
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  // Dynamic SEO metadata
  useEffect(() => {
    const siteName = settings?.site?.name || "German Auto";
    document.title = `${t("sellCarHeroTitle")} | ${siteName}`;

    let metaTag = document.querySelector('meta[name="description"]');
    if (!metaTag) {
      metaTag = document.createElement("meta");
      metaTag.name = "description";
      document.head.appendChild(metaTag);
    }
    metaTag.content = t("sellCarHeroSubtitle");
  }, [t, settings]);

  // Entrance animations scoped with GSAP
  useGsapContext(
    pageContainerRef,
    () => {
      if (isReducedMotion() || isSuccess) return;

      gsap.from(".sell-car-header", {
        opacity: 0,
        y: 25,
        duration: 0.65,
        ease: "power2.out",
      });

      gsap.from(".form-card-section", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.15,
      });
    },
    [isSuccess]
  );

  // CMS feature configuration
  const sellCarConfig = settings?.sell_car || {};
  const isFeatureEnabled = sellCarConfig.enabled !== false;
  const currentLang = i18n.language || "de";
  const customTitle = sellCarConfig[`title_${currentLang}`] || t("sellCarHeroTitle");
  const customSubtitle = sellCarConfig[`description_${currentLang}`] || t("sellCarHeroSubtitle");
  const customCtaText = sellCarConfig[`cta_text_${currentLang}`] || t("submitSellCar");
  const mediaUrl = sellCarConfig.media_url || null;

  // If disabled via CMS
  if (!isFeatureEnabled) {
    return (
      <main
        style={{
          minHeight: "75vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-2xl) var(--space-md)",
        }}
      >
        <EmptyState
          title={t("sellCarDisabledTitle")}
          message={t("sellCarDisabledMessage")}
          actionLabel={t("contactTitle")}
          onAction={() => {
            window.location.href = "/contact";
          }}
        />
      </main>
    );
  }

  // Handle single field change
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for that field if present
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (submitError) setSubmitError(null);
  };

  // Comprehensive client-side validation
  const validateForm = () => {
    const errs = {};

    // 1. Vehicle data
    if (!form.brand.trim()) {
      errs.brand = t("errBrandRequired");
    }
    if (!form.model.trim()) {
      errs.model = t("errModelRequired");
    }
    if (!form.vin.trim()) {
      errs.vin = t("errVinInvalid");
    } else if (!VIN_RE.test(form.vin.trim())) {
      errs.vin = t("errVinInvalid");
    }

    if (!form.first_registration) {
      errs.first_registration = t("errFirstRegistrationRequired");
    } else {
      const regDate = new Date(form.first_registration);
      if (isNaN(regDate.getTime()) || regDate > new Date()) {
        errs.first_registration = t("errFirstRegistrationFuture");
      }
    }

    // 2. Vehicle details
    if (!form.postal_code.trim() || !POSTAL_RE.test(form.postal_code.trim())) {
      errs.postal_code = t("errPostalCodeInvalid");
    }

    if (form.mileage_km === "" || form.mileage_km === null || form.mileage_km === undefined) {
      errs.mileage_km = t("errMileageRequired");
    } else {
      const mileage = Number(form.mileage_km);
      if (isNaN(mileage) || mileage < 0 || mileage > 9999999) {
        errs.mileage_km = t("errMileageInvalid");
      }
    }

    if (form.accident_free !== "yes" && form.accident_free !== "no") {
      errs.accident_free = t("errAccidentFreeRequired");
    }

    if (form.repainting !== "yes" && form.repainting !== "no") {
      errs.repainting = t("errRepaintingRequired");
    }

    if (form.min_price !== "" && form.min_price !== null && form.min_price !== undefined) {
      const p = Number(form.min_price);
      if (isNaN(p) || p < 0) {
        errs.min_price = t("errMinPriceInvalid");
      }
    }

    // 3. Images validation
    if (images.length > 5) {
      errs.images = t("errMaxImagesExceeded");
    }

    // 4. Contact data
    if (!form.first_name.trim()) {
      errs.first_name = t("errFirstNameRequired");
    }
    if (!form.last_name.trim()) {
      errs.last_name = t("errLastNameRequired");
    }
    if (!form.email.trim() || !EMAIL_RE.test(form.email.trim())) {
      errs.email = t("errEmailInvalid");
    }
    if (!form.phone.trim() || !PHONE_RE.test(form.phone.trim())) {
      errs.phone = t("errPhoneInvalid");
    }
    if (!["EMAIL", "WHATSAPP", "PHONE"].includes(form.preferred_contact)) {
      errs.preferred_contact = t("errPreferredContactRequired");
    }

    if (form.privacy_consent === false) {
      errs.privacy_consent = t("errPrivacyRequired");
    }

    return errs;
  };

  const handleNext = () => {
    const validationErrors = validateForm();
    const currentStepErrors = {};
    if (step === 1) {
      if (validationErrors.brand) currentStepErrors.brand = validationErrors.brand;
      if (validationErrors.model) currentStepErrors.model = validationErrors.model;
      if (validationErrors.vin) currentStepErrors.vin = validationErrors.vin;
      if (validationErrors.first_registration) currentStepErrors.first_registration = validationErrors.first_registration;
    } else if (step === 2) {
      if (validationErrors.postal_code) currentStepErrors.postal_code = validationErrors.postal_code;
      if (validationErrors.mileage_km) currentStepErrors.mileage_km = validationErrors.mileage_km;
      if (validationErrors.accident_free) currentStepErrors.accident_free = validationErrors.accident_free;
      if (validationErrors.repainting) currentStepErrors.repainting = validationErrors.repainting;
      if (validationErrors.min_price) currentStepErrors.min_price = validationErrors.min_price;
      if (validationErrors.images) currentStepErrors.images = validationErrors.images;
    }

    if (Object.keys(currentStepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...currentStepErrors }));
      const firstErrorKey = Object.keys(currentStepErrors)[0];
      const el = document.getElementById(firstErrorKey);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
      return;
    }
    
    setStep(step + 1);
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  // Submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Determine which step has errors and jump to it
      if (validationErrors.brand || validationErrors.model || validationErrors.vin || validationErrors.first_registration) {
        setStep(1);
      } else if (validationErrors.postal_code || validationErrors.mileage_km || validationErrors.accident_free || validationErrors.repainting || validationErrors.min_price || validationErrors.images) {
        setStep(2);
      }
      const firstErrorKey = Object.keys(validationErrors)[0];
      setTimeout(() => {
        const el = document.getElementById(firstErrorKey);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus();
        }
      }, 100);
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("brand", form.brand.trim());
      fd.append("model", form.model.trim());
      fd.append("vin", form.vin.trim().toUpperCase());
      fd.append("first_registration", form.first_registration);
      fd.append("postal_code", form.postal_code.trim().toUpperCase());
      fd.append("mileage_km", String(Number(form.mileage_km)));
      fd.append("accident_free", form.accident_free === "yes" ? "true" : "false");
      fd.append("repainting", form.repainting === "yes" ? "true" : "false");

      if (form.min_price) {
        fd.append("min_price", String(Number(form.min_price)));
      }
      if (form.additional_info && form.additional_info.trim()) {
        fd.append("additional_info", form.additional_info.trim());
      }

      fd.append("first_name", form.first_name.trim());
      fd.append("last_name", form.last_name.trim());
      fd.append("email", form.email.trim().toLowerCase());
      fd.append("phone", form.phone.trim());
      fd.append("preferred_contact", form.preferred_contact.toUpperCase());
      fd.append("privacy_consent", "true");

      images.forEach((file) => {
        fd.append("images", file);
      });

      const res = await formsService.submitSellCar(fd);
      const subId =
        res?.submission_id ||
        res?.data?.submission_id ||
        res?.data?.id ||
        `GA-${Date.now().toString().slice(-6)}`;

      setSubmissionId(subId);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    setForm(INITIAL_FORM);
    setImages([]);
    setErrors({});
    setSubmitError(null);
    setIsSuccess(false);
    setSubmissionId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If form was successfully submitted
  if (isSuccess) {
    return (
      <main ref={pageContainerRef} style={{ padding: "var(--space-2xl) var(--space-md)" }}>
        <SellCarSuccessView submissionId={submissionId} onReset={handleReset} />
      </main>
    );
  }

  // Today's date for datepicker max
  const today = new Date().toISOString().split("T")[0];

  return (
    <main
      ref={pageContainerRef}
      className="sell-your-car-page"
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        padding: "var(--space-xl) clamp(10px, 3.5vw, var(--space-md)) var(--space-4xl)",
        width: "100%",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      {/* ─── Hero Section with 4-Step Visual ─────────────────────────── */}
      <SellCarProcessHeader
        title={customTitle}
        subtitle={customSubtitle}
        mediaUrl={mediaUrl}
      />

      {/* ─── Global Submission Error Notice ──────────────────────────── */}
      {submitError && (
        <div
          role="alert"
          style={{
            padding: "var(--space-md) var(--space-lg)",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid var(--color-error)",
            color: "var(--color-error)",
            marginBottom: "var(--space-xl)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-sm)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          <Icon name="alert-circle" size={20} />
          <span>{submitError}</span>
        </div>
      )}

      {/* ─── Multi-Section Automotive Valuation Form ─────────────────── */}
      <div style={{ maxWidth: "800px", width: "100%", margin: "0 auto var(--space-2xl)", position: "relative", boxSizing: "border-box" }}>
        {/* Wizard Progress Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", marginBottom: "var(--space-2xl)", width: "100%" }}>
          {/* Animated Line */}
          <div style={{ position: "absolute", top: "22px", left: "16%", right: "16%", height: "2px", backgroundColor: "var(--color-border)", zIndex: 0 }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              backgroundColor: "var(--color-secondary)",
              width: step === 1 ? "0%" : step === 2 ? "50%" : "100%",
              transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
            }} />
            <div style={{
              position: "absolute",
              top: "-11px",
              left: step === 1 ? "0%" : step === 2 ? "50%" : "100%",
              transition: "left 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
              color: "var(--color-secondary)",
              backgroundColor: "var(--color-background)",
              padding: "2px",
              borderRadius: "50%",
              transform: "translateX(-50%)",
              zIndex: 2
            }}>
              <Icon name="truck" size={22} />
            </div>
          </div>

          {[
            { id: 1, label: (i18n.language || "").startsWith("en") ? "Vehicle Data" : "Fahrzeugdaten", icon: "car" },
            { id: 2, label: (i18n.language || "").startsWith("en") ? "Condition" : "Zustand & Details", icon: "sliders" },
            { id: 3, label: (i18n.language || "").startsWith("en") ? "Contact" : "Kontaktdaten", icon: "user" }
          ].map((s) => (
            <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", zIndex: 1, position: "relative", flex: 1, minWidth: 0 }}>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                backgroundColor: step >= s.id ? "var(--color-secondary)" : "var(--color-card)",
                color: step >= s.id ? "#000" : "var(--color-text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2px solid ${step >= s.id ? "var(--color-secondary)" : "var(--color-border)"}`,
                transition: "all 0.4s ease",
                flexShrink: 0,
              }}>
                <Icon name={s.icon} size={18} />
              </div>
              <span style={{ fontSize: "clamp(10px, 2.5vw, 11px)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em", color: step >= s.id ? "var(--color-secondary)" : "var(--color-text-muted)", textAlign: "center", wordBreak: "break-word" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: "var(--space-2xl)" }}
      >
        {/* ── SECTION 1: VEHICLE IDENTIFICATION ──────────────────────── */}
        {step === 1 && (
        <section
          className="form-card-section"
          aria-labelledby="section-vehicle-heading"
          style={{
            backgroundColor: "var(--color-card)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            padding: "var(--space-xl)",
            boxShadow: "var(--shadow-elevation-1)",
          }}
        >
          <div style={{ marginBottom: "var(--space-lg)" }}>
            <h2
              id="section-vehicle-heading"
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
                letterSpacing: "var(--tracking-tight)",
                margin: "0 0 var(--space-3xs) 0",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-xs)",
                color: "var(--color-text)",
              }}
            >
              <Icon name="car" size={20} color="var(--color-secondary)" />
              <span>{t("sectionVehicleTitle")}</span>
            </h2>
            <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-subtle)" }}>
              {t("sectionVehicleDesc")}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              gap: "var(--space-md)",
            }}
          >
            <Input
              id="brand"
              name="brand"
              label={t("brandLabel")}
              placeholder={t("brandPlaceholder")}
              value={form.brand}
              onChange={(e) => handleChange("brand", e.target.value)}
              error={errors.brand}
              required
            />

            <Input
              id="model"
              name="model"
              label={t("modelLabel")}
              placeholder={t("modelPlaceholder")}
              value={form.model}
              onChange={(e) => handleChange("model", e.target.value)}
              error={errors.model}
              required
            />

            <Input
              id="first_registration"
              name="first_registration"
              type="date"
              max={today}
              min="1900-01-01"
              label={t("firstRegistrationLabel")}
              helperText={t("firstRegistrationHelper")}
              value={form.first_registration}
              onChange={(e) => handleChange("first_registration", e.target.value)}
              error={errors.first_registration}
              required
            />

            <div style={{ position: "relative" }}>
              <Input
                id="vin"
                name="vin"
                label={t("vinLabel")}
                placeholder={t("vinPlaceholder")}
                helperText={t("vinHelper")}
                value={form.vin}
                maxLength={17}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 17);
                  handleChange("vin", sanitized);
                }}
                error={errors.vin}
                required
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "-14px",
                  marginBottom: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: (form.vin || "").length === 17 ? "#10b981" : "var(--color-secondary, #D4AF37)",
                }}
              >
                <span>{(form.vin || "").length} / 17</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-xl)" }}>
            <Button variant="primary" onClick={handleNext}>
              {(i18n.language || "").startsWith("en") ? "Next Step" : "Nächster Schritt"}
            </Button>
          </div>
        </section>
        )}

        {/* ── SECTION 2: CONDITION & SPECIFICATIONS ──────────────────── */}
        {step === 2 && (
        <section
          className="form-card-section"
          aria-labelledby="section-details-heading"
          style={{
            backgroundColor: "var(--color-card)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            padding: "var(--space-xl)",
            boxShadow: "var(--shadow-elevation-1)",
          }}
        >
          <div style={{ marginBottom: "var(--space-lg)" }}>
            <h2
              id="section-details-heading"
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
                letterSpacing: "var(--tracking-tight)",
                margin: "0 0 var(--space-3xs) 0",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-xs)",
                color: "var(--color-text)",
              }}
            >
              <Icon name="sliders" size={20} color="var(--color-secondary)" />
              <span>{t("sectionDetailsTitle")}</span>
            </h2>
            <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-subtle)" }}>
              {t("sectionDetailsDesc")}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              gap: "var(--space-md)",
            }}
          >
            <Input
              id="postal_code"
              name="postal_code"
              label={t("postalCodeLabel")}
              placeholder={t("postalCodePlaceholder")}
              value={form.postal_code}
              onChange={(e) => handleChange("postal_code", e.target.value.toUpperCase())}
              error={errors.postal_code}
              required
            />

            <Input
              id="mileage_km"
              name="mileage_km"
              type="number"
              min="0"
              max="9999999"
              step="1"
              label={t("mileageLabel")}
              placeholder={t("mileagePlaceholder")}
              value={form.mileage_km}
              onChange={(e) => handleChange("mileage_km", e.target.value)}
              error={errors.mileage_km}
              required
            />

            {/* Unfallfrei — Luxury Gold Switch Button */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }} id="accident_free">
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text)", letterSpacing: "0.02em" }}>
                {t("accidentFreeLabel")} <span style={{ color: "var(--color-secondary, #D4AF37)" }}>*</span>
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "6px",
                  background: "rgba(255, 255, 255, 0.04)",
                  padding: "4px",
                  borderRadius: "10px",
                  border: `1px solid ${errors.accident_free ? "var(--color-error)" : form.accident_free ? "rgba(212, 175, 55, 0.5)" : "rgba(255, 255, 255, 0.12)"}`,
                }}
              >
                <button
                  type="button"
                  onClick={() => handleChange("accident_free", "yes")}
                  style={{
                    padding: "9px 12px",
                    borderRadius: "7px",
                    border: form.accident_free === "yes" ? "1px solid #D4AF37" : "1px solid transparent",
                    backgroundColor: form.accident_free === "yes" ? "#D4AF37" : "transparent",
                    color: form.accident_free === "yes" ? "#000000" : "rgba(255, 255, 255, 0.75)",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    boxShadow: form.accident_free === "yes" ? "0 0 12px rgba(212, 175, 55, 0.4)" : "none",
                  }}
                >
                  <Icon name="check" size={15} color={form.accident_free === "yes" ? "#000" : "currentColor"} />
                  {t("accidentFreeYes", { defaultValue: "Ja" })}
                </button>
                <button
                  type="button"
                  onClick={() => handleChange("accident_free", "no")}
                  style={{
                    padding: "9px 12px",
                    borderRadius: "7px",
                    border: form.accident_free === "no" ? "1px solid #D4AF37" : "1px solid transparent",
                    backgroundColor: form.accident_free === "no" ? "#D4AF37" : "transparent",
                    color: form.accident_free === "no" ? "#000000" : "rgba(255, 255, 255, 0.75)",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    boxShadow: form.accident_free === "no" ? "0 0 12px rgba(212, 175, 55, 0.4)" : "none",
                  }}
                >
                  <Icon name="x" size={15} color={form.accident_free === "no" ? "#000" : "currentColor"} />
                  {t("accidentFreeNo", { defaultValue: "Nein" })}
                </button>
              </div>
              {errors.accident_free && (
                <span style={{ fontSize: "11px", color: "var(--color-error)" }}>{errors.accident_free}</span>
              )}
            </div>

            {/* Nachlackierung — Luxury Gold Switch Button */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }} id="repainting">
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text)", letterSpacing: "0.02em" }}>
                {t("repaintingLabel")} <span style={{ color: "var(--color-secondary, #D4AF37)" }}>*</span>
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "6px",
                  background: "rgba(255, 255, 255, 0.04)",
                  padding: "4px",
                  borderRadius: "10px",
                  border: `1px solid ${errors.repainting ? "var(--color-error)" : form.repainting ? "rgba(212, 175, 55, 0.5)" : "rgba(255, 255, 255, 0.12)"}`,
                }}
              >
                <button
                  type="button"
                  onClick={() => handleChange("repainting", "yes")}
                  style={{
                    padding: "9px 12px",
                    borderRadius: "7px",
                    border: form.repainting === "yes" ? "1px solid #D4AF37" : "1px solid transparent",
                    backgroundColor: form.repainting === "yes" ? "#D4AF37" : "transparent",
                    color: form.repainting === "yes" ? "#000000" : "rgba(255, 255, 255, 0.75)",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    boxShadow: form.repainting === "yes" ? "0 0 12px rgba(212, 175, 55, 0.4)" : "none",
                  }}
                >
                  <Icon name="check" size={15} color={form.repainting === "yes" ? "#000" : "currentColor"} />
                  {t("repaintingYes", { defaultValue: "Ja" })}
                </button>
                <button
                  type="button"
                  onClick={() => handleChange("repainting", "no")}
                  style={{
                    padding: "9px 12px",
                    borderRadius: "7px",
                    border: form.repainting === "no" ? "1px solid #D4AF37" : "1px solid transparent",
                    backgroundColor: form.repainting === "no" ? "#D4AF37" : "transparent",
                    color: form.repainting === "no" ? "#000000" : "rgba(255, 255, 255, 0.75)",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    boxShadow: form.repainting === "no" ? "0 0 12px rgba(212, 175, 55, 0.4)" : "none",
                  }}
                >
                  <Icon name="x" size={15} color={form.repainting === "no" ? "#000" : "currentColor"} />
                  {t("repaintingNo", { defaultValue: "Nein" })}
                </button>
              </div>
              {errors.repainting && (
                <span style={{ fontSize: "11px", color: "var(--color-error)" }}>{errors.repainting}</span>
              )}
            </div>

            <Input
              id="min_price"
              name="min_price"
              type="number"
              min="0"
              step="500"
              label={t("minPriceLabel")}
              placeholder={t("minPricePlaceholder")}
              value={form.min_price}
              onChange={(e) => handleChange("min_price", e.target.value)}
              error={errors.min_price}
              startIcon={<span style={{ color: "var(--color-secondary)" }}>€</span>}
            />
          </div>

          <div style={{ marginTop: "var(--space-md)" }}>
            <Textarea
              id="additional_info"
              name="additional_info"
              label={t("additionalInfoLabel")}
              placeholder={t("additionalInfoPlaceholder")}
              rows={3}
              value={form.additional_info}
              maxLength={2000}
              onChange={(e) => handleChange("additional_info", e.target.value)}
              error={errors.additional_info}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--space-xl)" }}>
            <Button variant="outline" onClick={handlePrev}>
              {(i18n.language || "").startsWith("en") ? "Previous" : "Zurück"}
            </Button>
            <Button variant="primary" onClick={handleNext}>
              {(i18n.language || "").startsWith("en") ? "Next Step" : "Nächster Schritt"}
            </Button>
          </div>
        </section>
        )}

        {/* ── SECTION 3: CONTACT INFORMATION & PHOTOS ─────────────────────────── */}
        {step === 3 && (
        <>
        <section
          className="form-card-section"
          aria-labelledby="section-images-heading"
          style={{
            backgroundColor: "var(--color-card)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            padding: "var(--space-xl)",
            boxShadow: "var(--shadow-elevation-1)",
          }}
        >
          <div style={{ marginBottom: "var(--space-lg)" }}>
            <h2
              id="section-images-heading"
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
                letterSpacing: "var(--tracking-tight)",
                margin: "0 0 var(--space-3xs) 0",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-xs)",
                color: "var(--color-text)",
              }}
            >
              <Icon name="camera" size={20} color="var(--color-secondary)" />
              <span>{t("sectionImagesTitle")}</span>
            </h2>
            <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-subtle)" }}>
              {t("sectionImagesDesc")}
            </p>
          </div>

          <FileUpload
            label={t("uploadFormatsHint")}
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple={true}
            maxFiles={5}
            maxSizeBytes={10 * 1024 * 1024}
            files={images}
            onFilesSelected={(newFiles) => {
              setImages(newFiles);
              if (errors.images) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.images;
                  return next;
                });
              }
            }}
            dropText={t("uploadDropText")}
            removeText={t("removeImage")}
            error={errors.images}
          />
        </section>

        {/* ── SECTION 4: CONTACT INFORMATION ─────────────────────────── */}
        <section
          className="form-card-section"
          aria-labelledby="section-contact-heading"
          style={{
            backgroundColor: "var(--color-card)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            padding: "var(--space-xl)",
            boxShadow: "var(--shadow-elevation-1)",
          }}
        >
          <div style={{ marginBottom: "var(--space-lg)" }}>
            <h2
              id="section-contact-heading"
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
                letterSpacing: "var(--tracking-tight)",
                margin: "0 0 var(--space-3xs) 0",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-xs)",
                color: "var(--color-text)",
              }}
            >
              <Icon name="user" size={20} color="var(--color-secondary)" />
              <span>{t("sectionContactTitle")}</span>
            </h2>
            <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-subtle)" }}>
              {t("sectionContactDesc")}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              gap: "var(--space-md)",
            }}
          >
            <Input
              id="first_name"
              name="first_name"
              label={t("firstNameLabel")}
              placeholder={t("firstNamePlaceholder")}
              value={form.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
              error={errors.first_name}
              required
            />

            <Input
              id="last_name"
              name="last_name"
              label={t("lastNameLabel")}
              placeholder={t("lastNamePlaceholder")}
              value={form.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
              error={errors.last_name}
              required
            />

            <Input
              id="email"
              name="email"
              type="email"
              label={t("emailLabel")}
              placeholder={t("emailPlaceholder")}
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={errors.email}
              startIcon="mail"
              required
            />

            <Input
              id="phone"
              name="phone"
              type="tel"
              label={t("phoneLabel")}
              placeholder={t("phonePlaceholder")}
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              error={errors.phone}
              startIcon="phone"
              required
            />

            <Select
              id="preferred_contact"
              name="preferred_contact"
              label={t("preferredContactLabel")}
              placeholder={t("preferredContactSelect")}
              value={form.preferred_contact}
              onChange={(e) => handleChange("preferred_contact", e.target.value)}
              error={errors.preferred_contact}
              options={[
                { value: "EMAIL", label: t("contactEmail") },
                { value: "WHATSAPP", label: t("contactWhatsApp") },
                { value: "PHONE", label: t("contactPhone") },
              ]}
              required
            />
          </div>
        </section>

        {/* ── SECTION 5: PRIVACY CONSENT & SUBMISSION ─────────────────── */}
        <section
          className="form-card-section"
          style={{
            backgroundColor: "var(--color-card)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            padding: "var(--space-xl)",
            boxShadow: "var(--shadow-elevation-1)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-lg)",
          }}
        >
          <Checkbox
            id="privacy_consent"
            name="privacy_consent"
            label={t("privacyConsentLabel")}
            checked={form.privacy_consent}
            onChange={(e) => handleChange("privacy_consent", e.target.checked)}
            error={errors.privacy_consent}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "var(--space-md)",
              paddingTop: "var(--space-sm)",
              borderTop: "1px solid var(--color-border-subtle)",
              width: "100%",
            }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
            >
              {(i18n.language || "").startsWith("en") ? "Previous" : "Zurück"}
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              iconLeft="send"
              style={{
                minWidth: "260px",
                padding: "var(--space-md) var(--space-xl)",
                fontSize: "var(--font-size-base)",
              }}
            >
              {loading ? t("submitting") : customCtaText}
            </Button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2xs)",
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-subtle)",
              }}
            >
              <Icon name="shield-check" size={15} color="var(--color-secondary)" />
              <span>Diskrete & unverbindliche Bewertung ohne Verkaufsverpflichtung.</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "var(--space-md)" }}>
            <Button variant="outline" onClick={handlePrev}>Previous</Button>
          </div>
        </section>
        </>
        )}
      </form>
    </main>
  );
}

export default SellYourCarPage;
