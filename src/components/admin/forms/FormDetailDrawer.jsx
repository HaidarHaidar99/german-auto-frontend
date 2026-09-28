import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Drawer from "../../ui/Drawer";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import Textarea from "../../forms/Textarea";
import Icon from "../../common/Icon";
import FormImageModal from "./FormImageModal";

export function FormDetailDrawer({
  isOpen,
  form = null,
  onClose,
  onUpdateStatus,
  onUpdateNotes,
  onArchive,
}) {
  const { t, i18n } = useTranslation(["admin", "forms", "common"]);
  const currentLang = i18n.language || "de";

  const [notesText, setNotesText] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  // Sync draft notes whenever form changes
  useEffect(() => {
    if (form) {
      setNotesText(form.admin_notes || "");
      setNotesSuccess(false);
      setShowArchiveConfirm(false);
    }
  }, [form]);

  if (!form) return null;

  const isContact = form.form_type === "CONTACT";
  const data = form.data || {};

  // Contact person details
  const contactName = isContact
    ? data.name || "—"
    : `${data.first_name || ""} ${data.last_name || ""}`.trim() || "—";
  const contactEmail = data.email || "";
  const contactPhone = data.phone || "";

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
    if (!newStatus || newStatus === form.status || updatingStatus) return;
    try {
      setUpdatingStatus(true);
      await onUpdateStatus?.(form.id, newStatus);
    } catch (err) {
      alert(err?.message || "Fehler beim Aktualisieren des Status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    if (savingNotes) return;
    try {
      setSavingNotes(true);
      await onUpdateNotes?.(form.id, notesText.trim());
      setNotesSuccess(true);
      setTimeout(() => setNotesSuccess(false), 3500);
    } catch (err) {
      alert(err?.message || "Fehler beim Speichern der Notiz.");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleArchive = async () => {
    try {
      setUpdatingStatus(true);
      await onArchive?.(form.id);
      setShowArchiveConfirm(false);
    } catch (err) {
      alert(err?.message || "Fehler beim Archivieren des Eingangs.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Safe external URLs
  const cleanPhone = contactPhone.replace(/[^0-9+]/g, "");
  const mailSubject = isContact
    ? `German Auto: Ihre Anfrage bezüglich "${data.regarding || "Anfrage"}"`
    : `German Auto: Ihr Fahrzeugangebot ${data.brand || ""} ${data.model || ""}`.trim();
  const mailBody = `Guten Tag ${contactName},\n\nvielen Dank für Ihre Kontaktaufnahme mit German Auto.\n\nMit freundlichen Grüßen,\nIhr German Auto Team`;
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
        title={isContact ? t("formTypeContact", { defaultValue: "Kontaktanfrage" }) : t("formTypeSellCar", { defaultValue: "Fahrzeugankauf" })}
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
              borderBottom: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.08))",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
              <Badge variant={isContact ? "outline" : "secondary"} size="sm">
                {isContact ? "CONTACT" : "SELL_CAR"}
              </Badge>
              <Badge variant={getStatusBadgeVariant(form.status)} size="sm">
                {t(`status${form.status.charAt(0) + form.status.slice(1).toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase())}`, { defaultValue: form.status })}
              </Badge>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
              <label style={{ fontSize: "11px", color: "var(--color-admin-muted)", marginRight: "4px" }}>
                Status ändern:
              </label>
              <select
                value={form.status}
                disabled={updatingStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{
                  padding: "4px 8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  borderRadius: "var(--radius-sm, 4px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "#ffffff",
                  cursor: updatingStatus ? "wait" : "pointer",
                  outline: "none",
                }}
              >
                <option value="NEW" style={{ backgroundColor: "#1a1d24" }}>Neu (NEW)</option>
                <option value="READ" style={{ backgroundColor: "#1a1d24" }}>Gelesen (READ)</option>
                <option value="IN_PROGRESS" style={{ backgroundColor: "#1a1d24" }}>In Bearbeitung (IN_PROGRESS)</option>
                <option value="COMPLETED" style={{ backgroundColor: "#1a1d24" }}>Abgeschlossen (COMPLETED)</option>
                <option value="ARCHIVED" style={{ backgroundColor: "#1a1d24" }}>Archiviert (ARCHIVED)</option>
              </select>

              {form.status !== "ARCHIVED" && !showArchiveConfirm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowArchiveConfirm(true)}
                  style={{ height: "28px", fontSize: "11px", color: "var(--color-admin-muted)" }}
                >
                  <Icon name="archive" size={12} style={{ marginRight: "4px" }} />
                  Archivieren
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
              <div style={{ fontSize: "var(--font-size-xs)", color: "#eab308" }}>
                {t("archiveConfirmMessage", { defaultValue: "Möchten Sie diesen Eingang wirklich archivieren?" })}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <Button variant="ghost" size="sm" onClick={() => setShowArchiveConfirm(false)} style={{ height: "26px", fontSize: "11px" }}>
                  Abbrechen
                </Button>
                <Button variant="primary" size="sm" loading={updatingStatus} onClick={handleArchive} style={{ height: "26px", fontSize: "11px" }}>
                  Bestätigen
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
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderRadius: "var(--radius-sm, 6px)",
              border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.06))",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-admin-muted)", marginRight: "6px" }}>
              {t("contactCustomer", { defaultValue: "Kunden kontaktieren" })}:
            </span>

            {mailtoUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(mailtoUrl, "_blank")}
                style={{ fontSize: "11px", height: "30px" }}
              >
                <Icon name="mail" size={13} style={{ marginRight: "4px" }} />
                {t("sendEmail", { defaultValue: "E-Mail senden" })}
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
                {t("callPhone", { defaultValue: "Anrufen" })}
              </Button>
            )}

            {waUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(waUrl, "_blank", "noopener,noreferrer")}
                style={{ fontSize: "11px", height: "30px", borderColor: "rgba(34, 197, 94, 0.4)", color: "#22c55e" }}
              >
                <Icon name="message-circle" size={13} style={{ marginRight: "4px" }} />
                {t("chatWhatsApp", { defaultValue: "WhatsApp" })}
              </Button>
            )}
          </div>

          {/* Customer Information Section */}
          <div
            style={{
              padding: "var(--space-md)",
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              borderRadius: "var(--radius-sm, 6px)",
              border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.06))",
            }}
          >
            <h4 style={{ margin: "0 0 var(--space-sm)", fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-primary, #C5A059)" }}>
              {t("customerInformation", { defaultValue: "Kundendaten" })}
            </h4>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-sm)", fontSize: "var(--font-size-xs)" }}>
              <div>
                <span style={{ color: "var(--color-admin-muted)", display: "block" }}>Name</span>
                <strong style={{ color: "#ffffff" }}>{contactName}</strong>
              </div>

              <div>
                <span style={{ color: "var(--color-admin-muted)", display: "block" }}>E-Mail</span>
                <strong style={{ color: "#ffffff" }}>{contactEmail || "—"}</strong>
              </div>

              <div>
                <span style={{ color: "var(--color-admin-muted)", display: "block" }}>Telefon</span>
                <strong style={{ color: "#ffffff" }}>{contactPhone || "—"}</strong>
              </div>

              {!isContact && data.preferred_contact && (
                <div>
                  <span style={{ color: "var(--color-admin-muted)", display: "block" }}>{t("preferredContact", { defaultValue: "Bevorzugte Kontaktaufnahme" })}</span>
                  <Badge variant="outline" size="sm">{data.preferred_contact}</Badge>
                </div>
              )}

              <div>
                <span style={{ color: "var(--color-admin-muted)", display: "block" }}>Eingegangen am</span>
                <span style={{ color: "var(--color-admin-text, #ffffff)" }}>{formatDate(form.created_at)}</span>
              </div>

              <div>
                <span style={{ color: "var(--color-admin-muted)", display: "block" }}>Kundenkonto</span>
                <span style={{ color: form.user_id ? "var(--color-primary, #C5A059)" : "var(--color-admin-muted)" }}>
                  {form.user_id ? `Registrierter Benutzer (${form.user_id.substring(0, 8)}...)` : t("guestSubmission", { defaultValue: "Gast-Einsendung" })}
                </span>
              </div>
            </div>
          </div>

          {/* CONTACT Specific: Topic & Full Message */}
          {isContact && (
            <div
              style={{
                padding: "var(--space-md)",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                borderRadius: "var(--radius-sm, 6px)",
                border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.06))",
              }}
            >
              <h4 style={{ margin: "0 0 var(--space-xs)", fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-primary, #C5A059)" }}>
                {t("regarding", { defaultValue: "Betreff / Anliegen" })}
              </h4>
              <div style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: "#ffffff", marginBottom: "var(--space-md)" }}>
                {data.regarding || "Allgemeine Anfrage"}
              </div>

              <h4 style={{ margin: "0 0 var(--space-xs)", fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-primary, #C5A059)" }}>
                {t("message", { defaultValue: "Nachricht" })}
              </h4>
              <div
                style={{
                  padding: "var(--space-md)",
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  borderRadius: "4px",
                  fontSize: "var(--font-size-sm)",
                  color: "#ffffff",
                  lineHeight: 1.6,
                  whiteSpace: "pre-line",
                  borderLeft: "3px solid var(--color-primary, #C5A059)",
                }}
              >
                {data.message || "Kein Nachrichtentext hinterlegt."}
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
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  borderRadius: "var(--radius-sm, 6px)",
                  border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.06))",
                }}
              >
                <h4 style={{ margin: "0 0 var(--space-sm)", fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-primary, #C5A059)" }}>
                  {t("vehicleDetails", { defaultValue: "Fahrzeugdaten" })}
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-sm)", fontSize: "var(--font-size-xs)" }}>
                  <div>
                    <span style={{ color: "var(--color-admin-muted)", display: "block" }}>Marke & Modell</span>
                    <strong style={{ color: "#ffffff", fontSize: "var(--font-size-sm)" }}>
                      {data.brand || "—"} {data.model || ""}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: "var(--color-admin-muted)", display: "block" }}>{t("firstRegistration", { defaultValue: "Erstzulassung" })}</span>
                    <strong style={{ color: "#ffffff" }}>{data.first_registration || "—"}</strong>
                  </div>

                  <div>
                    <span style={{ color: "var(--color-admin-muted)", display: "block" }}>{t("vin", { defaultValue: "Fahrgestellnummer (FIN)" })}</span>
                    <code style={{ color: "var(--color-primary, #C5A059)", fontSize: "12px", fontFamily: "monospace" }}>
                      {data.vin || "—"}
                    </code>
                  </div>

                  <div>
                    <span style={{ color: "var(--color-admin-muted)", display: "block" }}>{t("postalCode", { defaultValue: "Standort / PLZ" })}</span>
                    <strong style={{ color: "#ffffff" }}>{data.postal_code || "—"}</strong>
                  </div>

                  <div>
                    <span style={{ color: "var(--color-admin-muted)", display: "block" }}>{t("mileage", { defaultValue: "Kilometerstand" })}</span>
                    <strong style={{ color: "#ffffff" }}>
                      {data.mileage_km != null ? `${new Intl.NumberFormat("de-DE").format(data.mileage_km)} km` : "—"}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: "var(--color-admin-muted)", display: "block" }}>{t("minPrice", { defaultValue: "Mindestpreisvorstellung" })}</span>
                    <strong style={{ color: "var(--color-primary, #C5A059)", fontSize: "var(--font-size-sm)" }}>
                      {data.min_price != null ? `${new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(data.min_price)}` : "Keine Angabe"}
                    </strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "var(--space-lg)", marginTop: "var(--space-md)", paddingTop: "var(--space-sm)", borderTop: "1px solid rgba(255, 255, 255, 0.06)", fontSize: "var(--font-size-xs)" }}>
                  <div>
                    <span style={{ color: "var(--color-admin-muted)", marginRight: "6px" }}>{t("accidentFree", { defaultValue: "Unfallfrei" })}:</span>
                    <Badge variant={data.accident_free ? "success" : "warning"} size="sm">
                      {data.accident_free ? "Ja" : "Nein"}
                    </Badge>
                  </div>
                  <div>
                    <span style={{ color: "var(--color-admin-muted)", marginRight: "6px" }}>{t("repainted", { defaultValue: "Nachlackiert" })}:</span>
                    <Badge variant={data.repainting ? "warning" : "neutral"} size="sm">
                      {data.repainting ? "Ja" : "Nein"}
                    </Badge>
                  </div>
                </div>

                {data.additional_info && (
                  <div style={{ marginTop: "var(--space-sm)", paddingTop: "var(--space-sm)", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <span style={{ color: "var(--color-admin-muted)", fontSize: "11px", display: "block", marginBottom: "4px" }}>
                      Zusätzliche Angaben:
                    </span>
                    <div style={{ fontSize: "var(--font-size-xs)", color: "#ffffff", lineHeight: 1.5, whiteSpace: "pre-line" }}>
                      {data.additional_info}
                    </div>
                  </div>
                )}
              </div>

              {/* Submitted Images Gallery */}
              <div
                style={{
                  padding: "var(--space-md)",
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  borderRadius: "var(--radius-sm, 6px)",
                  border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.06))",
                }}
              >
                <h4 style={{ margin: "0 0 var(--space-xs)", fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-primary, #C5A059)" }}>
                  {t("submittedImages", { defaultValue: "Eingereichte Bilder" })} ({Array.isArray(data.images) ? data.images.length : 0})
                </h4>

                {Array.isArray(data.images) && data.images.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                      gap: "var(--space-xs)",
                      marginTop: "var(--space-xs)",
                    }}
                  >
                    {data.images.map((img, idx) => {
                      const imgUrl = typeof img === "string" ? img : img.public_url || "";
                      const imgName = typeof img === "object" && img.name ? img.name : `Foto ${idx + 1}`;

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
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            cursor: "pointer",
                          }}
                          title="Klicken zum Vergrößern"
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
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-admin-muted)", marginTop: "4px" }}>
                    {t("noImagesSubmitted", { defaultValue: "Keine Bilder zu diesem Fahrzeug eingereicht." })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Admin Notes Editor */}
          <div
            style={{
              padding: "var(--space-md)",
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              borderRadius: "var(--radius-sm, 6px)",
              border: "1px solid var(--color-admin-border, rgba(255, 255, 255, 0.06))",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-xs)" }}>
              <h4 style={{ margin: 0, fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-primary, #C5A059)" }}>
                {t("adminNotes", { defaultValue: "Admin-Notizen" })}
              </h4>
              <span style={{ fontSize: "11px", color: "var(--color-admin-muted)" }}>
                Nur für Administratoren sichtbar
              </span>
            </div>

            <Textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder={t("adminNotesPlaceholder", { defaultValue: "Interne Notizen zu dieser Anfrage (nur für Administratoren sichtbar)..." })}
              rows={4}
              style={{ fontSize: "var(--font-size-xs)", marginBottom: "var(--space-sm)" }}
            />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {notesSuccess ? (
                <span style={{ fontSize: "var(--font-size-xs)", color: "#22c55e", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Icon name="check" size={14} />
                  {t("notesSaved", { defaultValue: "Notizen erfolgreich gespeichert." })}
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
                {t("saveNotes", { defaultValue: "Notiz speichern" })}
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
