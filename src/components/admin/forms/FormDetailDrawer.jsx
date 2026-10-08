import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Drawer from "../../ui/Drawer";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import Textarea from "../../forms/Textarea";
import Icon from "../../common/Icon";
import FormImageModal from "./FormImageModal";
import formsService from "../../../services/forms/forms.service";

/**
 * Safely unwrap form object in case it was delivered nested as { form: { ... } }
 */
function normalizeForm(f) {
  if (!f) return null;
  if (f.form && typeof f.form === "object" && (f.form.id || f.form.form_type || f.form.data)) {
    return f.form;
  }
  return f;
}

export function FormDetailDrawer({
  isOpen,
  form: initialForm = null,
  onClose,
  onUpdateStatus,
  onUpdateNotes,
  onArchive,
}) {
  const { t, i18n } = useTranslation(["admin", "forms", "common"]);
  const currentLang = i18n.language || "de";

  const [form, setForm] = useState(() => normalizeForm(initialForm));
  const [notesText, setNotesText] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  // Sync draft notes and load full data if missing
  useEffect(() => {
    const resolvedInitial = normalizeForm(initialForm);
    if (!resolvedInitial) {
      setForm(null);
      return;
    }

    setForm((prev) => {
      const prevNorm = normalizeForm(prev);
      const prevData = (prevNorm?.data && typeof prevNorm.data === "object") ? prevNorm.data : {};
      const nextData = (resolvedInitial?.data && typeof resolvedInitial.data === "object") ? resolvedInitial.data : {};

      // If incoming payload has richer data, use it; otherwise retain previous full data
      const mergedData = Object.keys(nextData).length > 0 ? nextData : prevData;

      return {
        ...prevNorm,
        ...resolvedInitial,
        data: mergedData,
      };
    });

    setNotesText(resolvedInitial.admin_notes || "");
    setNotesSuccess(false);
    setShowArchiveConfirm(false);

    // Check if form data is already present
    const rawData = resolvedInitial.data;
    const hasData = rawData && (
      (typeof rawData === "string" && rawData.trim().length > 2) ||
      (typeof rawData === "object" && Object.keys(rawData).length > 0)
    );

    // Only fetch if form doesn't contain data blob and we have a valid ID
    if (!hasData && resolvedInitial.id) {
      formsService.adminGetForm(resolvedInitial.id)
        .then((res) => {
          const fetched = res?.data?.form || res?.data;
          if (fetched && (fetched.id || fetched.data)) {
            setForm((prev) => {
              const prevNorm = normalizeForm(prev) || resolvedInitial;
              const prevDataObj = (prevNorm?.data && typeof prevNorm.data === "object") ? prevNorm.data : {};
              const freshDataObj = (fetched.data && typeof fetched.data === "object") ? fetched.data : {};
              return {
                ...prevNorm,
                ...fetched,
                data: Object.keys(freshDataObj).length > 0 ? freshDataObj : prevDataObj,
              };
            });
            if (fetched.admin_notes) setNotesText(fetched.admin_notes);
          }
        })
        .catch(() => {});
    }
  }, [initialForm]);

  if (!form) return null;

  const currentForm = normalizeForm(form) || {};
  const isContact = currentForm.form_type === "CONTACT";

  // Safely parse JSON if data was serialized as string
  let parsedData = {};
  if (typeof currentForm.data === "string") {
    try {
      parsedData = JSON.parse(currentForm.data);
    } catch {
      parsedData = {};
    }
  } else if (currentForm.data && typeof currentForm.data === "object") {
    parsedData = currentForm.data;
  }

  // Merge top-level currentForm and parsedData so any field in either place is accessible
  const data = {
    ...currentForm,
    ...parsedData,
  };

  // Contact person details with robust field alias resolution
  const contactName = isContact
    ? (data.name || data.full_name || data.customer_name || `${data.first_name || ""} ${data.last_name || ""}`.trim() || currentForm.name || "—")
    : (`${data.first_name || ""} ${data.last_name || ""}`.trim() || data.name || data.full_name || data.customer_name || currentForm.name || "—");
  const contactEmail = data.email || data.contact_email || currentForm.email || "";
  const contactPhone = data.phone || data.phone_number || data.mobile || currentForm.phone || "";
  const submittedDate = currentForm.created_at || data.submitted_at || data.created_at;
  const currentStatus = currentForm.status || "NEW";

  // Vehicle specifications
  const vehicleBrand = data.brand || data.make || "—";
  const vehicleModel = data.model || "";
  const firstReg = data.first_registration || data.registration || data.ez || "—";
  const vinNumber = data.vin || data.chassis_number || data.chassis || "—";
  const postalCode = data.postal_code || data.zip || data.zip_code || data.plz || data.location || "—";

  const rawMileage = data.mileage_km ?? data.mileage ?? data.km ?? data.kilometer;
  const mileageDisplay = rawMileage != null && rawMileage !== ""
    ? `${new Intl.NumberFormat(currentLang === "de" ? "de-DE" : "en-US").format(rawMileage)} km`
    : "—";

  const rawPrice = data.min_price ?? data.price ?? data.asking_price ?? data.price_eur;
  const priceDisplay = rawPrice != null && rawPrice !== ""
    ? `${new Intl.NumberFormat(currentLang === "de" ? "de-DE" : "en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(rawPrice)}`
    : t("notSpecified", { defaultValue: "Nicht angegeben" });

  const isAccidentFree = data.accident_free === true || data.accident_free === "true" || data.accident_free === 1 || data.accident_free === "yes";
  const isRepainted = data.repainting === true || data.repainting === "true" || data.repainting === 1 || data.repainting === "yes";
  const additionalInfo = data.additional_info || data.notes || data.description || data.comments;

  const images = Array.isArray(data.images)
    ? data.images
    : Array.isArray(currentForm.images)
      ? currentForm.images
      : [];

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString(currentLang === "de" ? "de-DE" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "NEW":
        return "secondary";
      case "READ":
        return "outline";
      case "IN_PROGRESS":
        return "warning";
      case "COMPLETED":
        return "success";
      case "ARCHIVED":
        return "default";
      default:
        return "neutral";
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!newStatus || newStatus === currentStatus || updatingStatus) return;
    try {
      setUpdatingStatus(true);
      await onUpdateStatus?.(currentForm.id, newStatus);
      setForm((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert(err?.message || t("errorUpdatingStatus", { defaultValue: "Error updating status." }));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    if (savingNotes) return;
    try {
      setSavingNotes(true);
      await onUpdateNotes?.(currentForm.id, notesText.trim());
      setForm((prev) => ({ ...prev, admin_notes: notesText.trim() }));
      setNotesSuccess(true);
      setTimeout(() => setNotesSuccess(false), 3500);
    } catch (err) {
      alert(err?.message || t("errorSavingNotes", { defaultValue: "Error saving notes." }));
    } finally {
      setSavingNotes(false);
    }
  };

  const handleArchive = async () => {
    try {
      setUpdatingStatus(true);
      await onArchive?.(currentForm.id);
      setShowArchiveConfirm(false);
      setForm((prev) => ({ ...prev, status: "ARCHIVED" }));
    } catch (err) {
      alert(err?.message || t("errorArchiving", { defaultValue: "Error archiving submission." }));
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Safe external URLs
  const cleanPhone = contactPhone.replace(/[^0-9+]/g, "");
  const mailSubject = isContact
    ? `German Auto: ${data.regarding || "Inquiry"}`
    : `German Auto: Vehicle Offer ${vehicleBrand !== "—" ? vehicleBrand : ""} ${vehicleModel}`.trim();
  const mailBody = `Hello ${contactName},\n\nThank you for reaching out to König Automobile Rheinberg.\n\nBest regards,\nGerman Auto Team`;
  const mailtoUrl = contactEmail
    ? `mailto:${contactEmail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`
    : null;
  const telUrl = cleanPhone ? `tel:${cleanPhone}` : null;
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.replace("+", "")}?text=${encodeURIComponent(mailBody)}`
    : null;

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={isContact ? t("formTypeContact", { defaultValue: "Contact Inquiry" }) : t("vehicleAppraisal", { defaultValue: "Vehicle Appraisal" })}
        size="lg"
        position="right"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)", paddingBottom: "var(--space-2xl)" }}>
          {/* Header Row: Badges, Status changer & Archive */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "var(--space-sm)",
              paddingBottom: "var(--space-sm)",
              borderBottom: "1px solid var(--color-admin-border, #e2e8f0)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
              <Badge variant={isContact ? "outline" : "secondary"} size="sm">
                {isContact ? "CONTACT" : "SELL_CAR"}
              </Badge>
              <Badge variant={getStatusBadgeVariant(currentStatus)} size="sm">
                {currentStatus ? t(`status${currentStatus.charAt(0) + currentStatus.slice(1).toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase())}`, { defaultValue: currentStatus }) : "NEW"}
              </Badge>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
              <label style={{ fontSize: "11px", color: "var(--color-admin-muted, #64748b)", marginRight: "4px" }}>
                {t("changeStatus", { defaultValue: "Status ändern" })}:
              </label>
              <select
                value={currentStatus}
                disabled={updatingStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{
                  padding: "4px 8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  borderRadius: "var(--radius-sm, 4px)",
                  border: "1px solid var(--color-admin-border, #e2e8f0)",
                  backgroundColor: "var(--color-admin-card, #ffffff)",
                  color: "var(--color-admin-text, #0f172a)",
                  cursor: updatingStatus ? "wait" : "pointer",
                  outline: "none",
                }}
              >
                <option value="NEW">{t("statusNew", { defaultValue: "New" })}</option>
                <option value="READ">{t("statusRead", { defaultValue: "Read" })}</option>
                <option value="IN_PROGRESS">{t("statusInProgress", { defaultValue: "In Progress" })}</option>
                <option value="COMPLETED">{t("statusCompleted", { defaultValue: "Completed" })}</option>
                <option value="ARCHIVED">{t("statusArchived", { defaultValue: "Archived" })}</option>
              </select>

              {currentStatus !== "ARCHIVED" && !showArchiveConfirm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowArchiveConfirm(true)}
                  style={{ height: "28px", fontSize: "11px", color: "var(--color-admin-muted, #64748b)" }}
                >
                  <Icon name="archive" size={12} style={{ marginRight: "4px" }} />
                  {t("archive", { defaultValue: "ARCHIVE" })}
                </Button>
              )}
            </div>
          </div>

          {/* Archive Confirmation Banner */}
          {showArchiveConfirm && (
            <div
              style={{
                padding: "var(--space-sm) var(--space-md)",
                backgroundColor: "rgba(234, 179, 8, 0.1)",
                border: "1px solid rgba(234, 179, 8, 0.3)",
                borderRadius: "var(--radius-sm, 6px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--space-sm)",
              }}
            >
              <div style={{ fontSize: "var(--font-size-xs)", color: "#b45309", fontWeight: 500 }}>
                {t("archiveConfirmMessage", { defaultValue: "Are you sure you want to archive this submission?" })}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <Button variant="ghost" size="sm" onClick={() => setShowArchiveConfirm(false)} style={{ height: "26px", fontSize: "11px" }}>
                  {t("cancel", { defaultValue: "Cancel" })}
                </Button>
                <Button variant="primary" size="sm" loading={updatingStatus} onClick={handleArchive} style={{ height: "26px", fontSize: "11px" }}>
                  {t("confirm", { defaultValue: "Confirm" })}
                </Button>
              </div>
            </div>
          )}

          {/* Quick Action Contact Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-xs)",
              padding: "var(--space-sm) var(--space-md)",
              backgroundColor: "var(--color-admin-accent-subtle, #f8fafc)",
              borderRadius: "var(--radius-sm, 6px)",
              border: "1px solid var(--color-admin-border, #e2e8f0)",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-admin-muted, #64748b)", marginRight: "6px" }}>
              {t("contactCustomer", { defaultValue: "Contact Customer:" })}
            </span>

            {mailtoUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(mailtoUrl, "_blank")}
                style={{ fontSize: "11px", height: "30px" }}
              >
                <Icon name="mail" size={13} style={{ marginRight: "4px" }} />
                {t("sendEmail", { defaultValue: "Send Email" })}
              </Button>
            )}

            {telUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(telUrl, "_self")}
                style={{ fontSize: "11px", height: "30px" }}
              >
                <Icon name="phone" size={13} style={{ marginRight: "4px" }} />
                {t("callPhone", { defaultValue: "Call Phone" })}
              </Button>
            )}

            {waUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(waUrl, "_blank", "noopener,noreferrer")}
                style={{ fontSize: "11px", height: "30px", borderColor: "rgba(34, 197, 94, 0.4)", color: "#16a34a" }}
              >
                <Icon name="whatsapp" size={13} style={{ marginRight: "4px" }} />
                {t("chatWhatsApp", { defaultValue: "WhatsApp" })}
              </Button>
            )}
          </div>

          {/* Customer Information Section */}
          <div
            style={{
              padding: "var(--space-md)",
              backgroundColor: "var(--color-admin-card, #ffffff)",
              borderRadius: "var(--radius-sm, 6px)",
              border: "1px solid var(--color-admin-border, #e2e8f0)",
            }}
          >
            <h4 style={{ margin: "0 0 var(--space-sm)", fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-admin-accent, #0284c7)" }}>
              {t("customerInformation", { defaultValue: "CUSTOMER INFORMATION" })}
            </h4>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-sm)", fontSize: "var(--font-size-xs)" }}>
              <div>
                <span style={{ color: "var(--color-admin-muted, #64748b)", display: "block" }}>{t("name", { defaultValue: "Name" })}</span>
                <strong style={{ color: "var(--color-admin-text, #0f172a)" }}>{contactName}</strong>
              </div>

              <div>
                <span style={{ color: "var(--color-admin-muted, #64748b)", display: "block" }}>{t("email", { defaultValue: "Email Address" })}</span>
                <strong style={{ color: "var(--color-admin-text, #0f172a)" }}>{contactEmail || "—"}</strong>
              </div>

              <div>
                <span style={{ color: "var(--color-admin-muted, #64748b)", display: "block" }}>{t("phone", { defaultValue: "Phone Number" })}</span>
                <strong style={{ color: "var(--color-admin-text, #0f172a)" }}>{contactPhone || "—"}</strong>
              </div>

              {!isContact && data.preferred_contact && (
                <div>
                  <span style={{ color: "var(--color-admin-muted, #64748b)", display: "block" }}>{t("preferredContact", { defaultValue: "Preferred Contact" })}</span>
                  <Badge variant="outline" size="sm">{data.preferred_contact}</Badge>
                </div>
              )}

              <div>
                <span style={{ color: "var(--color-admin-muted, #64748b)", display: "block" }}>{t("submittedOn", { defaultValue: "Eingegangen am" })}</span>
                <span style={{ color: "var(--color-admin-text, #0f172a)", fontWeight: 500 }}>{formatDate(submittedDate)}</span>
              </div>

              <div>
                <span style={{ color: "var(--color-admin-muted, #64748b)", display: "block" }}>{t("customerAccount", { defaultValue: "Kundenkonto" })}</span>
                <span style={{ color: currentForm.user_id ? "var(--color-admin-accent, #0284c7)" : "var(--color-admin-muted, #64748b)", fontWeight: 500 }}>
                  {currentForm.user_id ? t("registeredUserWithId", { id: String(currentForm.user_id).substring(0, 8), defaultValue: `Registered User (${String(currentForm.user_id).substring(0, 8)}...)` }) : t("guestSubmission", { defaultValue: "Guest Submission (not logged in)" })}
                </span>
              </div>
            </div>
          </div>

          {/* CONTACT Specific: Topic & Full Message */}
          {isContact && (
            <div
              style={{
                padding: "var(--space-md)",
                backgroundColor: "var(--color-admin-card, #ffffff)",
                borderRadius: "var(--radius-sm, 6px)",
                border: "1px solid var(--color-admin-border, #e2e8f0)",
              }}
            >
              <h4 style={{ margin: "0 0 var(--space-xs)", fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-admin-accent, #0284c7)" }}>
                {t("regarding", { defaultValue: "Subject / Topic" })}
              </h4>
              <div style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: "var(--color-admin-text, #0f172a)", marginBottom: "var(--space-md)" }}>
                {data.regarding || data.subject || t("generalInquiry", { defaultValue: "General inquiry" })}
              </div>

              <h4 style={{ margin: "0 0 var(--space-xs)", fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-admin-accent, #0284c7)" }}>
                {t("message", { defaultValue: "Message" })}
              </h4>
              <div
                style={{
                  padding: "var(--space-md)",
                  backgroundColor: "var(--color-admin-accent-subtle, #f8fafc)",
                  borderRadius: "4px",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-admin-text, #0f172a)",
                  lineHeight: 1.6,
                  whiteSpace: "pre-line",
                  border: "1px solid var(--color-admin-border, #e2e8f0)",
                  borderLeft: "3px solid var(--color-admin-accent, #0284c7)",
                }}
              >
                {data.message || data.message_text || data.comment || data.description || t("noMessageContent", { defaultValue: "No message text provided." })}
              </div>
            </div>
          )}

          {/* SELL_CAR Specific: Vehicle & Details */}
          {!isContact && (
            <>
              {/* Vehicle Specifications */}
              <div
                style={{
                  padding: "var(--space-md)",
                  backgroundColor: "var(--color-admin-card, #ffffff)",
                  borderRadius: "var(--radius-sm, 6px)",
                  border: "1px solid var(--color-admin-border, #e2e8f0)",
                }}
              >
                <h4 style={{ margin: "0 0 var(--space-sm)", fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-admin-accent, #0284c7)" }}>
                  {t("vehicleInformation", { defaultValue: "VEHICLE INFORMATION" })}
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-sm)", fontSize: "var(--font-size-xs)" }}>
                  <div>
                    <span style={{ color: "var(--color-admin-muted, #64748b)", display: "block" }}>{t("brandAndModel", { defaultValue: "Marke & Modell" })}</span>
                    <strong style={{ color: "var(--color-admin-text, #0f172a)", fontSize: "var(--font-size-sm)" }}>
                      {vehicleBrand} {vehicleModel}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: "var(--color-admin-muted, #64748b)", display: "block" }}>{t("firstRegistration", { defaultValue: "First Registration" })}</span>
                    <strong style={{ color: "var(--color-admin-text, #0f172a)" }}>{firstReg}</strong>
                  </div>

                  <div>
                    <span style={{ color: "var(--color-admin-muted, #64748b)", display: "block" }}>{t("vin", { defaultValue: "Vehicle Identification Number (VIN)" })}</span>
                    <code style={{ color: "var(--color-admin-accent, #0284c7)", fontSize: "12px", fontFamily: "monospace", fontWeight: 600 }}>
                      {vinNumber}
                    </code>
                  </div>

                  <div>
                    <span style={{ color: "var(--color-admin-muted, #64748b)", display: "block" }}>{t("postalCode", { defaultValue: "Location / Postal Code" })}</span>
                    <strong style={{ color: "var(--color-admin-text, #0f172a)" }}>{postalCode}</strong>
                  </div>

                  <div>
                    <span style={{ color: "var(--color-admin-muted, #64748b)", display: "block" }}>{t("mileage", { defaultValue: "Mileage" })}</span>
                    <strong style={{ color: "var(--color-admin-text, #0f172a)" }}>
                      {mileageDisplay}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: "var(--color-admin-muted, #64748b)", display: "block" }}>{t("minPrice", { defaultValue: "Minimum Asking Price" })}</span>
                    <strong style={{ color: "var(--color-admin-accent, #0284c7)", fontSize: "var(--font-size-sm)", fontWeight: 700 }}>
                      {priceDisplay}
                    </strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "var(--space-lg)", marginTop: "var(--space-md)", paddingTop: "var(--space-sm)", borderTop: "1px solid var(--color-admin-border, #e2e8f0)", fontSize: "var(--font-size-xs)" }}>
                  <div>
                    <span style={{ color: "var(--color-admin-muted, #64748b)", marginRight: "6px" }}>{t("accidentFree", { defaultValue: "Accident-free" })}:</span>
                    <Badge variant={isAccidentFree ? "success" : "warning"} size="sm">
                      {isAccidentFree ? t("yes", { defaultValue: "JA" }) : t("no", { defaultValue: "NEIN" })}
                    </Badge>
                  </div>
                  <div>
                    <span style={{ color: "var(--color-admin-muted, #64748b)", marginRight: "6px" }}>{t("repainted", { defaultValue: "Repainted" })}:</span>
                    <Badge variant={isRepainted ? "warning" : "neutral"} size="sm">
                      {isRepainted ? t("yes", { defaultValue: "JA" }) : t("no", { defaultValue: "NEIN" })}
                    </Badge>
                  </div>
                </div>

                {additionalInfo && (
                  <div style={{ marginTop: "var(--space-sm)", paddingTop: "var(--space-sm)", borderTop: "1px solid var(--color-admin-border, #e2e8f0)" }}>
                    <span style={{ color: "var(--color-admin-muted, #64748b)", fontSize: "11px", display: "block", marginBottom: "4px" }}>
                      {t("additionalInformation", { defaultValue: "Additional Information:" })}
                    </span>
                    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-admin-text, #0f172a)", lineHeight: 1.5, whiteSpace: "pre-line" }}>
                      {additionalInfo}
                    </div>
                  </div>
                )}
              </div>

              {/* Submitted Images Gallery */}
              <div
                style={{
                  padding: "var(--space-md)",
                  backgroundColor: "var(--color-admin-card, #ffffff)",
                  borderRadius: "var(--radius-sm, 6px)",
                  border: "1px solid var(--color-admin-border, #e2e8f0)",
                }}
              >
                <h4 style={{ margin: "0 0 var(--space-xs)", fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-admin-accent, #0284c7)" }}>
                  {t("submittedImages", { defaultValue: "Submitted Photos" })} ({images.length})
                </h4>

                {images.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                      gap: "var(--space-xs)",
                      marginTop: "var(--space-xs)",
                    }}
                  >
                    {images.map((img, idx) => {
                      const imgUrl = typeof img === "string" ? img : img.public_url || img.url || "";
                      const imgName = typeof img === "object" && img.name ? img.name : t("photoNumber", { num: idx + 1, defaultValue: `Photo ${idx + 1}` });

                      return (
                        <div
                          key={idx}
                          onClick={() => setPreviewImage(img)}
                          style={{
                            position: "relative",
                            height: "80px",
                            borderRadius: "4px",
                            overflow: "hidden",
                            backgroundColor: "#000",
                            border: "1px solid var(--color-admin-border, #e2e8f0)",
                            cursor: "pointer",
                          }}
                          title={t("clickToEnlarge", { defaultValue: "Click to enlarge" })}
                        >
                          <img
                            src={imgUrl}
                            alt={imgName}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              backgroundColor: "rgba(0, 0, 0, 0.4)",
                              opacity: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "opacity 0.2s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                          >
                            <Icon name="zoom-in" size={18} style={{ color: "#ffffff" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-admin-muted, #64748b)", marginTop: "4px" }}>
                    {t("noImagesSubmitted", { defaultValue: "No images submitted for this vehicle." })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Admin Notes Editor */}
          <div
            style={{
              padding: "var(--space-md)",
              backgroundColor: "var(--color-admin-card, #ffffff)",
              borderRadius: "var(--radius-sm, 6px)",
              border: "1px solid var(--color-admin-border, #e2e8f0)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-xs)" }}>
              <h4 style={{ margin: 0, fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-admin-accent, #0284c7)" }}>
                {t("adminNotes", { defaultValue: "Internal Admin Notes" })}
              </h4>
              <span style={{ fontSize: "11px", color: "var(--color-admin-muted, #64748b)" }}>
                {t("adminOnlyVisible", { defaultValue: "Visible to administrators only" })}
              </span>
            </div>

            <Textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder={t("adminNotesPlaceholder", { defaultValue: "Internal notes on this inquiry (visible only to admins)..." })}
              rows={4}
              style={{ fontSize: "var(--font-size-xs)", marginBottom: "var(--space-sm)" }}
            />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {notesSuccess ? (
                <span style={{ fontSize: "var(--font-size-xs)", color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Icon name="check" size={14} />
                  {t("notesSaved", { defaultValue: "Notes saved successfully." })}
                </span>
              ) : (
                <span />
              )}

              <Button
                variant="primary"
                size="sm"
                loading={savingNotes}
                onClick={handleSaveNotes}
              >
                <Icon name="save" size={14} style={{ marginRight: "6px" }} />
                {t("saveNotes", { defaultValue: "Save notes" })}
              </Button>
            </div>
          </div>
        </div>
      </Drawer>

      {/* Lightbox Modal for Enlarge View */}
      <FormImageModal
        isOpen={Boolean(previewImage)}
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </>
  );
}

export default FormDetailDrawer;
